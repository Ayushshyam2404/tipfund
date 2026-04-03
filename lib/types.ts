import type { User, Project, Funding, Bid, ProjectStatus } from "@prisma/client";

// Re-export Prisma types
export type { User, Project, Funding, Bid, ProjectStatus };

// Extended types
export type ProjectWithStats = Project & {
  owner: User;
  fundingCount: number;
  bidCount: number;
  yesVotes: number;
  noVotes: number;
  fundings?: Funding[];
  bids?: Bid[];
};

export type BidWithBidder = Bid & {
  bidder: User;
};

export type FundingWithFunder = Funding & {
  funder: User;
};

export type ProjectWithFundings = Project & {
  fundings: FundingWithFunder[];
};

export type UserWithRoles = User & {
  roles: string[]; // Array of role strings
};

export type BidOutcome = {
  won: boolean;
  payout: number | null;
  outcome: "won" | "lost";
};

export type APIResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
};

export type DashboardStats = {
  totalFunded: number;
  activeProjects: number;
  totalBids: number;
  userWinRate?: number;
};
