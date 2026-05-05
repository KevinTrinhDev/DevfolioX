// components/sections/ContentMedia.tsx
// Media wall: articles + YouTube videos in a single grid.
// Source data comes from config/articles + config/youtube; expand with TikTok / IG later.
"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";
import { ArrowUpRight, BookOpenText, Play } from "lucide-react";

import { blogPosts as articles } from "../../config/articles";
import { youtubeVideos } from "../../config/youtube";

type MediaItem = {
  id: string;
  href: string;
  external: boolean;
  imageSrc?: string;
  imageAlt?: string;
  title: string;
  meta?: string;
  type: "article" | "youtube";
  date?: string;
};

function timestamp(iso?: string): number {
  if (!iso) return 0;
  const t = new Date(iso).getTime();
  return Number.isFinite(t) ? t : 0;
}

function buildItems(): MediaItem[] {
  const items: MediaItem[] = [];

  for (const a of articles as any[]) {
    const slug = a?.slug || a?.id;
    if (!a?.title || !slug) continue;
    items.push({
      id: `article:${slug}`,
      href: a?.href || `/articles/${slug}`,
      external: typeof a?.href === "string" && /^https?:\/\//.test(a.href),
      imageSrc: a?.imageSrc,
      imageAlt: a?.imageAlt || a.title,
      title: a.title,
      meta: a.category || "Article",
      type: "article",
      date: a?.date,
    });
  }

  for (const v of youtubeVideos as any[]) {
    if (!v?.title || !v?.url) continue;
    items.push({
      id: `youtube:${v.id || v.url}`,
      href: v.url,
      external: true,
      imageSrc: v.thumbnailUrl,
      imageAlt: v.title,
      title: v.title,
      meta: v.duration ? `${v.duration} · YouTube` : "YouTube",
      type: "youtube",
      date: v?.date,
    });
  }

  return items.sort((a, b) => timestamp(b.date) - timestamp(a.date)).slice(0, 9);
}

function TypeBadge({ type }: { type: MediaItem["type"] }) {
  const cfg =
    type === "youtube"
      ? {
          label: "YouTube",
          Icon: Play,
          className:
            "border-red-500/30 bg-red-500/15 text-red-200",
        }
      : {
          label: "Article",
          Icon: BookOpenText,
          className:
            "border-indigo-400/30 bg-indigo-500/15 text-indigo-200",
        };

  const { Icon, label, className } = cfg;
  return (
    <span
      className={`inline-flex w-fit items-center gap-1.5 rounded-md border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${className}`}
    >
      <Icon className="h-3 w-3" aria-hidden="true" />
      {label}
    </span>
  );
}

function MediaCard({ item }: { item: MediaItem }) {
  const Inner = (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-lg border border-white/10 bg-white/5 transition-colors duration-200 ease-out hover:border-white/20 hover:bg-white/[0.07]">
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-white/5">
        {item.imageSrc ? (
          <Image
            src={item.imageSrc}
            alt={item.imageAlt || item.title}
            fill
            sizes="(min-width: 1024px) 360px, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/25 via-violet-500/15 to-sky-500/15" />
        )}

        {item.type === "youtube" && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/0 transition-colors duration-200 group-hover:bg-black/30">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-red-600/95 text-white shadow-[0_6px_24px_rgba(0,0,0,0.4)] transition-transform duration-200 group-hover:scale-110">
              <Play className="h-5 w-5 translate-x-[1px] fill-current" />
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <TypeBadge type={item.type} />
        <h4 className="text-[14px] font-semibold leading-snug text-foreground sm:text-[15px]">
          <span className="block break-words line-clamp-2">{item.title}</span>
        </h4>
      </div>
    </article>
  );

  if (item.external) {
    return (
      <a href={item.href} target="_blank" rel="noreferrer" className="block">
        {Inner}
      </a>
    );
  }
  return (
    <Link href={item.href} className="block">
      {Inner}
    </Link>
  );
}

export function ContentMediaSection() {
  const items = useMemo(buildItems, []);
  if (!items.length) return null;

  return (
    <section id="content" className="py-16 scroll-mt-12 lg:py-24">
      <div className="mx-auto w-full max-w-6xl px-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-1 items-center gap-4">
            <h2 className="font-mono text-base font-semibold uppercase tracking-[0.18em] text-muted-foreground sm:text-lg">
              ~/Content
            </h2>
            <div className="h-px w-40 bg-white/15 sm:w-72" aria-hidden />
          </div>

          <div className="grid grid-cols-1 gap-2 sm:flex sm:items-center">
            <Link
              href="/articles"
              className="group inline-flex w-full items-center justify-center gap-2 rounded-lg border border-white/15 bg-white/5 px-3.5 py-2 text-sm font-medium text-white/80 transition-all duration-200 ease-out hover:-translate-y-0.5 hover:bg-white/10 hover:text-white active:scale-[0.99] focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40 sm:w-auto"
            >
              <span>View all articles</span>
              <ArrowUpRight className="h-4 w-4 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <MediaCard key={item.id} item={item} />
          ))}
        </div>
      </div>
    </section>
  );
}
