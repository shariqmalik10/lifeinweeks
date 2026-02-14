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
      return { type: "years" as const, decades };
    }

    if (timeUnit === "months") {
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
      return { type: "months" as const, rows };
    }

    // Weeks view
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
    return { type: "weeks" as const, rows };
  }, [birthDate, lifespanYears, timeUnit]);

  return (
    <div className="h-full flex">
      {/* Age axis labels */}
      {gridData.type === "weeks" && (
        <div className="flex flex-col pr-2 shrink-0 pt-5">
          {gridData.rows.map((row) => (
            <div key={row.age} className="flex-1 flex items-center justify-end min-h-0">
              {row.age % 5 === 0 && (
                <span className="text-[10px] text-muted-foreground font-mono leading-none">
                  {row.age}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
      {gridData.type === "months" && (
        <div className="flex flex-col pr-2 shrink-0 pt-5">
          {gridData.rows.map((row) => (
            <div key={row.age} className="flex-1 flex items-center justify-end min-h-0">
              {row.age % 10 === 0 && (
                <span className="text-[10px] text-muted-foreground font-mono leading-none">
                  {row.age}
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="flex-1 flex flex-col min-h-0">
        {/* Column header labels */}
        {gridData.type === "weeks" && (
          <div className="flex mb-1 shrink-0 h-4">
            {Array.from({ length: 52 }, (_, i) => i + 1).map((week) => (
              <div key={week} className="flex-1 min-w-0 flex justify-center">
                {week === 1 || week % 5 === 0 ? (
                  <span className="text-[10px] text-muted-foreground font-mono leading-none">
                    {week}
                  </span>
                ) : null}
              </div>
            ))}
          </div>
        )}
        {gridData.type === "months" && (
          <div className="flex mb-1 shrink-0 h-4">
            {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
              <div key={month} className="flex-1 min-w-0 flex justify-center">
                <span className="text-[10px] text-muted-foreground font-mono leading-none">
                  {month}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Grid */}
        <div className="flex-1 min-h-0">
          {gridData.type === "years" && (
            <YearsGrid decades={gridData.decades} />
          )}
          {gridData.type === "months" && (
            <MonthsGrid rows={gridData.rows} />
          )}
          {gridData.type === "weeks" && (
            <WeeksGrid rows={gridData.rows} />
          )}
        </div>
      </div>
    </div>
  );
}

// Years Grid: Squares in 9 rows x 10 columns
function YearsGrid({ decades }: { decades: Array<{ decade: number; years: Array<{ age: number; status: CellStatus }> }> }) {
  return (
    <div className="h-full flex flex-col justify-center items-center gap-3">
      {decades.map((decadeData) => (
        <div key={decadeData.decade} className="flex gap-3">
          {decadeData.years.map((year) => (
            <div
              key={year.age}
              className={cn(
                "w-10 h-10 cursor-pointer",
                year.status === "past" && "bg-primary",
                year.status === "current" && "bg-primary/80",
                year.status === "future" && "bg-transparent border-2 border-border hover:border-muted-foreground"
              )}
              title={`Age ${year.age}`}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

// Months Grid: Circles in 90 rows x 12 columns
function MonthsGrid({ rows }: { rows: Array<{ age: number; months: Array<{ month: number; status: CellStatus }> }> }) {
  return (
    <div className="h-full flex flex-col gap-[2px]">
      {rows.map((row) => (
        <div key={row.age} className="flex gap-[2px] flex-1 min-h-0">
          {row.months.map((month) => (
            <div
              key={month.month}
              className={cn(
                "flex-1 min-w-0 rounded-full cursor-pointer",
                month.status === "past" && "bg-primary",
                month.status === "current" && "bg-primary/80",
                month.status === "future" && "bg-transparent border border-border hover:border-muted-foreground"
              )}
              title={`Age ${row.age}, Month ${month.month + 1}`}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

// Weeks Grid: Squares in 90 rows x 52 columns
function WeeksGrid({ rows }: { rows: Array<{ age: number; weeks: Array<{ week: number; status: CellStatus }> }> }) {
  return (
    <div className="h-full flex flex-col gap-[1px]">
      {rows.map((row) => (
        <div key={row.age} className="flex gap-[1px] flex-1 min-h-0">
          {row.weeks.map((week) => (
            <div
              key={week.week}
              className={cn(
                "flex-1 min-w-0 cursor-pointer bg-transparent border",
                week.status === "past" && "bg-primary",
                week.status === "current" && "bg-primary/80",
                week.status === "future" && ""
              )}
              title={`Age ${row.age}, Week ${week.week + 1}`}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
