import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@supabase/supabase-js";
import {
  isValidBidAmount,
  isValidRiskPercent,
  calculateBidOutcome,
} from "@/lib/fee";
import { createBidSchema } from "@/lib/schemas";

export const dynamic = "force-dynamic";

async function verifyAuth(request: NextRequest) {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return { user: null, error: "Missing authorization header" };
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const token = authHeader.slice(7);
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser(token);

  if (authError || !user) {
    return { user: null, error: "Unauthorized" };
  }

  return { user, error: null };
}

// POST /api/bids - Create new bid
export async function POST(request: NextRequest) {
  try {
    const { user, error: authError } = await verifyAuth(request);
    if (authError || !user) {
      return NextResponse.json({ error: authError }, { status: 401 });
    }

    const body = await request.json();

    // Validate with Zod
    const validation = createBidSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.error.issues },
        { status: 400 }
      );
    }

    const { projectId, amount, riskPercent, prediction } = validation.data;

    // Validate amounts
    if (!isValidBidAmount(amount)) {
      return NextResponse.json(
        { error: "Bid amount must be between $10 and $100,000" },
        { status: 400 }
      );
    }

    if (!isValidRiskPercent(riskPercent)) {
      return NextResponse.json(
        { error: "Risk must be between 1% and 100%" },
        { status: 400 }
      );
    }

    // Check project exists and is OPEN
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { status: true, ownerId: true },
    });

    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    if (project.status !== "OPEN") {
      return NextResponse.json(
        { error: "Project not accepting bids" },
        { status: 400 }
      );
    }

    // Prevent bidding on own project
    if (project.ownerId === user.id) {
      return NextResponse.json(
        { error: "Cannot bid on your own project" },
        { status: 400 }
      );
    }

    // Create bid
    const bid = await prisma.bid.create({
      data: {
        projectId,
        bidderId: user.id,
        amount,
        riskPercent,
        prediction: prediction,
        status: "ACTIVE",
        settled: false,
      },
      include: {
        bidder: {
          select: {
            id: true,
            email: true,
            githubUsername: true,
          },
        },
      },
    });

    return NextResponse.json(
      { success: true, bid },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/bids error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create bid" },
      { status: 500 }
    );
  }
}

// GET /api/bids - List bids
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");
    const userId = searchParams.get("userId");
    const settled = searchParams.get("settled");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");

    if (!projectId && !userId) {
      return NextResponse.json(
        { error: "Must provide projectId or userId" },
        { status: 400 }
      );
    }

    const skip = (page - 1) * limit;
    const whereClause: any = {};

    if (projectId) whereClause.projectId = projectId;
    if (userId) whereClause.bidderId = userId;
    if (settled !== null) whereClause.settled = settled === "true";

    const [bids, total] = await Promise.all([
      prisma.bid.findMany({
        where: whereClause,
        include: {
          bidder: {
            select: {
              id: true,
              email: true,
              githubUsername: true,
              avatarUrl: true,
            },
          },
          project: {
            select: {
              id: true,
              title: true,
              status: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.bid.count({ where: whereClause }),
    ]);

    return NextResponse.json(
      {
        bids,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET /api/bids error:", error);
    return NextResponse.json(
      { error: "Failed to fetch bids" },
      { status: 500 }
    );
  }
}

// PATCH /api/bids/settle - Settle bids on a project (admin only for now, could be automated)
export async function PATCH(request: NextRequest) {
  try {
    const { user, error: authError } = await verifyAuth(request);
    if (authError || !user) {
      return NextResponse.json({ error: authError }, { status: 401 });
    }

    const body = await request.json();
    const { projectId } = body;

    if (!projectId) {
      return NextResponse.json(
        { error: "Missing projectId" },
        { status: 400 }
      );
    }

    // Get project - only owner can settle
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { ownerId: true, status: true },
    });

    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    if (project.ownerId !== user.id) {
      return NextResponse.json(
        { error: "Only project owner can settle bids" },
        { status: 403 }
      );
    }

    if (!["FUNDED", "CLOSED"].includes(project.status)) {
      return NextResponse.json(
        { error: "Project must be FUNDED or CLOSED to settle bids" },
        { status: 400 }
      );
    }

    // Get all unsettled bids
    const unsettledBids = await prisma.bid.findMany({
      where: { projectId, settled: false },
    });

    // Settle each bid
    const settledBids = await Promise.all(
      unsettledBids.map(async (bid) => {
        const outcome = calculateBidOutcome(
          bid.amount,
          bid.riskPercent,
          bid.prediction as "YES" | "NO",
          project.status as "FUNDED" | "CLOSED"
        );

        return prisma.bid.update({
          where: { id: bid.id },
          data: {
            settled: true,
            status: outcome.won ? "WON" : "LOST",
            outcome: outcome.outcome,
            payout: outcome.payout,
          },
          include: {
            bidder: {
              select: {
                id: true,
                email: true,
                githubUsername: true,
              },
            },
          },
        });
      })
    );

    return NextResponse.json(
      {
        success: true,
        settledCount: settledBids.length,
        bids: settledBids,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("PATCH /api/bids error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to settle bids" },
      { status: 500 }
    );
  }
}
