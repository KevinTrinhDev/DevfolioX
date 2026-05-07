// components/sections/ContentMedia.tsx
// Pulls the latest YouTube videos from the channel's public RSS feed at
// build time (with revalidation). Placeholder TikTok / Article slots will be
// added later when those platforms are active.
import { YoutubeGlyph } from "@/components/BrandGlyphs";
import { Play } from "lucide-react";
import { siteConfig } from "@/config/siteConfig";
import {
  loadLatestYouTubeVideos,
  type YouTubeFeedVideo,
} from "@/config/youtubeFeed";

function VideoCard({ video }: { video: YouTubeFeedVideo }) {
  return (
    <a
      href={video.url}
      target="_blank"
      rel="noreferrer noopener"
      aria-label={`Watch on YouTube: ${video.title}`}
      className="group relative flex h-full flex-col overflow-hidden rounded-lg border border-white/10 bg-white/5 transition-colors duration-200 ease-out hover:border-white/25"
    >
      <div className="relative aspect-video w-full overflow-hidden bg-slate-900">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={video.thumbnailUrl}
          alt=""
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-black/15" />
        {/* Play button — YouTube-red */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="inline-flex h-12 w-16 items-center justify-center rounded-xl bg-red-600 text-white shadow-lg shadow-black/30 ring-4 ring-white/15 transition-transform duration-200 group-hover:scale-105">
            <Play className="h-5 w-5 translate-x-[1px] fill-current" />
          </span>
        </div>
        {/* Channel chip */}
        <div className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-md bg-black/60 px-1.5 py-1 text-[10px] font-semibold text-white backdrop-blur-sm">
          <YoutubeGlyph className="h-3.5 w-3.5" />
          <span>YouTube</span>
        </div>
      </div>
      <div className="flex flex-none flex-col gap-1 p-4">
        <h4 className="line-clamp-2 text-[14px] font-semibold leading-snug text-foreground sm:text-[15px]">
          {video.title}
        </h4>
      </div>
    </a>
  );
}

export async function ContentMediaSection() {
  const channelId =
    (siteConfig as any).featuredContent?.youtubeChannelId || "";
  const videos = await loadLatestYouTubeVideos(channelId, 3);

  // Hide entirely if there's nothing to show — better than a half-empty grid.
  if (videos.length === 0) return null;

  return (
    <section id="content" className="py-16 scroll-mt-12 lg:py-24">
      <div className="mx-auto w-full max-w-6xl px-4">
        <div className="flex items-center gap-4">
          <h2 className="font-mono text-[13px] font-semibold uppercase tracking-[0.18em] text-muted-foreground sm:text-lg">
            ~/Content
          </h2>
          <div className="hidden h-px w-40 bg-white/15 sm:block sm:w-72" aria-hidden />
        </div>

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {videos.map((v) => (
            <VideoCard key={v.id} video={v} />
          ))}
        </div>
      </div>
    </section>
  );
}
