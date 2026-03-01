"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { PlannerCalendar } from "@/components/planner-calendar";
import { UpcomingTasks } from "@/components/upcoming-tasks";
import { TaskForm } from "@/components/task-form";
import { WeekStripView } from "@/components/week-strip-view";

type ViewMode = "month" | "week" | "current";

const viewModeLabels: Record<ViewMode, string> = {
  month: "Month",
  week: "Week",
  current: "Current Week",
};

export default function PlannerPage() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("month");

  return (
    <div className="mx-auto max-w-7xl p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-balance text-3xl font-semibold italic text-foreground">
            Planner
          </h1>
          {/* View mode toggle */}
          <div className="flex rounded-lg border border-border bg-card p-1">
            {(["month", "week", "current"] as ViewMode[]).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setViewMode(mode)}
                className={`relative rounded-md px-4 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                  viewMode === mode
                    ? "text-background"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {viewMode === mode && (
                  <motion.div
                    layoutId="viewModeToggle"
                    className="absolute inset-0 rounded-md bg-foreground"
                    initial={false}
                    transition={{
                      type: "spring",
                      stiffness: 500,
                      damping: 35,
                    }}
                  />
                )}
                <span className="relative z-10">{viewModeLabels[mode]}</span>
              </button>
            ))}
          </div>
        </div>
        <TaskForm defaultDate={selectedDate?.toISOString().slice(0, 10)} />
      </div>

      {/* Content */}
      {viewMode === "current" ? (
        <WeekStripView onDateSelect={setSelectedDate} />
      ) : (
        <div className="flex items-start gap-6">
          {/* Main calendar */}
          <div className="flex-1">
            <PlannerCalendar
              onDateSelect={setSelectedDate}
              viewMode={viewMode}
            />
          </div>

          {/* Sidebar */}
          <UpcomingTasks />
        </div>
      )}
    </div>
  );
}
