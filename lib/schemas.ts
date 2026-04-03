import { z } from "zod";

// Project schemas
export const createProjectSchema = z.object({
  githubRepoUrl: z.string().url(),
  title: z.string().min(3).max(100),
  description: z.string().min(10).max(1000),
  fundingGoal: z.number().min(100),
  deadline: z.string().datetime().optional(),
  techStack: z.array(z.string()).optional(),
});

// Funding schemas
export const createFundingSchema = z.object({
  projectId: z.string().uuid(),
  amount: z.number().min(5),
  tip: z.boolean().optional(),
});

// Bid schemas
export const createBidSchema = z.object({
  projectId: z.string().uuid(),
  amount: z.number().min(10).max(10000),
  riskPercent: z.number().min(5).max(50),
  prediction: z.enum(["YES", "NO"]),
});

// Auth schemas
export const emailPasswordSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const signUpSchema = z
  .object({
    email: z.string().email(),
    password: z.string().min(6),
    confirmPassword: z.string().min(6),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export const rolesSchema = z.object({
  roles: z.array(z.enum(["OWNER", "FUNDER", "BIDDER"])).min(1),
});

// Type exports
export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type CreateFundingInput = z.infer<typeof createFundingSchema>;
export type CreateBidInput = z.infer<typeof createBidSchema>;
export type EmailPasswordInput = z.infer<typeof emailPasswordSchema>;
export type SignUpInput = z.infer<typeof signUpSchema>;
export type RolesInput = z.infer<typeof rolesSchema>;
