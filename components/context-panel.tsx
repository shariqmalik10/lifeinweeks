"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import Link from "next/link";
import {
  Plus,
  ArrowRight,
  Calendar,
  Target,
  Dumbbell,
  Languages,
  DollarSign,
  BookOpen,
  Briefcase,
  Plane,
  Code,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/lib/store";
import type { TimeUnit } from "@/components/granularity-toggle";
import type { Goal, GoalColor } from "@/lib/types";
import { GoalProgressModal } from "@/components/goal-progress-modal";

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

const goalBorderMap: Record<GoalColor, string> = {
  orange: "border-l-orange-500",
  blue: "border-l-blue-500",
  green: "border-l-green-500",
  purple: "border-l-purple-500",
};

interface ContextPanelProps {
  timeUnit: TimeUnit;
  birthDate: Date;
  lifespan: number;
  onAddGoal: () => void;
}

export function ContextPanel({ timeUnit, birthDate, lifespan, onAddGoal }: ContextPanelProps) {
  const goals = useAppStore((s) => s.goals);
  const tasks = useAppStore((s) => s.tasks);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);

  const activeGoals = useMemo(() => goals.filter((g) => !g.completed), [goals]);

  const focusInfo = useMemo(() => {
    const now = new Date();
    const msPerWeek = 7 * 24 * 60 * 60 * 1000;
    const weeksLived = Math.floor((now.getTime() - birthDate.getTime()) / msPerWeek);
    const ageInYears = Math.floor((now.getTime() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
    const monthsLived = ageInYears * 12 + now.getMonth() - birthDate.getMonth();
    const totalMonths = lifespan * 12;

    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay() + 1);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);

    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    return {
      week: weeksLived,
      totalWeeks: lifespan * 52,
      weekRange: `${weekStart.toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${weekEnd.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`,
      month: monthNames[now.getMonth()],
      monthNumber: monthsLived,
      totalMonths,
      year: now.getFullYear(),
      lifeYear: ageInYears,
    };
  }, [birthDate, lifespan]);

  const upcomingTasks = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    const weekFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    return tasks
      .filter((t) => t.date >= today && t.date <= weekFromNow && !t.completed)
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, 4);
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
      <aside className="w-[var(--context-panel-width)] shrink-0 border-l border-border bg-card overflow-y-auto max-lg:hidden">
        <div className="p-5 space-y-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={timeUnit}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              {timeUnit === "weeks" && (
                <WeeksContext
                  focusInfo={focusInfo}
                  activeGoals={activeGoals}
                  upcomingTasks={upcomingTasks}
                  onTrackCount={onTrackCount}
                  onAddGoal={onAddGoal}
                  onSelectGoal={setSelectedGoal}
                />
              )}
              {timeUnit === "months" && (
                <MonthsContext
                  focusInfo={focusInfo}
                  activeGoals={activeGoals}
                  onTrackCount={onTrackCount}
                  onAddGoal={onAddGoal}
                  onSelectGoal={setSelectedGoal}
                />
              )}
              {timeUnit === "years" && (
                <YearsContext
                  focusInfo={focusInfo}
                  activeGoals={activeGoals}
                  onAddGoal={onAddGoal}
                  onSelectGoal={setSelectedGoal}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </aside>

      {selectedGoal && (
        <GoalProgressModal
          goal={selectedGoal}
          onClose={() => setSelectedGoal(null)}
        />
      )}
    </>
  );
}

interface WeeksContextProps {
  focusInfo: {
    week: number;
    weekRange: string;
  };
  activeGoals: Goal[];
  upcomingTasks: { id: string; title: string; date: string; priority: string }[];
  onTrackCount: number;
  onAddGoal: () => void;
  onSelectGoal: (goal: Goal) => void;
}

function WeeksContext({ focusInfo, activeGoals, upcomingTasks, onTrackCount, onAddGoal, onSelectGoal }: WeeksContextProps) {
  const dayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return (
    <>
      {/* Current Focus */}
      <div>
        <p className="text-[10px] font-bold uppercase tracking-wider text-primary mb-1">Current Focus</p>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-foreground">
              Week {focusInfo.week.toLocaleString()}
            </h3>
            <p className="text-xs text-muted-foreground">{focusInfo.weekRange}</p>
          </div>
          <button
            onClick={onAddGoal}
            className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <Plus className="size-3.5" />
            Plan
          </button>
        </div>
      </div>

      {/* Active Goals */}
      <GoalsSection
        goals={activeGoals}
        onTrackCount={onTrackCount}
        onSelectGoal={onSelectGoal}
        onAddGoal={onAddGoal}
      />

      {/* This Week's Focus */}
      <div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-foreground mb-3">
          This Week&apos;s Focus
        </h4>
        {upcomingTasks.length === 0 ? (
          <p className="text-xs text-muted-foreground italic">No tasks this week</p>
        ) : (
          <div className="space-y-2">
            {upcomingTasks.map((task) => {
              const taskDate = new Date(task.date + "T00:00:00");
              const dayLabel = dayLabels[taskDate.getDay() === 0 ? 6 : taskDate.getDay() - 1];
              return (
                <div key={task.id} className="flex items-center gap-3 py-2">
                  <div className="size-5 rounded-full border-2 border-border shrink-0" />
                  <span className={cn(
                    "text-sm flex-1",
                    task.priority === "high" ? "text-foreground font-medium" : "text-muted-foreground"
                  )}>
                    {task.title}
                  </span>
                  <span className="text-[10px] text-muted-foreground shrink-0">{dayLabel}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* View Full Planner */}
      <Link
        href="/app/planner"
        className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors pt-2"
      >
        View Full Planner <ArrowRight className="size-3.5" />
      </Link>
    </>
  );
}

interface MonthsContextProps {
  focusInfo: {
    month: string;
    monthNumber: number;
    totalMonths: number;
    year: number;
  };
  activeGoals: Goal[];
  onTrackCount: number;
  onAddGoal: () => void;
  onSelectGoal: (goal: Goal) => void;
}

function MonthsContext({ focusInfo, activeGoals, onTrackCount, onAddGoal, onSelectGoal }: MonthsContextProps) {
  const tasks = useAppStore((s) => s.tasks);

  const monthMilestones = useMemo(() => {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().slice(0, 10);
    return tasks
      .filter((t) => t.date >= monthStart && t.date <= monthEnd && t.priority === "high")
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, 4);
  }, [tasks]);

  return (
    <>
      {/* Current Month Focus */}
      <div>
        <p className="text-[10px] font-bold uppercase tracking-wider text-primary mb-1">Current Month Focus</p>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-foreground">
              {focusInfo.month} {focusInfo.year}
            </h3>
            <p className="text-xs text-muted-foreground">
              Month {focusInfo.monthNumber.toLocaleString()} of {focusInfo.totalMonths.toLocaleString()}
            </p>
          </div>
          <button
            onClick={onAddGoal}
            className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <Calendar className="size-3.5" />
            Plan Month
          </button>
        </div>
      </div>

      {/* Monthly Active Goals */}
      <GoalsSection
        goals={activeGoals}
        onTrackCount={onTrackCount}
        onSelectGoal={onSelectGoal}
        onAddGoal={onAddGoal}
      />

      {/* This Month's Key Milestones */}
      <div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-foreground mb-3">
          This Month&apos;s Key Milestones
        </h4>
        {monthMilestones.length === 0 ? (
          <p className="text-xs text-muted-foreground italic">No milestones this month</p>
        ) : (
          <div className="space-y-2">
            {monthMilestones.map((task) => {
              const taskDate = new Date(task.date + "T00:00:00");
              return (
                <div key={task.id} className="flex items-start gap-3 rounded-lg border border-border bg-background p-3">
                  <div className="size-2 rounded-full bg-primary mt-1.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{task.title}</p>
                    {task.description && (
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">{task.description}</p>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground shrink-0">
                    {taskDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Link
        href="/app/planner"
        className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors pt-2"
      >
        View Yearly Plan <Calendar className="size-3.5" />
      </Link>
    </>
  );
}

interface YearsContextProps {
  focusInfo: {
    lifeYear: number;
    year: number;
  };
  activeGoals: Goal[];
  onAddGoal: () => void;
  onSelectGoal: (goal: Goal) => void;
}

function YearsContext({ focusInfo, activeGoals, onAddGoal, onSelectGoal }: YearsContextProps) {
  const yearLabel = useMemo(() => {
    if (focusInfo.lifeYear < 20) return "Foundation Years";
    if (focusInfo.lifeYear < 30) return "Your Quarter-Life Chapter";
    if (focusInfo.lifeYear < 40) return "The Building Decade";
    if (focusInfo.lifeYear < 50) return "Peak Performance";
    if (focusInfo.lifeYear < 60) return "Wisdom Era";
    return "Legacy Chapter";
  }, [focusInfo.lifeYear]);

  return (
    <>
      {/* Current Focus */}
      <div>
        <p className="text-[10px] font-bold uppercase tracking-wider text-primary mb-1">Current Focus</p>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-foreground">
              Life Year {focusInfo.lifeYear}
            </h3>
            <p className="text-xs text-muted-foreground">
              {focusInfo.year} - {yearLabel}
            </p>
          </div>
          <button
            onClick={onAddGoal}
            className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <Plus className="size-3.5" />
            Plan
          </button>
        </div>
      </div>

      {/* Vision Progress */}
      <div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-foreground mb-3">
          Vision Progress
        </h4>
        {activeGoals.length === 0 ? (
          <p className="text-xs text-muted-foreground italic">Set your first life vision goal</p>
        ) : (
          <div className="space-y-3">
            {activeGoals.slice(0, 3).map((goal) => (
              <div key={goal.id} className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-foreground">{goal.title}</span>
                  <span className="text-xs font-semibold text-primary tabular-nums">{goal.progress}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                  <motion.div
                    className={cn("h-full rounded-full", goalColorMap[goal.color])}
                    initial={{ width: 0 }}
                    animate={{ width: `${goal.progress}%` }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Major Annual Goals */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
            Major Annual Goals
          </h4>
          {activeGoals.length > 0 && (
            <span className="text-[10px] font-semibold text-green-400 bg-green-500/10 px-2 py-0.5 rounded-full">
              {activeGoals.length} Active
            </span>
          )}
        </div>
        {activeGoals.length === 0 ? (
          <button
            onClick={onAddGoal}
            className="w-full rounded-lg border-2 border-dashed border-border py-6 text-sm text-muted-foreground hover:border-muted-foreground/40 hover:text-foreground transition-colors"
          >
            + Set your first goal
          </button>
        ) : (
          <div className="space-y-2">
            {activeGoals.slice(0, 4).map((goal) => {
              const GoalIcon = iconMap[goal.icon || "target"] || Target;
              return (
                <button
                  key={goal.id}
                  onClick={() => onSelectGoal(goal)}
                  className={cn(
                    "w-full flex items-center gap-3 rounded-lg border-l-4 bg-background p-3 text-left hover:bg-secondary/50 transition-colors",
                    goalBorderMap[goal.color]
                  )}
                >
                  <GoalIcon className="size-4 text-muted-foreground shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{goal.title}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {goal.category ? `${goal.category.charAt(0).toUpperCase() + goal.category.slice(1)} Pillar` : "General"} · Due {new Date(goal.target_date).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                    </p>
                  </div>
                  <ChevronRight className="size-4 text-muted-foreground shrink-0" />
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Yearly Targets */}
      {activeGoals.length > 0 && (
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-foreground mb-3">
            Yearly Targets
          </h4>
          <div className="space-y-2">
            {activeGoals.slice(0, 2).map((goal) => (
              <div key={goal.id} className="flex items-center justify-between py-1">
                <span className="text-sm text-foreground">{goal.title}</span>
                <span className="text-xs text-muted-foreground tabular-nums">{goal.progress}%</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

interface GoalsSectionProps {
  goals: Goal[];
  onTrackCount: number;
  onSelectGoal: (goal: Goal) => void;
  onAddGoal: () => void;
}

function GoalsSection({ goals, onTrackCount, onSelectGoal, onAddGoal }: GoalsSectionProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
          Active Goals
        </h4>
        {onTrackCount > 0 && (
          <span className="text-[10px] font-semibold text-green-400 bg-green-500/10 px-2 py-0.5 rounded-full">
            {onTrackCount} On Track
          </span>
        )}
      </div>
      {goals.length === 0 ? (
        <button
          onClick={onAddGoal}
          className="w-full rounded-lg border-2 border-dashed border-border py-6 text-sm text-muted-foreground hover:border-muted-foreground/40 hover:text-foreground transition-colors"
        >
          + Add your first goal
        </button>
      ) : (
        <div className="space-y-2">
          {goals.slice(0, 3).map((goal) => {
            const GoalIcon = iconMap[goal.icon || "target"] || Target;
            return (
              <button
                key={goal.id}
                onClick={() => onSelectGoal(goal)}
                className={cn(
                  "w-full rounded-lg border border-border p-3 text-left hover:bg-secondary/30 transition-colors",
                )}
              >
                <div className="flex items-center gap-3">
                  <div className={cn("size-8 rounded-lg flex items-center justify-center", `bg-${goal.color}-500/20`)}>
                    <GoalIcon className={cn("size-4", `text-${goal.color}-400`)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground">{goal.title}</p>
                    <p className="text-[10px] text-muted-foreground">
                      Target: {new Date(goal.target_date).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                    </p>
                  </div>
                  <span className="text-xs font-semibold tabular-nums text-muted-foreground">{goal.progress}%</span>
                </div>
                <div className="mt-2 h-1.5 rounded-full bg-secondary overflow-hidden">
                  <div
                    className={cn("h-full rounded-full transition-all", goalColorMap[goal.color])}
                    style={{ width: `${goal.progress}%` }}
                  />
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
