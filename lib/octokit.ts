import { Octokit } from "octokit";

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

// Simple in-memory cache with TTL (6 hours)
const cache = new Map<
  string,
  { data: unknown; timestamp: number }
>();
const CACHE_TTL = 6 * 60 * 60 * 1000; // 6 hours

function getCached(key: string) {
  const item = cache.get(key);
  if (!item) return null;
  if (Date.now() - item.timestamp > CACHE_TTL) {
    cache.delete(key);
    return null;
  }
  return item.data;
}

function setCached(key: string, data: unknown) {
  cache.set(key, { data, timestamp: Date.now() });
}

export interface RepoMetadata {
  owner: string;
  repo: string;
  fullName: string;
  description: string;
  stars: number;
  forks: number;
  language?: string;
  topics: string[];
  readme?: string;
  url: string;
}

/**
 * Fetch GitHub repository metadata
 */
export async function fetchRepoMetadata(
  owner: string,
  repo: string
): Promise<RepoMetadata | null> {
  try {
    const cacheKey = `repo:${owner}/${repo}`;
    const cached = getCached(cacheKey);
    if (cached) return cached as RepoMetadata;

    const { data } = await octokit.rest.repos.get({
      owner,
      repo,
    });

    let readme: string | undefined;
    try {
      const readmeResponse = await octokit.rest.repos.getReadme({
        owner,
        repo,
        headers: {
          accept: "application/vnd.github.v3.raw",
        },
      });
      readme = readmeResponse.data as unknown as string;
    } catch {
      // README not found, it's okay
    }

    const metadata: RepoMetadata = {
      owner,
      repo,
      fullName: data.full_name,
      description: data.description || "",
      stars: data.stargazers_count,
      forks: data.forks_count,
      language: data.language || undefined,
      topics: data.topics || [],
      readme,
      url: data.html_url,
    };

    setCached(cacheKey, metadata);
    return metadata;
  } catch (error) {
    console.error(`Failed to fetch repo metadata for ${owner}/${repo}:`, error);
    return null;
  }
}

/**
 * Fetch commit activity stats for the past year
 */
export async function fetchCommitStats(owner: string, repo: string) {
  try {
    const cacheKey = `commits:${owner}/${repo}`;
    const cached = getCached(cacheKey);
    if (cached) return cached;

    const response = await octokit.rest.repos.getCommitActivityStats({
      owner,
      repo,
    });

    // Parse the stat response (returns weeks with commit counts)
    const stats = (response.data as unknown as Array<{ week: number; total: number; days: number[] }>) || [];

    setCached(cacheKey, stats);
    return stats;
  } catch (error) {
    console.error(`Failed to fetch commit stats for ${owner}/${repo}:`, error);
    return [];
  }
}

/**
 * Parse GitHub repo URL and extract owner/repo
 */
export function parseGitHubUrl(url: string): {
  owner: string;
  repo: string;
} | null {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname.split("/").filter(Boolean);

    if (pathname.length < 2) return null;

    return {
      owner: pathname[0],
      repo: pathname[1].replace(".git", ""),
    };
  } catch {
    return null;
  }
}

/**
 * Check GitHub API rate limit
 */
export async function checkRateLimit() {
  try {
    const { data } = await octokit.rest.rateLimit.get();
    const coreLimit = data.resources?.core;
    if (!coreLimit) return null;
    
    return {
      remaining: coreLimit.remaining,
      limit: coreLimit.limit,
      resetAt: new Date(coreLimit.reset * 1000),
    };
  } catch (error) {
    console.error("Failed to check rate limit:", error);
    return null;
  }
}

/**
 * Clear cache (useful for testing)
 */
export function clearCache() {
  cache.clear();
}
