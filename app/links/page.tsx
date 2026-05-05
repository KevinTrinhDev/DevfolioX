// app/links/page.tsx
import type { Metadata } from "next";
import Image from "next/image";
import {
  ArrowUpRight,
  Folder,
  Globe,
  Mail,
  MapPin,
  Newspaper,
  Play,
} from "lucide-react";

import { siteConfig } from "@/config/siteConfig";
import { ShareButton } from "@/components/ShareButton";
import { JsonLd } from "@/components/JsonLd";
import { youtubeVideos } from "@/config/youtube";

const BASE_URL = (
  process.env.NEXT_PUBLIC_BASE_URL || "https://kevintrinh.dev"
).replace(/\/$/, "");

const LINKS_DESCRIPTION = `Where ${siteConfig.name} hangs out online — socials, portfolio, and content in one link.`;

export const metadata: Metadata = {
  title: `Links | ${siteConfig.name}`,
  description: LINKS_DESCRIPTION,
  alternates: { canonical: "/links" },
  openGraph: {
    type: "profile",
    url: "/links",
    title: `${siteConfig.name} · Links`,
    description: LINKS_DESCRIPTION,
    siteName: `${siteConfig.name} Portfolio`,
    images: [
      {
        url: "/images/demo_1.png",
        width: 1864,
        height: 952,
        alt: `${siteConfig.name} — links to socials, projects, and articles`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.name} · Links`,
    description: LINKS_DESCRIPTION,
    images: ["/images/demo_1.png"],
  },
  robots: { index: true, follow: true },
};

/* ---------------- Brand-colored social glyphs ---------------- */

function GithubGlyph({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <path
        fill="#ffffff"
        d="M12 .5C5.73.5.66 5.57.66 11.84c0 5.02 3.25 9.27 7.76 10.78.57.1.78-.25.78-.55 0-.27-.01-.99-.02-1.94-3.16.69-3.83-1.52-3.83-1.52-.52-1.31-1.27-1.66-1.27-1.66-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.02 1.76 2.69 1.25 3.34.96.1-.74.4-1.25.72-1.54-2.52-.29-5.18-1.26-5.18-5.62 0-1.24.45-2.26 1.18-3.05-.12-.29-.51-1.45.11-3.02 0 0 .96-.31 3.16 1.16.92-.26 1.9-.39 2.88-.39s1.96.13 2.88.39c2.2-1.47 3.16-1.16 3.16-1.16.62 1.57.23 2.73.11 3.02.74.79 1.18 1.81 1.18 3.05 0 4.37-2.66 5.33-5.2 5.61.41.36.78 1.06.78 2.14 0 1.55-.01 2.79-.01 3.17 0 .31.21.66.79.55 4.51-1.51 7.76-5.76 7.76-10.78C23.34 5.57 18.27.5 12 .5Z"
      />
    </svg>
  );
}

function LinkedInGlyph({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <rect width="24" height="24" rx="3" fill="#0A66C2" />
      <path
        fill="#ffffff"
        d="M7.06 18.6H4.5V9.34h2.56V18.6ZM5.78 8.18a1.49 1.49 0 1 1 0-2.98 1.49 1.49 0 0 1 0 2.98ZM19.5 18.6h-2.56v-4.5c0-1.07-.02-2.45-1.49-2.45-1.5 0-1.73 1.17-1.73 2.37v4.58H11.16V9.34h2.45v1.27h.04c.34-.65 1.18-1.34 2.43-1.34 2.6 0 3.42 1.71 3.42 3.93v5.4Z"
      />
    </svg>
  );
}

function YoutubeGlyph({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <path
        fill="#FF0000"
        d="M23.5 6.7s-.23-1.62-.94-2.34c-.9-.94-1.9-.94-2.36-1C16.83 3.1 12 3.1 12 3.1s-4.83 0-8.2.26c-.46.06-1.46.06-2.36 1C.73 5.08.5 6.7.5 6.7S.27 8.6.27 10.5v1.78c0 1.9.23 3.8.23 3.8s.23 1.62.94 2.34c.9.94 2.08.91 2.6 1.01 1.89.18 8.04.24 8.04.24s4.83 0 8.2-.26c.46-.06 1.46-.06 2.36-1 .71-.72.94-2.34.94-2.34s.23-1.9.23-3.8V10.5c0-1.9-.23-3.8-.23-3.8Z"
      />
      <path fill="#ffffff" d="M9.75 14.4V7.6l6.3 3.4-6.3 3.4Z" />
    </svg>
  );
}

function InstagramGlyph({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <defs>
        <linearGradient id="ig-grad" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0%" stopColor="#FBBE3D" />
          <stop offset="35%" stopColor="#E4405F" />
          <stop offset="70%" stopColor="#A535A0" />
          <stop offset="100%" stopColor="#5851D9" />
        </linearGradient>
      </defs>
      <rect width="24" height="24" rx="6" fill="url(#ig-grad)" />
      <circle
        cx="12"
        cy="12"
        r="4.2"
        fill="none"
        stroke="#ffffff"
        strokeWidth="1.7"
      />
      <circle cx="17.4" cy="6.6" r="1.1" fill="#ffffff" />
    </svg>
  );
}

function TikTokGlyph({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <rect width="24" height="24" rx="5" fill="#000000" />
      <path
        d="M16.7 6.5c.3 1.7 1.4 2.7 3 2.9v1.9c-1.1.1-2-.2-2.9-.7v4.5c0 2.7-2.2 4.9-4.9 4.9s-4.9-2.2-4.9-4.9 2.2-4.9 4.9-4.9c.3 0 .6 0 .9.1v2c-.3-.1-.6-.2-.9-.2-1.7 0-3 1.3-3 3s1.3 3 3 3 3-1.3 3-3V5h1.8Z"
        fill="#25F4EE"
        transform="translate(0.7 0)"
      />
      <path
        d="M16.7 6.5c.3 1.7 1.4 2.7 3 2.9v1.9c-1.1.1-2-.2-2.9-.7v4.5c0 2.7-2.2 4.9-4.9 4.9s-4.9-2.2-4.9-4.9 2.2-4.9 4.9-4.9c.3 0 .6 0 .9.1v2c-.3-.1-.6-.2-.9-.2-1.7 0-3 1.3-3 3s1.3 3 3 3 3-1.3 3-3V5h1.8Z"
        fill="#FE2C55"
        transform="translate(-0.7 0)"
      />
      <path
        fill="#ffffff"
        d="M16.7 6.5c.3 1.7 1.4 2.7 3 2.9v1.9c-1.1.1-2-.2-2.9-.7v4.5c0 2.7-2.2 4.9-4.9 4.9s-4.9-2.2-4.9-4.9 2.2-4.9 4.9-4.9c.3 0 .6 0 .9.1v2c-.3-.1-.6-.2-.9-.2-1.7 0-3 1.3-3 3s1.3 3 3 3 3-1.3 3-3V5h1.8Z"
      />
    </svg>
  );
}

type SocialGlyph = {
  key: string;
  label: string;
  href: string;
  Glyph: (props: { className?: string }) => React.ReactNode;
};

const SOCIAL_ORDER = [
  "github",
  "linkedin",
  "youtube",
  "instagram",
  "tiktok",
] as const;

function glyphForKey(key: string) {
  switch (key) {
    case "github":
      return GithubGlyph;
    case "linkedin":
      return LinkedInGlyph;
    case "youtube":
      return YoutubeGlyph;
    case "instagram":
      return InstagramGlyph;
    case "tiktok":
      return TikTokGlyph;
    default:
      return null;
  }
}

export default function LinksPage() {
  const socialMap = new Map(
    (siteConfig.socialsList ?? []).map((s) => [s.key, s])
  );

  const emailEntry = socialMap.get("email");
  const emailHref =
    typeof emailEntry?.href === "string" && emailEntry.href.startsWith("mailto:")
      ? emailEntry.href
      : "mailto:kevin@kevintrinh.dev";

  const socials: SocialGlyph[] = SOCIAL_ORDER.flatMap((key) => {
    const s = socialMap.get(key);
    const href = (s?.href || "").trim();
    if (!s || !href || href === "null" || href.startsWith("copy:")) return [];
    const Glyph = glyphForKey(key);
    if (!Glyph) return [];
    return [{ key, label: s.label || key, href, Glyph }];
  });

  const bigButtons: Array<{
    key: string;
    label: string;
    href: string;
    Icon: typeof Globe;
    iconBg: string;
    iconColor: string;
  }> = [
    {
      key: "portfolio",
      label: "Portfolio website",
      href: `${BASE_URL}/`,
      Icon: Globe,
      iconBg: "bg-indigo-500/15",
      iconColor: "text-indigo-300",
    },
    {
      key: "projects",
      label: "Projects",
      href: `${BASE_URL}/projects`,
      Icon: Folder,
      iconBg: "bg-emerald-500/15",
      iconColor: "text-emerald-300",
    },
    {
      key: "articles",
      label: "Articles",
      href: `${BASE_URL}/articles`,
      Icon: Newspaper,
      iconBg: "bg-amber-500/15",
      iconColor: "text-amber-300",
    },
  ];

  // Featured YouTube video — newest first (best-effort by date)
  const featuredVideo = (() => {
    const list = (youtubeVideos as any[]).filter((v) => v?.url && v?.thumbnailUrl);
    if (!list.length) return null;
    const sorted = [...list].sort((a, b) => {
      const ta = a?.date ? new Date(a.date).getTime() : 0;
      const tb = b?.date ? new Date(b.date).getTime() : 0;
      return (Number.isFinite(tb) ? tb : 0) - (Number.isFinite(ta) ? ta : 0);
    });
    return sorted[0];
  })();

  const year = new Date().getFullYear();

  const profileJsonLd = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    url: `${BASE_URL}/links`,
    name: `${siteConfig.name} · Links`,
    description: LINKS_DESCRIPTION,
    mainEntity: {
      "@type": "Person",
      name: siteConfig.name,
      url: BASE_URL,
      jobTitle: siteConfig.title,
      ...(siteConfig.location && {
        address: {
          "@type": "PostalAddress",
          addressLocality: siteConfig.location,
        },
      }),
      sameAs: (siteConfig.socialsList ?? [])
        .filter((s) => s.key !== "handshake")
        .map((s) => s.href)
        .filter(
          (h): h is string => typeof h === "string" && /^https?:\/\//i.test(h)
        ),
      email: emailHref.replace(/^mailto:/i, ""),
    },
  };

  return (
    <main className="relative mx-auto flex min-h-[100dvh] w-full max-w-md flex-col items-center px-5 pb-10 pt-16 sm:pt-20">
      <JsonLd data={profileJsonLd} />

      {/* Soft ambient glow behind the avatar */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 rounded-full bg-indigo-500/15 blur-3xl"
      />

      {/* Top-left: Email */}
      <a
        href={emailHref}
        aria-label={`Email ${siteConfig.name}`}
        title={`Email ${siteConfig.name}`}
        className="absolute left-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-md border border-indigo-400/40 bg-indigo-500/15 text-indigo-200 transition-colors hover:border-indigo-300 hover:bg-indigo-500/25 hover:text-white sm:left-5 sm:top-5"
      >
        <Mail className="h-4 w-4" aria-hidden />
      </a>

      {/* Top-right: Share */}
      <div className="absolute right-4 top-4 flex items-center gap-2 sm:right-5 sm:top-5">
        <ShareButton
          label="Share"
          showLabel={false}
          className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-white/10 bg-white/5 text-slate-200 transition-colors hover:border-accent hover:bg-white/10 hover:text-white"
        />
      </div>

      {/* Avatar */}
      <div className="relative z-10 mb-5 h-28 w-28 overflow-hidden rounded-full ring-2 ring-indigo-400/30 sm:h-32 sm:w-32">
        <Image
          src="/images/avatar.jpg"
          alt={siteConfig.name}
          fill
          sizes="128px"
          className="object-cover"
          priority
        />
      </div>

      {/* Name */}
      <h1 className="z-10 text-center text-2xl font-semibold tracking-tight text-slate-50 sm:text-3xl">
        {siteConfig.name}
      </h1>

      {/* Location */}
      <div className="z-10 mt-1.5 inline-flex items-center gap-1.5 text-sm text-muted-foreground">
        <MapPin className="h-4 w-4 text-slate-200/70" aria-hidden />
        <span>{siteConfig.location || "Houston, TX"}</span>
      </div>

      {/* Description */}
      <p className="z-10 mt-3 max-w-xs text-center text-sm leading-relaxed text-slate-200/85">
        Full-stack developer & CS student at UH.
      </p>

      {/* Social glyphs row — branded, no outline */}
      {socials.length > 0 && (
        <div className="z-10 mt-7 flex flex-wrap items-center justify-center gap-5">
          {socials.map(({ key, label, href, Glyph }) => (
            <a
              key={key}
              href={href}
              target="_blank"
              rel="noreferrer noopener"
              aria-label={label}
              title={label}
              className="group inline-flex items-center justify-center transition-transform duration-150 hover:-translate-y-0.5"
            >
              <Glyph className="h-9 w-9 transition-transform duration-150 group-hover:scale-110" />
            </a>
          ))}
        </div>
      )}

      {/* Big buttons */}
      <div className="z-10 mt-7 flex w-full flex-col gap-3">
        {bigButtons.map(({ key, label, href, Icon, iconBg, iconColor }) => (
          <a
            key={key}
            href={href}
            target="_blank"
            rel="noreferrer noopener"
            className="group inline-flex w-full items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/5 px-5 py-3.5 text-sm font-semibold text-slate-50 transition-all duration-150 hover:-translate-y-0.5 hover:border-accent/60 hover:bg-white/[0.08] hover:shadow-[0_4px_24px_-12px_rgba(99,102,241,0.5)]"
          >
            <span className="inline-flex items-center gap-3">
              <span
                className={`flex h-9 w-9 flex-none items-center justify-center rounded-lg ${iconBg} ${iconColor} transition-colors`}
              >
                <Icon className="h-4 w-4" aria-hidden />
              </span>
              <span>{label}</span>
            </span>
            <ArrowUpRight
              className="h-4 w-4 text-muted-foreground transition-all duration-150 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent"
              aria-hidden
            />
          </a>
        ))}
      </div>

      {/* Featured YouTube video — sits below the big buttons */}
      {featuredVideo ? (
        <a
          href={featuredVideo.url}
          target="_blank"
          rel="noreferrer noopener"
          className="group z-10 mt-4 block w-full overflow-hidden rounded-xl border border-white/10 bg-white/5 transition-all duration-150 hover:-translate-y-0.5 hover:border-red-500/40 hover:shadow-[0_4px_24px_-12px_rgba(239,68,68,0.45)]"
        >
          <div className="relative aspect-[16/9] w-full overflow-hidden bg-black">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={featuredVideo.thumbnailUrl}
              alt={featuredVideo.title}
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
              loading="lazy"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/15 transition-colors duration-200 group-hover:bg-black/30">
              <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-red-600/95 text-white shadow-[0_6px_24px_rgba(0,0,0,0.45)] transition-transform duration-200 group-hover:scale-110">
                <Play className="h-6 w-6 translate-x-[1px] fill-current" />
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3 px-4 py-3">
            <span className="inline-flex items-center gap-1.5 rounded-md border border-red-500/30 bg-red-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-red-200">
              <Play className="h-3 w-3 fill-current" aria-hidden="true" />
              YouTube
            </span>
            <span className="line-clamp-1 text-sm font-medium text-slate-100">
              {featuredVideo.title}
            </span>
          </div>
        </a>
      ) : null}

      {/* Copyright */}
      <div className="z-10 mt-auto pt-10 text-center text-xs leading-relaxed text-muted-foreground/70">
        <div>Built by Kevin Trinh</div>
        <div>© {year} All rights reserved</div>
      </div>
    </main>
  );
}
