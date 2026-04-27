// components/mdx/MdxComponents.tsx
import type { ReactNode } from "react";
import { Info, AlertTriangle, CheckCircle, XCircle, Lightbulb } from "lucide-react";

type CalloutKind = "info" | "warning" | "success" | "danger" | "tip";

const CALLOUT_STYLES: Record<
  CalloutKind,
  { icon: typeof Info; cls: string; iconCls: string }
> = {
  info: {
    icon: Info,
    cls: "border-sky-500/30 bg-sky-500/10",
    iconCls: "text-sky-400",
  },
  warning: {
    icon: AlertTriangle,
    cls: "border-amber-500/30 bg-amber-500/10",
    iconCls: "text-amber-400",
  },
  success: {
    icon: CheckCircle,
    cls: "border-emerald-500/30 bg-emerald-500/10",
    iconCls: "text-emerald-400",
  },
  danger: {
    icon: XCircle,
    cls: "border-rose-500/30 bg-rose-500/10",
    iconCls: "text-rose-400",
  },
  tip: {
    icon: Lightbulb,
    cls: "border-indigo-500/30 bg-indigo-500/10",
    iconCls: "text-indigo-300",
  },
};

export function Callout({
  kind = "info",
  title,
  children,
}: {
  kind?: CalloutKind;
  title?: string;
  children: ReactNode;
}) {
  const safe = CALLOUT_STYLES[kind] ?? CALLOUT_STYLES.info;
  const Icon = safe.icon;
  return (
    <div
      className={[
        "my-6 rounded-lg border p-4 text-sm sm:text-base",
        safe.cls,
      ].join(" ")}
    >
      <div className="flex items-start gap-3">
        <Icon className={["mt-0.5 h-5 w-5 flex-none", safe.iconCls].join(" ")} aria-hidden />
        <div className="min-w-0 flex-1">
          {title && (
            <div className="mb-1 font-semibold text-foreground">{title}</div>
          )}
          <div className="text-muted-foreground [&>p:first-child]:mt-0 [&>p:last-child]:mb-0">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Embed a YouTube video by ID or URL.
 *   <YouTube id="dQw4w9WgXcQ" />
 *   <YouTube url="https://www.youtube.com/watch?v=dQw4w9WgXcQ" />
 */
export function YouTube({
  id,
  url,
  title = "YouTube video",
}: {
  id?: string;
  url?: string;
  title?: string;
}) {
  const videoId = id ?? extractYouTubeId(url);
  if (!videoId) return null;

  return (
    <figure className="my-6 overflow-hidden rounded-xl border border-white/10 bg-black">
      <div className="relative aspect-video w-full">
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${videoId}`}
          title={title}
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
          className="absolute inset-0 h-full w-full"
        />
      </div>
    </figure>
  );
}

function extractYouTubeId(url?: string): string | null {
  if (!url) return null;
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtu.be")) {
      return u.pathname.replace(/^\//, "") || null;
    }
    if (u.hostname.includes("youtube.com")) {
      const v = u.searchParams.get("v");
      if (v) return v;
      const parts = u.pathname.split("/").filter(Boolean);
      const ix = parts.indexOf("embed");
      if (ix !== -1 && parts[ix + 1]) return parts[ix + 1];
    }
  } catch {
    return null;
  }
  return null;
}

/**
 * Embed an X / Twitter post by URL. Renders a lightweight blockquote
 * fallback (no JS embed) for the dynamic edge runtime.
 *   <Tweet url="https://x.com/KevinTrinhDev/status/..." />
 */
export function Tweet({ url, children }: { url: string; children?: ReactNode }) {
  if (!url) return null;
  return (
    <blockquote className="my-6 rounded-xl border border-white/10 bg-white/5 p-4">
      {children && <div className="text-foreground">{children}</div>}
      <a
        href={url}
        target="_blank"
        rel="noreferrer noopener"
        className="mt-2 inline-block text-sm text-accent hover:underline"
      >
        View on X / Twitter →
      </a>
    </blockquote>
  );
}

/**
 * Captioned image. Use instead of plain markdown images when you want a caption.
 *   <Figure src="/images/foo.png" alt="..." caption="..." />
 */
export function Figure({
  src,
  alt,
  caption,
  width,
  height,
}: {
  src: string;
  alt?: string;
  caption?: string;
  width?: number;
  height?: number;
}) {
  if (!src) return null;
  return (
    <figure className="my-6">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt ?? caption ?? ""}
        width={width}
        height={height}
        loading="lazy"
        decoding="async"
        className="w-full rounded-xl border border-white/10"
      />
      {caption && (
        <figcaption className="mt-2 text-center text-sm text-muted-foreground">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

/**
 * Inline KBD-style key/keyboard shortcut.
 *   <Kbd>Ctrl</Kbd>+<Kbd>K</Kbd>
 */
export function Kbd({ children }: { children: ReactNode }) {
  return (
    <kbd className="inline-flex items-center rounded-md border border-white/15 bg-white/5 px-1.5 py-0.5 font-mono text-[0.85em] text-foreground shadow-[0_1px_0_rgba(255,255,255,0.08)]">
      {children}
    </kbd>
  );
}

export const mdxComponents = {
  Callout,
  YouTube,
  Tweet,
  Figure,
  Kbd,
};
