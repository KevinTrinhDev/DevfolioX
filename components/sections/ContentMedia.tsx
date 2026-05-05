// components/sections/ContentMedia.tsx
// Media wall — placeholder masonry grid showing a mix of YouTube videos,
// TikToks, and articles. Items have varying row spans for an asymmetric layout.
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, BookOpenText, Music2, Play } from "lucide-react";

type MediaType = "youtube" | "tiktok" | "article";

type MediaItem = {
  id: string;
  type: MediaType;
  href: string;
  external: boolean;
  imageSrc: string;
  imageAlt: string;
  title: string;
  /** How many grid rows this card occupies (1 or 2). */
  rowSpan?: 1 | 2;
};

// Placeholder content — swap for real data later.
const ITEMS: MediaItem[] = [
  {
    id: "yt-1",
    type: "youtube",
    href: "#",
    external: true,
    imageSrc: "/images/devfoliox_demo_1.gif",
    imageAlt: "Building DevfolioX in public",
    title: "Building DevfolioX in public — Episode 1",
    rowSpan: 2,
  },
  {
    id: "tt-1",
    type: "tiktok",
    href: "#",
    external: true,
    imageSrc: "/images/demo_2.png",
    imageAlt: "Quick coding tip",
    title: "60-second tip: Tailwind utility I use daily",
    rowSpan: 1,
  },
  {
    id: "art-1",
    type: "article",
    href: "#",
    external: false,
    imageSrc: "/images/demo_3.png",
    imageAlt: "Cloudflare Workers + OpenNext",
    title: "Cloudflare Workers + OpenNext: a real-world setup",
    rowSpan: 1,
  },
  {
    id: "art-2",
    type: "article",
    href: "#",
    external: false,
    imageSrc: "/images/setup.jpg",
    imageAlt: "Notion CMS pipeline",
    title: "A no-bloat Notion CMS pipeline",
    rowSpan: 2,
  },
  {
    id: "tt-2",
    type: "tiktok",
    href: "#",
    external: true,
    imageSrc: "/images/demo_5.png",
    imageAlt: "Behind the build",
    title: "Behind the build — late night refactor",
    rowSpan: 1,
  },
  {
    id: "yt-2",
    type: "youtube",
    href: "#",
    external: true,
    imageSrc: "/images/reactfolio.png",
    imageAlt: "Reactfolio walkthrough",
    title: "Reactfolio v2 — what changed and why",
    rowSpan: 1,
  },
];

const TYPE_BADGE: Record<
  MediaType,
  { label: string; className: string; Icon: typeof Play }
> = {
  youtube: {
    label: "YouTube",
    className: "border-red-500/30 bg-red-500/15 text-red-200",
    Icon: Play,
  },
  tiktok: {
    label: "TikTok",
    className: "border-fuchsia-500/30 bg-fuchsia-500/15 text-fuchsia-200",
    Icon: Music2,
  },
  article: {
    label: "Article",
    className: "border-indigo-400/30 bg-indigo-500/15 text-indigo-200",
    Icon: BookOpenText,
  },
};

function TypeBadge({ type }: { type: MediaType }) {
  const cfg = TYPE_BADGE[type];
  const { Icon } = cfg;
  return (
    <span
      className={`inline-flex w-fit items-center gap-1.5 rounded-md border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${cfg.className}`}
    >
      <Icon className="h-3 w-3" aria-hidden="true" />
      {cfg.label}
    </span>
  );
}

function MediaCard({ item }: { item: MediaItem }) {
  const rowSpanClass =
    item.rowSpan === 2 ? "row-span-2" : "row-span-1";

  const Inner = (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-lg border border-white/10 bg-white/5 transition-colors duration-200 ease-out hover:border-white/20 hover:bg-white/[0.07]">
      <div className="relative w-full flex-1 overflow-hidden bg-white/5">
        <Image
          src={item.imageSrc}
          alt={item.imageAlt}
          fill
          sizes="(min-width: 1024px) 360px, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
          unoptimized={item.imageSrc.endsWith(".gif")}
        />

        {item.type === "youtube" && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/0 transition-colors duration-200 group-hover:bg-black/30">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-red-600/95 text-white shadow-[0_6px_24px_rgba(0,0,0,0.4)] transition-transform duration-200 group-hover:scale-110">
              <Play className="h-5 w-5 translate-x-[1px] fill-current" />
            </span>
          </div>
        )}

        {item.type === "tiktok" && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/0 transition-colors duration-200 group-hover:bg-black/25">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-black/85 text-white ring-1 ring-fuchsia-400/40 shadow-[0_6px_24px_rgba(0,0,0,0.4)] transition-transform duration-200 group-hover:scale-110">
              <Music2 className="h-5 w-5" />
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-none flex-col gap-2 p-4">
        <TypeBadge type={item.type} />
        <h4 className="text-[14px] font-semibold leading-snug text-foreground sm:text-[15px]">
          <span className="block break-words line-clamp-2">{item.title}</span>
        </h4>
      </div>
    </article>
  );

  const className = `block h-full ${rowSpanClass}`;

  if (item.external) {
    return (
      <a
        href={item.href}
        target="_blank"
        rel="noreferrer"
        className={className}
      >
        {Inner}
      </a>
    );
  }
  return (
    <Link href={item.href} className={className}>
      {Inner}
    </Link>
  );
}

export function ContentMediaSection() {
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

        {/* Masonry-style grid: fixed row height, items span 1 or 2 rows for variety */}
        <div className="mt-8 grid auto-rows-[160px] grid-cols-1 gap-4 sm:auto-rows-[180px] sm:grid-cols-2 lg:grid-cols-3">
          {ITEMS.map((item) => (
            <MediaCard key={item.id} item={item} />
          ))}
        </div>
      </div>
    </section>
  );
}
