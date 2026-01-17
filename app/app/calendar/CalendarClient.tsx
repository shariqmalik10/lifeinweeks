"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import {
  CATEGORIES,
  SLOTS,
  type CategoryId,
  type Slot,
} from "@/lib/calendar/types";
import {
  defaultDayCheckIns,
  readCheckIns,
  readGoals,
  setCheckIn,
  writeGoals,
} from "@/lib/calendar/storage";
import { Input } from "@/components/ui/input";

function startOfWeek(date: Date) {
  const d = new Date(date);
  const day = d.getDay(); // 0=Sun
  const diff = (day + 6) % 7; // Monday start
  d.setDate(d.getDate() - diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function addDays(date: Date, days: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function dateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function formatDayTitle(date: Date) {
  return date.toLocaleDateString(undefined, { weekday: "long" });
}

function formatRangeTitle(weekStart: Date) {
  const weekEnd = addDays(weekStart, 6);
  const opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
  const left = weekStart.toLocaleDateString(undefined, opts);
  const right = weekEnd.toLocaleDateString(undefined, opts);
  const year = weekEnd.getFullYear();
  return `${left} - ${right}, ${year}`;
}

function inRange(dayIso: string, weekStart: Date) {
  const startIso = dateKey(weekStart);
  const endIso = dateKey(addDays(weekStart, 6));
  return dayIso >= startIso && dayIso <= endIso;
}

function ProgressBar({ value, max }: { value: number; max: number }) {
  const pct = max <= 0 ? 0 : Math.min(100, (value / max) * 100);
  return (
    <div className="mt-2 h-2 w-full rounded-full bg-zinc-900">
      <div className="h-2 rounded-full bg-zinc-200" style={{ width: `${pct}%` }} />
    </div>
  );
}

export function CalendarClient({ userKey }: { userKey: string }) {
  const qc = useQueryClient();
  const [weekAnchor, setWeekAnchor] = useState(() => new Date());
  const [selectedCategory, setSelectedCategory] = useState<CategoryId>("work");

  const weekStart = useMemo(() => startOfWeek(weekAnchor), [weekAnchor]);
  const days = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)),
    [weekStart],
  );

  const rangeTitle = useMemo(() => formatRangeTitle(weekStart), [weekStart]);

  const checkInsQuery = useQuery({
    queryKey: ["calendar", "checkins", userKey],
    queryFn: () => readCheckIns(userKey),
  });

  const goalsQuery = useQuery({
    queryKey: ["calendar", "goals", userKey],
    queryFn: () => readGoals(userKey),
  });

  const setCheckInMutation = useMutation({
    mutationFn: async (params: { dayKey: string; slot: Slot; categoryId: CategoryId }) => {
      return setCheckIn({
        userKey,
        dayKey: params.dayKey,
        slot: params.slot,
        categoryId: params.categoryId,
      });
    },
    onSuccess: (data) => {
      qc.setQueryData(["calendar", "checkins", userKey], data);
    },
  });

  const setGoalMutation = useMutation({
    mutationFn: async (params: { categoryId: CategoryId; target: number }) => {
      const current = readGoals(userKey);
      const next = { ...current, [params.categoryId]: params.target };
      writeGoals(userKey, next);
      return next;
    },
    onSuccess: (data) => {
      qc.setQueryData(["calendar", "goals", userKey], data);
    },
  });

  const checkIns = checkInsQuery.data ?? {};
  const goals = goalsQuery.data ?? {};

  const weeklyCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const [dayIso, dayData] of Object.entries(checkIns)) {
      if (!inRange(dayIso, weekStart)) continue;
      const normalized = dayData ?? defaultDayCheckIns();
      for (const slot of SLOTS) {
        const cat = normalized[slot];
        if (!cat) continue;
        counts[cat] = (counts[cat] ?? 0) + 1;
      }
    }
    return counts as Record<CategoryId, number>;
  }, [checkIns, weekStart]);

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-balance text-2xl font-semibold text-white">
            {rangeTitle}
          </h1>
          <p className="text-pretty text-sm text-zinc-400">
            Pick a category, then click a cell to check in. Everything is saved
            locally and cached via TanStack Query.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setWeekAnchor((d) => addDays(d, -7))}
            className="rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-200 hover:bg-zinc-900"
          >
            Previous
          </button>
          <button
            type="button"
            onClick={() => setWeekAnchor(() => new Date())}
            className="rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-200 hover:bg-zinc-900"
          >
            Today
          </button>
          <button
            type="button"
            onClick={() => setWeekAnchor((d) => addDays(d, 7))}
            className="rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-200 hover:bg-zinc-900"
          >
            Next
          </button>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-zinc-400">Choose your task</span>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => {
              const active = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={cn(
                    "rounded-full border px-3 py-1 text-xs",
                    active
                      ? "border-zinc-200 bg-zinc-200 text-zinc-950"
                      : "border-zinc-800 bg-zinc-950 text-zinc-200 hover:bg-zinc-900",
                  )}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center justify-between gap-3">
          <div className="text-sm text-zinc-400">View</div>
          <Link
            href={`/app/calendar/${dateKey(new Date())}`}
            className="inline-flex rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-200 hover:bg-zinc-900"
          >
            Zoom to today
          </Link>
        </div>

        <div className="grid gap-2 md:grid-cols-[140px_1fr]">
          <div className="hidden md:block" />
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 md:grid-cols-7">
            {days.map((day) => {
              const k = dateKey(day);
              return (
                <Link
                  key={k}
                  href={`/app/calendar/${k}`}
                  className="rounded-md px-2 py-1 text-left text-sm text-zinc-200 hover:bg-zinc-900"
                >
                  <div className="text-sm font-medium">{formatDayTitle(day)}</div>
                  <div className="text-xs text-zinc-500 tabular-nums">
                    {day.toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                  </div>
                </Link>
              );
            })}
          </div>

          {SLOTS.map((slot) => (
            <div key={slot} className="grid gap-2 md:grid-cols-[140px_1fr]">
              <div className="flex items-center justify-between md:justify-start">
                <div className="text-sm font-medium text-zinc-300">{slot}</div>
              </div>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 md:grid-cols-7">
                {days.map((day) => {
                  const k = dateKey(day);
                  const value = checkIns[k]?.[slot] ?? null;
                  const label =
                    value == null
                      ? "Empty"
                      : CATEGORIES.find((c) => c.id === value)?.label ?? "Set";
                  return (
                    <button
                      key={`${k}:${slot}`}
                      type="button"
                      onClick={() =>
                        setCheckInMutation.mutate({
                          dayKey: k,
                          slot,
                          categoryId: selectedCategory,
                        })
                      }
                      className={cn(
                        "min-h-16 rounded-lg border px-3 py-2 text-left",
                        value
                          ? "border-zinc-700 bg-zinc-900 text-zinc-100"
                          : "border-zinc-800 bg-zinc-950 text-zinc-400 hover:bg-zinc-900",
                      )}
                    >
                      <div className="text-sm">{label}</div>
                      <div className="mt-1 text-xs text-zinc-500">
                        Click to set
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      <section className="space-y-3">
        <h2 className="text-balance text-lg font-semibold text-white">
          Weekly goals
        </h2>
        <div className="grid gap-3 md:grid-cols-2">
          {CATEGORIES.map((cat) => {
            const done = weeklyCounts[cat.id] ?? 0;
            const target = Math.max(0, Number(goals[cat.id] ?? 0));
            return (
              <div
                key={cat.id}
                className="rounded-xl border border-zinc-800 bg-zinc-950 p-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-sm font-medium text-zinc-200">
                      {cat.label}
                    </div>
                    <div className="mt-1 text-xs text-zinc-500 tabular-nums">
                      {done} / {target || 0} times
                    </div>
                  </div>
                  <div className="w-24">
                    <Input
                      type="number"
                      min={0}
                      step={1}
                      inputMode="numeric"
                      value={target}
                      onChange={(e) =>
                        setGoalMutation.mutate({
                          categoryId: cat.id,
                          target: Math.max(0, Number(e.target.value || 0)),
                        })
                      }
                      className="h-9 bg-zinc-950 text-zinc-100 tabular-nums"
                      aria-label={`${cat.label} weekly target`}
                    />
                  </div>
                </div>
                <ProgressBar value={done} max={target || 0} />
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}


