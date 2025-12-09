// components/ColumnLayout.tsx
import type { ReactNode } from "react";

export function ColumnLayout({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-6xl px-4">
      <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
        {/* left gutter on md+ */}
        <div className="hidden md:block" />

        {/* main content in center columns */}
        <div className="col-span-1 md:col-span-2">{children}</div>

        {/* right gutter on md+ */}
        <div className="hidden md:block" />
      </div>
    </div>
  );
}
