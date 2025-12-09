// components/sections/Contact.tsx
"use client";

import { FormEvent, useEffect, useRef, useState, ReactNode } from "react";
import { siteConfig } from "../../config/siteConfig";
import rawContactCfg from "../../config/contact.json";
import {
  Mail,
  MessageCircle,
  Send,
  Github,
  Linkedin,
  Youtube,
  FileText,
  ExternalLink,
} from "lucide-react";

// ─── Types for contact.json ──────────────────────────────────────────────────
type ContactLimits = {
  nameMax?: number;
  emailMax?: number;
  subjectMax?: number;
  messageMax?: number;
};

type ContactUI = {
  labels?: Record<string, string>;
  placeholders?: Record<string, string>;
  subjectOptions?: string[];
  customSubjectOptionLabel?: string;
  heading?: string;
  title?: string;
  intro?: string;
  successText?: string;
  errorText?: string;
};

type ContactSocialsBlock = {
  title?: string;
  description?: string;
};

type ContactConfig = {
  limits?: ContactLimits;
  ui?: ContactUI;
  socialsBlock?: ContactSocialsBlock;
};

// Cast the imported JSON once with a useful shape
const contactCfg = (rawContactCfg ?? {}) as ContactConfig;

// ─── Limits / config derived from JSON ───────────────────────────────────────
const NAME_MAX = contactCfg?.limits?.nameMax ?? 80;
const EMAIL_MAX = contactCfg?.limits?.emailMax ?? 254;
const MSG_MAX = contactCfg?.limits?.messageMax ?? 2000;
const SUBJECT_MAX = contactCfg?.limits?.subjectMax ?? 50;

const ui = contactCfg?.ui ?? {};
const labels = ui.labels ?? {};
const placeholders = ui.placeholders ?? {};
const subjectOptions = ui.subjectOptions ?? [
  "General message",
  "Role / Opportunity",
  "Question about a project",
  "Business Inquiry",
  "Other",
];
const customSubjectLabel = ui.customSubjectOptionLabel ?? "Custom…";

const socialsBlockCfg = contactCfg?.socialsBlock ?? null;

// ─── Local types ─────────────────────────────────────────────────────────────
type SocialLink = {
  icon?: string;
  label: string;
  href: string;
  detail?: string;
};

export function ContactSection() {
  // Only render if the section is enabled
  if (siteConfig.sections && siteConfig.sections.contact === false) {
    return null;
  }

  // Build “contact socials” from site.json -> siteConfig.socialsFor.contact
  const contactSocials =
    (siteConfig as any).socialsFor?.contact?.filter((s: any) => !!s?.href) ??
    [];

  // Resolve to the shape the grid expects; also normalize email mailto
  const contactLinks: SocialLink[] = contactSocials.map((s: any) => ({
    icon: s.icon,
    label: s.label || s.key,
    href:
      s.key === "email"
        ? s.href?.startsWith("mailto:")
          ? s.href
          : `mailto:${s.href}`
        : s.href,
    detail: s.detail,
  }));

  // Fallback links if no socialsFor.contact configured
  const hasConfiguredLinks = contactLinks.length > 0;
  const fallbackLinks: SocialLink[] = hasConfiguredLinks
    ? []
    : ([
        siteConfig.socials?.email && {
          icon: "Mail",
          label: "Email",
          href: siteConfig.socials.email.startsWith("mailto:")
            ? siteConfig.socials.email
            : `mailto:${siteConfig.socials.email}`,
          detail: siteConfig.socials.email.replace(/^mailto:/, ""),
        },
        siteConfig.socials?.discord && {
          icon: "MessageCircle",
          label: "Discord",
          href: siteConfig.socials.discord,
          detail: "Join / contact on Discord",
        },
        siteConfig.socials?.github && {
          icon: "Github",
          label: "GitHub",
          href: siteConfig.socials.github,
          detail: "Profile & projects",
        },
        siteConfig.socials?.linkedin && {
          icon: "Linkedin",
          label: "LinkedIn",
          href: siteConfig.socials.linkedin,
          detail: "Professional profile",
        },
        siteConfig.socials?.devto && {
          icon: "FileText",
          label: "Dev.to",
          href: siteConfig.socials.devto,
          detail: "Articles & posts",
        },
        siteConfig.socials?.youtube && {
          icon: "Youtube",
          label: "YouTube",
          href: siteConfig.socials.youtube,
          detail: "View my channel",
        },
      ].filter(Boolean) as SocialLink[]);

  const primaryEmail = siteConfig.socials?.email?.replace(/^mailto:/, "");

  const [status, setStatus] = useState<
    "idle" | "submitting" | "done" | "error"
  >("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [nameVal, setNameVal] = useState("");
  const [emailVal, setEmailVal] = useState("");
  const [messageVal, setMessageVal] = useState("");

  // subject select + optional custom input
  const [subjectVal, setSubjectVal] = useState<string>(
    subjectOptions[0] ?? "General message"
  );
  const [subjectCustom, setSubjectCustom] = useState<string>("");

  // simple “copied” flash state for copy: links
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const startedAtRef = useRef<number>(0);
  useEffect(() => {
    startedAtRef.current = Date.now();
  }, []);

  const isCustom = subjectVal === "__custom__";
  const effectiveSubject = (isCustom ? subjectCustom : subjectVal).slice(
    0,
    SUBJECT_MAX
  );

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === "submitting") return;

    setStatus("submitting");
    setErrorMsg(null);

    const form = e.currentTarget;
    const formData = new FormData(form);

    const name = String(formData.get("name") || "")
      .trim()
      .slice(0, NAME_MAX);
    const email = String(formData.get("email") || "")
      .trim()
      .slice(0, EMAIL_MAX);
    const subject = effectiveSubject; // already clipped
    const message = String(formData.get("message") || "")
      .trim()
      .slice(0, MSG_MAX);
    const hp = String(formData.get("company") || ""); // honeypot

    const payload = {
      name,
      email,
      subject,
      message,
      hp,
      startedAt: startedAtRef.current,
    };

    try {
      const controller = new AbortController();
      const t = setTimeout(() => controller.abort(), 12_000);

      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(t);

      if (!res.ok) {
        const { error } = await res
          .json()
          .catch(() => ({ error: ui.errorText || "Failed to send" }));
        setErrorMsg(error || ui.errorText || "Failed to send");
        setStatus("error");
        return;
      }

      setStatus("done");
      form.reset();
      setNameVal("");
      setEmailVal("");
      setMessageVal("");
      setSubjectVal(subjectOptions[0] ?? "General message");
      setSubjectCustom("");
      setTimeout(() => setStatus("idle"), 4000);
    } catch {
      setErrorMsg(ui.errorText || "Network error. Please try again.");
      setStatus("error");
    }
  }

  const heading = ui.heading ?? "~/Contact";
  const titleText = ui.title ?? "Let's get in touch.";
  const intro =
    ui.intro ??
    "Feel free to reach out to me about job opportunities, collaborations, questions, or anything related to my work. You can contact me using my email or by filling out the form below to reach me quicker.";

  // Copy handler for "copy:" socials
  async function handleCopy(href: string, key: string) {
    const value = href.replace(/^copy:/, "");
    try {
      await navigator.clipboard.writeText(value);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey((k) => (k === key ? null : k)), 1500);
    } catch {
      // Silent failure; optionally set an error toast.
    }
  }

  return (
    <section id="contact" className="py-16 scroll-mt-12">
      <div className="mx-auto w-full max-w-6xl px-4">
        <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          {heading}
        </h2>

        <h3 className="mt-3 text-2xl font-semibold sm:text-3xl">{titleText}</h3>

        <p className="mt-4 text-sm text-muted-foreground sm:text-base">
          {intro}
        </p>

        <div className="mt-8 space-y-6">
          {status === "done" && (
            <div className="flex items-center gap-2 rounded-md border border-green-500/30 bg-green-500/10 px-3 py-2 text-sm text-green-300">
              <span>✅</span>
              <span>
                {ui.successText ?? "Message sent! I'll get back to you soon."} —{" "}
                {siteConfig.name}
              </span>
            </div>
          )}
          {status === "error" && (
            <div className="flex items-center gap-2 rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
              <span>⚠️</span>
              <span>
                {errorMsg ??
                  ui.errorText ??
                  "Something went wrong. Please try again."}
              </span>
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            suppressHydrationWarning
            className="space-y-4 rounded-lg border border-white/10 bg-white/5 p-4 text-sm sm:text-base"
          >
            {/* Honeypot */}
            <input
              type="text"
              name="company"
              tabIndex={-1}
              autoComplete="off"
              className="hidden"
              aria-hidden="true"
            />

            {/* Row: Name / Email */}
            <div className="flex flex-col gap-4 sm:flex-row">
              <FieldWithCounter
                id="name"
                name="name"
                label={labels.name ?? "Name"}
                placeholder={placeholders.name ?? "Your name"}
                type="text"
                max={NAME_MAX}
                value={nameVal}
                setValue={(v) => setNameVal(v.slice(0, NAME_MAX))}
              />
              <FieldWithCounter
                id="email"
                name="email"
                label={labels.email ?? "Email"}
                placeholder={placeholders.email ?? "you@example.com"}
                type="email"
                max={EMAIL_MAX}
                value={emailVal}
                setValue={(v) => setEmailVal(v.slice(0, EMAIL_MAX))}
              />
            </div>

            {/* Subject select (own row) */}
            <div>
              <label
                htmlFor="subject"
                className="mb-1 block text-xs font-medium text-foreground sm:text-sm"
              >
                {labels.subject ?? "Subject"}
              </label>
              <select
                id="subject"
                name="subjectSelect"
                className="h-10 w-full rounded-md border border-white/15 bg-transparent px-2 text-sm text-foreground outline-none ring-0 focus:border-accent"
                value={isCustom ? "__custom__" : subjectVal}
                onChange={(e) => {
                  const v = e.target.value;
                  if (v === "__custom__") {
                    setSubjectVal("__custom__");
                  } else {
                    setSubjectVal(v);
                    setSubjectCustom("");
                  }
                }}
              >
                {subjectOptions.map((opt) => (
                  <option key={opt} value={opt} className="bg-[#020817]">
                    {opt}
                  </option>
                ))}
                <option value="__custom__" className="bg-[#020817]">
                  {customSubjectLabel}
                </option>
              </select>
            </div>

            {/* Custom subject (appears only if Custom… selected) */}
            {isCustom && (
              <div>
                <label
                  htmlFor="subjectCustom"
                  className="mb-1 flex items-center justify-between text-xs font-medium text-foreground sm:text-sm"
                >
                  <span>Custom subject</span>
                  <span className="text-[10px] text-muted-foreground">
                    {subjectCustom.length}/{SUBJECT_MAX}
                  </span>
                </label>
                <input
                  id="subjectCustom"
                  name="subjectCustom"
                  type="text"
                  value={subjectCustom}
                  onChange={(e) =>
                    setSubjectCustom(e.target.value.slice(0, SUBJECT_MAX))
                  }
                  maxLength={SUBJECT_MAX}
                  className="h-10 w-full rounded-md border border-white/15 bg-transparent px-2 text-sm text-foreground outline-none ring-0 placeholder:text-xs placeholder:text-muted-foreground/60 focus:border-accent"
                  placeholder={
                    ui.placeholders?.customSubject ?? "Enter a custom subject"
                  }
                  required
                />
              </div>
            )}

            {/* Message */}
            <div>
              <label
                htmlFor="message"
                className="mb-1 flex items-center justify-between text-xs font-medium text-foreground sm:text-sm"
              >
                <span>{labels.message ?? "Message"}</span>
                <span className="text-[10px] text-muted-foreground">
                  {messageVal.length}/{MSG_MAX}
                </span>
              </label>
              <textarea
                id="message"
                name="message"
                required
                rows={4}
                maxLength={MSG_MAX}
                value={messageVal}
                onChange={(e) => setMessageVal(e.target.value)}
                className="w-full rounded-md border border-white/15 bg-transparent px-2 py-2 text-sm text-foreground outline-none ring-0 placeholder:text-xs placeholder:text-muted-foreground/60 focus:border-accent"
                placeholder={
                  placeholders.message ??
                  "Write a short message and include your preferred contact info so I know how to get back to you."
                }
              />
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                {primaryEmail && (
                  <a
                    href={`mailto:${primaryEmail}`}
                    className="inline-flex items-center gap-1.5 rounded-md border border-white/20 px-3 py-1.5 text-xs text-muted-foreground transition hover:border-accent hover:bg-white/5 hover:text-foreground sm:text-sm"
                  >
                    <Mail className="h-4 w-4" />
                    <span>Email me directly</span>
                  </a>
                )}
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  disabled={status === "submitting"}
                  className="inline-flex items-center gap-1.5 rounded-md border border-transparent bg-accent px-4 py-2 text-xs font-medium text-white shadow-sm transition-transform transition-colors duration-200 hover:border-accent hover:bg-accent/90 hover:shadow-md hover:-translate-y-0.5 disabled:opacity-70 sm:text-sm"
                >
                  <Send className="h-4 w-4" />
                  {status === "submitting"
                    ? "Sending..."
                    : status === "done"
                    ? "Sent!"
                    : status === "error"
                    ? "Try again"
                    : "Send message"}
                </button>
              </div>
            </div>
          </form>

          {/* Socials block */}
          <div className="rounded-lg border border-white/10 bg-white/5 p-4 text-sm">
            <p className="text-xs font-bold text-foreground sm:text-sm">
              {socialsBlockCfg?.title ?? "More of my work & socials"}
            </p>
            <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
              {socialsBlockCfg?.description ??
                "Quick links to my profiles and other places where I share projects, updates, and resources."}
            </p>

            <div className="mt-4 grid gap-2 sm:grid-cols-2 md:grid-cols-3">
              {(hasConfiguredLinks ? contactLinks : fallbackLinks).map(
                (link, idx) => {
                  const isCopy =
                    typeof link.href === "string" &&
                    link.href.startsWith("copy:");
                  return (
                    <ContactLink
                      key={idx}
                      icon={resolveIcon(link.icon)}
                      label={
                        isCopy && copiedKey === link.label
                          ? "Copied!"
                          : link.label
                      }
                      href={link.href}
                      detail={link.detail}
                      onCopy={() => handleCopy(link.href, link.label)}
                      copied={copiedKey === link.label}
                    />
                  );
                }
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function FieldWithCounter(props: {
  id: string;
  name: string;
  label: string;
  placeholder: string;
  type: string;
  max: number;
  value: string;
  setValue: (v: string) => void;
}) {
  const { id, name, label, placeholder, type, max, value, setValue } = props;
  return (
    <div className="flex-1">
      <label
        htmlFor={id}
        className="mb-1 flex items-center justify-between text-xs font-medium text-foreground sm:text-sm"
      >
        <span>{label}</span>
        <span className="text-[10px] text-muted-foreground">
          {value.length}/{max}
        </span>
      </label>
      <input
        id={id}
        name={name}
        type={type}
        required
        maxLength={max}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="h-10 w-full rounded-md border border-white/15 bg-transparent px-2 text-sm text-foreground outline-none ring-0 placeholder:text-xs placeholder:text-muted-foreground/60 focus:border-accent"
        placeholder={placeholder}
      />
    </div>
  );
}

function ContactLink({
  icon,
  label,
  href,
  detail,
  onCopy,
  copied,
}: {
  icon: ReactNode;
  label: string;
  href: string;
  detail?: string;
  onCopy?: () => void;
  copied?: boolean;
}) {
  const isCopy = href?.startsWith("copy:");
  if (isCopy) {
    return (
      <button
        type="button"
        onClick={onCopy}
        className="flex items-center justify-between gap-2 rounded-md border border-white/10 bg-transparent px-3 py-2 text-left text-xs text-muted-foreground transition hover:border-accent hover:bg-white/5 hover:text-foreground sm:text-sm"
        aria-label={`Copy ${label}`}
        title="Copy to clipboard"
      >
        <span className="inline-flex items-center gap-2">
          {icon}
          <span className="font-medium">{copied ? "Copied!" : label}</span>
        </span>
        {detail && (
          <span className="text-[11px] text-muted-foreground sm:text-xs">
            {copied ? "Done" : detail}
          </span>
        )}
      </button>
    );
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="flex items-center justify-between gap-2 rounded-md border border-white/10 bg-transparent px-3 py-2 text-xs text-muted-foreground transition hover:border-accent hover:bg-white/5 hover:text-foreground sm:text-sm"
    >
      <span className="inline-flex items-center gap-2">
        {icon}
        <span className="font-medium">{label}</span>
      </span>
      {detail && (
        <span className="text-[11px] text-muted-foreground sm:text-xs">
          {detail}
        </span>
      )}
    </a>
  );
}

function resolveIcon(name?: string): ReactNode {
  switch (name) {
    case "Mail":
      return <Mail className="h-4 w-4" />;
    case "MessageCircle":
      return <MessageCircle className="h-4 w-4" />;
    case "Github":
      return <Github className="h-4 w-4" />;
    case "Linkedin":
      return <Linkedin className="h-4 w-4" />;
    case "Youtube":
      return <Youtube className="h-4 w-4" />;
    case "FileText":
      return <FileText className="h-4 w-4" />;
    default:
      return <ExternalLink className="h-4 w-4" />;
  }
}
