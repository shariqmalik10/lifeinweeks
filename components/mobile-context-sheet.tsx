"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Plus,
  ArrowRight,
  Target,
  Dumbbell,
  Languages,
  DollarSign,
  BookOpen,
  Briefcase,
  Plane,
  Code,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/lib/store";
import type { TimeUnit } from "@/components/granularity-toggle";
import type { Goal, GoalColor } from "@/lib/types";
import { GoalProgressModal } from "@/components/goal-progress-modal";
import Link from "next/link";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  dumbbell: Dumbbell,
  languages: Languages,
  dollar: DollarSign,
  book: BookOpen,
  target: Target,
  briefcase: Briefcase,
  plane: Plane,
  code: Code,
};

const goalColorMap: Record<GoalColor, string> = {
  orange: "bg-orange-500",
  blue: "bg-blue-500",
  green: "bg-green-500",
  purple: "bg-purple-500",
};

interface MobileContextSheetProps {
  timeUnit: TimeUnit;
  birthDate: Date;
  lifespan: number;
  onAddGoal: () => void;
}

export function MobileContextSheet({ timeUnit, birthDate, lifespan, onAddGoal }: MobileContextSheetProps) {
  const goals = useAppStore((s) => s.goals);
  const tasks = useAppStore((s) => s.tasks);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [expanded, setExpanded] = useState(false);

  const activeGoals = useMemo(() => goals.filter((g) => !g.completed), [goals]);

  const focusInfo = useMemo(() => {
    const now = new Date();
    const msPerWeek = 7 * 24 * 60 * 60 * 1000;
    const weeksLived = Math.floor((now.getTime() - birthDate.getTime()) / msPerWeek);

    return {
      week: weeksLived,
    };
  }, [birthDate]);

  const upcomingTasks = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    const weekFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    return tasks
      .filter((t) => t.date >= today && t.date <= weekFromNow && !t.completed)
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, 3);
  }, [tasks]);

  const onTrackCount = useMemo(() => {
    const now = new Date();
    return activeGoals.filter((g) => {
      const target = new Date(g.target_date);
      const totalDays = (target.getTime() - new Date(g.created_at).getTime()) / (1000 * 60 * 60 * 24);
      const elapsed = (now.getTime() - new Date(g.created_at).getTime()) / (1000 * 60 * 60 * 24);
      const expectedProgress = Math.min(100, (elapsed / totalDays) * 100);
      return g.progress >= expectedProgress * 0.7;
    }).length;
  }, [activeGoals]);

  return (
    <>
      {/* Mobile-only context sheet */}
      <div className="lg:hidden border-t border-border bg-card">
        {/* Drag handle */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex flex-col items-center pt-2 pb-1"
        >
          <div className="w-10 h-1 rounded-full bg-muted-foreground/30" />
        </button>

        {/* Collapsed header */}
        <div className="px-4 pb-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-primary">Current Focus</p>
              <h3 className="text-base font-bold text-foreground">
                Week {focusInfo.week.toLocaleString()}
              </h3>
            </div>
            <button
              onClick={onAddGoal}
              className="size-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground"
            >
              <Plus className="size-5" />
            </button>
          </div>
        </div>

        {/* Expanded content */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-4 space-y-4">
                {/* Goals */}
                {activeGoals.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">Goals</h4>
                      {onTrackCount > 0 && (
                        <span className="text-[10px] font-semibold text-green-400 bg-green-500/10 px-2 py-0.5 rounded-full">
                          {onTrackCount} On Track
                        </span>
                      )}
                    </div>
                    <div className="space-y-2">
                      {activeGoals.slice(0, 2).map((goal) => {
                        const GoalIcon = iconMap[goal.icon || "target"] || Target;
                        return (
                          <button
                            key={goal.id}
                            onClick={() => setSelectedGoal(goal)}
                            className="w-full rounded-lg border border-border bg-background p-3 text-left"
                          >
                            <div className="flex items-center gap-3">
                              <GoalIcon className="size-4 text-muted-foreground shrink-0" />
                              <span className="text-sm font-medium text-foreground flex-1">{goal.title}</span>
                              <span className="text-xs text-muted-foreground tabular-nums">{goal.progress}%</span>
                            </div>
                            <div className="mt-2 h-1.5 rounded-full bg-secondary overflow-hidden">
                              <div
                                className={cn("h-full rounded-full", goalColorMap[goal.color])}
                                style={{ width: `${goal.progress}%` }}
                              />
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* This Week */}
                {upcomingTasks.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-foreground mb-2">This Week</h4>
                    <div className="space-y-1.5">
                      {upcomingTasks.map((task) => {
                        const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
                        const taskDate = new Date(task.date + "T00:00:00");
                        return (
                          <div key={task.id} className="flex items-center gap-3 py-1.5">
                            <div className="size-5 rounded-full border-2 border-border shrink-0" />
                            <span className="text-sm text-foreground flex-1">{task.title}</span>
                            <span className="text-[10px] text-muted-foreground">{dayLabels[taskDate.getDay()]}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <Link
                  href="/app/planner"
                  className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  View Full Planner <ArrowRight className="size-3.5" />
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {selectedGoal && (
        <GoalProgressModal
          goal={selectedGoal}
          onClose={() => setSelectedGoal(null)}
        />
      )}
    </>
  );
}
