"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";

import { ArticleCard } from "./ArticleCard";
import type { ArticleListItem } from "./ArticlesBrowser";

type Props = {
  articles: ArticleListItem[];
  intervalMs?: number;
};

/**
 * Auto-advancing carousel of featured articles. Pauses on hover. Uses the
 * shared ArticleCard so featured items match the rest of the listing.
 */
export function FeaturedArticlesCarousel({
  articles,
  intervalMs = 6000,
}: Props) {
  const items = articles.filter(Boolean);
  const count = items.length;
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (count <= 1 || paused) return;
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % count);
    }, intervalMs);
    return () => window.clearInterval(id);
  }, [count, paused, intervalMs]);

  if (count === 0) return null;
  const safe = Math.min(index, count - 1);

  const go = (delta: number) => {
    setIndex((i) => (i + delta + count) % count);
  };

  return (
    <section
      aria-label="Featured articles"
      className="relative"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="mb-3 flex items-center justify-between">
        <h2 className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          <Sparkles className="h-3.5 w-3.5 text-accent" />
          Featured
        </h2>
        {count > 1 && (
          <div className="hidden items-center gap-1.5 sm:flex">
            <button
              type="button"
              aria-label="Previous featured article"
              onClick={() => go(-1)}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/15 bg-white/5 text-foreground transition-colors hover:border-accent hover:bg-white/10"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              aria-label="Next featured article"
              onClick={() => go(1)}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/15 bg-white/5 text-foreground transition-colors hover:border-accent hover:bg-white/10"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {/* Slide stage — render only the active slide so cards lay out cleanly */}
      <div className="relative">
        <div key={items[safe].slug} className="animate-in fade-in-0 duration-300">
          <ArticleCard article={items[safe]} />
        </div>
      </div>

      {/* Dots */}
      {count > 1 && (
        <div className="mt-4 flex items-center justify-center gap-1.5">
          {items.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Go to featured slide ${i + 1}`}
              onClick={() => setIndex(i)}
              className={[
                "h-1.5 rounded-full transition-all",
                i === safe ? "w-8 bg-accent" : "w-3 bg-white/30 hover:bg-white/50",
              ].join(" ")}
            />
          ))}
        </div>
      )}
    </section>
  );
}
