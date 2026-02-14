"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/lib/store";
import type { Task } from "@/lib/types";

const DAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
const MONTHS = [
  "JANUARY",
  "FEBRUARY",
  "MARCH",
  "APRIL",
  "MAY",
  "JUNE",
  "JULY",
  "AUGUST",
  "SEPTEMBER",
  "OCTOBER",
  "NOVEMBER",
  "DECEMBER",
];

interface WeekStripViewProps {
  onDateSelect?: (date: Date) => void;
}

export function WeekStripView({ onDateSelect }: WeekStripViewProps) {
  const tasks = useAppStore((state) => state.tasks);
  
  // Get today and calculate the current week
  const today = useMemo(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return now;
  }, []);

  const [selectedDate, setSelectedDate] = useState<Date>(today);

  // Calculate the week days (Monday to Sunday)
  const weekDays = useMemo(() => {
    const day = today.getDay();
    // Adjust to get Monday as start (0 = Monday, 6 = Sunday)
    const diff = today.getDate() - day + (day === 0 ? -6 : 1);
    const weekStart = new Date(today);
    weekStart.setDate(diff);

    const days: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(weekStart);
      d.setDate(weekStart.getDate() + i);
      days.push(d);
    }
    return days;
  }, [today]);

  // Get tasks for selected date
  const selectedDateTasks = useMemo(() => {
    const dateStr = selectedDate.toISOString().slice(0, 10);
    return tasks.filter((task) => task.date === dateStr);
  }, [tasks, selectedDate]);

  // Get upcoming tasks (next few tasks from today onwards)
  const upcomingTasks = useMemo(() => {
    const todayStr = today.toISOString().slice(0, 10);
    return tasks
      .filter((task) => task.date >= todayStr && !task.completed)
      .sort((a, b) => {
        if (a.date !== b.date) return a.date.localeCompare(b.date);
        return (a.time || "").localeCompare(b.time || "");
      })
      .slice(0, 4);
  }, [tasks, today]);

  const handleDayClick = (date: Date) => {
    setSelectedDate(date);
    onDateSelect?.(date);
  };

  const isSameDay = (a: Date, b: Date) =>
    a.getDate() === b.getDate() &&
    a.getMonth() === b.getMonth() &&
    a.getFullYear() === b.getFullYear();

  const isToday = (date: Date) => isSameDay(date, today);

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":");
    const h = parseInt(hours, 10);
    const ampm = h >= 12 ? "PM" : "AM";
    const hour12 = h % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  const getRelativeDay = (date: Date) => {
    if (isSameDay(date, today)) return "Today";
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    if (isSameDay(date, tomorrow)) return "Tomorrow";
    return DAYS[date.getDay()];
  };

  // Current day of week name for the header
  const currentDayName = DAYS[selectedDate.getDay()];

  return (
    <div className="space-y-6">
      {/* Main container - uses theme colors */}
      <div className="rounded-2xl bg-card p-6 text-foreground border border-border">
        {/* Day name header */}
        <h2 className="text-2xl font-bold uppercase tracking-tight">
          {currentDayName}
        </h2>

        {/* Upcoming tasks section */}
        {upcomingTasks.length > 0 && (
          <div className="mt-6">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="size-4" />
              <span>Upcoming tasks</span>
            </div>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {upcomingTasks.slice(0, 2).map((task) => (
                <TaskCard key={task.id} task={task} today={today} />
              ))}
            </div>
          </div>
        )}

        {/* Week strip */}
        <div className="mt-8">
          <div className="flex items-center justify-between gap-1">
            {weekDays.map((date) => {
              const isSelected = isSameDay(date, selectedDate);

              return (
                <button
                  key={date.toISOString()}
                  type="button"
                  onClick={() => handleDayClick(date)}
                  className={cn(
                    "relative flex flex-1 flex-col items-center gap-1 rounded-xl px-2 py-4 transition-colors",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-card",
                    isSelected
                      ? "bg-background"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {/* Animated dot indicator */}
                  <AnimatePresence>
                    {isSelected && (
                      <motion.div
                        layoutId="weekDot"
                        className="absolute -top-0.5 left-1/2 size-1.5 -translate-x-1/2 rounded-full bg-primary"
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{
                          type: "spring",
                          stiffness: 500,
                          damping: 35,
                        }}
                      />
                    )}
                  </AnimatePresence>

                  {/* Month */}
                  <span className={cn(
                    "text-[10px] font-medium uppercase tracking-wider",
                    isSelected ? "text-foreground" : "text-muted-foreground"
                  )}>
                    {MONTHS[date.getMonth()]}
                  </span>

                  {/* Day number */}
                  <span className={cn(
                    "text-xl font-semibold tabular-nums",
                    isSelected ? "text-foreground" : "text-foreground/70"
                  )}>
                    {date.getDate()}
                  </span>

                  {/* Day abbreviation */}
                  <span className={cn(
                    "text-xs font-medium uppercase",
                    isSelected ? "text-foreground" : "text-muted-foreground"
                  )}>
                    {DAYS[date.getDay()]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tasks for selected day */}
      {selectedDateTasks.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Tasks for {isSameDay(selectedDate, today) ? "Today" : DAYS[selectedDate.getDay()]}
          </h3>
          <div className="space-y-2">
            {selectedDateTasks.map((task) => (
              <SelectedDayTask key={task.id} task={task} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

interface TaskCardProps {
  task: Task;
  today: Date;
}

function TaskCard({ task, today }: TaskCardProps) {
  const taskDate = new Date(task.date);
  const isSameDay = (a: Date, b: Date) =>
    a.getDate() === b.getDate() &&
    a.getMonth() === b.getMonth() &&
    a.getFullYear() === b.getFullYear();

  const getRelativeDay = () => {
    if (isSameDay(taskDate, today)) return "Today";
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    if (isSameDay(taskDate, tomorrow)) return "Tomorrow";
    return taskDate.toLocaleDateString("en-US", { weekday: "short" });
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":");
    const h = parseInt(hours, 10);
    const ampm = h >= 12 ? "PM" : "AM";
    const hour12 = h % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-border bg-secondary/50 p-4"
    >
      <div className="font-medium text-foreground">{task.title}</div>
      <div className="mt-1 text-sm text-muted-foreground">
        {getRelativeDay()}
        {task.time && `, ${formatTime(task.time)}`}
      </div>
    </motion.div>
  );
}

interface SelectedDayTaskProps {
  task: Task;
}

function SelectedDayTask({ task }: SelectedDayTaskProps) {
  const toggleTaskComplete = useAppStore((state) => state.toggleTaskComplete);

  const priorityColors = {
    high: "border-l-red-500",
    medium: "border-l-amber-500",
    low: "border-l-green-500",
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":");
    const h = parseInt(hours, 10);
    const ampm = h >= 12 ? "PM" : "AM";
    const hour12 = h % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      className={cn(
        "flex items-center gap-3 rounded-lg border border-border border-l-4 bg-card p-4",
        priorityColors[task.priority]
      )}
    >
      <button
        type="button"
        onClick={() => toggleTaskComplete(task.id)}
        className={cn(
          "flex size-5 shrink-0 items-center justify-center rounded border-2 transition-colors",
          task.completed
            ? "border-primary bg-primary text-primary-foreground"
            : "border-muted-foreground/50 hover:border-primary"
        )}
        aria-label={`Mark "${task.title}" as ${task.completed ? "incomplete" : "complete"}`}
      >
        {task.completed && (
          <svg className="size-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        )}
      </button>
      <div className="flex-1 min-w-0">
        <div className={cn(
          "font-medium",
          task.completed && "line-through text-muted-foreground"
        )}>
          {task.title}
        </div>
        {task.time && (
          <div className="text-sm text-muted-foreground">
            {formatTime(task.time)}
          </div>
        )}
      </div>
    </motion.div>
  );
}
