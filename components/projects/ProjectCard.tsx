// components/projects/ProjectCard.tsx
"use client";

import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { FolderGit2, Star, GitFork, Download } from "lucide-react";
import type { ProjectItem, ProjectLink } from "../../config/projects";

interface ProjectCardProps {
  project: ProjectItem;
  onOpenDetails: (project: ProjectItem) => void; // kept for back-compat with existing callers
  iconFor: (type?: string) => ReactNode;
}

export function ProjectCard({ project, iconFor }: ProjectCardProps) {
  const router = useRouter();

  const hasStats =
    project.githubStars !== undefined ||
    project.githubForks !== undefined ||
    project.downloads !== undefined;

  // Dedicated project page route (best-effort)
  const projectHref =
    (project as any).href ||
    ((project as any).slug
      ? `/projects/${String((project as any).slug)}`
      : "") ||
    `/projects/${project.id}`;

  const goToProject = () => router.push(projectHref);

  const onCardKeyDown: React.KeyboardEventHandler<HTMLElement> = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      goToProject();
    }
  };

  // Only show the first description item (or fallback to summary)
  const firstDesc = project.description?.length
    ? project.description[0]
    : project.summary ?? "";

  // slightly smaller action buttons
  const actionBtnClass =
    "inline-flex items-center gap-1.5 rounded-md border border-white/15 bg-transparent px-2.5 py-1 text-[11px] text-muted-foreground transition-colors hover:border-accent hover:text-foreground";

  return (
    <article
      role="link"
      tabIndex={0}
      onClick={goToProject}
      onKeyDown={onCardKeyDown}
      className={[
        "group flex h-full flex-col rounded-lg border border-white/10 bg-white/5 p-4",
        "cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-white/30",
        "transition-colors transition-shadow transition-transform duration-200 ease-out",
        "hover:bg-white/[0.07] hover:border-white/15 hover:shadow-sm hover:-translate-y-[1px]",
      ].join(" ")}
      aria-label={`Open ${project.name} project page`}
    >
      {/* TOP ROW: icon left, stats right (if any) */}
      <div className="flex items-center justify-between gap-3">
        <span
          className="inline-flex items-center justify-center text-indigo-300/95"
          aria-hidden="true"
          title="Project"
        >
          {/* ✅ slightly bigger icon */}
          <FolderGit2 className="h-8 w-8" />
        </span>

        {hasStats ? (
          <div className="flex items-center gap-2 text-[12px] text-muted-foreground">
            {project.githubStars !== undefined && (
              <span className="inline-flex items-center gap-1">
                <Star className="h-4 w-4" />
                <span>{project.githubStars}</span>
              </span>
            )}
            {project.githubForks !== undefined && (
              <span className="inline-flex items-center gap-1">
                <GitFork className="h-4 w-4" />
                <span>{project.githubForks}</span>
              </span>
            )}
            {project.downloads !== undefined && (
              <span className="inline-flex items-center gap-1">
                <Download className="h-4 w-4" />
                <span>{project.downloads}</span>
              </span>
            )}
          </div>
        ) : null}
      </div>

      {/* Title + underline on hover */}
      <h4 className="mt-4 text-lg font-semibold text-foreground">
        <span
          className={[
            "bg-[length:0%_2px] bg-left-bottom bg-no-repeat",
            "bg-gradient-to-r from-white/70 to-white/70",
            "transition-[background-size] duration-300 ease-out",
            "group-hover:bg-[length:100%_2px]",
          ].join(" ")}
        >
          {project.name}
        </span>
      </h4>

      {/* Body */}
      <div className="mt-3 flex-1">
        {firstDesc ? (
          <p className="text-[15px] leading-7 text-muted-foreground">
            {firstDesc}
          </p>
        ) : null}

        <div className="mt-6" />

        {project.technologies?.length ? (
          <p className="text-[14px] text-muted-foreground">
            {project.technologies.join(", ")}
          </p>
        ) : null}
      </div>

      {/* FOOTER: action buttons forced to bottom */}
      {project.links?.length ? (
        <div className="mt-auto pt-4">
          <div className="flex flex-wrap justify-start gap-2">
            {project.links.map((link: ProjectLink) => (
              <a
                key={`${project.id}-${link.label}-${link.href}`}
                href={link.href}
                target="_blank"
                rel="noreferrer"
                onClick={(e) => e.stopPropagation()}
                className={actionBtnClass}
              >
                {iconFor(link.type)}
                <span>{link.label}</span>
              </a>
            ))}
          </div>
        </div>
      ) : null}
    </article>
  );
}
