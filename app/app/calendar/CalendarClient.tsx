"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
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

function formatDayShort(date: Date) {
  return date.toLocaleDateString(undefined, { weekday: "short" });
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
    <div className="h-1.5 w-full rounded-full bg-zinc-900/50">
      <div
        className="h-1.5 rounded-full bg-zinc-200 transition-all duration-200"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

export function CalendarClient({ userKey }: { userKey: string }) {
  const qc = useQueryClient();
  const router = useRouter();
  const [weekAnchor, setWeekAnchor] = useState(() => new Date());
  const [selectedCategory, setSelectedCategory] = useState<CategoryId>("work");
  const dayRefs = useRef<Record<string, HTMLDivElement | null>>({});

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

  const todayKey = dateKey(new Date());

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <h1 className="text-balance text-3xl font-semibold text-white">
            {rangeTitle}
          </h1>
          <p className="text-pretty text-base text-zinc-400">
            Pick a category, then click a cell to check in. Everything is saved
            locally and cached via TanStack Query.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setWeekAnchor((d) => addDays(d, -7))}
            className="min-h-[44px] rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-2 text-sm text-zinc-200 transition-colors hover:bg-zinc-900 hover:border-zinc-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 touch-manipulation"
            aria-label="Previous week"
          >
            ← Previous
          </button>
          <button
            type="button"
            onClick={() => {
              setWeekAnchor(() => new Date());
              const target = dayRefs.current[todayKey];
              setTimeout(() => {
                target?.scrollIntoView({ behavior: "smooth", block: "center" });
              }, 100);
            }}
            className="min-h-[44px] rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-2 text-sm text-zinc-200 transition-colors hover:bg-zinc-900 hover:border-zinc-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 touch-manipulation"
            aria-label="Jump to today"
          >
            Jump to Today
          </button>
          <button
            type="button"
            onClick={() => setWeekAnchor((d) => addDays(d, 7))}
            className="min-h-[44px] rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-2 text-sm text-zinc-200 transition-colors hover:bg-zinc-900 hover:border-zinc-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 touch-manipulation"
            aria-label="Next week"
          >
            Next →
          </button>
        </div>
      </div>

      {/* Category Selection */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-base font-medium text-zinc-300">Choose your task</span>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => {
              const active = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={cn(
                    "min-h-[44px] rounded-lg border px-4 py-2 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 touch-manipulation",
                    active
                      ? "border-zinc-200 bg-zinc-200 text-zinc-950"
                      : "border-zinc-800 bg-zinc-950 text-zinc-200 hover:bg-zinc-900 hover:border-zinc-700",
                  )}
                  aria-pressed={active}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center justify-between gap-3">
          <span className="text-base font-medium text-zinc-300">View</span>
          <button
            type="button"
            onClick={() => router.push(`/app/calendar/${todayKey}`)}
            className="min-h-[44px] rounded-lg border border-zinc-800 bg-zinc-200 px-4 py-2 text-sm font-medium text-zinc-950 transition-colors hover:bg-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 touch-manipulation"
          >
            Zoom to today
          </button>
        </div>
      </div>

      {/* Mobile: Stacked Day Cards */}
      <div className="space-y-4 md:hidden">
        {days.map((day) => {
          const k = dateKey(day);
          const isToday = k === todayKey;
          return (
            <div
              key={k}
              ref={(node) => {
                dayRefs.current[k] = node;
              }}
              className={cn(
                "rounded-xl border bg-zinc-950 p-5 transition-colors",
                isToday
                  ? "border-zinc-500 bg-zinc-900/50"
                  : "border-zinc-800",
              )}
            >
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <div className="text-lg font-semibold text-zinc-100">
                    {formatDayTitle(day)}
                  </div>
                  <div className="mt-0.5 text-sm text-zinc-500 tabular-nums">
                    {day.toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                    })}
                  </div>
                </div>
                <Link
                  href={`/app/calendar/${k}`}
                  className="min-h-[44px] rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs font-medium text-zinc-200 transition-colors hover:bg-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 touch-manipulation"
                >
                  Open
                </Link>
              </div>
              <div className="grid gap-3">
                {SLOTS.map((slot) => {
                  const value = checkIns[k]?.[slot] ?? null;
                  const category = value ? CATEGORIES.find((c) => c.id === value) : null;
                  const label = category?.label ?? "Empty";
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
                        "min-h-[60px] rounded-lg border px-4 py-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 touch-manipulation",
                        value
                          ? "border-zinc-700 bg-zinc-900/50 text-zinc-100 hover:bg-zinc-900"
                          : "border-zinc-800 bg-zinc-950 text-zinc-400 hover:bg-zinc-900 hover:border-zinc-700",
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{slot}</span>
                        <span className="text-sm font-medium">{label}</span>
                      </div>
                      {!value && (
                        <div className="mt-1 text-xs text-zinc-500">Tap to set</div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Desktop: Week Grid */}
      <div className="hidden md:block">
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full">
            <div className="grid gap-3" style={{ gridTemplateColumns: "160px repeat(7, 1fr)" }}>
              {/* Empty corner */}
              <div className="hidden md:block" />

              {/* Day headers */}
              {days.map((day) => {
                const k = dateKey(day);
                const isToday = k === todayKey;
                return (
                  <div
                    key={k}
                    ref={(node) => {
                      dayRefs.current[k] = node;
                    }}
                    className={cn(
                      "rounded-lg border px-3 py-3 text-center transition-colors",
                      isToday
                        ? "border-zinc-500 bg-zinc-900/50"
                        : "border-zinc-800 bg-zinc-950",
                    )}
                  >
                    <Link
                      href={`/app/calendar/${k}`}
                      className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950"
                    >
                      <div className="text-sm font-semibold text-zinc-100">
                        {formatDayShort(day)}
                      </div>
                      <div className="mt-1 text-xs text-zinc-500 tabular-nums">
                        {day.toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                        })}
                      </div>
                    </Link>
                  </div>
                );
              })}

              {/* Time slot rows */}
              {SLOTS.map((slot) => (
                <div key={slot} className="contents">
                  <div className="flex items-center justify-start px-2">
                    <div className="text-base font-medium uppercase text-zinc-300">
                      {slot}
                    </div>
                  </div>
                  {days.map((day) => {
                    const k = dateKey(day);
                    const value = checkIns[k]?.[slot] ?? null;
                    const category = value ? CATEGORIES.find((c) => c.id === value) : null;
                    const label = category?.label ?? "Empty";
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
                          "min-h-[100px] rounded-lg border px-3 py-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 touch-manipulation",
                          value
                            ? "border-zinc-700 bg-zinc-900/50 text-zinc-100 hover:bg-zinc-900"
                            : "border-zinc-800 bg-zinc-950 text-zinc-400 hover:bg-zinc-900 hover:border-zinc-700",
                        )}
                      >
                        <div className="text-sm font-medium">{label}</div>
                        {!value && (
                          <div className="mt-1 text-xs text-zinc-500">Click to set</div>
                        )}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Weekly Goals */}
      <section className="space-y-4">
        <h2 className="text-balance text-xl font-semibold text-white">
          Weekly Goals
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CATEGORIES.map((cat) => {
            const done = weeklyCounts[cat.id] ?? 0;
            const target = Math.max(0, Number(goals[cat.id] ?? 0));
            const isComplete = target > 0 && done >= target;
            return (
              <div
                key={cat.id}
                className="rounded-xl border border-zinc-800 bg-zinc-950 p-5"
              >
                <div className="mb-3 flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <div className="text-base font-medium text-zinc-200">
                        {cat.label}
                      </div>
                      {isComplete && (
                        <span className="text-zinc-400" aria-label="Goal completed">
                          ✓
                        </span>
                      )}
                    </div>
                    <div className="mt-1 text-sm text-zinc-500 tabular-nums">
                      {done} / {target || 0} times
                    </div>
                  </div>
                  <div className="w-20 shrink-0">
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
                      className="h-10 bg-zinc-900 text-base text-zinc-100 tabular-nums focus:bg-zinc-800"
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


