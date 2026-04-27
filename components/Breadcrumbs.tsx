// components/Breadcrumbs.tsx
import Link from "next/link";
import { JsonLd } from "@/components/JsonLd";
import { ShareButton } from "@/components/ShareButton";
import { generateBreadcrumbSchema } from "@/lib/structured-data";

export type BreadcrumbItem = { name: string; url: string };

type Props = {
  items: BreadcrumbItem[];
  showShare?: boolean;
  shareLabel?: string;
  className?: string;
  /** Visually clip the last item when its name exceeds this many characters. */
  truncateLastAt?: number;
};

function clipName(name: string, max: number): string {
  if (name.length <= max) return name;
  // Try to break at a word boundary if reasonable
  const slice = name.slice(0, max);
  const lastSpace = slice.lastIndexOf(" ");
  return (lastSpace > max * 0.6 ? slice.slice(0, lastSpace) : slice).trimEnd() + "…";
}

export function Breadcrumbs({
  items,
  showShare = true,
  shareLabel = "Share",
  className = "",
  truncateLastAt,
}: Props) {
  if (!items || items.length === 0) return null;

  return (
    <>
      <JsonLd data={generateBreadcrumbSchema(items)} />

      <div
        className={[
          "mb-4 flex items-center justify-between gap-4",
          className,
        ].join(" ")}
      >
        <nav
          aria-label="Breadcrumb"
          className="flex min-w-0 items-center gap-2 text-sm text-muted-foreground"
        >
          {items.map((item, idx) => {
            const isLast = idx === items.length - 1;
            const displayName =
              isLast && typeof truncateLastAt === "number"
                ? clipName(item.name, truncateLastAt)
                : item.name;
            return (
              <span
                key={`${item.url}-${idx}`}
                className="flex min-w-0 items-center gap-2"
              >
                {isLast ? (
                  <span
                    className="truncate text-foreground"
                    title={item.name}
                  >
                    {displayName}
                  </span>
                ) : (
                  <Link
                    href={item.url}
                    className="truncate transition-colors hover:text-accent"
                  >
                    {displayName}
                  </Link>
                )}
                {!isLast && (
                  <span aria-hidden className="text-muted-foreground/60">
                    /
                  </span>
                )}
              </span>
            );
          })}
        </nav>
        {showShare && <ShareButton label={shareLabel} />}
      </div>
    </>
  );
}
