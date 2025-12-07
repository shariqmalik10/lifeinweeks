"use client";

import { cn } from "@/lib/utils";
import { useMemo, useRef, useEffect } from "react";
import { TimeUnit } from "./view-controls";

interface LifeGridProps {
  birthDate: Date;
  lifespan?: number;
  timeUnit: TimeUnit;
  focusRemaining: boolean;
  highlightYear?: number | null;
}

type UnitStatus = "past" | "current" | "future";

interface YearData {
  year: number;
  units: UnitData[];
  isPast: boolean;
  isCurrent: boolean;
  isFuture: boolean;
}

interface UnitData {
  index: number;
  status: UnitStatus;
  label: string;
}

function getUnitsPerYear(timeUnit: TimeUnit): number {
  switch (timeUnit) {
    case "weeks": return 52;
    case "months": return 12;
    case "years": return 1;
  }
}

function calculateYearData(
  birthDate: Date,
  lifespan: number,
  timeUnit: TimeUnit
): YearData[] {
  const now = new Date();
  const birthYear = birthDate.getFullYear();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  const deathYear = birthYear + lifespan;
  
  const unitsPerYear = getUnitsPerYear(timeUnit);
  const years: YearData[] = [];

  // Calculate current week/month of the year
  const startOfYear = new Date(currentYear, 0, 1);
  const msIntoYear = now.getTime() - startOfYear.getTime();
  const msPerWeek = 7 * 24 * 60 * 60 * 1000;
  const currentWeekOfYear = Math.floor(msIntoYear / msPerWeek);
  const currentMonthOfYear = currentMonth;

  for (let year = birthYear; year <= deathYear; year++) {
    const isPast = year < currentYear;
    const isCurrent = year === currentYear;
    const isFuture = year > currentYear;

    const units: UnitData[] = [];
    
    for (let i = 0; i < unitsPerYear; i++) {
      let status: UnitStatus;
      let label: string;

      if (timeUnit === "years") {
        status = isPast ? "past" : isCurrent ? "current" : "future";
        label = `Age ${year - birthYear}`;
      } else if (timeUnit === "months") {
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        label = `${monthNames[i]} ${year}`;
        
        if (isPast) {
          status = "past";
        } else if (isFuture) {
          status = "future";
        } else {
          // Current year
          if (i < currentMonthOfYear) {
            status = "past";
          } else if (i === currentMonthOfYear) {
            status = "current";
          } else {
            status = "future";
          }
        }
      } else {
        // weeks
        label = `Week ${i + 1}, ${year}`;
        
        if (isPast) {
          status = "past";
        } else if (isFuture) {
          status = "future";
        } else {
          // Current year
          if (i < currentWeekOfYear) {
            status = "past";
          } else if (i === currentWeekOfYear) {
            status = "current";
          } else {
            status = "future";
          }
        }
      }

      units.push({ index: i, status, label });
    }

    years.push({ year, units, isPast, isCurrent, isFuture });
  }

  return years;
}

export function LifeGrid({ 
  birthDate, 
  lifespan = 90, 
  timeUnit, 
  focusRemaining,
  highlightYear 
}: LifeGridProps) {
  const yearRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  
  const yearData = useMemo(
    () => calculateYearData(birthDate, lifespan, timeUnit),
    [birthDate, lifespan, timeUnit]
  );

  const filteredYears = useMemo(() => {
    if (!focusRemaining) return yearData;
    return yearData.filter(y => y.isCurrent || y.isFuture);
  }, [yearData, focusRemaining]);

  // Scroll to highlighted year
  useEffect(() => {
    if (highlightYear !== null && highlightYear !== undefined) {
      const element = yearRefs.current.get(highlightYear);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }, [highlightYear]);

  // Scroll to top when focus remaining is toggled on
  useEffect(() => {
    if (focusRemaining) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [focusRemaining]);

  const unitsPerYear = getUnitsPerYear(timeUnit);

  return (
    <div className="w-full space-y-2">
      {filteredYears.map((yearInfo) => (
        <div
          key={yearInfo.year}
          ref={(el) => {
            if (el) yearRefs.current.set(yearInfo.year, el);
          }}
          className={cn(
            "flex items-center gap-4 transition-all duration-300",
            highlightYear === yearInfo.year && "bg-primary/10 -mx-4 px-4 py-2 rounded-lg"
          )}
        >
          {/* Year Label */}
          <div
            className={cn(
              "text-sm font-serif w-16 text-right shrink-0 transition-colors",
              yearInfo.isCurrent
                ? "font-bold text-primary"
                : "text-muted-foreground"
            )}
            title={`${unitsPerYear} ${timeUnit} in ${yearInfo.year}`}
          >
            {yearInfo.year}
          </div>

          {/* Units Grid */}
          <div
            className="grid gap-[2px] flex-1"
            style={{
              gridTemplateColumns: `repeat(${unitsPerYear}, minmax(0, 1fr))`,
            }}
          >
            {yearInfo.units.map((unit) => (
              <UnitNode
                key={unit.index}
                status={unit.status}
                label={unit.label}
                timeUnit={timeUnit}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

interface UnitNodeProps {
  status: UnitStatus;
  label: string;
  timeUnit: TimeUnit;
}

function UnitNode({ status, label, timeUnit }: UnitNodeProps) {
  const baseClasses = "transition-all duration-200 cursor-pointer";
  
  // Adjust aspect ratio based on time unit for better visibility
  const sizeClasses = timeUnit === "years" 
    ? "aspect-square min-h-6" 
    : timeUnit === "months"
    ? "aspect-square min-h-4"
    : "aspect-square min-h-2";

  const statusClasses = {
    past: "bg-secondary hover:bg-secondary/80",
    current: "bg-primary animate-pulse shadow-[0_0_12px_rgba(99,102,241,0.6)] hover:shadow-[0_0_16px_rgba(99,102,241,0.8)]",
    future: "bg-card border border-border hover:border-primary/50",
  };

  return (
    <div
      className={cn(baseClasses, sizeClasses, statusClasses[status])}
      title={label}
      role="gridcell"
      aria-label={`${label} - ${status}`}
    />
  );
}

