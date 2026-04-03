import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    // Get auth header
    const authHeader = request.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Missing authorization header" },
        { status: 401 }
      );
    }

    // Verify token with Supabase
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
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { roles } = body;

    if (!Array.isArray(roles) || roles.length === 0) {
      return NextResponse.json(
        { error: "At least one role is required" },
        { status: 400 }
      );
    }

    // Validate roles
    const validRoles = ["OWNER", "FUNDER", "BIDDER"];
    const invalidRoles = roles.filter((r) => !validRoles.includes(r));

    if (invalidRoles.length > 0) {
      return NextResponse.json(
        { error: `Invalid roles: ${invalidRoles.join(", ")}` },
        { status: 400 }
      );
    }

    // Get or create user in Prisma
    let dbUser = await prisma.user.findUnique({
      where: { id: user.id },
    });

    if (!dbUser) {
      // Create new user with Supabase ID
      dbUser = await prisma.user.create({
        data: {
          id: user.id,
          email: user.email || "",
          githubUsername: user.user_metadata?.user_name || undefined,
          avatarUrl: user.user_metadata?.avatar_url || undefined,
        },
      });
    }

    // Remove existing roles
    await prisma.userRole.deleteMany({
      where: { userId: user.id },
    });

    // Add new roles
    await prisma.userRole.createMany({
      data: roles.map((role: string) => ({
        userId: user.id,
        role: role as "OWNER" | "FUNDER" | "BIDDER",
      })),
    });

    return NextResponse.json(
      { success: true, roles },
      { status: 200 }
    );
  } catch (error) {
    console.error("Set roles error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
