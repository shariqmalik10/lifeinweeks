"use client";

import { useMemo } from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/lib/store";
import { getDailyQuote } from "@/lib/types";
import type { Task, TaskPriority } from "@/lib/types";
import { Checkbox } from "@/components/ui/checkbox";

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
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ duration: 0.15 }}
      className="flex items-start gap-3 py-2"
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
            "text-sm font-medium",
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

interface TodaySectionProps {
  className?: string;
}

export function TodaySection({ className }: TodaySectionProps) {
  const { tasks, toggleTaskComplete, goals } = useAppStore();
  const quote = useMemo(() => getDailyQuote(), []);

  const todayStr = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const todayTasks = useMemo(() => {
    return tasks
      .filter((task) => task.date === todayStr)
      .sort((a, b) => {
        // Completed tasks at the bottom
        if (a.completed !== b.completed) return a.completed ? 1 : -1;
        // Sort by priority
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      });
  }, [tasks, todayStr]);

  // Get weekly goals progress (top 3 goals)
  const weeklyGoals = useMemo(() => {
    return goals.slice(0, 3);
  }, [goals]);

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header with number */}
      <div className="flex items-center gap-2">
        <div className="flex size-6 items-center justify-center rounded-full bg-foreground text-xs font-bold text-background">
          3
        </div>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-foreground">
          Today
        </h2>
      </div>

      {/* Quote */}
      <div className="rounded-xl border border-border bg-card p-4">
        <p className="text-pretty text-base italic text-foreground">
          &ldquo;{quote}&rdquo;
        </p>
      </div>

      {/* Today's tasks */}
      <div className="rounded-xl border border-border bg-card p-4">
        {todayTasks.length > 0 ? (
          <div className="divide-y divide-border">
            {todayTasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                onToggle={toggleTaskComplete}
              />
            ))}
          </div>
        ) : (
          <div className="py-6 text-center">
            <p className="text-sm text-muted-foreground">
              No tasks for today
            </p>
            <a
              href="/app/planner"
              className="mt-2 inline-block text-sm font-medium text-primary hover:underline"
            >
              Add a task
            </a>
          </div>
        )}
      </div>

      {/* Weekly Goals */}
      {weeklyGoals.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Weekly Goals
          </h3>
          <div className="space-y-2">
            {weeklyGoals.map((goal) => (
              <div key={goal.id} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-foreground">{goal.title}</span>
                  <span className="tabular-nums text-muted-foreground">
                    {goal.progress}%
                  </span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                  <motion.div
                    className={cn(
                      "h-full rounded-full",
                      goal.color === "orange" && "bg-orange-500",
                      goal.color === "blue" && "bg-blue-500",
                      goal.color === "green" && "bg-green-500",
                      goal.color === "purple" && "bg-purple-500"
                    )}
                    initial={{ width: 0 }}
                    animate={{ width: `${goal.progress}%` }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
