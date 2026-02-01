"use client";

import { useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/lib/store";
import { Checkbox } from "@/components/ui/checkbox";
import type { Task, TaskPriority } from "@/lib/types";

const priorityStyles: Record<TaskPriority, string> = {
  high: "text-red-500",
  medium: "text-amber-500",
  low: "text-green-500",
};

const priorityLabels: Record<TaskPriority, string> = {
  high: "HIGH",
  medium: "MEDIUM",
  low: "LOW",
};

interface TaskItemProps {
  task: Task;
  onToggle: (id: string) => void;
}

function TaskItem({ task, onToggle }: TaskItemProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 8 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -8 }}
      transition={{ duration: 0.15 }}
      className="flex items-start gap-3 py-3 border-b border-border last:border-b-0"
    >
      <Checkbox
        checked={task.completed}
        onCheckedChange={() => onToggle(task.id)}
        className="mt-0.5"
        aria-label={`Mark "${task.title}" as ${task.completed ? "incomplete" : "complete"}`}
      />
      <div className="flex-1 min-w-0">
        <div
          className={cn(
            "text-sm font-medium text-foreground",
            task.completed && "line-through text-muted-foreground"
          )}
        >
          {task.title}
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <span className={cn("text-[10px] font-semibold", priorityStyles[task.priority])}>
            {priorityLabels[task.priority]}
          </span>
          {task.time && (
            <>
              <span className="text-muted-foreground">•</span>
              <span className="text-xs tabular-nums text-muted-foreground">
                {task.time}
              </span>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export function UpcomingTasks() {
  const { tasks, toggleTaskComplete } = useAppStore();

  const upcomingTasks = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    return tasks
      .filter((task) => task.date >= today)
      .sort((a, b) => {
        // Completed tasks at the bottom
        if (a.completed !== b.completed) return a.completed ? 1 : -1;
        // Sort by date
        if (a.date !== b.date) return a.date.localeCompare(b.date);
        // Sort by priority
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      })
      .slice(0, 10);
  }, [tasks]);

  return (
    <div className="w-80 flex-shrink-0 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-foreground">Upcoming Tasks</h2>
        <button
          type="button"
          className="text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
          aria-label="Filter tasks"
        >
          <svg
            className="size-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
            />
          </svg>
        </button>
      </div>

      {/* Task list */}
      <div className="rounded-xl border border-border bg-card p-4">
        {upcomingTasks.length > 0 ? (
          <AnimatePresence mode="popLayout">
            {upcomingTasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                onToggle={toggleTaskComplete}
              />
            ))}
          </AnimatePresence>
        ) : (
          <div className="py-8 text-center">
            <p className="text-sm text-muted-foreground">
              No upcoming tasks
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Create a task to get started
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
