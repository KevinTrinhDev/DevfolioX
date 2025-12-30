// components/sections/Contact.tsx
"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { siteConfig } from "../../config/siteConfig";
import rawContactCfg from "../../config/contact.json";
import { Send, SquareArrowOutUpRight } from "lucide-react";

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
  heading?: string;
  title?: string;
  intro?: string;
  successText?: string;
  errorText?: string;
};

type ContactConfig = {
  limits?: ContactLimits;
  ui?: ContactUI;
};

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

// ─── TEMP posts (3 total for now) ────────────────────────────────────────────
type PlatformKey = "x" | "youtube" | "linkedin";

type TempPost = {
  id: string;
  platform: PlatformKey;
  title: string;
  excerpt: string;
  href: string;
  dateLabel: string;
  bgImageUrl: string;
};

const TEMP_POSTS: TempPost[] = [
  {
    id: "p1",
    platform: "x",
    title: "DevfolioX: shipping a cleaner content system",
    excerpt:
      "Small structural tweaks that make it way easier for others to customize and extend.",
    href: "https://example.com/post-1",
    dateLabel: "Dec 29, 2025",
    bgImageUrl:
      "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=1600&q=80",
  },
  {
    id: "p2",
    platform: "youtube",
    title: "Notion → Blog pipeline walkthrough",
    excerpt:
      "A quick demo of tags, pagination, and how the content sync stays maintainable.",
    href: "https://example.com/post-2",
    dateLabel: "Dec 27, 2025",
    bgImageUrl:
      "https://images.unsplash.com/photo-1551739440-5dd934d3a94a?auto=format&fit=crop&w=1600&q=80",
  },
  {
    id: "p3",
    platform: "linkedin",
    title: "Weekly shipping: how I keep scope tight",
    excerpt:
      "A simple process for polishing UI + avoiding regressions while moving fast.",
    href: "https://example.com/post-3",
    dateLabel: "Dec 26, 2025",
    bgImageUrl:
      "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1600&q=80",
  },
];

function PlatformIcon({
  platform,
  className = "",
}: {
  platform: PlatformKey;
  className?: string;
}) {
  // Inline SVGs (currentColor) to avoid extra deps
  if (platform === "x") {
    return (
      <svg
        viewBox="0 0 1200 1227"
        aria-hidden="true"
        className={className}
        fill="currentColor"
      >
        <path d="M714.163 519.284L1160.89 0H1055.03L667.137 450.887L357.328 0H0L468.492 681.821L0 1226.37H105.866L515.491 750.218L842.672 1226.37H1200L714.137 519.284H714.163ZM569.165 687.828L521.697 619.934L144.011 79.6944H306.615L611.412 515.685L658.88 583.579L1055.08 1150.3H892.476L569.165 687.854V687.828Z" />
      </svg>
    );
  }

  if (platform === "youtube") {
    return (
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        className={className}
        fill="currentColor"
      >
        <path d="M23.498 6.186a3.02 3.02 0 0 0-2.126-2.14C19.505 3.5 12 3.5 12 3.5s-7.505 0-9.372.546A3.02 3.02 0 0 0 .502 6.186C0 8.074 0 12 0 12s0 3.926.502 5.814a3.02 3.02 0 0 0 2.126 2.14C4.495 20.5 12 20.5 12 20.5s7.505 0 9.372-.546a3.02 3.02 0 0 0 2.126-2.14C24 15.926 24 12 24 12s0-3.926-.502-5.814ZM9.545 15.568V8.432L15.818 12l-6.273 3.568Z" />
      </svg>
    );
  }

  // LinkedIn
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={className}
      fill="currentColor"
    >
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.047c.476-.9 1.637-1.852 3.369-1.852 3.603 0 4.269 2.372 4.269 5.456v6.287ZM5.337 7.433a2.062 2.062 0 1 1 0-4.124 2.062 2.062 0 0 1 0 4.124ZM7.119 20.452H3.555V9h3.564v11.452ZM22.225 0H1.771C.792 0 0 .774 0 1.727v20.545C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.273V1.727C24 .774 23.2 0 22.222 0h.003Z" />
    </svg>
  );
}

function platformLabel(p: PlatformKey) {
  if (p === "x") return "Twitter / X";
  if (p === "youtube") return "YouTube";
  return "LinkedIn";
}

function platformColorClass(p: PlatformKey) {
  if (p === "youtube") return "text-red-500";
  if (p === "linkedin") return "text-sky-500";
  return "text-foreground";
}

function SocialCarousel() {
  const posts = TEMP_POSTS;
  const count = posts.length;

  const [active, setActive] = useState(0);
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    if (count <= 1) return;
    if (isHovering) return;

    const id = window.setInterval(() => {
      setActive((i) => (i + 1) % count);
    }, 7000);

    return () => window.clearInterval(id);
  }, [count, isHovering]);

  const safeActive = count === 0 ? 0 : Math.min(active, count - 1);

  return (
    <div
      className="relative h-full min-h-[260px] overflow-hidden rounded-none sm:min-h-[340px]"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {posts.map((p, idx) => {
        const isOn = idx === safeActive;

        return (
          <a
            key={p.id}
            href={p.href}
            target="_blank"
            rel="noreferrer"
            className={[
              "group absolute inset-0 block",
              "transition-opacity duration-700 ease-in-out",
              isOn ? "opacity-100" : "pointer-events-none opacity-0",
              "focus:outline-none focus:ring-0",
            ].join(" ")}
          >
            <div
              className="absolute inset-0 transition-transform duration-700 will-change-transform group-hover:scale-[1.05]"
              style={{
                backgroundImage: `url(${p.bgImageUrl})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            />

            <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/35 to-black/70" />

            <div className="absolute right-4 top-4 z-10">
              <div
                className={[
                  "pointer-events-none inline-flex items-center gap-2 rounded-md",
                  "border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-medium text-white",
                  "opacity-0 translate-y-1 transition-all duration-200",
                  "group-hover:opacity-100 group-hover:translate-y-0",
                ].join(" ")}
              >
                <span>View post</span>
                <SquareArrowOutUpRight className="h-4 w-4 text-white/85" />
              </div>
            </div>

            <div className="absolute left-4 top-4 z-10 flex items-center gap-2 text-xs text-white/90">
              <PlatformIcon
                platform={p.platform}
                className={["h-4 w-4", platformColorClass(p.platform)].join(
                  " "
                )}
              />
              <span className="font-medium">{platformLabel(p.platform)}</span>
              <span className="text-white/45">•</span>
              <span className="text-white/75">
                Recently posted:{" "}
                <span className="text-white/90">{p.dateLabel}</span>
              </span>
            </div>

            <div className="relative flex h-full flex-col items-center justify-center px-6 text-center">
              <h4 className="max-w-[36ch] text-lg font-semibold text-white sm:text-xl">
                {p.title}
              </h4>

              <p className="mt-3 max-w-[56ch] text-[15px] leading-relaxed text-white/85 sm:text-base">
                {p.excerpt}
              </p>
            </div>
          </a>
        );
      })}

      {count > 1 ? (
        <div className="pointer-events-auto absolute bottom-3 left-0 right-0 flex items-center justify-center gap-2">
          {posts.map((_, idx) => {
            const on = idx === safeActive;
            return (
              <button
                key={idx}
                type="button"
                aria-label={`Go to slide ${idx + 1}`}
                onClick={() => setActive(idx)}
                className={[
                  "h-1 w-12 rounded-[2px] transition-all",
                  on ? "bg-accent" : "bg-white/30 hover:bg-white/45",
                ].join(" ")}
              />
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

export function ContactSection() {
  if (siteConfig.sections && siteConfig.sections.contact === false) return null;

  const [status, setStatus] = useState<
    "idle" | "submitting" | "done" | "error"
  >("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [nameVal, setNameVal] = useState("");
  const [emailVal, setEmailVal] = useState("");
  const [messageVal, setMessageVal] = useState("");

  const [subjectVal, setSubjectVal] = useState<string>("");

  const [consentOk, setConsentOk] = useState(false);

  const startedAtRef = useRef<number>(0);
  useEffect(() => {
    startedAtRef.current = Date.now();
  }, []);

  const TERMS_HREF = "/terms";

  const canSubmit = status !== "submitting" && !!subjectVal && !!consentOk;

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === "submitting") return;

    if (!subjectVal) {
      setStatus("error");
      setErrorMsg("Please select a subject before sending.");
      return;
    }

    if (!consentOk) {
      setStatus("error");
      setErrorMsg("Please accept the terms to continue.");
      return;
    }

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
    const subject = String(subjectVal).trim().slice(0, SUBJECT_MAX);
    const message = String(formData.get("message") || "")
      .trim()
      .slice(0, MSG_MAX);
    const hp = String(formData.get("company") || "");

    const payload = {
      name,
      email,
      subject,
      message,
      hp,
      startedAt: startedAtRef.current,
      consent: true,
    };

    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), 12_000);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

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
      setSubjectVal("");
      setConsentOk(false);
      setTimeout(() => setStatus("idle"), 3500);
    } catch {
      setErrorMsg(ui.errorText || "Network error. Please try again.");
      setStatus("error");
    } finally {
      clearTimeout(t);
    }
  }

  const heading = ui.heading ?? "~/Contact";
  const titleText = ui.title ?? "Connect with me.";

  return (
    <section id="contact" className="py-16 scroll-mt-12">
      <div className="mx-auto w-full max-w-6xl px-4">
        <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          {heading}
        </h2>
        <h3 className="mt-3 text-2xl font-semibold sm:text-3xl">{titleText}</h3>

        <div className="mt-7 overflow-hidden rounded-lg border border-white/10">
          {/* MOBILE: show ONLY the form */}
          <div className="lg:hidden border-white/10 bg-white/5 p-5 sm:p-6">
            <ContactForm
              status={status}
              errorMsg={errorMsg}
              ui={ui}
              siteName={siteConfig.name}
              handleSubmit={handleSubmit}
              canSubmit={canSubmit}
              consentOk={consentOk}
              setConsentOk={setConsentOk}
              TERMS_HREF={TERMS_HREF}
              labels={labels}
              placeholders={placeholders}
              subjectOptions={subjectOptions}
              nameVal={nameVal}
              setNameVal={setNameVal}
              emailVal={emailVal}
              setEmailVal={setEmailVal}
              messageVal={messageVal}
              setMessageVal={setMessageVal}
              subjectVal={subjectVal}
              setSubjectVal={setSubjectVal}
            />
          </div>

          {/* DESKTOP/TABLET: split view */}
          <div className="hidden lg:grid lg:grid-cols-2 lg:items-stretch">
            <div>
              <SocialCarousel />
            </div>

            <div className="border-white/10 bg-white/5 p-5 sm:p-6 lg:border-l">
              <ContactForm
                status={status}
                errorMsg={errorMsg}
                ui={ui}
                siteName={siteConfig.name}
                handleSubmit={handleSubmit}
                canSubmit={canSubmit}
                consentOk={consentOk}
                setConsentOk={setConsentOk}
                TERMS_HREF={TERMS_HREF}
                labels={labels}
                placeholders={placeholders}
                subjectOptions={subjectOptions}
                nameVal={nameVal}
                setNameVal={setNameVal}
                emailVal={emailVal}
                setEmailVal={setEmailVal}
                messageVal={messageVal}
                setMessageVal={setMessageVal}
                subjectVal={subjectVal}
                setSubjectVal={setSubjectVal}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ContactForm(props: {
  status: "idle" | "submitting" | "done" | "error";
  errorMsg: string | null;
  ui: ContactUI;
  siteName: string;
  handleSubmit: (e: FormEvent<HTMLFormElement>) => Promise<void>;
  canSubmit: boolean;
  consentOk: boolean;
  setConsentOk: (v: boolean) => void;
  TERMS_HREF: string;

  labels: Record<string, string>;
  placeholders: Record<string, string>;
  subjectOptions: string[];

  nameVal: string;
  setNameVal: (v: string) => void;
  emailVal: string;
  setEmailVal: (v: string) => void;
  messageVal: string;
  setMessageVal: (v: string) => void;
  subjectVal: string;
  setSubjectVal: (v: string) => void;
}) {
  const {
    status,
    errorMsg,
    ui,
    siteName,
    handleSubmit,
    canSubmit,
    consentOk,
    setConsentOk,
    TERMS_HREF,
    labels,
    placeholders,
    subjectOptions,
    nameVal,
    setNameVal,
    emailVal,
    setEmailVal,
    messageVal,
    setMessageVal,
    subjectVal,
    setSubjectVal,
  } = props;

  return (
    <div className="flex h-full flex-col space-y-3">
      {status === "done" && (
        <div className="flex items-center gap-2 rounded-md border border-green-500/30 bg-green-500/10 px-3 py-2 text-sm text-green-300">
          <span>✅</span>
          <span>
            {ui.successText ?? "Message sent! I'll get back to you soon."} —{" "}
            {siteName}
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
        className="flex h-full flex-col space-y-4 text-sm sm:text-base"
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

        {/* Subject */}
        <div>
          <label
            htmlFor="subject"
            className="mb-1 block text-xs font-medium text-foreground sm:text-sm"
          >
            {labels.subject ?? "Subject"}
          </label>

          <select
            id="subject"
            name="subject"
            required
            className="h-10 w-full rounded-md border border-white/15 bg-transparent px-2 text-sm text-foreground outline-none ring-0 focus:border-accent"
            value={subjectVal}
            onChange={(e) => setSubjectVal(e.target.value)}
          >
            <option value="" disabled className="bg-[#020817]">
              Select a subject…
            </option>

            {subjectOptions.map((opt) => (
              <option key={opt} value={opt} className="bg-[#020817]">
                {opt}
              </option>
            ))}
          </select>
        </div>

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
        <div className="mt-auto flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <label className="inline-flex items-center gap-2 text-[11px] text-muted-foreground sm:text-xs">
            <input
              type="checkbox"
              checked={consentOk}
              onChange={(e) => setConsentOk(e.target.checked)}
              className="h-4 w-4 rounded border-white/20 bg-transparent text-white outline-none focus:ring-0"
              aria-label="Consent to be contacted"
            />
            <span>
              I agree to{" "}
              <Link
                href={TERMS_HREF}
                className="font-semibold text-accent underline decoration-accent/60 underline-offset-4 transition hover:opacity-90"
              >
                Terms & Privacy
              </Link>
              .
            </span>
          </label>

          <button
            type="submit"
            disabled={!canSubmit}
            className="inline-flex items-center gap-1.5 rounded-md border border-transparent bg-accent px-4 py-2 text-xs font-medium text-white shadow-sm transition-transform transition-colors duration-200 hover:border-accent hover:bg-accent/90 hover:shadow-md hover:-translate-y-0.5 disabled:opacity-70 disabled:hover:translate-y-0 sm:text-sm"
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
      </form>
    </div>
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
