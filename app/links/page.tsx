// app/links/page.tsx
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Mail, UserPlus, Play, Newspaper } from "lucide-react";

import { siteConfig } from "@/config/siteConfig";
import { ShareButton } from "@/components/ShareButton";
import { JsonLd } from "@/components/JsonLd";
import { FilledMapPin } from "@/components/FilledIcons";
import {
  GithubGlyph,
  LinkedInGlyph,
  YoutubeGlyph,
  InstagramGlyph,
  TikTokGlyph,
} from "@/components/BrandGlyphs";

const BASE_URL = (
  process.env.NEXT_PUBLIC_BASE_URL || "https://kevintrinh.dev"
).replace(/\/$/, "");

const LINKS_DESCRIPTION = `Where ${siteConfig.name} hangs out online — socials, portfolio, and content in one link.`;

// Feature flags — flip to true to surface a section.
const SHOW_ARTICLES_SECTION = false;
const SHOW_COOGCASA_SECTION = false;

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
        url: "/images/og/links.png",
        width: 1200,
        height: 630,
        alt: `${siteConfig.name} — links to socials, projects, and articles`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.name} · Links`,
    description: LINKS_DESCRIPTION,
    images: ["/images/og/links.png"],
  },
  robots: { index: true, follow: true },
};

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

// Distinguish internal vs external hrefs so we can route same-tab for
// internal links (faster, in-app-browser-friendly) and only open new tabs
// for genuinely external destinations.
function isExternal(href: string): boolean {
  if (!href) return false;
  if (href.startsWith("/") && !href.startsWith("//")) return false;
  if (href.startsWith("#")) return false;
  if (href.startsWith("mailto:") || href.startsWith("tel:")) return false;
  try {
    const u = new URL(href, BASE_URL);
    return u.host !== new URL(BASE_URL).host;
  } catch {
    return false;
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
      : "mailto:contact@kevintrinh.dev";

  const socials: SocialGlyph[] = SOCIAL_ORDER.flatMap((key) => {
    const s = socialMap.get(key);
    const href = (s?.href || "").trim();
    if (!s || !href || href === "null" || href.startsWith("copy:")) return [];
    const Glyph = glyphForKey(key);
    if (!Glyph) return [];
    return [{ key, label: s.label || key, href, Glyph }];
  });

  // Big buttons — Articles row removed per latest revision; Portfolio is now
  // an internal Link (same tab) for fast switching.
  const bigButtons: Array<{
    key: string;
    label: string;
    description: string;
    href: string;
    icon: React.ReactNode;
  }> = [
    {
      key: "portfolio",
      label: "Portfolio Website",
      description: "My main personal site",
      href: "/",
      icon: (
        <Image
          src="/images/favicon.png"
          alt=""
          width={28}
          height={28}
          className="h-7 w-7 rounded-md object-contain"
        />
      ),
    },
    {
      key: "projects",
      label: "Projects",
      description: "Builds & open source on GitHub",
      href: "https://github.com/KevinTrinhDev",
      icon: <GithubGlyph className="h-7 w-7" />,
    },
  ];

  // YouTube tile (channel link / featured video).
  const youtubeChannel =
    socialMap.get("youtube")?.href ||
    "https://www.youtube.com/@KevinTrinhDev";
  const ytId = (siteConfig as any).featuredContent?.youtubeVideoId as
    | string
    | undefined;
  const youtubeHref = ytId
    ? `https://www.youtube.com/watch?v=${ytId}`
    : youtubeChannel;
  // Use mqdefault.jpg — small (~10 KB), loads instantly on weak wifi.
  const youtubeThumb = ytId
    ? `https://i.ytimg.com/vi/${ytId}/mqdefault.jpg`
    : null;

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

  // Reusable big-button render that picks <a> vs <Link> based on hostname.
  const renderBigButton = (
    btn: (typeof bigButtons)[number],
    extraClassName?: string
  ) => {
    const inner = (
      <>
        <span className="inline-flex min-w-0 items-center gap-3">
          <span className="flex h-10 w-10 flex-none items-center justify-center">
            {btn.icon}
          </span>
          <span className="flex min-w-0 flex-col text-left">
            <span className="text-sm font-semibold leading-tight text-slate-900">
              {btn.label}
            </span>
            <span className="text-[12px] font-normal leading-snug text-slate-500">
              {btn.description}
            </span>
          </span>
        </span>
        <ArrowUpRight
          className="h-4 w-4 flex-none text-slate-400 transition-transform duration-150 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-slate-700"
          aria-hidden
        />
      </>
    );
    const className =
      "group inline-flex w-full items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-5 py-3.5 text-sm font-semibold text-slate-900 transition-colors duration-150 hover:border-slate-300 hover:bg-slate-50" +
      (extraClassName ? ` ${extraClassName}` : "");
    if (isExternal(btn.href)) {
      return (
        <a
          key={btn.key}
          href={btn.href}
          target="_blank"
          rel="noreferrer noopener"
          className={className}
        >
          {inner}
        </a>
      );
    }
    return (
      <Link key={btn.key} href={btn.href} className={className}>
        {inner}
      </Link>
    );
  };

  return (
    <main className="relative mx-auto flex min-h-[100dvh] w-full max-w-md flex-col items-center px-5 pb-10 pt-16 text-slate-900 sm:pt-20">
      <JsonLd data={profileJsonLd} />

      {/* Top-left: Email (mailto) — icon button */}
      <a
        href={emailHref}
        aria-label={`Email ${siteConfig.name}`}
        title={`Email ${siteConfig.name}`}
        className="absolute left-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-100 sm:left-5 sm:top-5"
      >
        <Mail className="h-4 w-4" aria-hidden />
      </a>

      {/* Top-right: Save contact (vCard) + Share — icons only */}
      <div className="absolute right-4 top-4 flex items-center gap-2 sm:right-5 sm:top-5">
        <a
          href="/contact.vcf"
          download="KevinTrinh.vcf"
          aria-label={`Save ${siteConfig.name} to your contacts`}
          title="Save my contact"
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-100"
        >
          <UserPlus className="h-4 w-4" aria-hidden />
        </a>
        <ShareButton
          label="Share"
          showLabel={false}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-100"
        />
      </div>

      {/* Avatar */}
      <div className="relative mb-5 h-28 w-28 overflow-hidden rounded-full ring-1 ring-slate-200 sm:h-32 sm:w-32">
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
      <h1 className="text-center text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
        {siteConfig.name}
      </h1>

      {/* Location */}
      <div className="mt-1.5 inline-flex items-center gap-1.5 text-sm text-slate-500">
        <FilledMapPin className="h-4 w-4 text-slate-400" />
        <span>{siteConfig.location || "Houston, TX"}</span>
      </div>

      {/* Tagline — Software | Tech | Creator | Builder */}
      <p className="mt-3 max-w-xs text-center text-[13px] font-medium tracking-wide text-slate-700 sm:text-sm">
        <span>Software</span>
        <span className="mx-2 text-slate-300">|</span>
        <span>Tech</span>
        <span className="mx-2 text-slate-300">|</span>
        <span>Creator</span>
        <span className="mx-2 text-slate-300">|</span>
        <span>Builder</span>
      </p>

      {/* Social glyphs */}
      {socials.length > 0 && (
        <div className="mt-7 flex flex-wrap items-center justify-center gap-4">
          {socials.map(({ key, label, href, Glyph }) => (
            <a
              key={key}
              href={href}
              target="_blank"
              rel="noreferrer noopener"
              aria-label={label}
              title={label}
              className="group inline-flex h-7 w-7 items-center justify-center transition-transform duration-150 hover:-translate-y-0.5"
            >
              <Glyph className="h-7 w-7 transition-transform duration-150 group-hover:scale-110" />
            </a>
          ))}
        </div>
      )}

      {/* Big buttons */}
      <div className="mt-7 flex w-full flex-col gap-3">
        {bigButtons.map((btn) => renderBigButton(btn))}
      </div>

      {/* Featured YouTube — styled like an embedded player */}
      <a
        href={youtubeHref}
        target="_blank"
        rel="noreferrer noopener"
        aria-label="Watch the latest video on YouTube"
        className="group mt-4 block w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-all duration-150 hover:border-slate-300 hover:shadow-md"
      >
        <div className="relative aspect-video w-full overflow-hidden bg-slate-900">
          {youtubeThumb ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={youtubeThumb}
                alt="Featured YouTube video"
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
              />
              {/* Soft gradient for play-button contrast */}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-black/25" />
              {/* Play button — YouTube-red rounded shape */}
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="inline-flex h-14 w-20 items-center justify-center rounded-xl bg-red-600 text-white shadow-lg shadow-black/30 ring-4 ring-white/15 transition-transform duration-200 group-hover:scale-105">
                  <Play className="h-6 w-6 translate-x-[1px] fill-current" />
                </span>
              </div>
              {/* Channel chip top-left */}
              <div className="absolute left-2 top-2 inline-flex items-center gap-1.5 rounded-md bg-black/60 px-2 py-1 text-[11px] font-semibold text-white backdrop-blur-sm">
                <YoutubeGlyph className="h-3.5 w-3.5" />
                <span>@KevinTrinhDev</span>
              </div>
            </>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <YoutubeGlyph className="h-14 w-14" />
            </div>
          )}
        </div>
        <div className="flex items-center gap-3 px-4 py-3">
          <span className="line-clamp-1 flex-1 text-sm font-semibold text-slate-900">
            Latest from my channel
          </span>
          <span className="inline-flex items-center gap-1 text-[12px] font-medium text-red-700">
            Watch on YouTube
            <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
          </span>
        </div>
      </a>

      {/* Articles section — currently hidden, structure ready for later */}
      {SHOW_ARTICLES_SECTION && (
        <section className="mt-7 w-full" aria-label="Articles">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Articles
            </h2>
            <Link
              href="/articles"
              className="text-xs font-semibold text-slate-500 hover:text-slate-700"
            >
              View all
            </Link>
          </div>
          <Link
            href="/articles"
            className="group inline-flex w-full items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 transition-colors hover:border-slate-300 hover:bg-slate-50"
          >
            <span className="flex h-9 w-9 flex-none items-center justify-center rounded-md bg-slate-100">
              <Newspaper className="h-5 w-5 text-slate-700" />
            </span>
            <span className="flex min-w-0 flex-col text-left">
              <span className="text-sm font-semibold leading-tight text-slate-900">
                Latest articles
              </span>
              <span className="text-[12px] font-normal leading-snug text-slate-500">
                Writing, deep dives, and dev notes
              </span>
            </span>
            <ArrowUpRight
              className="ml-auto h-4 w-4 flex-none text-slate-400 transition-transform duration-150 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-slate-700"
              aria-hidden
            />
          </Link>
        </section>
      )}

      {/* CoogCasa block — currently disabled. Keep wired for easy re-enable. */}
      {SHOW_COOGCASA_SECTION && (
        <section className="mt-7 w-full" aria-label="CoogCasa">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              CoogCasa · UH student hub
            </h2>
            <a
              href="https://coogcasa.com"
              target="_blank"
              rel="noreferrer noopener"
              className="text-xs font-semibold text-slate-500 hover:text-slate-700"
            >
              Visit
            </a>
          </div>
        </section>
      )}

      {/* Media kit — image-led card: banner on top, CTA below */}
      <a
        href="https://beacons.ai/kevintrinh/mediakit"
        target="_blank"
        rel="noreferrer noopener"
        aria-label="View my media kit"
        className="group mt-4 flex w-full flex-col overflow-hidden rounded-xl border border-slate-200 bg-white transition-colors duration-150 hover:border-slate-300 hover:bg-slate-50"
      >
        <div className="relative aspect-[12/5] w-full overflow-hidden bg-slate-100">
          <Image
            src="/images/mediakitimage.jpg"
            alt="Media kit"
            fill
            sizes="(max-width: 768px) 100vw, 640px"
            className="object-cover"
          />
        </div>

        <div className="flex items-center justify-between gap-2 px-4 py-3">
          <span className="text-sm font-semibold leading-tight text-slate-900">
            View My Media Kit
          </span>
          <ArrowUpRight
            className="h-4 w-4 flex-none text-slate-400 transition-transform duration-150 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-slate-700"
            aria-hidden
          />
        </div>
      </a>

      {/* Footer — single line, slightly more visible */}
      <div className="mt-auto pt-10 text-center text-xs text-slate-500">
        Built by Kevin Trinh · © {year} All rights reserved
      </div>
    </main>
  );
}
