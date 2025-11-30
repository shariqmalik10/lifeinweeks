"use client";

import { cn } from "@/lib/utils";
import { useMemo } from "react";

interface YearGridProps {
  year: number;
}

export function YearGrid({ year }: YearGridProps) {
  const weeks = useMemo(() => {
    const weeksArray = [];
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 12, 31);

    // Find the first Monday of the year (or the first day if it starts mid-week)
    const firstDay = startDate.getDay();
    const daysToMonday = firstDay === 0 ? 1 : (8 - firstDay) % 7;

    const firstMonday = new Date(year, 0, 1 + daysToMonday);

    // Calculate weeks until we reach the end of the year
    let currentWeek = new Date(firstMonday);
    while (currentWeek <= endDate) {
      weeksArray.push(new Date(currentWeek));
      currentWeek.setDate(currentWeek.getDate() + 7);
    }

    return weeksArray;
  }, [year]);

  return (
    <div
      className="grid gap-1 w-full"
      style={{
        gridTemplateColumns: `repeat(${weeks.length}, 1fr)`,
      }}
    >
      {weeks.map((weekStart, index) => (
        <div
          key={index}
          className="aspect-square border border-border bg-secondary hover:bg-primary transition-colors cursor-pointer"
          title={weekStart.toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        />
      ))}
    </div>
  );
}
