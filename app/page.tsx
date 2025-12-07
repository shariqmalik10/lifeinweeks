"use client";

import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type TimeUnit = "weeks" | "months" | "years";

export default function Home() {
  // Default to 25 years ago per DESIGN.md
  const defaultDate = useMemo(() => {
    const now = new Date();
    return new Date(now.getFullYear() - 25, now.getMonth(), now.getDate());
  }, []);

  const [birthDate, setBirthDate] = useState<Date>(defaultDate);
  const [timeUnit, setTimeUnit] = useState<TimeUnit>("years");
  const lifespan = 90; // Fixed at 90 years

  // Calculate life stats
  const stats = useMemo(() => {
    const now = new Date();
    const msPerWeek = 7 * 24 * 60 * 60 * 1000;
    const msLived = now.getTime() - birthDate.getTime();
    const weeksLived = Math.floor(msLived / msPerWeek);
    const totalWeeks = lifespan * 52;
    const weeksRemaining = Math.max(0, totalWeeks - weeksLived);
    const percentComplete = Math.min(100, (weeksLived / totalWeeks) * 100);
    const yearsRemaining = Math.max(0, lifespan - Math.floor(weeksLived / 52));

    return {
      weeksLived,
      weeksRemaining,
      percentComplete,
      summersLeft: yearsRemaining,
      mondaysLeft: weeksRemaining,
    };
  }, [birthDate, lifespan]);

  // Calculate grid data
  const gridData = useMemo(() => {
    const now = new Date();
    const birthYear = birthDate.getFullYear();
    const currentYear = now.getFullYear();
    const deathYear = birthYear + lifespan;

    const unitsPerYear = timeUnit === "weeks" ? 52 : timeUnit === "months" ? 12 : 1;
    const currentMonth = now.getMonth();
    const startOfYear = new Date(currentYear, 0, 1);
    const msIntoYear = now.getTime() - startOfYear.getTime();
    const currentWeek = Math.floor(msIntoYear / (7 * 24 * 60 * 60 * 1000));

    const years = [];
    for (let year = birthYear; year <= deathYear; year++) {
      const isPast = year < currentYear;
      const isCurrent = year === currentYear;
      const units = [];

      for (let i = 0; i < unitsPerYear; i++) {
        let status: "past" | "current" | "future";
        if (timeUnit === "years") {
          status = isPast ? "past" : isCurrent ? "current" : "future";
        } else if (timeUnit === "months") {
          if (isPast) status = "past";
          else if (year > currentYear) status = "future";
          else status = i < currentMonth ? "past" : i === currentMonth ? "current" : "future";
        } else {
          if (isPast) status = "past";
          else if (year > currentYear) status = "future";
          else status = i < currentWeek ? "past" : i === currentWeek ? "current" : "future";
        }
        units.push({ index: i, status });
      }
      years.push({ year, units, isCurrent });
    }
    return { years, unitsPerYear };
  }, [birthDate, lifespan, timeUnit]);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = new Date(e.target.value);
    if (!isNaN(date.getTime())) {
      setBirthDate(date);
    }
  };

  return (
    <main className="relative z-10 h-screen flex flex-col p-4 md:p-6 overflow-hidden">
      {/* Header Row: Title + Input + Controls */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-4 shrink-0">
        {/* Title & Tagline */}
        <div className="shrink-0">
          <h1 className="text-2xl md:text-3xl font-serif font-medium text-foreground leading-tight">
            Life in Weeks
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Memento Mori — Remember you will die
          </p>
        </div>

        {/* Controls Row */}
        <div className="flex items-center gap-4">
          {/* Birth Date */}
          <Input
            type="date"
            value={birthDate.toISOString().split("T")[0]}
            onChange={handleDateChange}
            className="w-40 h-9 text-sm bg-card border-border"
            max={new Date().toISOString().split("T")[0]}
          />

          {/* Time Unit Toggle */}
          <div className="flex gap-1">
            {(["years", "months", "weeks"] as TimeUnit[]).map((unit) => (
              <Button
                key={unit}
                variant={timeUnit === unit ? "default" : "outline"}
                size="sm"
                onClick={() => setTimeUnit(unit)}
                className="h-9 px-3 text-xs capitalize"
              >
                {unit[0].toUpperCase()}
              </Button>
            ))}
          </div>
        </div>
      </header>

      {/* Stats Bar */}
      <div className="flex items-center gap-4 mb-4 shrink-0">
        {/* Progress Bar */}
        <div className="flex-1 space-y-1">
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-500"
              style={{ width: `${stats.percentComplete}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{stats.percentComplete.toFixed(1)}% complete</span>
            <span>{stats.weeksRemaining.toLocaleString()} weeks left</span>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="hidden md:flex gap-4 text-center">
          <div>
            <p className="font-serif text-xl font-medium text-foreground">{stats.summersLeft}</p>
            <p className="text-xs text-muted-foreground">summers</p>
          </div>
          <div>
            <p className="font-serif text-xl font-medium text-foreground">{stats.mondaysLeft.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">mondays</p>
          </div>
        </div>
      </div>

      {/* Life Grid - Fills remaining space */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden min-h-0">
        <div className="space-y-[2px]">
          {gridData.years.map((yearInfo) => (
            <div key={yearInfo.year} className="flex items-center gap-2">
              {/* Year Label */}
              <div
                className={cn(
                  "text-[10px] font-serif w-10 text-right shrink-0",
                  yearInfo.isCurrent ? "font-bold text-primary" : "text-muted-foreground"
                )}
              >
                {yearInfo.year}
              </div>

              {/* Units */}
              <div
                className="grid gap-[1px] flex-1"
                style={{
                  gridTemplateColumns: `repeat(${gridData.unitsPerYear}, minmax(0, 1fr))`,
                }}
              >
                {yearInfo.units.map((unit) => (
                  <div
                    key={unit.index}
                    className={cn(
                      "aspect-square transition-colors",
                      unit.status === "past" && "bg-secondary",
                      unit.status === "current" && "bg-primary animate-pulse shadow-[0_0_8px_rgba(99,102,241,0.5)]",
                      unit.status === "future" && "bg-card border border-border/50"
                    )}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
