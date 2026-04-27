"use client";

import { ArrowUpRight, Mail } from "lucide-react";

type Inquiry = {
  key: string;
  emoji: string;
  label: string;
  caption: string;
  email: string;
  subject: string;
  body: string;
};

function buildMailto(to: string, subject: string, body: string) {
  const params = new URLSearchParams({ subject, body });
  return `mailto:${to}?${params.toString().replace(/\+/g, "%20")}`;
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

const HI_BODY = [
  "Hi Kevin,",
  "",
  "",
].join("\n");

function buildInquiries(): Inquiry[] {
  return [
    {
      key: "project",
      emoji: "🛠️",
      label: "Hire me / project work",
      caption: "Build me a site or app, freelance, studio commissions.",
      email: "contact@kevintrinh.dev",
      subject: "Project inquiry — kevintrinh.dev",
      body: PROJECT_BODY,
    },
    {
      key: "opportunity",
      emoji: "💼",
      label: "Recruiting / job opportunity",
      caption: "Full-time, internship, or contract roles.",
      email: "kevin@kevintrinh.dev",
      subject: "Role opportunity — kevintrinh.dev",
      body: RECRUITING_BODY,
    },
    {
      key: "business",
      emoji: "🤝",
      label: "Business / collab / sponsor",
      caption: "Partnerships, sponsorships, or business questions.",
      email: "contact@kevintrinh.dev",
      subject: "Business / collab — kevintrinh.dev",
      body: BUSINESS_BODY,
    },
    {
      key: "general",
      emoji: "👋",
      label: "Just saying hi",
      caption: "Anything else — questions, kind words, intros.",
      email: "kevin@kevintrinh.dev",
      subject: "Hello — kevintrinh.dev",
      body: HI_BODY,
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

          {/* Single Email action — opens default mail app with prefilled body */}
          <a
            href={buildMailto(q.email, q.subject, q.body)}
            className="group mt-auto inline-flex items-center justify-center gap-2 rounded-md border border-white/15 bg-white/[0.03] px-3 py-2 text-sm font-medium text-foreground transition-colors hover:border-accent hover:bg-white/10"
          >
            <Mail className="h-4 w-4" />
            Email me
            <ArrowUpRight
              className="h-3.5 w-3.5 text-muted-foreground/70 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent"
              aria-hidden
            />
          </a>
        </article>
      ))}
    </div>
  );
}
