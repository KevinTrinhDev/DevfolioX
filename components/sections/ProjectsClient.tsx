// components/sections/ProjectsClient.tsx
"use client";

import { useMemo, useState, type ReactNode } from "react";
import {
  Github,
  Globe,
  FileText,
  Download,
  PlayCircle,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { ProjectItem } from "../../config/projects";
import { Modal } from "../ui/Modal";
import { ProjectCard } from "../projects/ProjectCard";
import { FeaturedProjectsTicker } from "../projects/FeaturedProjectsTicker";
import { ProjectDetails } from "../projects/ProjectDetails";

interface ProjectsSectionClientProps {
  projects: ProjectItem[];
}

export function ProjectsSectionClient({
  projects,
}: ProjectsSectionClientProps) {
  // If the loader somehow returns an empty list, show nothing
  if (!projects.length) return null;

  const [showAll, setShowAll] = useState(false);

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const selectedProjectId = searchParams.get("project");
  const selected = useMemo(
    () =>
      selectedProjectId
        ? projects.find((p) => p.id === selectedProjectId) ?? null
        : null,
    [selectedProjectId, projects]
  );

  const visibleProjects = showAll ? projects : projects.slice(0, 6);
  const showToggle = projects.length > 6;

  // Use only featured projects for the ticker
  const featuredTickerProjects = useMemo(
    () => projects.filter((p) => p.featured),
    [projects]
  );

  const openProject = (project: ProjectItem) => {
    const sp = new URLSearchParams(searchParams.toString());
    sp.set("project", project.id);
    const nextUrl = `${pathname}?${sp.toString()}`;
    router.replace(nextUrl, { scroll: false });
  };

  const closeProject = () => {
    const sp = new URLSearchParams(searchParams.toString());
    sp.delete("project");
    const nextUrl = sp.toString() ? `${pathname}?${sp.toString()}` : pathname;
    router.replace(nextUrl, { scroll: false });
  };

  const iconFor = (type?: string): ReactNode => {
    switch (type) {
      case "github":
        return <Github className="h-3.5 w-3.5" />;
      case "live":
        return <Globe className="h-3.5 w-3.5" />;
      case "docs":
        return <FileText className="h-3.5 w-3.5" />;
      case "download":
        return <Download className="h-3.5 w-3.5" />;
      case "video":
        return <PlayCircle className="h-3.5 w-3.5" />;
      default:
        return <ExternalLink className="h-3.5 w-3.5" />;
    }
  };

  const modalTitle: string | undefined = selected?.name ?? "Project";

  return (
    <section id="projects" className="py-16 scroll-mt-12 overflow-x-hidden">
      {/* Heading container */}
      <div className="mx-auto w-full max-w-6xl px-4">
        <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          ~/Projects
        </h2>

        <h3 className="mt-3 text-2xl font-semibold sm:text-3xl">
          Some things I&apos;ve been working on.
        </h3>
      </div>

      {/* Full-width featured projects ticker (sits outside the max-width container) */}
      {/* Full-width featured projects ticker (breaks out of container padding) */}
      {featuredTickerProjects.length > 0 && (
        <div className="mt-8 -mx-4 sm:-mx-6 lg:-mx-8">
          <FeaturedProjectsTicker projects={featuredTickerProjects} />
        </div>
      )}

      {/* Regular project cards grid back inside container */}
      <div className="mx-auto mt-8 w-full max-w-6xl px-4">
        <div className="grid auto-rows-fr gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visibleProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onOpenDetails={openProject}
              iconFor={iconFor}
            />
          ))}
        </div>

        {showToggle && (
          <div className="mt-6 flex justify-center">
            <button
              type="button"
              onClick={() => setShowAll((prev) => !prev)}
              className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-sm font-medium text-white/80 transition-transform duration-200 ease-out hover:-translate-y-0.5 hover:scale-[1.02] hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
            >
              <span>{showAll ? "Show less" : "View more"}</span>
              {showAll ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </button>
          </div>
        )}
      </div>

      {/* Info Modal – cached data only */}
      <Modal open={Boolean(selected)} onClose={closeProject} title={modalTitle}>
        {selected && <ProjectDetails project={selected} iconFor={iconFor} />}
      </Modal>
    </section>
  );
}
