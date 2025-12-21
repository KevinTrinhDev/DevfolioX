// components/sections/Experience.tsx
"use client";

import { useEffect, useState } from "react";
import { FileText, Download, ExternalLink } from "lucide-react";
import { experience } from "../../config/experience";
import { Modal } from "@/components/ui/Modal";
import PdfEmbed from "@/components/ui/PdfEmbed";
import { useModalRoute } from "@/components/hooks/useModalRoute";

export function ExperienceSection() {
  if (!experience.length) return null;

  const defaultActiveId = experience[0]?.id;
  const [activeId, setActiveId] = useState<string>(defaultActiveId);
  const activeItem =
    experience.find((item) => item.id === activeId) ?? experience[0];

  // Short flag-style URL: /current-path?resume
  const resumeModal = useModalRoute({
    scheme: "flag",
    key: "resume",
    scroll: false,
  });
  const [resumeOpen, setResumeOpen] = useState(false);

  // Show "(Updated ...)" when the API exposes a last-modified-like header
  const [lastUpdatedText, setLastUpdatedText] = useState<string | null>(null);

  // Sync modal with URL flag
  useEffect(() => {
    setResumeOpen(resumeModal.isActive);
  }, [resumeModal.isActive]);

  // API route paths
  const resumeViewHref = "/resume"; // inline view via API
  const resumeDownloadHref = "/resume?dl=1";

  // Fetch metadata for "Updated ..." text
  useEffect(() => {
    let cancelled = false;

    async function fetchMeta() {
      try {
        const res = await fetch(resumeViewHref, {
          method: "HEAD",
          cache: "no-store",
        });
        if (!res.ok) return;

        const lm =
          res.headers.get("Last-Modified") ||
          res.headers.get("x-resume-updated");
        if (!lm) return;

        const d = new Date(lm);
        if (isNaN(d.getTime())) return;

        const formatted = d.toLocaleString(undefined, {
          year: "numeric",
          month: "short",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        });

        if (!cancelled) setLastUpdatedText(formatted);
      } catch {
        // ignore
      }
    }

    fetchMeta();
    return () => {
      cancelled = true;
    };
  }, [resumeOpen]);

  const btnBase =
    "inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-xs sm:text-sm font-medium transition border border-white/15 text-white/90 hover:text-white hover:border-accent hover:bg-white/5";

  const btnAccent =
    "inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-xs sm:text-sm font-medium border border-transparent bg-accent text-white shadow-sm transition-transform transition-colors duration-200 hover:border-accent hover:bg-accent/90 hover:shadow-md hover:-translate-y-0.5";

  const modalTitle = lastUpdatedText
    ? `My Resume (Updated ${lastUpdatedText})`
    : "My Resume";

  return (
    <section id="experience" className="py-16 scroll-mt-12">
      <div className="mx-auto w-full max-w-6xl px-4">
        <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          ~/Experience
        </h2>

        <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="text-2xl font-semibold sm:text-3xl">
            My current/past relevant experience.
          </h3>

          {/* stacked on mobile, inline on sm+ */}
          <div className="grid grid-cols-1 gap-2 text-xs sm:flex sm:flex-wrap sm:gap-3 sm:text-sm">
            <a
              href={resumeModal.href}
              onClick={(e) => {
                e.preventDefault();
                resumeModal.open();
              }}
              className={btnAccent}
              title={`Open ${resumeModal.href}`}
            >
              <FileText className="h-4 w-4" />
              <span>View Resume</span>
            </a>

            <a href={resumeDownloadHref} className={btnBase}>
              <Download className="h-4 w-4" />
              <span>Download PDF</span>
            </a>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-4 md:flex-row md:items-start">
          {/* Left: roles list */}
          <div className="w-full border-b border-white/10 pb-4 md:w-60 md:border-b-0 md:pb-0 md:pr-4">
            <ul className="space-y-1">
              {experience.map((item) => {
                const isActive = item.id === activeItem.id;
                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => setActiveId(item.id)}
                      className={[
                        "group w-full rounded-md px-3 py-2.5 text-left transition-colors hover:bg-white/5",
                        isActive ? "bg-white/5" : "",
                      ].join(" ")}
                    >
                      <div className="flex items-center gap-2">
                        <div className="flex-1">
                          <p
                            className={
                              isActive
                                ? "text-base font-semibold text-indigo-300"
                                : "text-base font-semibold text-foreground group-hover:text-accent/60"
                            }
                          >
                            {item.company}
                          </p>
                          <p className="text-[13px] text-muted-foreground">
                            {item.role}
                          </p>
                        </div>

                        <div
                          className={`h-10 w-[2px] rounded-full transition-all duration-200 ${
                            isActive
                              ? "bg-accent"
                              : "bg-transparent group-hover:bg-accent/40"
                          }`}
                        />
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Right: details */}
          <article
            className="
              flex-1
              border-t-0
              pt-0
              text-muted-foreground
              md:border-t-0
              md:border-l
              md:border-white/10
              md:pl-4
              md:pt-0
            "
          >
            <div className="flex flex-col justify-between gap-2 sm:flex-row">
              <div>
                <h4 className="text-lg font-semibold text-foreground sm:text-xl">
                  {activeItem.role} @ {activeItem.company}
                </h4>

                <p className="mt-1 text-[15px] text-muted-foreground">
                  {/* CHANGE: hyphen "-" instead of en dash "—" */}
                  {activeItem.start} - {activeItem.end}
                  {activeItem.location && ` · ${activeItem.location}`}
                  {activeItem.type && ` · ${capitalize(activeItem.type)}`}
                </p>
              </div>
            </div>

            {activeItem.description?.length > 0 && (
              <ul className="mt-4 space-y-2 text-[15px] text-muted-foreground">
                {activeItem.description.map((line, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2 leading-relaxed"
                  >
                    {/* CHANGE: triangle bullet uses darker purple (your old vibe) */}
                    <span
                      className="
                        mt-[6px]
                        inline-block
                        h-0
                        w-0
                        border-y-[4px]
                        border-y-transparent
                        border-l-[7px]
                        border-l-accent
                      "
                      aria-hidden="true"
                    />
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            )}
          </article>
        </div>
      </div>

      {/* Resume Modal */}
      <Modal open={resumeOpen} onClose={resumeModal.close} title={modalTitle}>
        <PdfEmbed src={resumeViewHref} />
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2 sm:gap-3">
          <a
            href={resumeViewHref}
            target="_blank"
            rel="noreferrer"
            className={btnBase}
          >
            <ExternalLink className="h-4 w-4" />
            <span>Open in New Tab</span>
          </a>
          <a href={resumeDownloadHref} className={btnAccent}>
            <Download className="h-4 w-4" />
            <span>Download PDF</span>
          </a>
        </div>
      </Modal>
    </section>
  );
}

function capitalize(s?: string) {
  if (!s) return "";
  return s.charAt(0).toUpperCase() + s.slice(1);
}
