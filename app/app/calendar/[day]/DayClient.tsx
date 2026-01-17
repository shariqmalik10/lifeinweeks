"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
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
  setCheckIn,
} from "@/lib/calendar/storage";

function parseDayParam(raw: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(raw)) return null;
  const d = new Date(`${raw}T00:00:00`);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function DayClient({
  userKey,
  dayParam,
}: {
  userKey: string;
  dayParam: string;
}) {
  const qc = useQueryClient();
  const date = useMemo(() => parseDayParam(dayParam), [dayParam]);
  const [selectedCategory, setSelectedCategory] = useState<CategoryId>("work");

  const checkInsQuery = useQuery({
    queryKey: ["calendar", "checkins", userKey],
    queryFn: () => readCheckIns(userKey),
  });
  const checkIns = checkInsQuery.data ?? {};
  const day = checkIns[dayParam] ?? defaultDayCheckIns();

  const setCheckInMutation = useMutation({
    mutationFn: async (params: { slot: Slot; categoryId: CategoryId }) => {
      return setCheckIn({
        userKey,
        dayKey: dayParam,
        slot: params.slot,
        categoryId: params.categoryId,
      });
    },
    onSuccess: (data) => {
      qc.setQueryData(["calendar", "checkins", userKey], data);
    },
  });

  const title = useMemo(() => {
    if (!date) return "Day";
    return date.toLocaleDateString(undefined, {
      weekday: "long",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }, [date]);

  if (!date) {
    return (
      <div className="space-y-3">
        <h1 className="text-balance text-2xl font-semibold text-white">
          Invalid day
        </h1>
        <p className="text-pretty text-sm text-zinc-400">
          The day format should be YYYY-MM-DD.
        </p>
        <Link
          href="/app/calendar"
          className="inline-flex rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-200 hover:bg-zinc-900"
        >
          Back to week
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-balance text-2xl font-semibold text-white">
            {title}
          </h1>
          <p className="text-pretty text-sm text-zinc-400">
            Zoomed-in day view. Choose a category, then set each slot.
          </p>
        </div>
        <Link
          href="/app/calendar"
          className="inline-flex rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-200 hover:bg-zinc-900"
        >
          Back to week
        </Link>
      </div>

      <div className="flex flex-col gap-3">
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

        <div className="grid gap-3">
          {SLOTS.map((slot) => {
            const value = day[slot];
            const label =
              value == null
                ? "Empty"
                : CATEGORIES.find((c) => c.id === value)?.label ?? "Set";
            return (
              <button
                key={slot}
                type="button"
                onClick={() =>
                  setCheckInMutation.mutate({ slot, categoryId: selectedCategory })
                }
                className={cn(
                  "rounded-xl border px-4 py-4 text-left",
                  value
                    ? "border-zinc-700 bg-zinc-900 text-zinc-100"
                    : "border-zinc-800 bg-zinc-950 text-zinc-400 hover:bg-zinc-900",
                )}
              >
                <div className="flex items-baseline justify-between gap-4">
                  <div className="text-base font-medium text-zinc-200">
                    {slot}
                  </div>
                  <div className="text-sm">{label}</div>
                </div>
                <div className="mt-2 text-xs text-zinc-500">
                  Click to set to{" "}
                  {CATEGORIES.find((c) => c.id === selectedCategory)?.label}
                </div>
              </button>
            );
          })}
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
          <div className="text-sm font-medium text-zinc-200">Notes</div>
          <p className="mt-1 text-pretty text-sm text-zinc-500">
            Notes are coming next (we’ll attach them to each slot and persist via
            TanStack Query + storage).
          </p>
          <Input
            placeholder="Optional note (coming soon)"
            disabled
            className="mt-3 h-10 bg-zinc-950 text-zinc-100"
            aria-label="Notes (coming soon)"
          />
        </div>
      </div>
    </div>
  );
}


