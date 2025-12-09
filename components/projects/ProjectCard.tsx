// components/projects/ProjectCard.tsx
import type { ReactNode } from "react";
import { Info, Star, GitFork, Download } from "lucide-react";
import type { ProjectItem, ProjectLink } from "../../config/projects";
import { getDisplayDates } from "./projectHelpers";

interface ProjectCardProps {
  project: ProjectItem;
  onOpenDetails: (project: ProjectItem) => void;
  iconFor: (type?: string) => ReactNode;
}

export function ProjectCard({
  project,
  onOpenDetails,
  iconFor,
}: ProjectCardProps) {
  const hasStats =
    project.githubStars !== undefined ||
    project.githubForks !== undefined ||
    project.downloads !== undefined;

  const { startLabel, endLabel } = getDisplayDates(project);

  return (
    <article className="group flex h-full flex-col rounded-lg border border-white/10 bg-white/5 p-4 text-sm transition-transform transition-colors transition-shadow hover:-translate-y-[2px] hover:border-accent/70 hover:bg-white/10 hover:shadow-md">
      <div className="flex items-start justify-between gap-2">
        <h4 className="text-lg font-semibold text-foreground">
          {project.name}
        </h4>

        <button
          type="button"
          onClick={() => onOpenDetails(project)}
          className="inline-flex h-7 w-7 items-center justify-center text-accent/80 transition hover:scale-105 hover:text-accent"
          aria-label={`Open details for ${project.name}`}
          title={`View details for ${project.name}`}
        >
          <Info className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-2 h-px w-full bg-white/10" />

      <div className="mt-3 flex-1 space-y-2">
        {(startLabel || endLabel) && (
          <p className="text-[11px] text-muted-foreground">
            {startLabel} {endLabel ? `- ${endLabel}` : ""}
          </p>
        )}

        <div className="space-y-2 text-sm text-muted-foreground">
          {project.description?.length ? (
            project.description.map((para, idx) => <p key={idx}>{para}</p>)
          ) : project.summary ? (
            <p>{project.summary}</p>
          ) : null}
        </div>

        {project.technologies?.length ? (
          <div className="mt-1 flex flex-wrap gap-1.5">
            {project.technologies.map((tech) => (
              <span
                key={tech}
                className="rounded-full border border-white/10 px-2 py-1 text-xs text-muted-foreground transition-transform transition-colors duration-200 hover:-translate-y-[1px] hover:border-accent/60 hover:bg-white/5"
              >
                {tech}
              </span>
            ))}
          </div>
        ) : null}
      </div>

      {(project.links?.length || hasStats) && (
        <div className="mt-2 h-px w-full bg-white/10" />
      )}

      {project.links?.length ? (
        <div className="mt-2 flex flex-wrap justify-center gap-2 text-xs sm:text-sm">
          {project.links.map((link: ProjectLink) => (
            <a
              key={`${project.id}-${link.label}`}
              href={link.href}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-md border border-white/15 bg-transparent px-3 py-1.5 text-[11px] text-muted-foreground transition-colors hover:border-accent hover:text-foreground sm:text-xs"
            >
              {iconFor(link.type)}
              <span>{link.label}</span>
            </a>
          ))}
        </div>
      ) : null}

      {hasStats && (
        <div className="mt-3 flex flex-wrap justify-center gap-3 text-[11px] text-muted-foreground transition-colors duration-500 ease-out group-hover:text-white/90">
          {project.githubStars !== undefined && (
            <span className="inline-flex items-center gap-1">
              <Star className="h-3.5 w-3.5" />
              <span>{project.githubStars}</span>
              <span>Stars</span>
            </span>
          )}
          {project.githubForks !== undefined && (
            <span className="inline-flex items-center gap-1">
              <GitFork className="h-3.5 w-3.5" />
              <span>{project.githubForks}</span>
              <span>Forks</span>
            </span>
          )}
          {project.downloads !== undefined && (
            <span className="inline-flex items-center gap-1">
              <Download className="h-3.5 w-3.5" />
              <span>{project.downloads}</span>
              <span>Downloads</span>
            </span>
          )}
        </div>
      )}
    </article>
  );
}
