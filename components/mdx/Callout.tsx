// components/mdx/Callout.tsx
"use client";

import { Info, AlertTriangle, AlertCircle, Lightbulb, Check } from "lucide-react";
import type { ReactNode } from "react";

type CalloutType = "info" | "warning" | "danger" | "tip" | "success";

interface CalloutProps {
  type?: CalloutType;
  title?: string;
  children: ReactNode;
}

const calloutConfig: Record<
  CalloutType,
  { icon: typeof Info; className: string; defaultTitle: string }
> = {
  info: {
    icon: Info,
    className: "border-blue-500/50 bg-blue-500/10 text-blue-200",
    defaultTitle: "Note",
  },
  warning: {
    icon: AlertTriangle,
    className: "border-yellow-500/50 bg-yellow-500/10 text-yellow-200",
    defaultTitle: "Warning",
  },
  danger: {
    icon: AlertCircle,
    className: "border-red-500/50 bg-red-500/10 text-red-200",
    defaultTitle: "Danger",
  },
  tip: {
    icon: Lightbulb,
    className: "border-green-500/50 bg-green-500/10 text-green-200",
    defaultTitle: "Tip",
  },
  success: {
    icon: Check,
    className: "border-emerald-500/50 bg-emerald-500/10 text-emerald-200",
    defaultTitle: "Success",
  },
};

export function Callout({ type = "info", title, children }: CalloutProps) {
  const config = calloutConfig[type];
  const Icon = config.icon;

  return (
    <div
      className={`my-6 rounded-lg border-l-4 p-4 ${config.className}`}
      role="alert"
    >
      <div className="flex items-start gap-3">
        <Icon className="mt-0.5 h-5 w-5 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          {title && (
            <p className="mb-1 font-semibold">
              {title || config.defaultTitle}
            </p>
          )}
          <div className="text-sm opacity-90 [&>p]:m-0">{children}</div>
        </div>
      </div>
    </div>
  );
}

export default Callout;
