"use client";

import { ArrowUpRight, Mail, Linkedin, MessageCircle } from "lucide-react";

import { siteConfig } from "@/config/siteConfig";
import { XIcon } from "@/components/icons/XIcon";

type Action = {
  key: string;
  label: string;
  href: string;
  Icon: (p: { className?: string }) => React.ReactNode;
  /** True when the link target lives outside this domain. */
  external: boolean;
};

type Inquiry = {
  key: string;
  emoji: string;
  label: string;
  caption: string;
  actions: Action[];
};

function buildMailto(to: string, subject: string, body: string) {
  const params = new URLSearchParams({ subject, body });
  return `mailto:${to}?${params.toString().replace(/\+/g, "%20")}`;
}

function urlForKey(key: string): string | null {
  const item = (siteConfig.socialsList ?? []).find((s) => s.key === key);
  const href = (item?.href || "").trim();
  if (!href || href === "null" || href.startsWith("copy:")) return null;
  return href;
}

const PROJECT_BODY = [
  "Hi Kevin,",
  "",
  "I'd like to discuss a project.",
  "",
  "• Project type:",
  "• Goals / scope:",
  "• Timeline:",
  "• Budget range:",
  "",
  "Thanks!",
].join("\n");

const RECRUITING_BODY = [
  "Hi Kevin,",
  "",
  "We have an opportunity that may be a fit:",
  "",
  "• Company:",
  "• Role:",
  "• Location / remote?:",
  "• Compensation range:",
  "• Link to JD (if any):",
  "",
  "Looking forward to chatting.",
].join("\n");

const BUSINESS_BODY = [
  "Hi Kevin,",
  "",
  "I'd like to discuss a business / collab opportunity:",
  "",
  "• Who I am:",
  "• What I'm proposing:",
  "• What I'm hoping for:",
  "",
  "Thanks!",
].join("\n");

function buildInquiries(): Inquiry[] {
  const linkedin = urlForKey("linkedin");
  const x = urlForKey("x");
  const discord = urlForKey("discord") ?? "/discord";

  const projectMail = buildMailto(
    "contact@kevintrinh.dev",
    "Project inquiry — kevintrinh.dev",
    PROJECT_BODY
  );
  const recruitingMail = buildMailto(
    "kevin@kevintrinh.dev",
    "Role opportunity — kevintrinh.dev",
    RECRUITING_BODY
  );
  const businessMail = buildMailto(
    "contact@kevintrinh.dev",
    "Business / collab — kevintrinh.dev",
    BUSINESS_BODY
  );

  return [
    {
      key: "project",
      emoji: "🛠️",
      label: "Hire me / project work",
      caption: "Build me a site or app, freelance, studio commissions.",
      actions: [
        { key: "email", label: "Email me", href: projectMail, Icon: Mail, external: false },
        ...(linkedin
          ? [
              {
                key: "linkedin",
                label: "Message on LinkedIn",
                href: linkedin,
                Icon: Linkedin,
                external: true,
              } as Action,
            ]
          : []),
      ],
    },
    {
      key: "opportunity",
      emoji: "💼",
      label: "Recruiting / job opportunity",
      caption: "Full-time, internship, or contract roles.",
      actions: [
        { key: "email", label: "Email me", href: recruitingMail, Icon: Mail, external: false },
        ...(linkedin
          ? [
              {
                key: "linkedin",
                label: "Reach out on LinkedIn",
                href: linkedin,
                Icon: Linkedin,
                external: true,
              } as Action,
            ]
          : []),
      ],
    },
    {
      key: "business",
      emoji: "🤝",
      label: "Business / collab / sponsor",
      caption: "Partnerships, sponsorships, or business questions.",
      actions: [
        { key: "email", label: "Email me", href: businessMail, Icon: Mail, external: false },
        ...(linkedin
          ? [
              {
                key: "linkedin",
                label: "DM on LinkedIn",
                href: linkedin,
                Icon: Linkedin,
                external: true,
              } as Action,
            ]
          : []),
      ],
    },
    {
      key: "general",
      emoji: "👋",
      label: "Just saying hi",
      caption: "Anything else — questions, kind words, intros.",
      actions: [
        {
          key: "discord",
          label: "Join my Discord server",
          href: discord,
          Icon: MessageCircle,
          external: true,
        },
        ...(x
          ? [
              {
                key: "x",
                label: "Find me on X",
                href: x,
                Icon: XIcon,
                external: true,
              } as Action,
            ]
          : []),
      ],
    },
  ];
}

export function ContactPicker() {
  const inquiries = buildInquiries();

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {inquiries.map((q) => (
        <article
          key={q.key}
          className="flex flex-col gap-4 rounded-xl border border-white/10 bg-white/[0.03] p-5 transition-colors hover:border-accent/40 hover:bg-white/[0.05]"
        >
          {/* Header */}
          <header className="flex items-start gap-3">
            <span
              aria-hidden
              className="flex h-11 w-11 flex-none items-center justify-center rounded-lg bg-white/5 text-2xl"
            >
              {q.emoji}
            </span>
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-semibold text-foreground sm:text-base">
                {q.label}
              </h3>
              <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground sm:text-sm">
                {q.caption}
              </p>
            </div>
          </header>

          {/* Action buttons */}
          <div className="mt-auto flex flex-wrap gap-2">
            {q.actions.map((a) => (
              <a
                key={a.key}
                href={a.href}
                target={a.external ? "_blank" : undefined}
                rel={a.external ? "noreferrer noopener" : undefined}
                className="group inline-flex items-center gap-2 rounded-md border border-white/15 bg-white/[0.03] px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-accent hover:bg-white/10 sm:text-sm"
              >
                <a.Icon className="h-3.5 w-3.5" />
                {a.label}
                <ArrowUpRight
                  className="h-3 w-3 text-muted-foreground/70 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent"
                  aria-hidden
                />
              </a>
            ))}
          </div>
        </article>
      ))}
    </div>
  );
}
