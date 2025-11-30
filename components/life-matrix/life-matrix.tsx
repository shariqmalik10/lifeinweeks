"use client";

import { useState, useMemo } from "react";
import { YearGrid } from "./year-grid";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

type ViewOption = 5 | 10 | 20 | 50;

export function LifeMatrix() {
  const [view, setView] = useState<ViewOption>(10);

  const currentYear = new Date().getFullYear();

  const yearRange = useMemo(() => {
    const halfRange = Math.floor(view / 2);
    const startYear = currentYear - halfRange;
    const years: number[] = [];

    for (let i = 0; i < view; i++) {
      years.push(startYear + i);
    }

    return years;
  }, [view, currentYear]);

  const viewOptions: ViewOption[] = [5, 10, 20, 50];

  return (
    <div className="w-full space-y-8">
      <div className="space-y-3">
        <Label>View</Label>
        <div className="flex gap-2" role="group" aria-label="Year view options">
          {viewOptions.map((option) => (
            <Button
              key={option}
              variant={view === option ? "default" : "outline"}
              onClick={() => setView(option)}
              aria-pressed={view === option}
              className="min-w-[60px]"
            >
              {option}Y
            </Button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {yearRange.map((year) => (
          <div key={year} className="flex items-center gap-4">
            <div
              className={`text-sm font-serif w-16 text-right ${
                year === currentYear ? "font-bold text-foreground" : "text-muted-foreground"
              }`}
            >
              {year}
            </div>
            <YearGrid year={year} />
          </div>
        ))}
      </div>
    </div>
  );
}
