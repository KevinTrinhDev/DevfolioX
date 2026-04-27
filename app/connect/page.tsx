// app/connect/page.tsx
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import * as LucideIcons from "lucide-react";
import {
  ArrowUpRight,
  ExternalLink,
  FileText,
  Folder,
  Globe,
  MapPin,
  Newspaper,
} from "lucide-react";

import { siteConfig } from "@/config/siteConfig";
import { XIcon } from "@/components/icons/XIcon";

export const metadata: Metadata = {
  title: `Connect | ${siteConfig.name}`,
  description: `Reach me directly — every place I'm active online. ${siteConfig.name}.`,
  openGraph: {
    title: `Connect with ${siteConfig.name}`,
    description: "All my socials and links, in one place.",
  },
};

// The icon row uses these social keys, in this exact order.
const ICON_KEYS = [
  "tiktok",
  "instagram",
  "youtube",
  "linkedin",
  "github",
  "x",
  "handshake",
] as const;

type SmallIcon = {
  key: string;
  label: string;
  href: string;
  Icon: (props: { className?: string }) => React.ReactNode;
};

function resolveIconForSocial(
  key: string,
  iconName?: string
): (props: { className?: string }) => React.ReactNode {
  if (key === "x") return XIcon;
  // Fall back to lucide by name
  const fromLucide =
    iconName && (LucideIcons as any)[iconName]
      ? (LucideIcons as any)[iconName]
      : null;
  if (fromLucide) {
    const Comp = fromLucide as (p: { className?: string }) => React.ReactNode;
    return Comp;
  }
  // Last-ditch fallback
  return ArrowUpRight as unknown as (p: {
    className?: string;
  }) => React.ReactNode;
}

function isExternal(href: string) {
  return /^https?:\/\//i.test(href);
}

export default function ConnectPage() {
  // Resolve icon-row entries from siteConfig in the requested order, skipping
  // any social that isn't configured / has no usable href.
  const socialMap = new Map(
    (siteConfig.socialsList ?? []).map((s) => [s.key, s])
  );
  const smallIcons: SmallIcon[] = ICON_KEYS.map((key) => {
    const s = socialMap.get(key);
    const href = (s?.href || "").trim();
    if (!s || !href || href === "null" || href.startsWith("copy:")) {
      return null;
    }
    return {
      key,
      label: s.label || key,
      href,
      Icon: resolveIconForSocial(key, s.icon),
    };
  }).filter(Boolean) as SmallIcon[];

  const description =
    "Hey, I'm a CS student at the University of Houston building modern apps and free tools. Pick whichever link works for you below.";

  // Big buttons — fixed list per spec.
  const bigButtons = [
    {
      key: "portfolio",
      label: "Portfolio website",
      href: "/",
      Icon: Globe,
      external: false,
    },
    {
      key: "resume",
      label: "Résumé (PDF)",
      href: "/resume",
      Icon: FileText,
      external: true,
    },
    {
      key: "projects",
      label: "Projects",
      href: "/projects",
      Icon: Folder,
      external: false,
    },
    {
      key: "articles",
      label: "Articles",
      href: "/articles",
      Icon: Newspaper,
      external: false,
    },
  ];

  const year = new Date().getFullYear();

  return (
    <main className="mx-auto flex min-h-[100dvh] w-full max-w-md flex-col items-center px-5 pb-10 pt-12 sm:pt-16">
      {/* Avatar */}
      <div className="relative mb-5 h-28 w-28 overflow-hidden rounded-full ring-2 ring-white/10 sm:h-32 sm:w-32">
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
      <h1 className="text-center text-2xl font-semibold tracking-tight text-slate-50 sm:text-3xl">
        {siteConfig.name}
      </h1>

      {/* Location */}
      <div className="mt-1.5 inline-flex items-center gap-1.5 text-sm text-muted-foreground">
        <MapPin className="h-4 w-4 text-slate-200/70" aria-hidden />
        <span>{siteConfig.location || "Houston, TX"}</span>
      </div>

      {/* Description */}
      <p className="mt-4 max-w-[26rem] text-center text-sm leading-relaxed text-muted-foreground">
        {description}
      </p>

      {/* Small icon row */}
      {smallIcons.length > 0 && (
        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-3">
          {smallIcons.map(({ key, label, href, Icon }) => (
            <a
              key={key}
              href={href}
              target="_blank"
              rel="noreferrer noopener"
              aria-label={label}
              title={label}
              className="text-slate-200/85 transition-colors duration-150 hover:text-white"
            >
              <Icon className="h-[22px] w-[22px]" />
            </a>
          ))}
        </div>
      )}

      {/* Big buttons */}
      <div className="mt-7 flex w-full flex-col gap-3">
        {bigButtons.map(({ key, label, href, Icon, external }) => {
          const className =
            "group inline-flex w-full items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/5 px-5 py-3.5 text-sm font-semibold text-slate-50 transition-all duration-150 hover:-translate-y-0.5 hover:border-accent/60 hover:bg-white/[0.08] hover:shadow-[0_4px_24px_-12px_rgba(99,102,241,0.5)]";
          const inner = (
            <>
              <span className="inline-flex items-center gap-3">
                <span className="flex h-9 w-9 flex-none items-center justify-center rounded-lg bg-white/[0.06] text-slate-100 transition-colors group-hover:bg-accent/15">
                  <Icon className="h-4 w-4" aria-hidden />
                </span>
                <span>{label}</span>
              </span>
              {external ? (
                <ExternalLink
                  className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-accent"
                  aria-hidden
                />
              ) : (
                <ArrowUpRight
                  className="h-4 w-4 text-muted-foreground transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent"
                  aria-hidden
                />
              )}
            </>
          );

          if (external || isExternal(href)) {
            return (
              <a
                key={key}
                href={href}
                target="_blank"
                rel="noreferrer noopener"
                className={className}
              >
                {inner}
              </a>
            );
          }
          return (
            <Link key={key} href={href} className={className}>
              {inner}
            </Link>
          );
        })}
      </div>

      {/* Wordmark */}
      <div className="mt-auto pt-10 text-center text-xs text-muted-foreground/70">
        kevintrinh.dev · © {year}
      </div>
    </main>
  );
}
