// components/projects/ProjectCard.tsx
"use client";

import type { ReactNode } from "react";
import { Folder, Star, GitFork, Download } from "lucide-react";
import type { ProjectItem, ProjectLink } from "../../config/projects";

interface ProjectCardProps {
  project: ProjectItem;
  iconFor: (type?: string) => ReactNode;
  hideImage?: boolean;
}

function fallbackImage(_project: ProjectItem): string {
  // Static fallback used when a project has no imageUrl in config.
  return "/images/demo_1.png";
}

/**
 * Pick the most appropriate external destination for a project click:
 *   1. Live demo / hosted URL  → highest priority
 *   2. GitHub repo URL
 *   3. First non-empty link in the project's `links[]`
 *   4. null  → card stays click-no-op
 */
function externalHref(project: ProjectItem): string | null {
  const live = project.links?.find((l) => l.type === "live")?.href;
  if (live) return live;
  if (project.githubRepoUrl) return project.githubRepoUrl;
  const repoFromLinks = project.links?.find((l) => l.type === "github")?.href;
  if (repoFromLinks) return repoFromLinks;
  const anyLink = project.links?.find((l) => !!l.href)?.href;
  return anyLink || null;
}

export function ProjectCard({ project, iconFor, hideImage }: ProjectCardProps) {
  const hasStats =
    project.githubStars !== undefined ||
    project.githubForks !== undefined ||
    project.downloads !== undefined;

  const href = externalHref(project);

  const firstDesc = project.description?.length
    ? project.description[0]
    : project.summary ?? "";

  const actionBtnClass =
    "inline-flex h-7 w-7 items-center justify-center rounded-md text-indigo-400 transition-all duration-150 hover:scale-110 hover:text-indigo-300";

  const image = project.imageUrl || fallbackImage(project);

  const cardClass = [
    "group flex h-full flex-col overflow-hidden rounded-lg border border-white/10 bg-white/5",
    "outline-none focus-visible:ring-2 focus-visible:ring-white/30",
    "transition-colors transition-shadow transition-transform duration-200 ease-out",
    "hover:bg-white/[0.07] hover:border-white/15 hover:shadow-sm hover:-translate-y-[1px]",
    href ? "cursor-pointer" : "",
  ].join(" ");

  const inner = (
    <>
      {/* Cover image — desktop: at top, mobile: rendered below the title (see inner div) */}
      {!hideImage && (
        <div className="relative hidden aspect-[16/9] w-full overflow-hidden bg-white/5 md:block">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={image}
            alt={project.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
            loading="lazy"
          />
        </div>
      )}

      <div className="flex flex-1 flex-col p-4">
        {/* TOP ROW: folder icon + icon-only action buttons */}
        <div className="flex items-center justify-between gap-3">
          <span
            className="inline-flex items-center justify-center text-indigo-300/95"
            aria-hidden="true"
            title="Project"
          >
            <Folder className="h-7 w-7" />
          </span>

          {project.links?.length ? (
            <div className="flex items-center gap-1">
              {project.links.map((link: ProjectLink) => (
                <a
                  key={`${project.id}-${link.label}-${link.href}`}
                  href={link.href}
                  target="_blank"
                  rel="noreferrer noopener"
                  onClick={(e) => e.stopPropagation()}
                  aria-label={link.label}
                  title={link.label}
                  className={actionBtnClass}
                >
                  {iconFor(link.type)}
                </a>
              ))}
            </div>
          ) : null}
        </div>

        <div className="mt-3">
          <h4 className="text-lg font-semibold text-foreground">
            {project.name}
          </h4>
        </div>

        {/* Cover image — mobile only, between title and description. */}
        {!hideImage && (
          <div className="relative mt-3 aspect-[16/9] w-full overflow-hidden rounded-lg border border-white/10 bg-white/5 md:hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={image}
              alt={project.name}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
              loading="lazy"
            />
          </div>
        )}

        <div className="mt-3 flex-1">
          {firstDesc ? (
            <p className="line-clamp-3 text-[14px] leading-6 text-muted-foreground">
              {firstDesc}
            </p>
          ) : null}

          {project.technologies?.length ? (
            <p className="mt-4 truncate text-[12px] font-medium text-indigo-200/80">
              {project.technologies.join(", ")}
            </p>
          ) : null}
        </div>

        {hasStats ? (
          <div className="mt-4 flex items-center gap-3 border-t border-white/5 pt-3 text-[12px] text-muted-foreground">
            {project.githubStars !== undefined && (
              <span className="inline-flex items-center gap-1" title="Stars">
                <Star className="h-3.5 w-3.5" />
                <span>{project.githubStars}</span>
              </span>
            )}
            {project.githubForks !== undefined && (
              <span className="inline-flex items-center gap-1" title="Forks">
                <GitFork className="h-3.5 w-3.5" />
                <span>{project.githubForks}</span>
              </span>
            )}
            {project.downloads !== undefined && (
              <span className="inline-flex items-center gap-1" title="Downloads">
                <Download className="h-3.5 w-3.5" />
                <span>{project.downloads}</span>
              </span>
            )}
          </div>
        ) : null}
      </div>
    </>
  );

  // Whole card is a click-target → external link in a new tab. If the
  // project has no usable external URL we fall back to a non-interactive
  // article element so we never render a dead link.
  if (!href) {
    return (
      <article className={cardClass} aria-label={project.name}>
        {inner}
      </article>
    );
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer noopener"
      aria-label={`Open ${project.name} (opens in a new tab)`}
      className={cardClass}
    >
      {inner}
    </a>
  );
}
