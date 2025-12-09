// components/sections/About.tsx
"use client";

import Image from "next/image";
import { siteConfig } from "../../config/siteConfig";
import { ExternalLink } from "lucide-react";

export function AboutSection() {
  // Render only if enabled in JSON
  const enabled = (siteConfig as any)?.sections?.about === true;
  if (!enabled) return null;

  const about = siteConfig.about;
  const tools = about?.recentTools ?? [];

  return (
    <section id="about" className="py-16 scroll-mt-12">
      <div className="mx-auto w-full max-w-6xl px-4">
        <div className="flex flex-col gap-8 md:flex-row md:items-center">
          {/* Left: text */}
          <div className="flex-1">
            <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              ~/About
            </h2>

            <h3 className="mt-3 text-2xl font-semibold sm:text-3xl">
              An overview of who I am.
            </h3>

            <div className="mt-5 space-y-3 text-sm text-muted-foreground sm:text-base">
              {about?.intro?.map((paragraph: string, idx: number) => (
                <p key={idx}>{paragraph}</p>
              ))}
            </div>

            {/* "More information about me" – text-style link, slightly bolder, icon at the end */}
            <a
              href="/about"
              className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-400 transition-colors duration-200 hover:text-indigo-300 sm:text-sm"
            >
              <span>More information about me, if you&apos;re curious.</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </a>

            {tools.length > 0 && (
              <div className="mt-4 text-xs sm:text-sm">
                <p className="text-xs font-semibold text-muted-foreground sm:text-sm">
                  Some technologies I&apos;ve used:
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  {tools.map((tool: string) => (
                    <span
                      key={tool}
                      className="rounded-md border border-white/10 px-2.5 py-1 text-sm text-muted-foreground transition-colors duration-200 hover:border-accent/60 hover:bg-white/5 hover:text-white"
                    >
                      {tool}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right: portrait (static, slightly larger) */}
          {about?.avatarUrl && (
            <div className="mx-auto w-full max-w-xs shrink-0 rounded-2xl outline-none sm:max-w-sm md:w-80">
              <div className="group overflow-hidden rounded-2xl border border-white/10 bg-white/5 transition-transform duration-200 hover:-translate-y-[2px] hover:border-accent/60">
                <Image
                  src={about.avatarUrl}
                  alt={siteConfig.name}
                  width={600}
                  height={600}
                  className="h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.03]"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
