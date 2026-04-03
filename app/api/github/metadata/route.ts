import { NextRequest, NextResponse } from "next/server";
import {
  fetchRepoMetadata,
  fetchCommitStats,
  parseGitHubUrl,
  checkRateLimit,
} from "@/lib/octokit";

export const dynamic = "force-dynamic";

// GET /api/github/metadata - Fetch repo metadata
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const repoUrl = searchParams.get("url");

    if (!repoUrl) {
      return NextResponse.json(
        { error: "Missing url parameter" },
        { status: 400 }
      );
    }

    // Parse GitHub URL
    const parsed = parseGitHubUrl(repoUrl);

    if (!parsed || !parsed.owner || !parsed.repo) {
      return NextResponse.json(
        { error: "Invalid GitHub URL" },
        { status: 400 }
      );
    }

    const { owner, repo } = parsed;

    // Check rate limit first
    const rateLimit = await checkRateLimit();
    if (rateLimit && rateLimit.remaining < 10) {
      return NextResponse.json(
        {
          error: "GitHub API rate limit near exceeded",
          remaining: rateLimit.remaining,
          limit: rateLimit.limit,
          resetAt: rateLimit.resetAt,
        },
        { status: 429 }
      );
    }

    // Fetch metadata in parallel
    const [metadata, commitStats] = await Promise.all([
      fetchRepoMetadata(owner, repo),
      fetchCommitStats(owner, repo),
    ]);

    if (!metadata) {
      return NextResponse.json(
        { error: "Repository not found or private" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        metadata: {
          ...metadata,
          commitStats,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET /api/github/metadata error:", error);

    if (error instanceof Error && error.message.includes("404")) {
      return NextResponse.json(
        { error: "Repository not found" },
        { status: 404 }
      );
    }

    if (error instanceof Error && error.message.includes("403")) {
      return NextResponse.json(
        { error: "Rate limited or repository is private" },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch repository metadata" },
      { status: 500 }
    );
  }
}
