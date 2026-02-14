"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";

type CellStatus = "past" | "current" | "future";
type TimeUnit = "years" | "months" | "weeks";

interface LifeGridProps {
  birthDate: Date;
  lifespanYears?: number;
  timeUnit?: TimeUnit;
}

export function LifeGrid({ birthDate, lifespanYears = 90, timeUnit = "weeks" }: LifeGridProps) {
  const gridData = useMemo(() => {
    const now = new Date();
    const birthYear = birthDate.getFullYear();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    const startOfYear = new Date(currentYear, 0, 1);
    const msIntoYear = now.getTime() - startOfYear.getTime();
    const currentWeek = Math.floor(msIntoYear / (7 * 24 * 60 * 60 * 1000));
    const ageInYears = currentYear - birthYear;

    if (timeUnit === "years") {
      // 9 rows × 10 columns for years view
      const decades: Array<{
        decade: number;
        years: Array<{ age: number; status: CellStatus }>;
      }> = [];
      for (let decade = 0; decade < 9; decade++) {
        const years: Array<{ age: number; status: CellStatus }> = [];
        for (let yearInDecade = 0; yearInDecade < 10; yearInDecade++) {
          const age = decade * 10 + yearInDecade;
          let status: CellStatus;
          if (age < ageInYears) status = "past";
          else if (age === ageInYears) status = "current";
          else status = "future";
          years.push({ age, status });
        }
        decades.push({ decade, years });
      }
      return { type: "years" as const, decades, columns: 10 };
    }

    if (timeUnit === "months") {
      // Each row = 1 year, 12 columns for months
      const rows: Array<{
        age: number;
        months: Array<{ month: number; status: CellStatus }>;
      }> = [];
      for (let age = 0; age <= lifespanYears; age++) {
        const months: Array<{ month: number; status: CellStatus }> = [];
        for (let month = 0; month < 12; month++) {
          let status: CellStatus;
          if (age < ageInYears) status = "past";
          else if (age > ageInYears) status = "future";
          else {
            if (month < currentMonth) status = "past";
            else if (month === currentMonth) status = "current";
            else status = "future";
          }
          months.push({ month, status });
        }
        rows.push({ age, months });
      }
      return { type: "months" as const, rows, columns: 12 };
    }

    // Weeks view - 52 columns
    const rows: Array<{
      age: number;
      weeks: Array<{ week: number; status: CellStatus }>;
    }> = [];
    for (let age = 0; age <= lifespanYears; age++) {
      const weeks: Array<{ week: number; status: CellStatus }> = [];
      for (let week = 0; week < 52; week++) {
        let status: CellStatus;
        if (age < ageInYears) status = "past";
        else if (age > ageInYears) status = "future";
        else {
          if (week < currentWeek) status = "past";
          else if (week === currentWeek) status = "current";
          else status = "future";
        }
        weeks.push({ week, status });
      }
      rows.push({ age, weeks });
    }
    return { type: "weeks" as const, rows, columns: 52 };
  }, [birthDate, lifespanYears, timeUnit]);

  // Column headers for weeks view
  const columnHeaders = useMemo(() => {
    if (timeUnit !== "weeks") return null;
    // Show every 5th week number
    return Array.from({ length: 11 }, (_, i) => (i + 1) * 5);
  }, [timeUnit]);

  return (
    <div className="h-full flex flex-col">
      {/* Column headers for weeks */}
      {columnHeaders && (
        <div 
          className="grid mb-1 text-[10px] text-muted-foreground tabular-nums"
          style={{ gridTemplateColumns: `24px repeat(52, 1fr)` }}
        >
          <div /> {/* Empty cell for row labels column */}
          {Array.from({ length: 52 }, (_, i) => (
            <div key={i} className="text-center">
              {(i + 1) % 5 === 0 ? i + 1 : ""}
            </div>
          ))}
        </div>
      )}

      {/* Grid */}
      <div className="flex-1 overflow-auto">
        {gridData.type === "years" && (
          <div className="grid gap-1">
            {gridData.decades.map((decade) => (
              <div
                key={decade.decade}
                className="grid gap-1"
                style={{ gridTemplateColumns: `repeat(${gridData.columns}, 1fr)` }}
              >
                {decade.years.map((year) => (
                  <GridCell key={year.age} status={year.status} size="large" />
                ))}
              </div>
            ))}
          </div>
        )}

        {gridData.type === "months" && (
          <div className="grid gap-px">
            {gridData.rows.map((row) => (
              <div
                key={row.age}
                className="grid gap-px"
                style={{ gridTemplateColumns: `24px repeat(${gridData.columns}, 1fr)` }}
              >
                {/* Row label */}
                <div className="flex items-center justify-end pr-2 text-[10px] tabular-nums text-muted-foreground">
                  {row.age % 10 === 0 ? row.age : ""}
                </div>
                {row.months.map((cell) => (
                  <GridCell key={cell.month} status={cell.status} size="medium" />
                ))}
              </div>
            ))}
          </div>
        )}

        {gridData.type === "weeks" && (
          <div className="grid gap-px">
            {gridData.rows.map((row) => (
              <div
                key={row.age}
                className="grid gap-px"
                style={{ gridTemplateColumns: `24px repeat(${gridData.columns}, 1fr)` }}
              >
                {/* Row label - show every 5 years */}
                <div className="flex items-center justify-end pr-2 text-[10px] tabular-nums text-muted-foreground">
                  {row.age % 5 === 0 ? row.age : ""}
                </div>
                {row.weeks.map((cell) => (
                  <GridCell key={cell.week} status={cell.status} size="small" />
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

interface GridCellProps {
  status: CellStatus;
  size: "small" | "medium" | "large";
}

function GridCell({ status, size }: GridCellProps) {
  const sizeClasses = {
    small: "size-[6px]",
    medium: "size-3",
    large: "size-6",
  };

  return (
    <div
      className={cn(
        "rounded-[1px]",
        sizeClasses[size],
        status === "past" && "bg-primary",
        status === "current" && "bg-primary ring-1 ring-white/50",
        status === "future" && "bg-secondary border border-border"
      )}
    />
  );
}

