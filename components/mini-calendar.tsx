"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/lib/store";

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

interface MiniCalendarProps {
  onDateSelect?: (date: Date) => void;
  selectedDate?: Date;
}

export function MiniCalendar({ onDateSelect, selectedDate }: MiniCalendarProps) {
  const [viewDate, setViewDate] = useState(() => new Date());
  const tasks = useAppStore((state) => state.tasks);

  const today = useMemo(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return now;
  }, []);

  const calendarData = useMemo(() => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();

    // First day of the month
    const firstDay = new Date(year, month, 1);
    // Day of week (0 = Sunday, we want Monday = 0)
    let startDayOfWeek = firstDay.getDay() - 1;
    if (startDayOfWeek < 0) startDayOfWeek = 6;

    // Last day of the month
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();

    // Previous month days to show
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    const prevMonthDays: Date[] = [];
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      prevMonthDays.push(new Date(year, month - 1, prevMonthLastDay - i));
    }

    // Current month days
    const currentMonthDays: Date[] = [];
    for (let i = 1; i <= daysInMonth; i++) {
      currentMonthDays.push(new Date(year, month, i));
    }

    // Next month days to fill the grid
    const totalCells = Math.ceil((prevMonthDays.length + daysInMonth) / 7) * 7;
    const nextMonthDays: Date[] = [];
    const nextMonthDaysCount = totalCells - prevMonthDays.length - daysInMonth;
    for (let i = 1; i <= nextMonthDaysCount; i++) {
      nextMonthDays.push(new Date(year, month + 1, i));
    }

    // Build weeks
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
  }, [viewDate]);

  // Get dates that have tasks
  const datesWithTasks = useMemo(() => {
    const dates = new Set<string>();
    tasks.forEach((task) => {
      dates.add(task.date);
    });
    return dates;
  }, [tasks]);

  const goToPrevMonth = () => {
    setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
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
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex size-6 items-center justify-center rounded-full bg-foreground text-xs font-bold text-background">
            2
          </div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-foreground">
            {calendarData.month} {calendarData.year}
          </h2>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={goToPrevMonth}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            aria-label="Previous month"
          >
            <ChevronLeft className="size-4" />
          </button>
          <button
            type="button"
            onClick={goToToday}
            className="rounded-md px-2 py-1 text-xs font-medium text-muted-foreground hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            Today
          </button>
          <button
            type="button"
            onClick={goToNextMonth}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            aria-label="Next month"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>

      {/* Calendar */}
      <div className="rounded-xl border border-border bg-card p-3">
        {/* Day headers */}
        <div className="mb-2 grid grid-cols-7 gap-1">
          {DAYS.map((day) => (
            <div
              key={day}
              className="text-center text-xs font-medium text-muted-foreground"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Weeks */}
        <div className="grid gap-1">
          {calendarData.weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="grid grid-cols-7 gap-1">
              {week.map((date, dayIndex) => {
                const isCurrentMonth = date.getMonth() === calendarData.currentMonth;
                const isToday = isSameDay(date, today);
                const isSelected = selectedDate && isSameDay(date, selectedDate);
                const hasTask = datesWithTasks.has(formatDateString(date));

                return (
                  <button
                    key={dayIndex}
                    type="button"
                    onClick={() => onDateSelect?.(date)}
                    className={cn(
                      "relative flex aspect-square items-center justify-center rounded-md text-sm transition-colors",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                      isCurrentMonth
                        ? "text-foreground"
                        : "text-muted-foreground/50",
                      isToday && "bg-primary text-primary-foreground",
                      isSelected &&
                        !isToday &&
                        "bg-secondary text-foreground",
                      !isToday &&
                        !isSelected &&
                        "hover:bg-secondary"
                    )}
                  >
                    {date.getDate()}
                    {hasTask && !isToday && (
                      <span className="absolute bottom-1 left-1/2 size-1 -translate-x-1/2 rounded-full bg-primary" />
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
