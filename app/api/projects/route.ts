import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createProjectSchema } from "@/lib/schemas";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

// Verify auth and get user
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

// GET /api/projects - List all projects with pagination
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const status = searchParams.get("status");

    const skip = (page - 1) * limit;
    const whereClause: any = {};

    if (status) {
      whereClause.status = status;
    }

    const [projects, total] = await Promise.all([
      prisma.project.findMany({
        where: whereClause,
        include: {
          owner: {
            select: {
              id: true,
              email: true,
              githubUsername: true,
              avatarUrl: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.project.count({ where: whereClause }),
    ]);

    return NextResponse.json(
      {
        projects,
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
    console.error("GET /api/projects error:", error);
    return NextResponse.json(
      { error: "Failed to fetch projects" },
      { status: 500 }
    );
  }
}

// POST /api/projects - Create new project
export async function POST(request: NextRequest) {
  try {
    const { user, error: authError } = await verifyAuth(request);
    if (authError || !user) {
      return NextResponse.json({ error: authError }, { status: 401 });
    }

    const body = await request.json();

    // Validate with Zod
    const validation = createProjectSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.error.issues },
        { status: 400 }
      );
    }

    const { githubRepoUrl, title, description, techStack, fundingGoal, deadline } =
      validation.data;

    // Create project
    const project = await prisma.project.create({
      data: {
        ownerId: user.id,
        githubRepoUrl,
        title,
        description,
        techStack: techStack || [],
        fundingGoal,
        deadline: deadline ? new Date(deadline) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        status: "OPEN",
        totalFunded: 0,
      },
      include: {
        owner: {
          select: {
            id: true,
            email: true,
            githubUsername: true,
            avatarUrl: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        project,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/projects error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create project" },
      { status: 500 }
    );
  }
}
