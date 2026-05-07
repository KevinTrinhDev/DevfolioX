"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  FileText,
  Search,
  X,
} from "lucide-react";

import { ArticleCard } from "./ArticleCard";
import { siteConfig } from "@/config/siteConfig";

export type ArticleListItem = {
  slug: string;
  title: string;
  summary?: string;
  date: string;
  category?: string;
  tags?: string[];
  featured?: boolean;
  imageSrc?: string;
  imageAlt?: string;
  readingTime: number;
  author?: string;
};

type Props = {
  articles: ArticleListItem[];
};

const PAGE_SIZE = 9;
const AUTHOR_AVATAR = "/images/avatar.jpg";
const FALLBACK_IMG = "/images/demo_1.png";

function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
}

/**
 * Build the visible page-number row with ellipses.
 *   1 … 4 [5] 6 … 12
 */
function pageNumbers(current: number, total: number): (number | "…")[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  const set = new Set<number>([1, total, current, current - 1, current + 1]);
  const sorted = Array.from(set)
    .filter((n) => n >= 1 && n <= total)
    .sort((a, b) => a - b);
  const out: (number | "…")[] = [];
  for (let i = 0; i < sorted.length; i++) {
    out.push(sorted[i]);
    if (i < sorted.length - 1 && sorted[i + 1] - sorted[i] > 1) out.push("…");
  }
  return out;
}

/**
 * Single big featured article — replaces the auto-rotating carousel. Picks
 * the most recent featured article (or the most recent overall as a
 * fallback). Postiz-style: large cover image on top, title + meta below.
 */
function FeaturedHero({ article }: { article: ArticleListItem }) {
  const author = article.author || siteConfig.name;
  return (
    <Link
      href={`/articles/${article.slug}`}
      aria-label={`Read featured article: ${article.title}`}
      className="group block overflow-hidden rounded-2xl border border-white/10 bg-white/5 transition-colors hover:border-accent/50 hover:bg-white/[0.07]"
    >
      <div className="relative aspect-[21/9] w-full overflow-hidden bg-white/5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={article.imageSrc || FALLBACK_IMG}
          alt={article.imageAlt || article.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          loading="eager"
          decoding="async"
        />
      </div>
      <div className="flex flex-col gap-3 p-6 sm:p-8">
        <h2 className="text-2xl font-semibold leading-tight sm:text-3xl md:text-4xl">
          <span className="bg-[linear-gradient(currentColor,currentColor)] bg-[length:0%_2px] bg-[position:0_100%] bg-no-repeat transition-[background-size] duration-500 group-hover:bg-[length:100%_2px]">
            {article.title}
          </span>
        </h2>
        {article.summary && (
          <p className="line-clamp-2 max-w-3xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            {article.summary}
          </p>
        )}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="relative h-7 w-7 flex-none overflow-hidden rounded-full ring-1 ring-white/10">
            <Image
              src={AUTHOR_AVATAR}
              alt=""
              fill
              sizes="28px"
              className="object-cover"
            />
          </span>
          <span className="font-medium text-foreground">{author}</span>
          <span aria-hidden className="text-muted-foreground/60">
            ·
          </span>
          <span>{formatDate(article.date)}</span>
        </div>
      </div>
    </Link>
  );
}

export function ArticlesBrowser({ articles }: Props) {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [page, setPage] = useState(1);

  // Debounce search input — 150ms is fast enough to feel live but cheap.
  useEffect(() => {
    const t = window.setTimeout(() => setDebouncedQuery(query), 150);
    return () => window.clearTimeout(t);
  }, [query]);

  useEffect(() => {
    setPage(1);
  }, [debouncedQuery]);

  // Featured hero: prefer the first featured article, fall back to the most
  // recent overall (already sorted newest-first by the loader).
  const featuredHero = useMemo(() => {
    return articles.find((a) => a.featured) || articles[0] || null;
  }, [articles]);

  // Filter pipeline — text search only (categories/tags sidebar removed).
  const filtered = useMemo(() => {
    const q = debouncedQuery.trim().toLowerCase();
    if (!q) return articles;
    return articles.filter((a) => {
      const haystack = [
        a.title,
        a.summary ?? "",
        a.category ?? "",
        ...(a.tags ?? []),
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [articles, debouncedQuery]);

  const hasFilter = debouncedQuery.trim().length > 0;

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageStart = (safePage - 1) * PAGE_SIZE;
  const pageItems = filtered.slice(pageStart, pageStart + PAGE_SIZE);

  const clearAll = () => setQuery("");

  return (
    <div className="flex flex-col gap-12">
      {featuredHero && !hasFilter && <FeaturedHero article={featuredHero} />}

      {/* Search */}
      <div className="relative">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search articles by title, summary, tag, or category…"
          aria-label="Search articles"
          className="h-11 w-full rounded-lg border border-white/15 bg-white/5 pl-9 pr-10 text-sm text-foreground outline-none ring-0 placeholder:text-muted-foreground/70 focus:border-accent"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            aria-label="Clear search"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {hasFilter && (
        <div className="-mt-6 flex items-center justify-between text-sm text-muted-foreground">
          <span>
            {filtered.length}{" "}
            {filtered.length === 1 ? "match" : "matches"}
          </span>
          <button
            type="button"
            onClick={clearAll}
            className="text-accent transition-colors hover:underline"
          >
            Clear
          </button>
        </div>
      )}

      <section>
        <h2 className="mb-6 text-xl font-semibold">
          {hasFilter ? "Results" : "Latest articles"}
        </h2>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <FileText className="mb-4 h-12 w-12 text-muted-foreground/50" />
            <h3 className="mb-1 text-lg font-semibold">No articles found</h3>
            <p className="text-sm text-muted-foreground">
              {hasFilter
                ? "Try a different search."
                : "Articles will appear here once they're published."}
            </p>
            {hasFilter && (
              <button
                type="button"
                onClick={clearAll}
                className="mt-4 inline-flex items-center gap-1.5 rounded-md border border-white/15 bg-white/5 px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:border-accent hover:bg-white/10"
              >
                Clear search
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {pageItems.map((article) => (
              <ArticleCard key={article.slug} article={article} />
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <nav
            aria-label="Pagination"
            className="mt-10 flex flex-wrap items-center justify-center gap-1.5"
          >
            <button
              type="button"
              onClick={() => setPage(safePage - 1)}
              disabled={safePage === 1}
              aria-label="Previous page"
              className="inline-flex h-9 items-center gap-1 rounded-md border border-white/15 bg-white/5 px-3 text-sm font-medium text-foreground transition-colors hover:border-accent hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-white/15 disabled:hover:bg-white/5"
            >
              <ChevronLeft className="h-4 w-4" />
              Prev
            </button>

            {pageNumbers(safePage, totalPages).map((p, i) =>
              p === "…" ? (
                <span
                  key={`ellipsis-${i}`}
                  aria-hidden
                  className="px-2 text-muted-foreground"
                >
                  …
                </span>
              ) : (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPage(p)}
                  aria-current={p === safePage ? "page" : undefined}
                  aria-label={`Go to page ${p}`}
                  className={[
                    "inline-flex h-9 w-9 items-center justify-center rounded-md text-sm font-medium transition-colors",
                    p === safePage
                      ? "border border-accent bg-accent text-white"
                      : "border border-white/15 bg-white/5 text-foreground hover:border-accent hover:bg-white/10",
                  ].join(" ")}
                >
                  {p}
                </button>
              )
            )}

            <button
              type="button"
              onClick={() => setPage(safePage + 1)}
              disabled={safePage === totalPages}
              aria-label="Next page"
              className="inline-flex h-9 items-center gap-1 rounded-md border border-white/15 bg-white/5 px-3 text-sm font-medium text-foreground transition-colors hover:border-accent hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-white/15 disabled:hover:bg-white/5"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </button>
          </nav>
        )}
      </section>
    </div>
  );
}
