"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/lib/store";
import type { Task, TaskPriority } from "@/lib/types";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

type ViewMode = "month" | "week";

interface PlannerCalendarProps {
  onDateSelect?: (date: Date) => void;
  viewMode?: ViewMode;
}

const priorityColors: Record<TaskPriority, string> = {
  high: "bg-red-500/20 text-red-400 border-red-500/30",
  medium: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  low: "bg-green-500/20 text-green-400 border-green-500/30",
};

export function PlannerCalendar({ onDateSelect, viewMode = "month" }: PlannerCalendarProps) {
  const [viewDate, setViewDate] = useState(() => new Date());
  const tasks = useAppStore((state) => state.tasks);

  const today = useMemo(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return now;
  }, []);

  // Group tasks by date
  const tasksByDate = useMemo(() => {
    const map = new Map<string, Task[]>();
    tasks.forEach((task) => {
      const existing = map.get(task.date) || [];
      map.set(task.date, [...existing, task]);
    });
    return map;
  }, [tasks]);

  const calendarData = useMemo(() => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();

    if (viewMode === "week") {
      // Get the current week
      const day = viewDate.getDay();
      const diff = viewDate.getDate() - day + (day === 0 ? -6 : 1);
      const weekStart = new Date(viewDate);
      weekStart.setDate(diff);

      const weekDays: Date[] = [];
      for (let i = 0; i < 7; i++) {
        const d = new Date(weekStart);
        d.setDate(weekStart.getDate() + i);
        weekDays.push(d);
      }

      return {
        month: MONTHS[month],
        year,
        weeks: [weekDays],
        currentMonth: month,
      };
    }

    // Month view
    const firstDay = new Date(year, month, 1);
    let startDayOfWeek = firstDay.getDay() - 1;
    if (startDayOfWeek < 0) startDayOfWeek = 6;

    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();

    const prevMonthLastDay = new Date(year, month, 0).getDate();
    const prevMonthDays: Date[] = [];
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      prevMonthDays.push(new Date(year, month - 1, prevMonthLastDay - i));
    }

    const currentMonthDays: Date[] = [];
    for (let i = 1; i <= daysInMonth; i++) {
      currentMonthDays.push(new Date(year, month, i));
    }

    const totalCells = Math.ceil((prevMonthDays.length + daysInMonth) / 7) * 7;
    const nextMonthDays: Date[] = [];
    const nextMonthDaysCount = totalCells - prevMonthDays.length - daysInMonth;
    for (let i = 1; i <= nextMonthDaysCount; i++) {
      nextMonthDays.push(new Date(year, month + 1, i));
    }

    const allDays = [...prevMonthDays, ...currentMonthDays, ...nextMonthDays];
    const weeks: Date[][] = [];
    for (let i = 0; i < allDays.length; i += 7) {
      weeks.push(allDays.slice(i, i + 7));
    }

    return {
      month: MONTHS[month],
      year,
      weeks,
      currentMonth: month,
    };
  }, [viewDate, viewMode]);

  const goToPrev = () => {
    if (viewMode === "month") {
      setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
    } else {
      setViewDate((prev) => {
        const d = new Date(prev);
        d.setDate(d.getDate() - 7);
        return d;
      });
    }
  };

  const goToNext = () => {
    if (viewMode === "month") {
      setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
    } else {
      setViewDate((prev) => {
        const d = new Date(prev);
        d.setDate(d.getDate() + 7);
        return d;
      });
    }
  };

  const goToToday = () => {
    setViewDate(new Date());
  };

  const isSameDay = (a: Date, b: Date) =>
    a.getDate() === b.getDate() &&
    a.getMonth() === b.getMonth() &&
    a.getFullYear() === b.getFullYear();

  const formatDateString = (date: Date) => {
    return date.toISOString().slice(0, 10);
  };

  return (
    <div className="space-y-4">
      {/* Navigation */}
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-foreground">
          {calendarData.month} {calendarData.year}
        </h2>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={goToPrev}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            aria-label={viewMode === "month" ? "Previous month" : "Previous week"}
          >
            <ChevronLeft className="size-4" />
          </button>
          <button
            type="button"
            onClick={goToToday}
            className="rounded-md border border-border px-3 py-1 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            Today
          </button>
          <button
            type="button"
            onClick={goToNext}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            aria-label={viewMode === "month" ? "Next month" : "Next week"}
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        {/* Day headers */}
        <div className="grid grid-cols-7 border-b border-border">
          {DAYS.map((day) => (
            <div
              key={day}
              className="border-r border-border px-3 py-2 text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground last:border-r-0"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Weeks */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`${calendarData.month}-${calendarData.year}-${viewMode}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            {calendarData.weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="grid grid-cols-7">
                {week.map((date, dayIndex) => {
                  const isCurrentMonth = date.getMonth() === calendarData.currentMonth;
                  const isToday = isSameDay(date, today);
                  const dateStr = formatDateString(date);
                  const dayTasks = tasksByDate.get(dateStr) || [];

                  return (
                    <button
                      key={dayIndex}
                      type="button"
                      onClick={() => onDateSelect?.(date)}
                      className={cn(
                        "relative flex min-h-24 flex-col border-b border-r border-border p-2 text-left transition-colors last:border-r-0",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary",
                        isCurrentMonth ? "bg-card" : "bg-secondary/30",
                        "hover:bg-secondary/50"
                      )}
                    >
                      {/* Date number */}
                      <span
                        className={cn(
                          "inline-flex size-7 items-center justify-center rounded-full text-sm tabular-nums",
                          isToday && "bg-primary text-primary-foreground font-semibold",
                          !isToday && isCurrentMonth && "text-foreground",
                          !isToday && !isCurrentMonth && "text-muted-foreground/50"
                        )}
                      >
                        {date.getDate()}
                      </span>

                      {/* Tasks */}
                      <div className="mt-1 flex-1 space-y-1 overflow-hidden">
                        {dayTasks.slice(0, 3).map((task) => (
                          <div
                            key={task.id}
                            className={cn(
                              "truncate rounded-sm border px-1.5 py-0.5 text-xs",
                              task.completed && "line-through opacity-50",
                              priorityColors[task.priority]
                            )}
                          >
                            {task.title}
                          </div>
                        ))}
                        {dayTasks.length > 3 && (
                          <div className="text-xs text-muted-foreground">
                            +{dayTasks.length - 3} more
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
