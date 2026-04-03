import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// GET /api/leaderboard - Get top bidders by wins or ROI
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sortBy = searchParams.get("sortBy") || "roi"; // roi, wins, payouts
    const limit = Math.min(parseInt(searchParams.get("limit") || "100"), 1000);

    // Get all bidders with their stats
    const bidders = await prisma.bid.groupBy({
      by: ["bidderId"],
      _count: { id: true },
      _sum: { amount: true, payout: true },
    });

    // Calculate stats for each bidder
    const leaderboard = await Promise.all(
      bidders.map(async (b) => {
        const stats = await prisma.bid.aggregate({
          where: { bidderId: b.bidderId },
          _count: { id: true },
          _sum: { amount: true, payout: true },
        });

        const wonCount = await prisma.bid.count({
          where: { bidderId: b.bidderId, status: "WON" },
        });

        const bidder = await prisma.user.findUnique({
          where: { id: b.bidderId },
          select: {
            id: true,
            githubUsername: true,
            avatarUrl: true,
          },
        });

        const totalBiamount = stats._sum.amount || 0;
        const totalPayouts = stats._sum.payout || 0;
        const roi =
          totalBiamount > 0 ? ((totalPayouts - totalBiamount) / totalBiamount) * 100 : 0;

        return {
          bidder,
          stats: {
            bidsPlaced: stats._count.id,
            bidsWon: wonCount,
            totalBiamount,
            totalPayouts,
            roi,
          },
        };
      })
    );

    // Sort
    let sorted = leaderboard;
    if (sortBy === "roi") {
      sorted = leaderboard.sort((a, b) => b.stats.roi - a.stats.roi);
    } else if (sortBy === "wins") {
      sorted = leaderboard.sort((a, b) => b.stats.bidsWon - a.stats.bidsWon);
    } else if (sortBy === "payouts") {
      sorted = leaderboard.sort((a, b) => b.stats.totalPayouts - a.stats.totalPayouts);
    }

    return NextResponse.json(
      {
        leaderboard: sorted.slice(0, limit),
        total: sorted.length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET /api/leaderboard error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch leaderboard" },
      { status: 500 }
    );
  }
}
