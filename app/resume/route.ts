// app/resume/route.ts
import { NextResponse, NextRequest } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { siteConfig } from "../../config/siteConfig";

export const runtime = "nodejs";

// Tiny sanitizer so odd chars don't break Content-Disposition across browsers
function sanitizeFilename(name: string, fallback = "Resume.pdf") {
  const cleaned = name.replace(/[^a-zA-Z0-9._\- ()]/g, "").trim();
  return cleaned.length ? cleaned : fallback;
}

type ResumeCfg = {
  source?: "google" | "file";
  googleDocId?: string;
  file?: { path?: string; url?: string };
  filename?: string;
  cacheSeconds?: number;
};

export async function GET(req: NextRequest) {
  return handleResume(req, "GET");
}

export async function HEAD(req: NextRequest) {
  return handleResume(req, "HEAD");
}

async function handleResume(req: NextRequest, method: "GET" | "HEAD") {
  // siteConfig.resume is a placeholder ({ items: [] }); the actual delivery
  // config (filename / source / cacheSeconds) lives on resumeDelivery.
  const cfg = (siteConfig.resumeDelivery ?? {}) as ResumeCfg;

  const url = new URL(req.url);
  const forceDownload = url.searchParams.get("dl") === "1"; // /api/resume?dl=1
  const noCache = url.searchParams.get("noCache") === "1"; // /api/resume?noCache=1
  const buster = url.searchParams.get("buster") || ""; // /api/resume?buster=123

  const SOURCE = (cfg.source || "google").toLowerCase() as "google" | "file";
  const FILENAME = sanitizeFilename(cfg.filename || "Resume.pdf");
  const DEFAULT_CACHE = Number.isFinite(Number(cfg.cacheSeconds))
    ? Number(cfg.cacheSeconds)
    : 3600;
  const CACHE_SECS = noCache ? 0 : DEFAULT_CACHE;

  // Inline by default; force download only when requested
  const contentDisposition = `${
    forceDownload ? "attachment" : "inline"
  }; filename="${FILENAME}"`;

  // Base headers; we’ll add Last-Modified / Content-Length dynamically
  const baseHeaders: Record<string, string> = {
    "Content-Type": "application/pdf",
    "Content-Disposition": contentDisposition,
    "Cache-Control": noCache
      ? "no-store"
      : `public, max-age=${CACHE_SECS}, s-maxage=${CACHE_SECS}`,
  };

  try {
    if (SOURCE === "file") {
      // (1) Serve local file from /public if configured
      const localPath = cfg.file?.path;
      if (localPath && localPath.startsWith("/")) {
        const abs = path.join(process.cwd(), "public", localPath);
        const [data, stat] = await Promise.all([
          fs.readFile(abs),
          fs.stat(abs),
        ]);

        const headers = withMetaHeaders(baseHeaders, {
          lastModified: stat.mtime, // Date
          contentLength: data.byteLength.toString(), // string
        });

        // Respect HEAD (headers only)
        if (method === "HEAD")
          return new NextResponse(null, { status: 200, headers });
        return new NextResponse(data, { status: 200, headers });
      }

      // (2) Or fetch a remote URL if configured
      const remote = cfg.file?.url;
      if (remote && /^https?:\/\//i.test(remote)) {
        const remoteUrl = buster
          ? `${remote}${
              remote.includes("?") ? "&" : "?"
            }cachebust=${encodeURIComponent(buster)}`
          : remote;

        const res = await fetch(
          remoteUrl,
          noCache ? { cache: "no-store" } : { next: { revalidate: CACHE_SECS } }
        );
        if (!res.ok) {
          return NextResponse.json(
            { error: `Static URL fetch failed (${res.status})` },
            { status: 502 }
          );
        }

        const lastModHeader = res.headers.get("last-modified") ?? undefined;
        const contentLengthHeader =
          res.headers.get("content-length") ?? undefined;

        const headers = withMetaHeaders(baseHeaders, {
          lastModified: lastModHeader ? new Date(lastModHeader) : undefined,
          contentLength: contentLengthHeader || undefined,
        });

        if (method === "HEAD")
          return new NextResponse(null, { status: 200, headers });

        const blob = await res.blob();
        return new NextResponse(blob.stream(), { status: 200, headers });
      }

      // Nothing configured properly
      return NextResponse.json(
        {
          error:
            "RESUME source=file but no file.path or file.url configured in siteConfig.",
        },
        { status: 500 }
      );
    }

    // GOOGLE DOC mode — prefer env for privacy, fallback to JSON
    const envId = process.env.RESUME_GOOGLE_DOC_ID?.trim();
    const id = envId && envId.length ? envId : (cfg.googleDocId || "").trim();
    if (!id) {
      return NextResponse.json(
        {
          error:
            "RESUME source=google but no Google Doc ID provided (env or siteConfig).",
        },
        { status: 500 }
      );
    }

    let exportUrl = `https://docs.google.com/document/d/${encodeURIComponent(
      id
    )}/export?format=pdf`;
    if (buster) exportUrl += `&cachebust=${encodeURIComponent(buster)}`;

    const res = await fetch(
      exportUrl,
      noCache ? { cache: "no-store" } : { next: { revalidate: CACHE_SECS } }
    );

    if (!res.ok) {
      return NextResponse.json(
        { error: `Google export failed (${res.status})` },
        { status: 502 }
      );
    }

    // Try to forward Google's Last-Modified; fall back to now
    const googleLastMod = res.headers.get("last-modified");
    const lastModified = googleLastMod ? new Date(googleLastMod) : new Date();

    const headers = withMetaHeaders(baseHeaders, {
      lastModified,
      contentLength: res.headers.get("content-length") ?? undefined,
    });

    if (method === "HEAD")
      return new NextResponse(null, { status: 200, headers });

    const blob = await res.blob();
    return new NextResponse(blob.stream(), { status: 200, headers });
  } catch {
    return NextResponse.json(
      { error: "Failed to serve resume PDF" },
      { status: 500 }
    );
  }
}

/**
 * Adds Last-Modified (and x-resume-updated) + Content-Length when available.
 */
function withMetaHeaders(
  headers: Record<string, string>,
  opts: { lastModified?: Date; contentLength?: string }
) {
  const out = { ...headers };

  if (
    opts.lastModified instanceof Date &&
    !isNaN(opts.lastModified.getTime())
  ) {
    const lm = opts.lastModified.toUTCString();
    out["Last-Modified"] = lm;
    out["x-resume-updated"] = lm; // handy custom fallback for frontend
  }

  if (opts.contentLength && /^\d+$/.test(opts.contentLength)) {
    out["Content-Length"] = opts.contentLength;
  }

  return out;
}
