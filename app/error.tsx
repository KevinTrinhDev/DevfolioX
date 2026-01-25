// app/error.tsx
"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Home, RefreshCw, AlertTriangle } from "lucide-react";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Application error:", error);
  }, [error]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="mx-auto flex w-full max-w-md flex-col items-center text-center text-foreground">
        {/* Error icon */}
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10">
          <AlertTriangle className="h-8 w-8 text-red-500" />
        </div>

        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          ~/error
        </p>

        <h1 className="mt-3 text-4xl font-semibold sm:text-5xl">
          Something went wrong
        </h1>

        <p className="mt-3 text-sm text-muted-foreground sm:text-base">
          An unexpected error occurred. Please try again or return to the home
          page.
        </p>

        {/* Error digest for debugging (only in development or for support) */}
        {error.digest && (
          <p className="mt-2 font-mono text-xs text-muted-foreground/60">
            Error ID: {error.digest}
          </p>
        )}

        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 rounded-md bg-accent px-4 py-2 text-sm font-medium text-white transition-transform transition-colors hover:-translate-y-[1px] hover:bg-accent/90"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Try again</span>
          </button>

          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-md border border-white/15 px-4 py-2 text-sm text-foreground transition-transform transition-colors hover:-translate-y-[1px] hover:border-accent hover:bg-white/5"
          >
            <Home className="h-4 w-4" />
            <span>Back to home</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
