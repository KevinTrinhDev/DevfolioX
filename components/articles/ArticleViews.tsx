"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  slug: string;
  /** Optional initial count to avoid a flash of "—". */
  initial?: number;
};

const fmt = new Intl.NumberFormat("en-US");
const POLL_MS = 30_000;

export function ArticleViews({ slug, initial }: Props) {
  const [views, setViews] = useState<number | null>(
    typeof initial === "number" ? initial : null
  );
  const incrementedRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    let timer: number | undefined;

    const fetchViews = async (method: "GET" | "POST") => {
      try {
        const res = await fetch(`/api/views/${encodeURIComponent(slug)}`, {
          method,
          cache: "no-store",
        });
        if (!res.ok) return;
        const data = (await res.json()) as { views?: number };
        if (cancelled) return;
        if (typeof data.views === "number") setViews(data.views);
      } catch {
        // Network blip — keep whatever count we last had.
      }
    };

    // First call: increment (or no-op if cookie already set server-side).
    if (!incrementedRef.current) {
      incrementedRef.current = true;
      fetchViews("POST");
    } else {
      fetchViews("GET");
    }

    // Light polling while the tab is visible.
    const tick = () => {
      if (cancelled) return;
      if (typeof document !== "undefined" && document.hidden) {
        // Skip this tick; we'll resume on visibilitychange.
      } else {
        fetchViews("GET");
      }
      timer = window.setTimeout(tick, POLL_MS);
    };
    timer = window.setTimeout(tick, POLL_MS);

    const onVisibility = () => {
      if (typeof document !== "undefined" && !document.hidden) {
        fetchViews("GET");
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      cancelled = true;
      if (timer !== undefined) window.clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [slug]);

  return (
    <span
      className="inline-flex items-center gap-1.5"
      aria-label={
        views == null ? "View count loading" : `${fmt.format(views)} views`
      }
    >
      <span aria-hidden>👁</span>
      {views == null ? (
        <span className="inline-block h-3 w-8 animate-pulse rounded bg-white/10" />
      ) : (
        <span>{fmt.format(views)} views</span>
      )}
    </span>
  );
}
