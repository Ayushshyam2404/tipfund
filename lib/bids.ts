import { calculateBidOutcome } from "./fee";
import { settleBid, getUnsettledBidsOnProject } from "./db";

/**
 * Settle all bids on a project
 * This is called when a project status changes to FUNDED or CLOSED
 */
export async function settleBidsOnProject(
  projectId: string,
  finalProjectStatus: "FUNDED" | "CLOSED"
) {
  try {
    const unsettledBids = await getUnsettledBidsOnProject(projectId);

    const settledBids = [];

    for (const bid of unsettledBids) {
      const outcome = calculateBidOutcome(
        bid.amount,
        bid.riskPercent,
        bid.prediction,
        finalProjectStatus
      );

      const settled = await settleBid(
        bid.id,
        outcome.outcome,
        outcome.payout
      );

      settledBids.push({
        ...settled,
        bidderName: bid.bidder?.email || "Unknown",
      });

      // Log for demo purposes
      console.log(
        `[Demo Settlement] Bid ${bid.id} on project ${projectId}: ${outcome.outcome}, payout: ${outcome.payout}`
      );
    }

    return {
      success: true,
      settledCount: settledBids.length,
      bids: settledBids,
    };
  } catch (error) {
    console.error("Error settling bids:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      settledCount: 0,
      bids: [],
    };
  }
}

/**
 * Calculate bidder statistics
 */
export async function calculateBidderStats(bidderId: string, bids: unknown[]) {
  const bidArray = (bids as Array<{ outcome?: string; amount?: number; payout?: number | null }>) || [];
  
  const wonBids = bidArray.filter((b) => b.outcome === "won");
  const totalBidAmount = bidArray.reduce((sum, b) => sum + (b.amount || 0), 0);
  const totalWinnings = wonBids.reduce((sum, b) => sum + (b.payout || 0), 0);
  const winRate =
    bidArray.length > 0 ? (wonBids.length / bidArray.length) * 100 : 0;

  return {
    totalBids: bidArray.length,
    wonBids: wonBids.length,
    lostBids: bidArray.length - wonBids.length,
    winRate: parseFloat(winRate.toFixed(2)),
    totalBidAmount: parseFloat(totalBidAmount.toFixed(2)),
    totalWinnings: parseFloat(totalWinnings.toFixed(2)),
    roi:
      totalBidAmount > 0
        ? parseFloat((((totalWinnings - totalBidAmount) / totalBidAmount) * 100).toFixed(2))
        : 0,
  };
}

/**
 * Get bid status text
 */
export function getBidStatusText(
  prediction: boolean,
  outcome?: string | null
): string {
  if (!outcome) {
    return prediction ? "Betting YES" : "Betting NO";
  }
  if (outcome === "won") {
    return "✓ Won";
  }
  return "✗ Lost";
}

/**
 * Format bid prediction for display
 */
export function formatBidPrediction(prediction: boolean): string {
  return prediction ? "Will Fund" : "Won't Fund";
}
