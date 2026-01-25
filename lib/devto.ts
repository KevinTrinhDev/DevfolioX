// lib/devto.ts
// Dev.to API integration

export interface DevToArticle {
  id: number;
  title: string;
  description: string;
  url: string;
  publishedAt: string;
  readingTimeMinutes: number;
  tags: string[];
  coverImage?: string;
  reactionsCount: number;
  commentsCount: number;
  source: "devto";
}

interface DevToApiArticle {
  id: number;
  title: string;
  description: string;
  url: string;
  published_at: string;
  reading_time_minutes: number;
  tag_list: string[];
  cover_image?: string;
  public_reactions_count: number;
  comments_count: number;
}

/**
 * Fetch articles from Dev.to for a user
 */
export async function fetchDevToArticles(
  username: string,
  perPage: number = 10
): Promise<DevToArticle[]> {
  try {
    const url = new URL("https://dev.to/api/articles");
    url.searchParams.set("username", username);
    url.searchParams.set("per_page", String(perPage));

    const res = await fetch(url.toString(), {
      headers: {
        Accept: "application/json",
      },
      next: { revalidate: 3600 }, // Cache for 1 hour
    });

    if (!res.ok) {
      throw new Error(`Dev.to API error: ${res.status}`);
    }

    const articles: DevToApiArticle[] = await res.json();

    return articles.map((article) => ({
      id: article.id,
      title: article.title,
      description: article.description,
      url: article.url,
      publishedAt: article.published_at,
      readingTimeMinutes: article.reading_time_minutes,
      tags: article.tag_list,
      coverImage: article.cover_image,
      reactionsCount: article.public_reactions_count,
      commentsCount: article.comments_count,
      source: "devto" as const,
    }));
  } catch (error) {
    console.error("Failed to fetch Dev.to articles:", error);
    return [];
  }
}
