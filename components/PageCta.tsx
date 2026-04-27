// components/PageCta.tsx
// Site-wide call-to-action that appears on every page (currently promoting
// a YouTube video). Centralized so we can swap the offer in one place.
import Image from "next/image";
import { Play, ArrowUpRight } from "lucide-react";

const VIDEO_URL = "https://www.youtube.com/watch?v=K1qKbZqBh0w";
const VIDEO_ID = "K1qKbZqBh0w";

// hqdefault is reliably hosted by youtube and small (~30KB). Loaded from
// img.youtube.com (no auth, no API key, public).
const VIDEO_THUMB = `https://img.youtube.com/vi/${VIDEO_ID}/hqdefault.jpg`;

export function PageCta() {
  return (
    <section
      aria-label="Featured video"
      className="mx-auto w-full max-w-6xl px-4 pb-16 pt-6 sm:px-6 lg:px-8"
    >
      <a
        href={VIDEO_URL}
        target="_blank"
        rel="noreferrer noopener"
        className="group flex flex-col items-stretch overflow-hidden rounded-2xl border border-white/10 bg-white/5 transition-colors duration-200 hover:border-accent/60 hover:bg-white/[0.07] sm:flex-row"
      >
        {/* Thumbnail */}
        <div className="relative aspect-video w-full flex-none overflow-hidden bg-black sm:w-[280px] md:w-[340px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={VIDEO_THUMB}
            alt=""
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
            loading="lazy"
            decoding="async"
            referrerPolicy="no-referrer"
          />
          {/* Dark overlay + play button */}
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-t from-black/60 via-black/20 to-transparent">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-red-600 text-white shadow-lg ring-4 ring-red-600/25 transition-transform duration-200 group-hover:scale-110">
              <Play className="ml-0.5 h-6 w-6 fill-current" aria-hidden />
            </span>
          </div>
        </div>

        {/* Body */}
        <div className="flex flex-1 flex-col justify-center gap-2 p-5 sm:p-6">
          <div className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
            Featured · YouTube
          </div>
          <h2 className="text-lg font-semibold leading-snug text-foreground sm:text-xl">
            <span className="relative inline-block transition-colors group-hover:text-accent after:absolute after:left-0 after:-bottom-0.5 after:h-[2px] after:w-full after:origin-left after:scale-x-0 after:bg-accent after:transition-transform after:duration-300 group-hover:after:scale-x-100">
              Watch my latest video
            </span>
          </h2>
          <p className="line-clamp-2 text-sm text-muted-foreground sm:text-base">
            A behind-the-scenes look at what I&apos;m building. Click to watch on
            YouTube.
          </p>
          <div className="mt-1 inline-flex items-center gap-1.5 text-sm font-semibold text-accent">
            Watch now
            <ArrowUpRight className="h-4 w-4 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </div>
        </div>
      </a>
    </section>
  );
}
