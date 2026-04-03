// Platform fee constants
export const PLATFORM_FEE = 0.10; // 10%
export const MIN_BID_AMOUNT = 10;
export const MAX_BID_AMOUNT = 10000;
export const MIN_FUNDING_AMOUNT = 5;

/**
 * Calculate platform fee and net amount for a transaction
 */
export function calculatePlatformFee(grossAmount: number) {
  const platformFee = grossAmount * PLATFORM_FEE;
  const netToOwner = grossAmount - platformFee;

  return {
    platformFee: parseFloat(platformFee.toFixed(2)),
    netToOwner: parseFloat(netToOwner.toFixed(2)),
  };
}

/**
 * Calculate bid payout if prediction is correct
 * payout = amount + (amount * riskPercent / 100)
 */
export function calculateBidPayout(bidAmount: number, riskPercent: number) {
  const payout = bidAmount + (bidAmount * riskPercent) / 100;
  return parseFloat(payout.toFixed(2));
}

/**
 * Calculate bid outcome
 * Returns: { won: boolean, payout: number | null, outcome: "won" | "lost" }
 */
export function calculateBidOutcome(
  bidAmount: number,
  riskPercent: number,
  prediction: "YES" | "NO",
  projectStatus: "FUNDED" | "CLOSED"
): { won: boolean; payout: number | null; outcome: "won" | "lost" } {
  // Project FUNDED, bidder predicted YES
  if (projectStatus === "FUNDED" && prediction === "YES") {
    return {
      won: true,
      payout: calculateBidPayout(bidAmount, riskPercent),
      outcome: "won",
    };
  }

  // Project FUNDED, bidder predicted NO
  if (projectStatus === "FUNDED" && prediction === "NO") {
    return {
      won: false,
      payout: 0, // Bid amount lost, transferred to project owner
      outcome: "lost",
    };
  }

  // Project CLOSED (NOT funded), bidder predicted NO
  if (projectStatus === "CLOSED" && prediction === "NO") {
    return {
      won: true,
      payout: calculateBidPayout(bidAmount, riskPercent),
      outcome: "won",
    };
  }

  // Project CLOSED (NOT funded), bidder predicted YES
  if (projectStatus === "CLOSED" && prediction === "YES") {
    return {
      won: false,
      payout: 0, // Bid amount lost, transferred to project owner (micro-funding)
      outcome: "lost",
    };
  }

  return { won: false, payout: null, outcome: "lost" };
}

/**
 * Format currency for display
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

/**
 * Validate bid amount
 */
export function isValidBidAmount(amount: number): boolean {
  return amount >= MIN_BID_AMOUNT && amount <= MAX_BID_AMOUNT;
}

/**
 * Validate risk percentage
 */
export function isValidRiskPercent(riskPercent: number): boolean {
  return riskPercent >= 5 && riskPercent <= 50;
}

/**
 * Validate funding amount
 */
export function isValidFundingAmount(amount: number): boolean {
  return amount >= MIN_FUNDING_AMOUNT;
}
