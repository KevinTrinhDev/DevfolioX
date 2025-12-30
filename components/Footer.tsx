// components/Footer.tsx
import { siteConfig } from "../config/siteConfig";

// ---- helpers ----
function formatUpdatedDate(input?: string): string | null {
  if (!input) return null;
  const d = new Date(input);
  if (isNaN(d.getTime())) return null;
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
    const dateISO: string = push.created_at;
    if (!isHexSha(sha)) return null;

    return { sha, dateISO };
  } catch {
    return null;
  }
}

export async function Footer() {
  const year = new Date().getFullYear();
  const repoCfg: any = (siteConfig as any).repo ?? {};

  const { owner, repo } = parseOwnerRepo();

  let live: { sha: string; dateISO: string } | null = null;
  if (owner && repo) live = await fetchLatestPush(owner, repo);

  const cfgSha: string | undefined =
    repoCfg.lastCommitSha ||
    repoCfg.latestCommit?.sha ||
    (isHexSha(repoCfg.lastCommit) ? repoCfg.lastCommit : undefined);

  const cfgDateISO: string | undefined =
    repoCfg.lastCommitDateISO ||
    repoCfg.lastUpdatedISO ||
    repoCfg.latestCommit?.date;

  const finalSha = (live?.sha ?? cfgSha) || null;
  const finalDateISO = (live?.dateISO ?? cfgDateISO) || null;

  const formattedUpdated = formatUpdatedDate(finalDateISO || undefined);
  const shortSha = finalSha ? finalSha.slice(0, 7) : null;

  const repoUrl: string | undefined = repoCfg.url;
  const cleanRepoUrl = repoUrl ? repoUrl.replace(/\/+$/, "") : undefined;

  const finalCommitUrl =
    owner && repo && finalSha
      ? commitUrlFor(owner, repo, finalSha)
      : finalSha && cleanRepoUrl
      ? `${cleanRepoUrl}/commit/${finalSha}`
      : undefined;

  return (
    <footer className="mt-2 bg-transparent">
      <div className="mx-auto w-full max-w-6xl px-4 py-10 text-center text-sm text-muted-foreground sm:text-base">
        {(formattedUpdated || shortSha) && (
          <p className="text-muted-foreground">
            Updated {formattedUpdated || "Recently"}
            {shortSha ? (
              <>
                {" "}
                ·{" "}
                {finalCommitUrl ? (
                  <a
                    href={finalCommitUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="font-mono text-accent transition-colors hover:underline"
                  >
                    {shortSha}
                  </a>
                ) : (
                  <span className="font-mono text-accent">{shortSha}</span>
                )}
              </>
            ) : null}
          </p>
        )}

        <p className="mt-2 text-muted-foreground">
          Powered by{" "}
          <a
            href={(repoCfg.url as string) ?? "#"}
            target="_blank"
            rel="noreferrer"
            className="font-semibold text-muted-foreground transition-colors hover:text-foreground"
          >
            DevfolioX
          </a>{" "}
          · Built by{" "}
          <a
            href="https://kevintrinh.dev"
            target="_blank"
            rel="noreferrer"
            className="font-semibold text-muted-foreground transition-colors hover:text-foreground"
          >
            {siteConfig.name}
          </a>
        </p>

        <p className="mt-2 text-xs text-muted-foreground sm:text-sm">
          All rights reserved. © {year}
        </p>
      </div>
    </footer>
  );
}
