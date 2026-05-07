"use client";

import Image from "next/image";
import Link from "next/link";

import { siteConfig } from "@/config/siteConfig";
import type { ArticleListItem } from "./ArticlesBrowser";

const FALLBACK_IMG = "/images/demo_1.png";
const AUTHOR_AVATAR = "/images/avatar.jpg";

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

function articleImage(a: { imageSrc?: string }): string {
  return a.imageSrc || FALLBACK_IMG;
}

type Props = {
  article: ArticleListItem;
};

/**
 * Vertical article card — image on top, content below. Used on /articles
 * and in the related-posts grid at the bottom of individual articles.
 * Shows: image, title, author (avatar + name), date, summary (line-clamp).
 * No category badge, no tags, no read-time.
 */
export function ArticleCard({ article }: Props) {
  const author = (article as { author?: string }).author || siteConfig.name;

  return (
    <Link
      href={`/articles/${article.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-xl border border-white/10 bg-white/5 transition-colors duration-200 hover:border-accent/50 hover:bg-white/[0.07]"
    >
      <div className="relative aspect-[16/10] w-full flex-none overflow-hidden bg-white/5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={articleImage(article)}
          alt={article.imageAlt || article.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          loading="lazy"
          decoding="async"
        />
      </div>

      <div className="flex min-w-0 flex-1 flex-col p-5">
        <h3 className="text-lg font-semibold leading-snug">
          <span className="relative inline bg-[linear-gradient(currentColor,currentColor)] bg-[length:0%_2px] bg-[position:0_100%] bg-no-repeat transition-[background-size] duration-300 group-hover:bg-[length:100%_2px]">
            {article.title}
          </span>
        </h3>

        {/* Author + date row */}
        <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
          <span className="relative h-6 w-6 flex-none overflow-hidden rounded-full ring-1 ring-white/10">
            <Image
              src={AUTHOR_AVATAR}
              alt=""
              fill
              sizes="24px"
              className="object-cover"
            />
          </span>
          <span className="font-medium text-foreground">{author}</span>
          <span aria-hidden className="text-muted-foreground/60">
            ·
          </span>
          <span>{formatDate(article.date)}</span>
        </div>

        {article.summary && (
          <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
            {article.summary}
          </p>
        )}
      </div>
    </Link>
  );
}
