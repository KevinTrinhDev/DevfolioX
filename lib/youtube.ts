// lib/youtube.ts
// YouTube Data API v3 integration

export interface YouTubeVideo {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  publishedAt: string;
  viewCount?: number;
  likeCount?: number;
  duration?: string;
  url: string;
}

interface YouTubeApiResponse {
  items?: Array<{
    id: { videoId?: string } | string;
    snippet?: {
      title: string;
      description: string;
      publishedAt: string;
      thumbnails?: {
        high?: { url: string };
        medium?: { url: string };
        default?: { url: string };
      };
    };
    statistics?: {
      viewCount?: string;
      likeCount?: string;
    };
    contentDetails?: {
      duration?: string;
    };
  }>;
}

/**
 * Fetch latest videos from a YouTube channel
 */
export async function fetchYouTubeVideos(
  channelId: string,
  maxResults: number = 6
): Promise<YouTubeVideo[]> {
  const apiKey = process.env.YOUTUBE_API_KEY;

  if (!apiKey) {
    console.warn("YOUTUBE_API_KEY not set, returning empty array");
    return [];
  }

  try {
    // First, get the video IDs from the channel's uploads
    const searchUrl = new URL(
      "https://www.googleapis.com/youtube/v3/search"
    );
    searchUrl.searchParams.set("key", apiKey);
    searchUrl.searchParams.set("channelId", channelId);
    searchUrl.searchParams.set("order", "date");
    searchUrl.searchParams.set("part", "snippet");
    searchUrl.searchParams.set("type", "video");
    searchUrl.searchParams.set("maxResults", String(maxResults));

    const searchRes = await fetch(searchUrl.toString(), {
      next: { revalidate: 3600 }, // Cache for 1 hour
    });

    if (!searchRes.ok) {
      throw new Error(`YouTube API error: ${searchRes.status}`);
    }

    const searchData: YouTubeApiResponse = await searchRes.json();

    if (!searchData.items || searchData.items.length === 0) {
      return [];
    }

    // Get video IDs
    const videoIds = searchData.items
      .map((item) => {
        if (typeof item.id === "object" && item.id.videoId) {
          return item.id.videoId;
        }
        return null;
      })
      .filter(Boolean) as string[];

    if (videoIds.length === 0) {
      return [];
    }

    // Fetch detailed video info (views, likes, duration)
    const videosUrl = new URL(
      "https://www.googleapis.com/youtube/v3/videos"
    );
    videosUrl.searchParams.set("key", apiKey);
    videosUrl.searchParams.set("id", videoIds.join(","));
    videosUrl.searchParams.set("part", "snippet,statistics,contentDetails");

    const videosRes = await fetch(videosUrl.toString(), {
      next: { revalidate: 3600 },
    });

    if (!videosRes.ok) {
      // Fall back to search results without stats
      return searchData.items.map((item) => {
        const videoId =
          typeof item.id === "object" ? item.id.videoId : item.id;
        return {
          id: videoId || "",
          title: item.snippet?.title || "",
          description: item.snippet?.description || "",
          thumbnailUrl:
            item.snippet?.thumbnails?.high?.url ||
            item.snippet?.thumbnails?.medium?.url ||
            "",
          publishedAt: item.snippet?.publishedAt || "",
          url: `https://www.youtube.com/watch?v=${videoId}`,
        };
      });
    }

    const videosData: YouTubeApiResponse = await videosRes.json();

    return (videosData.items || []).map((item) => {
      const videoId = typeof item.id === "string" ? item.id : "";
      return {
        id: videoId,
        title: item.snippet?.title || "",
        description: item.snippet?.description || "",
        thumbnailUrl:
          item.snippet?.thumbnails?.high?.url ||
          item.snippet?.thumbnails?.medium?.url ||
          "",
        publishedAt: item.snippet?.publishedAt || "",
        viewCount: item.statistics?.viewCount
          ? parseInt(item.statistics.viewCount, 10)
          : undefined,
        likeCount: item.statistics?.likeCount
          ? parseInt(item.statistics.likeCount, 10)
          : undefined,
        duration: item.contentDetails?.duration,
        url: `https://www.youtube.com/watch?v=${videoId}`,
      };
    });
  } catch (error) {
    console.error("Failed to fetch YouTube videos:", error);
    return [];
  }
}

/**
 * Parse ISO 8601 duration to human-readable format
 */
export function formatDuration(isoDuration?: string): string {
  if (!isoDuration) return "";

  const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return "";

  const hours = match[1] ? parseInt(match[1], 10) : 0;
  const minutes = match[2] ? parseInt(match[2], 10) : 0;
  const seconds = match[3] ? parseInt(match[3], 10) : 0;

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

/**
 * Format view count for display
 */
export function formatViewCount(count?: number): string {
  if (!count) return "";
  if (count >= 1_000_000) {
    return `${(count / 1_000_000).toFixed(1)}M views`;
  }
  if (count >= 1_000) {
    return `${(count / 1_000).toFixed(1)}K views`;
  }
  return `${count} views`;
}
