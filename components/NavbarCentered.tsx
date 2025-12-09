// components/NavbarCentered.tsx
"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { siteConfig } from "../config/siteConfig";
import { Menu, X } from "lucide-react";

type NavItemCfg = {
  id?: string; // e.g. "about", "projects", "resume", "contact"
  href?: string; // override link (external or internal)
  label?: string; // visible text
  show?: boolean; // toggle visibility
  isButton?: boolean; // render as button (legacy)
  external?: boolean; // force new tab
};

type NavItem = {
  key: string;
  id: string;
  label: string;
  href: string;
  external: boolean;
  isButton: boolean;
};

export function NavbarCentered() {
  const [isOpen, setIsOpen] = useState(false);

  const navCfg = (siteConfig as any).nav as
    | { items?: NavItemCfg[] }
    | undefined;

  const visibleItems: NavItem[] = useMemo(() => {
    // If nav.items provided, use it exactly (respect show/hide, labels, href, isButton)
    if (Array.isArray(navCfg?.items) && navCfg!.items.length > 0) {
      return navCfg!.items
        .filter((it) => it?.show !== false)
        .map((it) => {
          const id = it.id ?? "";
          const label =
            it.label ??
            (id ? id.charAt(0).toUpperCase() + id.slice(1) : "Link");

          // default href: anchor by id
          const href = it.href ?? (id ? `#${id}` : "#");

          const external = it.external ?? href.startsWith("http");
          const isButton = !!it.isButton;

          return {
            key: id || href,
            id,
            label,
            href,
            external,
            isButton,
          };
        });
    }

    // Fallback to sections flags (legacy behavior)
    const defaults: { id: keyof typeof siteConfig.sections; label: string }[] =
      [
        { id: "about", label: "About" },
        { id: "education", label: "Education" },
        { id: "experience", label: "Experience" },
        { id: "projects", label: "Projects" },
        { id: "blog", label: "Blogs" },
        { id: "youtube", label: "YouTube" },
        { id: "certifications", label: "Certifications" },
      ];

    const items: NavItem[] = defaults
      .filter((d) => siteConfig.sections[d.id])
      .map((d) => ({
        key: d.id,
        id: d.id,
        label: d.label,
        href: `#${d.id}`,
        external: false,
        isButton: false,
      }));

    if (siteConfig.sections.resume) {
      items.push({
        key: "resume",
        id: "resume",
        label: "My Resume",
        href: "/resume",
        external: true,
        isButton: true,
      });
    }

    return items;
  }, [navCfg]);

  // Try to detect Contact / Resume items from config
  const contactItem = visibleItems.find((i) => {
    const label = i.label.toLowerCase();
    return (
      i.id === "contact" ||
      label === "contact" ||
      label === "contact me" ||
      i.href === "#contact"
    );
  });

  const resumeItem = visibleItems.find(
    (i) =>
      i.id === "resume" ||
      i.label.toLowerCase().includes("resume") ||
      i.href === "/resume"
  );

  const contactLink = contactItem ?? {
    key: "contact",
    id: "contact",
    label: "Contact Me",
    href: "#contact",
    external: false,
    isButton: true,
  };

  const resumeLink = resumeItem ?? {
    key: "resume",
    id: "resume",
    label: "My Resume",
    href: "/resume",
    external: true,
    isButton: true,
  };

  // Center nav should only show "regular" links (no contact/resume/buttons)
  const textLinks = visibleItems.filter((i) => {
    if (i.isButton) return false;
    if (i.id === contactLink.id || i.id === resumeLink.id) return false;
    return true;
  });

  return (
    <header className="sticky top-0 z-20 border-b border-white/10 bg-background/80 backdrop-blur">
      <div className="mx-auto w-full max-w-6xl px-4">
        <div className="flex items-center gap-4 py-4">
          {/* Left: logo + title (no subtitle) */}
          <div className="flex flex-1 items-center">
            <Link
              href="/"
              className="group flex items-center gap-2 transform-gpu transition hover:scale-[0.97] active:scale-95"
            >
              <Image
                src="/images/favicon.png"
                alt="kevintrinh.dev logo"
                width={24}
                height={24}
                className="shrink-0 rounded-sm"
              />
              <span className="text-base font-semibold leading-none tracking-tight sm:text-lg">
                kevintrinh.dev
              </span>
            </Link>
          </div>

          {/* Center: nav items (desktop) with subtle pill background */}
          <nav className="hidden flex-none items-center justify-center sm:flex">
            <div className="flex items-center gap-1 rounded-full border border-white/15 bg-white/5 px-2 py-1 text-xs text-muted-foreground shadow-sm md:gap-2 md:px-3 md:py-1.5 md:text-sm">
              {textLinks.map((item) =>
                item.external ? (
                  <a
                    key={item.key}
                    href={item.href}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-md px-2.5 py-1 font-medium text-muted-foreground transition hover:bg-white/10 hover:text-foreground md:px-3 md:py-1.5"
                  >
                    {item.label}
                  </a>
                ) : (
                  <a
                    key={item.key}
                    href={item.href}
                    className="rounded-md px-2.5 py-1 font-medium text-muted-foreground transition hover:bg-white/10 hover:text-foreground md:px-3 md:py-1.5"
                  >
                    {item.label}
                  </a>
                )
              )}
            </div>
          </nav>

          {/* Right: CTAs (desktop) */}
          <div className="hidden flex-1 items-center justify-end gap-2 sm:flex">
            {/* Contact Me button - outline style, slightly rounder, same text styling */}
            <a
              href={contactLink.href}
              target={contactLink.external ? "_blank" : undefined}
              rel={contactLink.external ? "noreferrer" : undefined}
              className="rounded-lg border border-white/25 px-3.5 py-1.5 text-xs font-medium text-slate-50 underline-offset-2 transition hover:border-accent hover:bg-white/10 hover:text-slate-50 md:text-sm"
            >
              {contactLink.label}
            </a>

            {/* Resume button - filled accent with light text + subtle hover animation, same font */}
            <a
              href={resumeLink.href}
              target={resumeLink.external ? "_blank" : undefined}
              rel={resumeLink.external ? "noreferrer" : undefined}
              className="rounded-lg border border-accent bg-accent px-3.5 py-1.5 text-xs font-medium text-slate-50 shadow-sm transition-transform transition-colors hover:-translate-y-0.5 hover:bg-accent/90 hover:shadow-md md:text-sm"
            >
              {resumeLink.label}
            </a>
          </div>

          {/* Mobile toggle */}
          <button
            type="button"
            className="ml-auto inline-flex items-center justify-center rounded-md border border-white/15 p-1.5 text-muted-foreground hover:border-accent hover:text-foreground sm:hidden"
            onClick={() => setIsOpen((o) => !o)}
            aria-label="Toggle navigation menu"
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile menu */}
        {isOpen && (
          <div className="pb-4 sm:hidden">
            <nav className="flex flex-col gap-1 text-sm text-muted-foreground">
              {textLinks.map((item) => {
                const base =
                  "rounded-md px-3 py-2 font-medium transition hover:bg-white/5 hover:text-foreground";
                if (item.external) {
                  return (
                    <a
                      key={item.key}
                      href={item.href}
                      target="_blank"
                      rel="noreferrer"
                      onClick={() => setIsOpen(false)}
                      className={base}
                    >
                      {item.label}
                    </a>
                  );
                }
                return (
                  <a
                    key={item.key}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={base}
                  >
                    {item.label}
                  </a>
                );
              })}

              {/* Divider-ish spacing */}
              <div className="mt-1 h-px bg-white/5" />

              {/* Contact Me + Resume buttons in mobile menu */}
              <a
                href={contactLink.href}
                target={contactLink.external ? "_blank" : undefined}
                rel={contactLink.external ? "noreferrer" : undefined}
                onClick={() => setIsOpen(false)}
                className="mt-1 rounded-lg border border-white/20 px-3 py-2 text-sm font-medium text-slate-50 underline-offset-2 transition hover:border-accent hover:bg-white/10"
              >
                {contactLink.label}
              </a>

              <a
                href={resumeLink.href}
                target={resumeLink.external ? "_blank" : undefined}
                rel={resumeLink.external ? "noreferrer" : undefined}
                onClick={() => setIsOpen(false)}
                className="mt-1 rounded-lg border border-accent bg-accent px-3 py-2 text-sm font-medium text-slate-50 shadow-sm transition-transform hover:-translate-y-0.5 hover:bg-accent/90 hover:shadow-md"
              >
                {resumeLink.label}
              </a>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
