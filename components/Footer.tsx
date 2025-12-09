// components/Footer.tsx
import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { siteConfig } from "../config/siteConfig";
import {
  Heart,
  Github,
  Linkedin,
  Code2,
  PenSquare,
  Youtube,
  Mail,
  Send,
  MessageCircle,
  GraduationCap,
  FileDown,
} from "lucide-react";

// ---- helpers ----
function formatUpdatedDate(input?: string): string | null {
  if (!input) return null;
  const d = new Date(input);
  if (isNaN(d.getTime())) return null;
  // Example: "Nov 12, 2025"
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}

function parseOwnerRepo(): { owner: string | null; repo: string | null } {
  const repoCfg: any = (siteConfig as any).repo ?? {};
  if (repoCfg.owner && repoCfg.name) {
    return { owner: String(repoCfg.owner), repo: String(repoCfg.name) };
  }
  const url: string | undefined = repoCfg.url;
  if (!url) return { owner: null, repo: null };
  // handles https://github.com/Owner/Repo and optional trailing “/”
  const m = url.match(/github\.com\/([^/]+)\/([^/?#]+)/i);
  return m
    ? { owner: m[1], repo: m[2].replace(/\.git$/, "") }
    : { owner: null, repo: null };
}

function isHexSha(s?: string): s is string {
  return !!s && /^[0-9a-f]{7,40}$/i.test(s);
}

function commitUrlFor(owner: string, repo: string, sha: string) {
  return `https://github.com/${owner}/${repo}/commit/${sha}`;
}

// ---- server fetch for latest push across ANY branch ----
// Uses /repos/{owner}/{repo}/events and picks the newest PushEvent.
// Returns { sha, dateISO } or null on failure. Cached for 1 day.
async function fetchLatestPush(
  owner: string,
  repo: string
): Promise<{ sha: string; dateISO: string } | null> {
  try {
    const headers: Record<string, string> = {
      "User-Agent": "devfoliox-footer",
      Accept: "application/vnd.github+json",
    };
    if (process.env.GITHUB_TOKEN) {
      headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
    }

    const res = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/events?per_page=30`,
      {
        headers,
        next: { revalidate: 86400 }, // 1 day
      }
    );

    if (!res.ok) return null;

    const events = (await res.json()) as any[];
    const push = events.find(
      (e) => e?.type === "PushEvent" && e?.payload?.head
    );
    if (!push) return null;

    const sha: string = push.payload.head;
    const dateISO: string = push.created_at; // event creation time
    if (!isHexSha(sha)) return null;

    return { sha, dateISO };
  } catch {
    return null;
  }
}

export async function Footer() {
  const year = new Date().getFullYear();
  const repoCfg: any = (siteConfig as any).repo ?? {};
  const socials = siteConfig.socials ?? {};

  // Resolve owner/repo
  const { owner, repo } = parseOwnerRepo();

  // Try live GitHub (latest push on any branch); fallback to config
  let live: { sha: string; dateISO: string } | null = null;
  if (owner && repo) {
    live = await fetchLatestPush(owner, repo);
  }

  // Fallbacks from config (if you wire a webhook to keep these fresh)
  const cfgSha: string | undefined =
    repoCfg.lastCommitSha ||
    repoCfg.latestCommit?.sha ||
    (isHexSha(repoCfg.lastCommit) ? repoCfg.lastCommit : undefined);
  const cfgDateISO: string | undefined =
    repoCfg.lastCommitDateISO ||
    repoCfg.lastUpdatedISO ||
    repoCfg.latestCommit?.date;

  // Pick final values
  const finalSha = (live?.sha ?? cfgSha) || null;
  const finalDateISO = (live?.dateISO ?? cfgDateISO) || null;

  const formattedUpdated = formatUpdatedDate(finalDateISO || undefined);
  const shortSha = finalSha ? finalSha.slice(0, 7) : null;

  // Fallback: use "now" as a placeholder timestamp if nothing else
  const fallbackUpdated =
    formattedUpdated || formatUpdatedDate(new Date().toISOString()) || "";

  const repoUrl: string | undefined = repoCfg.url;
  const cleanRepoUrl = repoUrl ? repoUrl.replace(/\/+$/, "") : undefined;
  const finalCommitUrl =
    owner && repo && finalSha
      ? commitUrlFor(owner, repo, finalSha)
      : finalSha && cleanRepoUrl
      ? `${cleanRepoUrl}/commit/${finalSha}`
      : undefined;

  // Use the richer config and only show items enabled for the footer.
  // Also ignore any entries using the "copy:" scheme since Footer is a server component.
  const footerSocials =
    (siteConfig as any).socialsFor?.footer
      ?.filter(
        (s: any) => typeof s?.href === "string" && !s.href.startsWith("copy:")
      )
      ?.map((s: any) => ({
        key: s.key as string,
        label: (s.label as string) || s.key,
        href:
          s.key === "email"
            ? s.href?.startsWith("mailto:")
              ? s.href
              : `mailto:${s.href}`
            : s.href,
        iconName: s.icon as string | undefined,
      })) ?? [];

  // Prefer explicit icon name; otherwise map by social key (github/linkedin/email/etc.)
  function resolveIcon(iconName?: string, key?: string): ReactNode {
    const pick = (n?: string) => {
      switch (n) {
        case "Github":
          return <Github className="h-4 w-4" />;
        case "Linkedin":
          return <Linkedin className="h-4 w-4" />;
        case "Code2":
          return <Code2 className="h-4 w-4" />;
        case "PenSquare":
          return <PenSquare className="h-4 w-4" />;
        case "Youtube":
          return <Youtube className="h-4 w-4" />;
        case "Mail":
          return <Mail className="h-4 w-4" />;
        case "Send":
          return <Send className="h-4 w-4" />;
        case "MessageCircle":
          return <MessageCircle className="h-4 w-4" />;
        case "GraduationCap":
          return <GraduationCap className="h-4 w-4" />;
        default:
          return null;
      }
    };

    // 1) If iconName provided in JSON, honor it
    const explicit = pick(iconName);
    if (explicit) return explicit;

    // 2) Fallback by key
    switch ((key || "").toLowerCase()) {
      case "github":
        return <Github className="h-4 w-4" />;
      case "linkedin":
        return <Linkedin className="h-4 w-4" />;
      case "devto":
      case "dev.to":
        return <Code2 className="h-4 w-4" />;
      case "medium":
        return <PenSquare className="h-4 w-4" />;
      case "youtube":
        return <Youtube className="h-4 w-4" />;
      case "email":
      case "mail":
        return <Mail className="h-4 w-4" />;
      case "telegram":
        return <Send className="h-4 w-4" />;
      case "discord":
        return <MessageCircle className="h-4 w-4" />;
      case "handshake":
        return <GraduationCap className="h-4 w-4" />;
      default:
        // final safe default
        return <Github className="h-4 w-4" />;
    }
  }

  return (
    <footer className="mt-16 border-t border-white/15 bg-background/80 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-6 px-4 py-8 text-sm text-muted-foreground sm:flex-row sm:items-start sm:justify-between sm:text-base">
        {/* Left: site + repo info */}
        <div className="space-y-3 text-center sm:text-left">
          <Link
            href="/"
            className="group flex items-center justify-center gap-2 transform-gpu transition sm:justify-start hover:scale-[0.97] active:scale-95"
          >
            <Image
              src="/images/favicon.png"
              alt="kevintrinh.dev logo"
              width={24}
              height={24}
              className="rounded-sm"
            />
            <span className="text-lg font-semibold text-accent sm:text-xl">
              kevintrinh.dev
            </span>
          </Link>

          <div className="space-y-2 text-sm sm:text-base">
            {(formattedUpdated || shortSha) && (
              <p className="text-muted-foreground">
                Portfolio updated
                {formattedUpdated ? <>: {formattedUpdated}</> : null}
                {shortSha ? (
                  <>
                    {" "}
                    (
                    {finalCommitUrl ? (
                      <a
                        href={finalCommitUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="font-mono text-accent transform-gpu transition hover:scale-95 hover:underline"
                      >
                        {shortSha}
                      </a>
                    ) : (
                      <span className="font-mono text-accent transform-gpu transition hover:scale-95 hover:underline">
                        {shortSha}
                      </span>
                    )}
                    )
                  </>
                ) : null}
              </p>
            )}

            <p className="text-muted-foreground">
              Content last updated {fallbackUpdated} via caching
            </p>

            {footerSocials.length > 0 && (
              <div className="mt-1 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                {footerSocials.map((item: any) => (
                  <a
                    key={item.key || item.label}
                    href={item.href}
                    target="_blank"
                    rel="noreferrer"
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 text-foreground transition hover:border-accent hover:bg-white/5 hover:text-accent"
                    aria-label={item.label}
                    title={item.label}
                  >
                    {resolveIcon(item.iconName, item.key)}
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: actions + text */}
        <div className="flex flex-col items-center gap-3 text-center sm:items-end sm:text-right">
          <div className="flex flex-wrap justify-center gap-3 sm:justify-end">
            <a
              href="/resume"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full border border-white/20 px-3 py-1.5 text-xs font-medium text-foreground transition hover:border-accent hover:bg-white/5 hover:text-foreground sm:text-sm"
            >
              <FileDown className="h-4 w-4" />
              <span>My Resume</span>
            </a>

            {siteConfig.sponsor?.enabled && siteConfig.sponsor.url && (
              <a
                href={siteConfig.sponsor.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full border border-white/20 px-3 py-1.5 text-xs font-medium text-foreground transition hover:border-accent hover:bg-white/5 hover:text-foreground sm:text-sm"
              >
                <Heart className="h-4 w-4" />
                <span>Support Me</span>
              </a>
            )}
          </div>

          <p className="mt-2 text-sm text-muted-foreground sm:text-base">
            Powered by{" "}
            <a
              href={(repoCfg.url as string) ?? "#"}
              target="_blank"
              rel="noreferrer"
              className="font-semibold text-muted-foreground transition-colors hover:text-foreground"
            >
              DevfolioX
            </a>
            , built &amp; designed by{" "}
            <a
              href="https://kevintrinh.dev"
              target="_blank"
              rel="noreferrer"
              className="font-semibold text-muted-foreground transition-colors hover:text-foreground"
            >
              Kevin Trinh
            </a>
            .
          </p>

          <p className="text-xs text-muted-foreground sm:text-sm">
            © {year} {siteConfig.name}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
