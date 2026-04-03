import { prisma } from "./prisma";
import { User, Project, Funding, Bid, Role } from "@prisma/client";

// User functions
export async function getUser(id: string) {
  return prisma.user.findUnique({ where: { id } });
}

export async function getUserByEmail(email: string) {
  return prisma.user.findUnique({ where: { email } });
}

export async function getUserByGitHub(githubUsername: string) {
  return prisma.user.findUnique({ where: { githubUsername } });
}

export async function createUser(data: {
  email: string;
  githubUsername?: string;
  avatarUrl?: string;
}) {
  return prisma.user.create({ data });
}

export async function updateUser(
  id: string,
  data: Partial<User>
) {
  return prisma.user.update({ where: { id }, data });
}

export async function setUserRoles(userId: string, roles: Role[]) {
  // First delete existing roles
  await prisma.userRole.deleteMany({ where: { userId } });
  // Then create new ones
  return prisma.userRole.createMany({
    data: roles.map((role) => ({ userId, role })),
  });
}

export async function getUserRoles(userId: string) {
  const userRoles = await prisma.userRole.findMany({ where: { userId } });
  return userRoles.map((ur) => ur.role);
}

// Project functions
export async function createProject(data: {
  ownerId: string;
  githubRepoUrl: string;
  title: string;
  description: string;
  techStack: string[];
  fundingGoal: number;
  deadline?: Date;
  stars?: number;
  forks?: number;
  language?: string;
}) {
  return prisma.project.create({ data });
}

export async function getProject(id: string) {
  return prisma.project.findUnique({
    where: { id },
    include: {
      owner: true,
      fundings: true,
      bids: true,
    },
  });
}

export async function getProjectsByOwner(ownerId: string) {
  return prisma.project.findMany({
    where: { ownerId },
    include: { owner: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function updateProjectStatus(
  id: string,
  status: "OPEN" | "FUNDED" | "CLOSED"
) {
  return prisma.project.update({
    where: { id },
    data: { status },
  });
}

export async function updateProjectStats(
  id: string,
  stars: number,
  forks: number,
  language?: string
) {
  return prisma.project.update({
    where: { id },
    data: { stars, forks, language },
  });
}

export async function getProjectStats(id: string) {
  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      fundings: true,
      bids: true,
    },
  });

  if (!project) return null;

  return {
    ...project,
    fundingCount: project.fundings.length,
    bidCount: project.bids.length,
    yesVotes: project.bids.filter((b) => b.prediction).length,
    noVotes: project.bids.filter((b) => !b.prediction).length,
  };
}

export async function getRecentProjects(limit = 10) {
  return prisma.project.findMany({
    where: { status: "OPEN" },
    take: limit,
    orderBy: { createdAt: "desc" },
    include: { owner: true },
  });
}

// Funding functions
export async function createFunding(data: {
  projectId: string;
  funderId: string;
  amount: number;
  netAmount: number;
  platformFee: number;
  tip?: boolean;
}) {
  return prisma.funding.create({ data });
}

export async function getFundingsByProject(projectId: string) {
  return prisma.funding.findMany({
    where: { projectId },
    include: { funder: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function getFundingsByFunder(funderId: string) {
  return prisma.funding.findMany({
    where: { funderId },
    include: { project: true },
    orderBy: { createdAt: "desc" },
  });
}

// Bid functions
export async function createBid(data: {
  projectId: string;
  bidderId: string;
  amount: number;
  riskPercent: number;
  prediction: "YES" | "NO";
}) {
  return prisma.bid.create({ data });
}

export async function getBidsOnProject(projectId: string) {
  return prisma.bid.findMany({
    where: { projectId },
    include: { bidder: true },
    orderBy: { amount: "desc" },
  });
}

export async function getBidsByBidder(bidderId: string) {
  return prisma.bid.findMany({
    where: { bidderId },
    include: { project: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function getUnsettledBidsOnProject(projectId: string) {
  return prisma.bid.findMany({
    where: { projectId, settled: false },
    include: { bidder: true },
  });
}

export async function settleBid(
  id: string,
  outcome: "won" | "lost",
  payout: number | null
) {
  return prisma.bid.update({
    where: { id },
    data: { settled: true, outcome, payout, status: outcome },
  });
}
