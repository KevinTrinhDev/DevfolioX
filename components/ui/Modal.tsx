"use client";

import { useEffect, useId, useState, type ReactNode } from "react";
import { X } from "lucide-react";

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title?: ReactNode; // string OR JSX
  children: ReactNode;
};

export function Modal({ open, onClose, title, children }: ModalProps) {
  const titleId = useId();

  // Internal mount + visibility state to allow exit animation
  const [isMounted, setIsMounted] = useState(open);
  const [isVisible, setIsVisible] = useState(open);

  // Handle mount/unmount + animation state
  useEffect(() => {
    if (open) {
      setIsMounted(true);
      // next tick visibility to ensure transition plays nicely
      requestAnimationFrame(() => setIsVisible(true));
    } else if (!open && isMounted) {
      setIsVisible(false);
      const timeout = setTimeout(() => setIsMounted(false), 180); // match duration
      return () => clearTimeout(timeout);
    }
  }, [open, isMounted]);

  // ESC to close (only while logically "open")
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  // Lock page scroll while the modal is mounted
  useEffect(() => {
    if (!isMounted) return;

    const originalOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";

    return () => {
      document.documentElement.style.overflow = originalOverflow;
    };
  }, [isMounted]);

  // After hooks: if not mounted, render nothing
  if (!isMounted) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      {/* Backdrop: a bit darker + moderate blur + fade animation */}
      <button
        type="button"
        aria-label="Close modal"
        onClick={onClose}
        className={`absolute inset-0 bg-black/70 backdrop-blur transition-opacity duration-200 ${
          isVisible ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* Modal content with fade + slight scale/translate animation */}
      <div
        className={`relative mx-auto flex w-full max-w-6xl flex-col rounded-2xl border border-white/15 bg-background/95 p-4 text-sm text-muted-foreground shadow-2xl sm:p-6 transform transition-all duration-200 ease-out ${
          isVisible
            ? "opacity-100 scale-100 translate-y-0"
            : "opacity-0 scale-95 translate-y-1"
        }`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
      >
        {/* Header row */}
        <div className="mb-2 flex items-center justify-between gap-3">
          {title && (
            <h2
              id={titleId}
              className="text-lg font-semibold text-foreground sm:text-xl"
            >
              {title}
            </h2>
          )}

          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/40 bg-black/40 text-white/80 shadow-md transition hover:border-accent hover:bg-accent/20 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Tiny separator under the title */}
        <div className="mb-4 h-px w-full bg-white/10" />

        {/* Body */}
        <div className="max-h-[75vh] overflow-y-auto pr-1 sm:pr-2">
          {children}
        </div>
      </div>
    </div>
  );
}
