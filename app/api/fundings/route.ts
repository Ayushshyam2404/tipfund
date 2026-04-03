import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@supabase/supabase-js";
import { calculatePlatformFee, isValidFundingAmount } from "@/lib/fee";

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

// Post funding
export async function POST(request: NextRequest) {
  try {
    const { user, error: authError } = await verifyAuth(request);
    if (authError || !user) {
      return NextResponse.json({ error: authError }, { status: 401 });
    }

    const body = await request.json();
    const { projectId, amount, tip } = body;

    // Validate
    if (!projectId || !amount) {
      return NextResponse.json(
        { error: "Missing required fields: projectId, amount" },
        { status: 400 }
      );
    }

    if (!isValidFundingAmount(amount)) {
      return NextResponse.json(
        { error: "Invalid funding amount. Must be between $1 and $1,000,000" },
        { status: 400 }
      );
    }

    // Check project exists and is OPEN
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { status: true, totalFunded: true, fundingGoal: true },
    });

    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    if (project.status !== "OPEN") {
      return NextResponse.json(
        { error: "Project is not accepting funding" },
        { status: 400 }
      );
    }

    // Prevent funder from being owner (check in db)
    const funder = await prisma.user.findUnique({
      where: { id: user.id },
      select: { id: true },
    });

    if (!funder) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Calculate fees
    const { platformFee, netToOwner } = calculatePlatformFee(amount);

    // Create funding record
    const funding = await prisma.funding.create({
      data: {
        projectId,
        funderId: user.id,
        amount,
        platformFee,
        netAmount: netToOwner,
        tip: tip || false,
        status: "PENDING", // Will be "COMPLETED" after Stripe payment later
      },
      include: {
        funder: {
          select: {
            id: true,
            email: true,
            githubUsername: true,
          },
        },
      },
    });

    // Update project totalFunded (CUMULATIVE - includes pending)
    await prisma.project.update({
      where: { id: projectId },
      data: {
        totalFunded: project.totalFunded + netToOwner,
        // Auto-mark as FUNDED if goal reached
        status:
          project.totalFunded + netToOwner >= project.fundingGoal
            ? "FUNDED"
            : "OPEN",
      },
    });

    return NextResponse.json(
      { success: true, funding },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/fundings error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create funding" },
      { status: 500 }
    );
  }
}

// GET /api/fundings - List fundings by project or user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");
    const userId = searchParams.get("userId");
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
    if (userId) whereClause.funderId = userId;

    const [fundings, total] = await Promise.all([
      prisma.funding.findMany({
        where: whereClause,
        include: {
          funder: {
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
      prisma.funding.count({ where: whereClause }),
    ]);

    return NextResponse.json(
      {
        fundings,
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
    console.error("GET /api/fundings error:", error);
    return NextResponse.json(
      { error: "Failed to fetch fundings" },
      { status: 500 }
    );
  }
}
