import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@supabase/supabase-js";

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

// GET /api/dashboard/stats - Get user dashboard statistics
export async function GET(request: NextRequest) {
  try {
    const { user, error: authError } = await verifyAuth(request);
    if (authError || !user) {
      return NextResponse.json({ error: authError }, { status: 401 });
    }

    // Get projects owned
    const projectsOwned = await prisma.project.count({
      where: { ownerId: user.id },
    });

    const projectsOwningStats = await prisma.project.aggregate({
      where: { ownerId: user.id },
      _sum: { totalFunded: true, fundingGoal: true },
    });

    // Get fundings made
    const fundingsMade = await prisma.funding.count({
      where: { funderId: user.id },
    });

    const fundingStats = await prisma.funding.aggregate({
      where: { funderId: user.id },
      _sum: { amount: true },
    });

    // Get bids placed
    const bidsPlaced = await prisma.bid.count({
      where: { bidderId: user.id },
    });

    const bidsWon = await prisma.bid.count({
      where: { bidderId: user.id, status: "WON" },
    });

    const bidsLost = await prisma.bid.count({
      where: { bidderId: user.id, status: "LOST" },
    });

    const bidStats = await prisma.bid.aggregate({
      where: { bidderId: user.id },
      _sum: { amount: true, payout: true },
    });

    // Get user roles
    const roles = await prisma.userRole.findMany({
      where: { userId: user.id },
      select: { role: true },
    });

    // Recent projects
    const recentProjects = await prisma.project.findMany({
      where: { ownerId: user.id },
      select: {
        id: true,
        title: true,
        status: true,
        totalFunded: true,
        fundingGoal: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    });

    // Recent fundings
    const recentFundings = await prisma.funding.findMany({
      where: { funderId: user.id },
      select: {
        id: true,
        amount: true,
        createdAt: true,
        project: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    });

    // Recent bids
    const recentBids = await prisma.bid.findMany({
      where: { bidderId: user.id },
      select: {
        id: true,
        amount: true,
        prediction: true,
        status: true,
        payout: true,
        createdAt: true,
        project: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    });

    return NextResponse.json(
      {
        stats: {
          owner: {
            projectsOwned,
            totalFundingGoal: projectsOwningStats._sum.fundingGoal || 0,
            totalFunded: projectsOwningStats._sum.totalFunded || 0,
          },
          funder: {
            fundingsMade,
            totalInvested: fundingStats._sum.amount || 0,
          },
          bidder: {
            bidsPlaced,
            bidsWon,
            bidsLost,
            totalBiamount: bidStats._sum.amount || 0,
            totalPayouts: bidStats._sum.payout || 0,
            winRate: bidsPlaced > 0 ? (bidsWon / bidsPlaced) * 100 : 0,
          },
          roles: roles.map((r) => r.role),
        },
        recentData: {
          projects: recentProjects,
          fundings: recentFundings,
          bids: recentBids,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET /api/dashboard/stats error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch dashboard stats" },
      { status: 500 }
    );
  }
}
