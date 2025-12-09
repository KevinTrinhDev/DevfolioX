// app/api/github-contributions/route.ts
import { NextRequest } from "next/server";
import {
  fetchGitHubContributionsForYear,
  type GitHubContributionDay,
} from "@/lib/github/contributions";

type ApiResponse = {
  username: string;
  year: number;
  days: GitHubContributionDay[];
};

// Simple in-memory cache for this server instance
type CacheEntry = {
  expiresAt: number; // timestamp in ms
  payload: ApiResponse;
};

// username:year -> CacheEntry
const memoryCache = new Map<string, CacheEntry>();

// Match the s-maxage (30 minutes)
const TTL_MS = 30 * 60 * 1000; // 30 minutes

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const usernameParam = searchParams.get("username");
    const yearParam = searchParams.get("year");

    const username = usernameParam || process.env.GITHUB_USERNAME || undefined;
    if (!username) {
      return new Response(JSON.stringify({ error: "Missing username" }), {
        status: 400,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    const now = new Date();
    const year = yearParam ? Number(yearParam) : now.getFullYear();
    if (!Number.isFinite(year)) {
      return new Response(JSON.stringify({ error: "Invalid year" }), {
        status: 400,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    // ----- In-memory cache lookup -----
    const cacheKey = `${username}:${year}`;
    const nowMs = Date.now();
    const cached = memoryCache.get(cacheKey);

    if (cached && cached.expiresAt > nowMs) {
      // Serve from in-memory cache
      return new Response(JSON.stringify(cached.payload), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "s-maxage=1800, stale-while-revalidate=86400",
        },
      });
    }

    // ----- Cache miss → fetch from GitHub -----
    const days = await fetchGitHubContributionsForYear(username, year);

    const payload: ApiResponse = { username, year, days };

    // Store in in-memory cache
    memoryCache.set(cacheKey, {
      expiresAt: nowMs + TTL_MS,
      payload,
    });

    return new Response(JSON.stringify(payload), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        // Cache at the edge for 30 min, allow stale for a day
        "Cache-Control": "s-maxage=1800, stale-while-revalidate=86400",
      },
    });
  } catch (err: any) {
    console.error("github-contributions API error:", err);
    return new Response(
      JSON.stringify({ error: "Failed to fetch contributions" }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}
