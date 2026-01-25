// lib/mdx/mdx.ts
// MDX utilities for loading and processing articles
import fs from "fs";
import path from "path";
import matter from "gray-matter";

const CONTENT_DIR = path.join(process.cwd(), "content/articles");

export interface ArticleFrontmatter {
  title: string;
  slug: string;
  summary: string;
  date: string;
  updated?: string;
  category?: string;
  tags?: string[];
  featured?: boolean;
  draft?: boolean;
  imageSrc?: string;
  imageAlt?: string;
  author?: string;
}

export interface Article extends ArticleFrontmatter {
  content: string;
  readingTime: number;
  wordCount: number;
}

export interface ArticlePreview extends ArticleFrontmatter {
  readingTime: number;
}

/**
 * Calculate reading time from content
 */
function calculateReadingTime(content: string): { time: number; words: number } {
  const wordsPerMinute = 200;
  const words = content.trim().split(/\s+/).length;
  const time = Math.ceil(words / wordsPerMinute);
  return { time: Math.max(1, time), words };
}

/**
 * Get all article files from the content directory
 */
function getArticleFiles(): string[] {
  try {
    if (!fs.existsSync(CONTENT_DIR)) {
      return [];
    }
    return fs
      .readdirSync(CONTENT_DIR)
      .filter((file) => file.endsWith(".mdx") || file.endsWith(".md"));
  } catch {
    return [];
  }
}

/**
 * Parse article file and extract frontmatter + content
 */
function parseArticleFile(
  filePath: string
): { frontmatter: ArticleFrontmatter; content: string } | null {
  try {
    const fileContent = fs.readFileSync(filePath, "utf-8");
    const { data, content } = matter(fileContent);

    // Extract slug from filename if not in frontmatter
    const filename = path.basename(filePath, path.extname(filePath));
    const slug = data.slug || filename;

    // Validate required fields
    if (!data.title || !data.date) {
      console.warn(`Article ${filename} is missing required fields (title, date)`);
      return null;
    }

    const frontmatter: ArticleFrontmatter = {
      title: data.title,
      slug,
      summary: data.summary || "",
      date: data.date,
      updated: data.updated,
      category: data.category,
      tags: data.tags || [],
      featured: data.featured || false,
      draft: data.draft || false,
      imageSrc: data.imageSrc,
      imageAlt: data.imageAlt,
      author: data.author,
    };

    return { frontmatter, content };
  } catch (error) {
    console.error(`Error parsing article file ${filePath}:`, error);
    return null;
  }
}

/**
 * Get all published articles (excludes drafts in production)
 */
export async function getArticles(): Promise<ArticlePreview[]> {
  const files = getArticleFiles();
  const articles: ArticlePreview[] = [];

  for (const file of files) {
    const filePath = path.join(CONTENT_DIR, file);
    const parsed = parseArticleFile(filePath);

    if (!parsed) continue;
    const { frontmatter, content } = parsed;

    // Skip drafts in production
    if (frontmatter.draft && process.env.NODE_ENV === "production") {
      continue;
    }

    const { time } = calculateReadingTime(content);

    articles.push({
      ...frontmatter,
      readingTime: time,
    });
  }

  // Sort by date (newest first), featured articles at top
  return articles.sort((a, b) => {
    if (a.featured && !b.featured) return -1;
    if (!a.featured && b.featured) return 1;
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });
}

/**
 * Get a single article by slug
 */
export async function getArticleBySlug(slug: string): Promise<Article | null> {
  const files = getArticleFiles();

  for (const file of files) {
    const filePath = path.join(CONTENT_DIR, file);
    const parsed = parseArticleFile(filePath);

    if (!parsed) continue;
    const { frontmatter, content } = parsed;

    if (frontmatter.slug === slug) {
      // Skip drafts in production
      if (frontmatter.draft && process.env.NODE_ENV === "production") {
        return null;
      }

      const { time, words } = calculateReadingTime(content);

      return {
        ...frontmatter,
        content,
        readingTime: time,
        wordCount: words,
      };
    }
  }

  return null;
}

/**
 * Get all article slugs for static generation
 */
export async function getArticleSlugs(): Promise<string[]> {
  const articles = await getArticles();
  return articles.map((article) => article.slug);
}

/**
 * Get articles by category
 */
export async function getArticlesByCategory(
  category: string
): Promise<ArticlePreview[]> {
  const articles = await getArticles();
  return articles.filter(
    (article) =>
      article.category?.toLowerCase() === category.toLowerCase()
  );
}

/**
 * Get articles by tag
 */
export async function getArticlesByTag(tag: string): Promise<ArticlePreview[]> {
  const articles = await getArticles();
  return articles.filter((article) =>
    article.tags?.some((t) => t.toLowerCase() === tag.toLowerCase())
  );
}

/**
 * Get all unique categories
 */
export async function getCategories(): Promise<string[]> {
  const articles = await getArticles();
  const categories = new Set<string>();

  for (const article of articles) {
    if (article.category) {
      categories.add(article.category);
    }
  }

  return Array.from(categories).sort();
}

/**
 * Get all unique tags
 */
export async function getTags(): Promise<string[]> {
  const articles = await getArticles();
  const tags = new Set<string>();

  for (const article of articles) {
    for (const tag of article.tags || []) {
      tags.add(tag);
    }
  }

  return Array.from(tags).sort();
}

/**
 * Get related articles based on tags
 */
export async function getRelatedArticles(
  currentSlug: string,
  limit: number = 3
): Promise<ArticlePreview[]> {
  const current = await getArticleBySlug(currentSlug);
  if (!current || !current.tags?.length) return [];

  const articles = await getArticles();

  // Score articles by number of matching tags
  const scored = articles
    .filter((article) => article.slug !== currentSlug)
    .map((article) => {
      const matchingTags =
        article.tags?.filter((tag) => current.tags?.includes(tag)).length || 0;
      return { article, score: matchingTags };
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score);

  return scored.slice(0, limit).map(({ article }) => article);
}
