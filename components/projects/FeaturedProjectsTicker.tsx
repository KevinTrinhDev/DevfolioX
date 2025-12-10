// components/projects/FeaturedProjectsTicker.tsx
"use client";

import type { ReactNode } from "react";
import { ExternalLink, Star, GitFork, Download, Pin } from "lucide-react";
import type { ProjectItem } from "../../config/projects";
import { getDisplayDates } from "./projectHelpers";

interface FeaturedProjectsTickerProps {
  projects: ProjectItem[];
}

export function FeaturedProjectsTicker({
  projects,
}: FeaturedProjectsTickerProps) {
  if (!projects.length) return null;

  // Limit how many we duplicate so the loop is smooth
  const items = projects.slice(0, 8);

  return (
    <div className="w-full">
      <div className="relative overflow-hidden py-5">
        {/* Gradient fades on edges – desktop / tablet only */}
        <div
          className="pointer-events-none absolute inset-y-0 left-0 z-20
             hidden sm:block sm:w-20 bg-gradient-to-r
             from-slate-950/95 via-slate-950/75 to-transparent"
        />
        <div
          className="pointer-events-none absolute inset-y-0 right-0 z-20
             hidden sm:block sm:w-20 bg-gradient-to-l
             from-slate-950/95 via-slate-950/75 to-transparent"
        />

        {/* Scrolling row – duplicated for infinite loop */}
        <div className="marquee-row flex gap-4 px-0 sm:px-4 lg:px-8">
          {[...items, ...items].map((project, idx) => {
            const blurb =
              project.description?.[0] ??
              project.summary ??
              "Personal project.";

            const image = project.imageUrl;

            // Primary link used for card click
            const primaryLink =
              project.links?.find((l) => l.type === "live") ??
              project.links?.find((l) => l.type === "github") ??
              project.links?.[0];

            // Tech line (comma separated)
            let techLabel: string | null = null;
            if (project.technologies && project.technologies.length > 0) {
              const techs = project.technologies;
              const maxShown = 4;
              if (techs.length <= maxShown) {
                techLabel = techs.join(", ");
              } else {
                techLabel =
                  techs.slice(0, maxShown).join(", ") +
                  `, +${techs.length - maxShown} more`;
              }
            }

            // Dates
            const { startLabel, endLabel } = getDisplayDates(project);
            const dateLabel =
              startLabel || endLabel
                ? `${startLabel}${endLabel ? ` – ${endLabel}` : ""}`
                : "";

            // Stats row (bottom-left)
            const metrics: {
              label: string;
              value: number;
              icon: ReactNode;
            }[] = [];

            if (
              typeof project.githubStars === "number" &&
              Number.isFinite(project.githubStars)
            ) {
              metrics.push({
                label: "Stars",
                value: project.githubStars,
                icon: <Star className="h-3 w-3" />,
              });
            }
            if (
              typeof project.githubForks === "number" &&
              Number.isFinite(project.githubForks)
            ) {
              metrics.push({
                label: "Forks",
                value: project.githubForks,
                icon: <GitFork className="h-3 w-3" />,
              });
            }
            if (
              typeof project.downloads === "number" &&
              Number.isFinite(project.downloads)
            ) {
              metrics.push({
                label: "Downloads",
                value: project.downloads,
                icon: <Download className="h-3 w-3" />,
              });
            }

            const hasStats = metrics.length > 0;

            const handleCardClick = () => {
              if (primaryLink?.href) {
                window.open(primaryLink.href, "_blank", "noopener,noreferrer");
              }
            };

            return (
              <article
                key={`${project.id}-${idx}`}
                onClick={handleCardClick}
                className="group relative flex h-[210px] w-[340px] flex-shrink-0 cursor-pointer overflow-hidden rounded-lg border border-white/10 bg-white/5 text-xs text-muted-foreground transition-colors duration-300 hover:border-accent/70 hover:bg-white/10 sm:h-[220px] sm:w-[420px] lg:h-[280px] lg:w-[460px]"
              >
                {/* Background image (full card, no gaps, keeps aspect ratio) */}
                {image ? (
                  <img
                    src={image}
                    alt={project.name}
                    className="absolute inset-0 h-full w-full object-cover object-center"
                    loading="lazy"
                  />
                ) : (
                  <div className="absolute inset-0 flex h-full w-full items-center justify-center bg-gradient-to-br from-indigo-500/40 via-violet-500/25 to-sky-500/30 px-3 text-[11px] font-medium text-slate-50">
                    <span className="line-clamp-3 text-center">
                      {project.name}
                    </span>
                  </div>
                )}

                {/* Dark overlay – mostly removed on hover so image shows */}
                <div className="pointer-events-none absolute inset-0 bg-slate-950/65 transition-opacity duration-300 group-hover:opacity-20" />

                {/* Content overlay */}
                <div className="relative z-10 flex h-full w-full flex-col justify-between p-4 sm:p-5">
                  {/* Top: title + badge + top-right external icon */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      {/* Title + Featured badge in one row so they animate together */}
                      <div className="flex items-center gap-2 transition-all duration-300 group-hover:translate-y-1 group-hover:opacity-0">
                        <h4 className="line-clamp-1 text-sm font-semibold text-slate-50 sm:text-base">
                          {project.name}
                        </h4>

                        <span className="inline-flex items-center gap-1 rounded-md border border-white/20 bg-slate-950/45 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-slate-100/90 backdrop-blur-[2px]">
                          <Pin className="h-3 w-3" />
                          <span>Featured</span>
                        </span>
                      </div>

                      {/* Date under title ONLY if we have stats */}
                      {hasStats && dateLabel && (
                        <p className="text-[11px] text-slate-300/95 transition-all duration-300 sm:text-xs group-hover:translate-y-1 group-hover:opacity-0">
                          {dateLabel}
                        </p>
                      )}
                    </div>

                    {primaryLink?.href && (
                      <a
                        href={primaryLink.href}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center justify-center"
                        aria-label={`Open ${project.name} in new tab`}
                      >
                        <ExternalLink className="h-5 w-5 text-white transition-colors duration-300 group-hover:text-indigo-400" />
                      </a>
                    )}
                  </div>

                  {/* Middle block: description + tech – fades away on hover */}
                  <div className="mt-3 space-y-2 text-slate-200/95 transition-all duration-300 group-hover:translate-y-2 group-hover:opacity-0">
                    <p className="line-clamp-3 text-[13px] leading-snug sm:text-sm">
                      {blurb}
                    </p>

                    {techLabel && (
                      <p className="text-[11px] sm:text-xs">{techLabel}</p>
                    )}
                  </div>

                  {/* Bottom: stats OR (if no stats) date, on bottom-left */}
                  <div className="mt-3">
                    {hasStats && (
                      <div className="flex flex-wrap gap-3 text-[11px] text-slate-200/95 transition-all duration-300 group-hover:translate-y-2 group-hover:opacity-0">
                        {metrics.map((m) => (
                          <span
                            key={m.label}
                            className="inline-flex items-center gap-1"
                          >
                            {m.icon}
                            <span className="font-semibold">{m.value}</span>
                            <span className="opacity-80">{m.label}</span>
                          </span>
                        ))}
                      </div>
                    )}

                    {!hasStats && dateLabel && (
                      <p className="text-[11px] text-slate-200/95 transition-all duration-300 group-hover:translate-y-2 group-hover:opacity-0">
                        {dateLabel}
                      </p>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
}
