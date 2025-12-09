"use client";

import { useMemo, useState } from "react";

interface ContributionGraphCardProps {
  title?: string;
  className?: string;
}

function hashString(input: string): number {
  let h = 0;
  for (let i = 0; i < input.length; i++) {
    h = (h * 31 + input.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

function buildCells(year: number, count = 7 * 52): number[] {
  // Return intensity level 0–4 for each cell (deterministic per year)
  return Array.from({ length: count }, (_, idx) => {
    const h = hashString(`${year}-${idx}`);
    return h % 5; // 0–4
  });
}

const MONTH_LABELS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export function ContributionGraphCard({
  title = "Contribution Graph",
  className,
}: ContributionGraphCardProps) {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);

  const years = [
    currentYear,
    currentYear - 1,
    currentYear - 2,
    currentYear - 3,
    currentYear - 4,
  ];

  const cells = useMemo(() => buildCells(year), [year]);
  const approxTotal = useMemo(
    () => cells.reduce((sum, level) => sum + level, 0) * 2,
    [cells]
  );

  // Outer card – match Education cards: border + bg-white/5
  const cardClass =
    "rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-slate-50 shadow-[0_18px_45px_rgba(15,23,42,0.6)] sm:px-6 sm:py-5";

  return (
    <section className={`mt-10 ${className ?? ""}`}>
      {/* Title row (outside card) */}
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <h2 className="text-2xl font-semibold tracking-tight sm:text-[1.75rem]">
          {title}
        </h2>
      </div>

      {/* Graph + year buttons */}
      <div className="mt-4 flex flex-col gap-4 md:flex-row md:items-stretch">
        {/* Graph card */}
        <div className={cardClass}>
          <div className="rounded-xl p-3">
            {/* Month labels (aligned with first column) */}
            <div className="flex justify-between text-[0.85rem] text-slate-50 sm:text-sm">
              {MONTH_LABELS.map((m) => (
                <span key={m}>{m}</span>
              ))}
            </div>

            {/* Heatmap: 7 rows (days), many columns (weeks) */}
            <div className="mt-1 grid grid-rows-7 grid-flow-col gap-[3.5px]">
              {cells.map((level, idx) => {
                let color = "bg-slate-800";
                if (level === 1) color = "bg-indigo-950";
                if (level === 2) color = "bg-indigo-900";
                if (level === 3) color = "bg-indigo-700";
                if (level === 4) color = "bg-indigo-500";

                return (
                  <div
                    key={idx}
                    className={`h-[13px] w-[13px] rounded-[3px] ${color}`}
                  />
                );
              })}
            </div>

            {/* Summary + legend (aligned with first column) */}
            <div className="mt-2 flex flex-col gap-2 text-[0.85rem] text-slate-50 sm:flex-row sm:items-center sm:justify-between sm:text-sm">
              <span className="font-medium">
                {approxTotal.toLocaleString()} contributions in the last year
              </span>
              <div className="flex items-center gap-2">
                <span>Less</span>
                <div className="flex items-center gap-[3.5px]">
                  <span className="h-[13px] w-[13px] rounded-[3px] bg-slate-800" />
                  <span className="h-[13px] w-[13px] rounded-[3px] bg-indigo-950" />
                  <span className="h-[13px] w-[13px] rounded-[3px] bg-indigo-900" />
                  <span className="h-[13px] w-[13px] rounded-[3px] bg-indigo-700" />
                  <span className="h-[13px] w-[13px] rounded-[3px] bg-indigo-500" />
                </div>
                <span>More</span>
              </div>
            </div>
          </div>
        </div>

        {/* Year selector (outside card, right side) */}
        <div className="flex w-full flex-row justify-between gap-1.5 text-xs text-slate-300 md:w-[4.75rem] md:flex-col md:text-sm">
          {years.map((y) => {
            const isActive = y === year;
            return (
              <button
                key={y}
                type="button"
                onClick={() => setYear(y)}
                className={`flex-1 rounded-md border px-2 py-2 text-center font-medium transition-colors ${
                  isActive
                    ? "border-indigo-500 bg-indigo-500 text-slate-950"
                    : "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
                }`}
              >
                {y}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
