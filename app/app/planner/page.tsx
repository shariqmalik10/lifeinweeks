"use client";

import { useState } from "react";
import { PlannerCalendar } from "@/components/planner-calendar";
import { UpcomingTasks } from "@/components/upcoming-tasks";
import { TaskForm } from "@/components/task-form";

export default function PlannerPage() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [viewMode, setViewMode] = useState<"month" | "week">("month");

  return (
    <div className="mx-auto max-w-7xl">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-balance text-3xl font-semibold italic text-foreground">
            Planner
          </h1>
          {/* View mode toggle */}
          <div className="flex rounded-lg border border-border bg-card p-1">
            {(["month", "week"] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setViewMode(mode)}
                className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                  viewMode === mode
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <TaskForm defaultDate={selectedDate?.toISOString().slice(0, 10)} />
      </div>

      {/* Content */}
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
    </div>
  );
}
