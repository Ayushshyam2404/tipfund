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

// GET /api/projects/[id] - Get single project
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        owner: {
          select: {
            id: true,
            email: true,
            githubUsername: true,
            avatarUrl: true,
          },
        },
        fundings: {
          select: {
            id: true,
            amount: true,
            createdAt: true,
            funder: {
              select: {
                id: true,
                email: true,
                githubUsername: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
          take: 10,
        },
        bids: {
          select: {
            id: true,
            amount: true,
            prediction: true,
            settled: true,
            createdAt: true,
            bidder: {
              select: {
                id: true,
                githubUsername: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
          take: 10,
        },
      },
    });

    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ project }, { status: 200 });
  } catch (error) {
    console.error("GET /api/projects/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to fetch project" },
      { status: 500 }
    );
  }
}

// PATCH /api/projects/[id] - Update project (owner only)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { user, error: authError } = await verifyAuth(request);
    if (authError || !user) {
      return NextResponse.json({ error: authError }, { status: 401 });
    }

    // Check ownership
    const project = await prisma.project.findUnique({
      where: { id },
      select: { ownerId: true },
    });

    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    if (project.ownerId !== user.id) {
      return NextResponse.json(
        { error: "Not authorized to update this project" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { status, fundingGoal, deadline } = body;

    // Only allow updating specific fields
    const updateData: any = {};
    if (status && ["OPEN", "FUNDED", "CLOSED"].includes(status)) {
      updateData.status = status;
    }
    if (fundingGoal) updateData.fundingGoal = fundingGoal;
    if (deadline) updateData.deadline = new Date(deadline);

    const updated = await prisma.project.update({
      where: { id },
      data: updateData,
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
      { success: true, project: updated },
      { status: 200 }
    );
  } catch (error) {
    console.error("PATCH /api/projects/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to update project" },
      { status: 500 }
    );
  }
}
