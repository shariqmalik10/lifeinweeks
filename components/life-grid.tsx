"use client";

import { useMemo } from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

type CellStatus = "past" | "current" | "future";

interface LifeGridProps {
  birthDate: Date;
  lifespanYears?: number;
}

export function LifeGrid({ birthDate, lifespanYears = 90 }: LifeGridProps) {
  const { rows, stats } = useMemo(() => {
    const now = new Date();
    const birthYear = birthDate.getFullYear();
    const currentYear = now.getFullYear();
    const startOfYear = new Date(currentYear, 0, 1);
    const msIntoYear = now.getTime() - startOfYear.getTime();
    const currentWeek = Math.floor(msIntoYear / (7 * 24 * 60 * 60 * 1000));
    const ageInYears = currentYear - birthYear;

    const totalWeeks = lifespanYears * 52;
    const weeksLived = ageInYears * 52 + currentWeek;

    const gridRows: Array<{
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
      gridRows.push({ age, weeks });
    }

    return {
      rows: gridRows,
      stats: {
        weeksLived,
        totalWeeks,
      },
    };
  }, [birthDate, lifespanYears]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex size-6 items-center justify-center rounded-full bg-foreground text-xs font-bold text-background">
            1
          </div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-foreground">
            Life Grid
          </h2>
        </div>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <div className="size-3 rounded-sm bg-[hsl(var(--grid-past))]" />
            <span>Past</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="size-3 rounded-sm bg-primary" />
            <span>Current</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="size-3 rounded-sm border border-[hsl(var(--grid-future-border))] bg-[hsl(var(--grid-future))]" />
            <span>Future</span>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="grid gap-0.5">
          {rows.map((row) => (
            <div
              key={row.age}
              className="grid gap-0.5"
              style={{ gridTemplateColumns: "repeat(52, minmax(0, 1fr))" }}
            >
              {row.weeks.map((week) => (
                <Cell key={week.week} status={week.status} />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Cell({ status }: { status: CellStatus }) {
  return (
    <motion.div
      initial={status === "current" ? { scale: 0.8 } : false}
      animate={status === "current" ? { scale: 1 } : undefined}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className={cn(
        "aspect-square w-full rounded-[2px]",
        status === "past" && "bg-[hsl(var(--grid-past))]",
        status === "current" && "bg-primary",
        status === "future" &&
          "border border-[hsl(var(--grid-future-border))] bg-[hsl(var(--grid-future))]"
      )}
    />
  );
}

interface LifeStatsProps {
  birthDate: Date;
  lifespanYears?: number;
  currentPhase: string;
}

export function LifeStats({
  birthDate,
  lifespanYears = 90,
  currentPhase,
}: LifeStatsProps) {
  const stats = useMemo(() => {
    const now = new Date();
    const msPerWeek = 7 * 24 * 60 * 60 * 1000;
    const msLived = now.getTime() - birthDate.getTime();
    const weeksLived = Math.max(0, Math.floor(msLived / msPerWeek));
    const totalWeeks = lifespanYears * 52;

    return {
      weeksLived,
      totalWeeks,
    };
  }, [birthDate, lifespanYears]);

  return (
    <div className="flex items-start justify-between">
      <div>
        <div className="text-xs uppercase tracking-wide text-muted-foreground">
          Current Phase
        </div>
        <h1 className="mt-1 text-balance text-3xl font-semibold italic text-foreground">
          {currentPhase}
        </h1>
      </div>
      <div className="text-right">
        <div className="text-xs uppercase tracking-wide text-muted-foreground">
          Life Consumed
        </div>
        <div className="mt-1 flex items-baseline gap-1">
          <span className="tabular-nums text-3xl font-semibold text-foreground">
            {stats.weeksLived.toLocaleString()}
          </span>
          <span className="text-sm text-muted-foreground">
            / {stats.totalWeeks.toLocaleString()} Weeks
          </span>
        </div>
      </div>
    </div>
  );
}
