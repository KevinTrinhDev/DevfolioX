// components/sections/HeroShowcaseSection.tsx
"use client";

import { siteConfig } from "../../config/siteConfig";
import {
  FileText,
  Mail,
  ArrowUpRight,
  Github,
  Linkedin,
  Youtube,
  Code2,
  PenSquare,
  MessageCircle,
  Coffee,
  Twitter,
  GraduationCap,
  AtSign,
} from "lucide-react";

// ⬇⬇⬇ change these two lines to relative paths
import { useModalRoute } from "../hooks/useModalRoute";
import { ContributionGraphCard } from "../ContributionGraphCard";
// ⬆⬆⬆

type SocialItem = {
  key: string; // key to look up in siteConfig.socials if present
  label: string;
  type?: "link" | "email" | "resume" | "donate";
};

// Hard-coded social platforms in the order requested
const SOCIALS: SocialItem[] = [
  { key: "github", label: "GitHub" },
  { key: "linkedin", label: "LinkedIn" },
  { key: "resume", label: "Resume", type: "resume" },
  { key: "email", label: "Email", type: "email" },
  { key: "tiktok", label: "TikTok" },
  { key: "leetcode", label: "LeetCode" },
  { key: "youtube", label: "YouTube" },
  { key: "x", label: "X" },
  { key: "handshake", label: "Handshake" },
  { key: "devto", label: "Dev.to" },
  { key: "medium", label: "Medium" },
  { key: "discord", label: "Discord Server" },
  { key: "threads", label: "Threads" },
  { key: "kofi", label: "Buy me a coffee", type: "donate" }, // Ko-fi / donations
];

function resolveSocialHref(item: SocialItem, resumeHref: string): string {
  const socials: any = (siteConfig as any).socials ?? {};

  if (item.type === "resume") {
    return resumeHref || "/resume";
  }

  if (item.type === "email") {
    const email = socials.email || socials.mail;
    return email
      ? email.startsWith("mailto:")
        ? email
        : `mailto:${email}`
      : "#";
  }

  if (item.type === "donate") {
    return socials.kofi || socials.ko_fi || socials.donate || "#";
  }

  // Generic link: try socials[key], else "#"
  return socials[item.key] ?? "#";
}

function SocialIcon({ item }: { item: SocialItem }) {
  const key = item.key.toLowerCase();
  const base =
    "h-4 w-4 text-slate-400 transition-colors group-hover:text-accent";

  if (key === "github") return <Github className={base} />;
  if (key === "linkedin") return <Linkedin className={base} />;
  if (key === "leetcode") return <Code2 className={base} />;
  if (key === "email") return <Mail className={base} />;
  if (key === "resume") return <FileText className={base} />;
  if (key === "youtube") return <Youtube className={base} />;
  if (key === "tiktok") return <PenSquare className={base} />; // placeholder icon
  if (key === "x") return <Twitter className={base} />;
  if (key === "handshake") return <GraduationCap className={base} />;
  if (key === "devto" || key === "dev.to") return <Code2 className={base} />;
  if (key === "medium") return <PenSquare className={base} />;
  if (key === "discord") return <MessageCircle className={base} />;
  if (key === "threads") return <AtSign className={base} />;
  if (key === "kofi") return <Coffee className={base} />;

  // fallback
  return <ArrowUpRight className={base} />;
}

export function HeroShowcaseSection() {
  // Short flag-style link: "/?resume"
  const resumeModal = useModalRoute({
    scheme: "flag",
    key: "resume",
    scroll: false,
  });

  const resumeHref = resumeModal.href || "/resume";

  // Top small text
  const smallLabel = "Hello there,";

  // Big heading lines
  const lineOne = "Kevin Trinh here.";
  const lineTwo = "I like to build cool stuff often.";

  const description =
    "I'm currently pursuing a B.S. in Computer Science at the University of Houston. I have a profound interest in machine learning, databases, full-stack apps, and everything in between.";

  return (
    <section id="top" className="pt-16 pb-20">
      <div className="mx-auto w-full max-w-6xl px-4">
        {/* Top hero row (right side left blank for now) */}
        <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
          {/* Left: intro + socials + CTAs */}
          <div>
            {/* small label */}
            <p className="text-sm font-medium text-muted-foreground sm:text-base">
              {smallLabel}
            </p>

            {/* big heading, two lines (second line slightly smaller) */}
            <h1 className="mt-3 text-4xl font-semibold leading-tight sm:text-5xl lg:text-6xl">
              <span className="block">{lineOne}</span>
              <span className="mt-1 block text-3xl sm:text-4xl lg:text-[2.6rem]">
                {lineTwo}
              </span>
            </h1>

            {/* description paragraph with more width */}
            <p className="mt-4 max-w-2xl text-sm text-muted-foreground sm:text-base">
              {description}
            </p>

            {/* Social links row */}
            <div className="mt-5 flex flex-wrap gap-2 text-xs sm:text-sm">
              {SOCIALS.map((item) => {
                const href = resolveSocialHref(item, resumeHref);

                return (
                  <a
                    key={item.key}
                    href={href}
                    target={href.startsWith("http") ? "_blank" : undefined}
                    rel={href.startsWith("http") ? "noreferrer" : undefined}
                    className="group inline-flex items-center gap-2 rounded-md px-2.5 py-1.5 text-xs sm:text-sm text-slate-50/90 transition-colors duration-150 hover:bg-white/5 hover:text-slate-50"
                  >
                    <SocialIcon item={item} />
                    <span className="text-slate-50">{item.label}</span>
                  </a>
                );
              })}
            </div>

            {/* CTAs */}
            <div className="mt-7 flex flex-wrap gap-3">
              {/* Open the resume modal with a shareable SPA URL (/?resume) */}
              <a
                href={resumeHref}
                onClick={(e) => {
                  e.preventDefault();
                  resumeModal.open();
                }}
                className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-slate-50 shadow-sm transition-colors duration-150 hover:bg-accent/90 hover:shadow-md"
                title={`Open ${resumeHref}`}
              >
                <FileText className="h-4 w-4" />
                <span>View Resume</span>
              </a>

              <a
                href="#contact"
                className="inline-flex items-center gap-2 rounded-lg border border-white/20 px-4 py-2 text-sm font-medium text-slate-50 transition-colors duration-150 hover:border-accent hover:bg-white/10"
              >
                <MessageCircle className="h-4 w-4" />
                <span>Say hello to me!</span>
              </a>
            </div>
          </div>

          {/* Right column intentionally blank for now */}
          <div className="hidden lg:block" />
        </div>

        {/* Contribution graph row */}
        <div className="mt-20">
          <ContributionGraphCard />
        </div>
      </div>
    </section>
  );
}
