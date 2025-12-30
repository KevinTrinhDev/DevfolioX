// components/ContributionGraphCard.tsx
"use client";

import { useEffect, useMemo, useState } from "react";

interface ContributionGraphCardProps {
  title?: string;
  className?: string;
  /**
   * Optional GitHub username override.
   * If omitted, the API will use process.env.GITHUB_USERNAME.
   */
  username?: string;
}

type ContributionDay = {
  date: string; // ISO "YYYY-MM-DD..." from the API
  count: number;
};

type DayCell = {
  date: Date;
  inRange: boolean; // true if within the actual period (year or rolling window)
  level: number; // 0–4
};

type GridResult = {
  cells: DayCell[];
  weekCount: number;
  monthLabelByWeek: Record<number, string>;
  approxTotal: number;
  summaryLabel: string;
};

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

function makeDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`; // "YYYY-MM-DD"
}

function buildContributionMap(contributionDays?: ContributionDay[]) {
  const map = new Map<string, number>();
  let total = 0;
  if (contributionDays && contributionDays.length > 0) {
    for (const d of contributionDays) {
      const key = d.date.slice(0, 10); // "YYYY-MM-DD"
      map.set(key, d.count);
      total += d.count;
    }
  }
  return { map, total, hasData: map.size > 0 };
}

/**
 * Calendar-year grid: Jan 1 → Dec 31 for `year`.
 * Month labels are placed roughly on the "second column" of that month.
 */
function buildYearGrid(
  year: number,
  contributionDays?: ContributionDay[]
): GridResult {
  const jan1 = new Date(year, 0, 1);
  const dec31 = new Date(year, 11, 31);

  // Sunday on/before Jan 1
  const gridStart = new Date(jan1);
  gridStart.setDate(gridStart.getDate() - gridStart.getDay());

  // Saturday on/after Dec 31
  const gridEnd = new Date(dec31);
  gridEnd.setDate(gridEnd.getDate() + (6 - gridEnd.getDay()));

  const {
    map: contribMap,
    total,
    hasData,
  } = buildContributionMap(contributionDays);

  const cells: DayCell[] = [];
  let cursor = new Date(gridStart);

  while (cursor <= gridEnd) {
    const d = new Date(cursor);
    const inRange = d >= jan1 && d <= dec31;

    let level = 0;
    if (inRange && hasData) {
      const key = makeDateKey(d);
      const count = contribMap.get(key) ?? 0;

      if (count === 0) level = 0;
      else if (count < 3) level = 1;
      else if (count < 6) level = 2;
      else if (count < 10) level = 3;
      else level = 4;
    }

    cells.push({ date: d, inRange, level });
    cursor.setDate(cursor.getDate() + 1);
  }

  // Ensure full weeks: pad with out-of-range filler cells so every column has 7 squares
  const rawDays = cells.length;
  const weekCount = Math.ceil(rawDays / 7);
  const needed = weekCount * 7 - rawDays;
  if (needed > 0) {
    for (let i = 0; i < needed; i++) {
      const fillerDate = new Date(gridEnd);
      fillerDate.setDate(fillerDate.getDate() + i + 1);
      cells.push({
        date: fillerDate,
        inRange: false,
        level: 0,
      });
    }
  }

  // Month spans in this year: compute min/max week index per month.
  type MonthSpan = { minWeek: number; maxWeek: number };
  const monthSpans: Array<MonthSpan | undefined> = new Array(12).fill(
    undefined
  );

  cells.forEach((cell, idx) => {
    if (!cell.inRange || cell.date.getFullYear() !== year) return;
    const m = cell.date.getMonth();
    const weekIndex = Math.floor(idx / 7);
    let span = monthSpans[m];
    if (!span) {
      span = { minWeek: weekIndex, maxWeek: weekIndex };
      monthSpans[m] = span;
    } else {
      if (weekIndex < span.minWeek) span.minWeek = weekIndex;
      if (weekIndex > span.maxWeek) span.maxWeek = weekIndex;
    }
  });

  const monthLabelByWeek: Record<number, string> = {};

  const MIN_LABEL_GAP_WEEKS = 4;
  let lastLabeledWeek = -9999;

  for (let m = 0; m < 12; m++) {
    const span = monthSpans[m];
    if (!span) continue;

    // "Second column" logic: shift one week to the right if possible.
    const second = span.minWeek + 1;
    let labelWeek = second <= span.maxWeek ? second : span.maxWeek;

    // Avoid overlap with prior label by shifting right within this month's span.
    if (labelWeek - lastLabeledWeek < MIN_LABEL_GAP_WEEKS) {
      let shifted = labelWeek;
      while (
        shifted - lastLabeledWeek < MIN_LABEL_GAP_WEEKS &&
        shifted < span.maxWeek
      ) {
        shifted += 1;
      }
      if (shifted - lastLabeledWeek < MIN_LABEL_GAP_WEEKS) continue;
      labelWeek = shifted;
    }

    if (monthLabelByWeek[labelWeek] == null) {
      monthLabelByWeek[labelWeek] = MONTH_LABELS[m];
      lastLabeledWeek = labelWeek;
    }
  }

  const approxTotal = hasData ? total : 0;
  const summaryLabel =
    approxTotal > 0
      ? `${approxTotal.toLocaleString()} contributions in ${year}`
      : `No contributions recorded in ${year}`;

  return { cells, weekCount, monthLabelByWeek, approxTotal, summaryLabel };
}

/**
 * Rolling grid: last ~365 days ending at `endDate`.
 *
 * Fix: month labels are computed by year-month (YYYY-MM), not just month name,
 * so labels remain chronologically ordered (no "Dec" after "Jan").
 */
function buildRollingGrid(
  endDate: Date,
  contributionDays?: ContributionDay[]
): GridResult {
  const end = new Date(
    endDate.getFullYear(),
    endDate.getMonth(),
    endDate.getDate()
  );

  // Start of rolling window (365 days including end)
  const rangeStart = new Date(end);
  rangeStart.setDate(rangeStart.getDate() - 364);

  // Align to full weeks (Sunday..Saturday)
  const gridStart = new Date(rangeStart);
  gridStart.setDate(gridStart.getDate() - gridStart.getDay());

  const gridEnd = new Date(end);
  gridEnd.setDate(gridEnd.getDate() + (6 - gridEnd.getDay()));

  const {
    map: contribMap,
    total,
    hasData,
  } = buildContributionMap(contributionDays);

  const cells: DayCell[] = [];
  let cursor = new Date(gridStart);

  while (cursor <= gridEnd) {
    const d = new Date(cursor);
    const inRange = d >= rangeStart && d <= end;

    let level = 0;
    if (inRange && hasData) {
      const key = makeDateKey(d);
      const count = contribMap.get(key) ?? 0;

      if (count === 0) level = 0;
      else if (count < 3) level = 1;
      else if (count < 6) level = 2;
      else if (count < 10) level = 3;
      else level = 4;
    }

    cells.push({ date: d, inRange, level });
    cursor.setDate(cursor.getDate() + 1);
  }

  // Ensure full weeks: pad with out-of-range filler cells so every column has 7 squares
  const rawDays = cells.length;
  const weekCount = Math.ceil(rawDays / 7);
  const needed = weekCount * 7 - rawDays;
  if (needed > 0) {
    for (let i = 0; i < needed; i++) {
      const fillerDate = new Date(gridEnd);
      fillerDate.setDate(fillerDate.getDate() + i + 1);
      cells.push({
        date: fillerDate,
        inRange: false,
        level: 0,
      });
    }
  }

  // Month spans by *year-month* across the rolling window.
  // This fixes out-of-order labels (e.g. "Dec" after "Jan") when the 365-day window
  // contains two Decembers across a year boundary.
  type MonthSpan = {
    year: number;
    month: number; // 0–11
    minWeek: number;
    maxWeek: number;
    inRangeDays: number;
  };

  const spans = new Map<number, MonthSpan>(); // key = year * 12 + month
  const trailingKey = end.getFullYear() * 12 + end.getMonth();

  cells.forEach((cell, idx) => {
    if (!cell.inRange) return;

    const y = cell.date.getFullYear();
    const m = cell.date.getMonth();
    const weekIndex = Math.floor(idx / 7);
    const key = y * 12 + m;

    const existing = spans.get(key);
    if (!existing) {
      spans.set(key, {
        year: y,
        month: m,
        minWeek: weekIndex,
        maxWeek: weekIndex,
        inRangeDays: 1,
      });
    } else {
      existing.inRangeDays += 1;
      if (weekIndex < existing.minWeek) existing.minWeek = weekIndex;
      if (weekIndex > existing.maxWeek) existing.maxWeek = weekIndex;
    }
  });

  const monthLabelByWeek: Record<number, string> = {};

  // Sort spans by their left edge so labels always appear left → right correctly.
  const presentSpans = Array.from(spans.entries())
    .map(([key, span]) => ({ key, span }))
    .sort((a, b) => a.span.minWeek - b.span.minWeek);

  // Prevent visual overlap: ensure month labels aren't placed too close together.
  const MIN_LABEL_GAP_WEEKS = 4;
  let lastLabeledWeek = -9999;

  for (const { key, span } of presentSpans) {
    const isTrailing = key === trailingKey;

    // Placement rule:
    // - trailing month with < 14 in-range days → earliest week
    // - otherwise "second column" if possible
    let labelWeek: number;
    if (isTrailing && span.inRangeDays > 0 && span.inRangeDays < 14) {
      labelWeek = span.minWeek;
    } else {
      const second = span.minWeek + 1;
      labelWeek = second <= span.maxWeek ? second : span.maxWeek;
    }

    // If it's too close to the previous label, try shifting right within the same month span.
    if (labelWeek - lastLabeledWeek < MIN_LABEL_GAP_WEEKS) {
      let shifted = labelWeek;
      while (
        shifted - lastLabeledWeek < MIN_LABEL_GAP_WEEKS &&
        shifted < span.maxWeek
      ) {
        shifted += 1;
      }

      // If we still can't get enough spacing, skip this label (prevents overlap).
      if (shifted - lastLabeledWeek < MIN_LABEL_GAP_WEEKS) continue;

      labelWeek = shifted;
    }

    // If that week already has a label, keep the first one (do not overwrite).
    if (monthLabelByWeek[labelWeek] == null) {
      monthLabelByWeek[labelWeek] = MONTH_LABELS[span.month];
      lastLabeledWeek = labelWeek;
    }
  }

  const approxTotal = hasData ? total : 0;
  const summaryLabel =
    approxTotal > 0
      ? `${approxTotal.toLocaleString()} contributions in the last 365 days`
      : "No contributions recorded in the last 365 days";

  return { cells, weekCount, monthLabelByWeek, approxTotal, summaryLabel };
}

export function ContributionGraphCard({
  title = "Contribution Graph",
  className,
  username,
}: ContributionGraphCardProps) {
  const now = new Date();
  const currentYear = now.getFullYear();

  const [year, setYear] = useState(currentYear);
  const [rollingCurrentYear, setRollingCurrentYear] = useState(true);

  const years = [
    currentYear,
    currentYear - 1,
    currentYear - 2,
    currentYear - 3,
    currentYear - 4,
  ];

  const [dataByYear, setDataByYear] = useState<
    Record<number, ContributionDay[] | undefined>
  >({});
  const [error, setError] = useState<string | null>(null);

  // Fetch GitHub data whenever `year` changes (only if not cached yet)
  useEffect(() => {
    let cancelled = false;

    if (Object.prototype.hasOwnProperty.call(dataByYear, year)) {
      return;
    }

    async function load() {
      try {
        const params = new URLSearchParams();
        params.set("year", String(year));
        if (username) params.set("username", username);

        const res = await fetch(
          `/api/github-contributions?${params.toString()}`
        );
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        const json = await res.json();
        const days: ContributionDay[] = json.days ?? [];
        if (!cancelled) {
          setError(null);
          setDataByYear((prev) => ({ ...prev, [year]: days }));
        }
      } catch (err) {
        console.error("Failed to fetch GitHub contributions:", err);
        if (!cancelled) {
          setError(
            "Could not load GitHub data. Showing an empty grid for now."
          );
          setDataByYear((prev) => ({ ...prev, [year]: [] }));
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [year, username, dataByYear]);

  const { cells, weekCount, monthLabelByWeek, summaryLabel } = useMemo(() => {
    const days = dataByYear[year];
    const useRolling = rollingCurrentYear && year === currentYear;

    if (useRolling) return buildRollingGrid(now, days);
    return buildYearGrid(year, days);
  }, [year, currentYear, rollingCurrentYear, now, dataByYear]);

  const cardClass =
    "rounded-2xl border border-white/10 bg-white/5 px-2 py-2 text-slate-50 shadow-[0_18px_45px_rgba(15,23,42,0.6)] sm:px-4 sm:py-3";

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
          <div className="rounded-xl p-1.5 sm:p-2">
            {/* Scrollable graph on small screens */}
            <div className="overflow-x-auto pb-2">
              <div className="inline-block pt-1">
                {/* Month labels row – aligned to the chosen week column */}
                <div className="flex justify-start gap-[3.5px] text-[0.8rem] leading-tight text-slate-300 sm:text-[0.85rem]">
                  {Array.from({ length: weekCount }).map((_, weekIndex) => {
                    const label = monthLabelByWeek[weekIndex] ?? "";
                    return (
                      <div
                        key={`month-${weekIndex}`}
                        className="flex min-h-[1.35rem] w-[12px] items-end justify-start pb-0.5"
                      >
                        {label && (
                          <span className="translate-x-[1px]">{label}</span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Heatmap: weeks (columns) × 7 days (rows) */}
                <div className="mt-1 flex gap-[3.5px]">
                  {Array.from({ length: weekCount }).map((_, weekIndex) => (
                    <div
                      key={`week-${weekIndex}`}
                      className="flex flex-col gap-[3.5px]"
                    >
                      {Array.from({ length: 7 }).map((_, dayIndex) => {
                        const idx = weekIndex * 7 + dayIndex;
                        const cell = cells[idx];

                        // Out-of-range filler cells (always light gray blocks)
                        if (!cell || !cell.inRange) {
                          return (
                            <div
                              key={`cell-${weekIndex}-${dayIndex}`}
                              className="h-[12px] w-[12px] rounded-[3px] bg-slate-900/20"
                            />
                          );
                        }

                        // In-range cells: 0-level still visible (old "less" color)
                        const level = cell.level;
                        let color = "bg-slate-800";
                        if (level === 1) color = "bg-indigo-950";
                        if (level === 2) color = "bg-indigo-900";
                        if (level === 3) color = "bg-indigo-700";
                        if (level === 4) color = "bg-indigo-500";

                        return (
                          <div
                            key={`cell-${weekIndex}-${dayIndex}`}
                            className={`h-[12px] w-[12px] rounded-[3px] ${color}`}
                          />
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Summary + legend */}
            <div className="mt-2 flex flex-col items-center gap-2 text-[0.85rem] text-slate-50 sm:flex-row sm:items-center sm:justify-between sm:text-sm">
              <span className="font-medium">{summaryLabel}</span>
              <div className="flex items-center gap-2">
                <span>Less</span>
                <div className="flex items-center gap-[3.5px]">
                  <span className="h-[12px] w-[12px] rounded-[3px] bg-slate-800" />
                  <span className="h-[12px] w-[12px] rounded-[3px] bg-indigo-950" />
                  <span className="h-[12px] w-[12px] rounded-[3px] bg-indigo-900" />
                  <span className="h-[12px] w-[12px] rounded-[3px] bg-indigo-700" />
                  <span className="h-[12px] w-[12px] rounded-[3px] bg-indigo-500" />
                </div>
                <span>More</span>
              </div>
            </div>

            {error && (
              <p className="mt-1 text-xs text-amber-300/80 sm:text-[0.8rem]">
                {error}
              </p>
            )}
          </div>
        </div>

        {/* Year selector */}
        <div className="flex w-full flex-row justify-between gap-1.5 text-xs text-slate-300 md:w-[4.75rem] md:flex-col md:text-sm">
          {years.map((y) => {
            const isActive = y === year;
            const isCurrent = y === currentYear;

            return (
              <button
                key={y}
                type="button"
                onClick={() => {
                  if (isCurrent) {
                    // Toggle rolling vs Jan–Dec when clicking the current year again
                    if (year === currentYear && isActive) {
                      setRollingCurrentYear((prev) => !prev);
                    } else {
                      setYear(currentYear);
                      setRollingCurrentYear(true);
                    }
                  } else {
                    setYear(y);
                    setRollingCurrentYear(false);
                  }
                }}
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
