"use client";

import { useMemo } from "react";
import { motion } from "motion/react";
import {
  BarChart3,
  CheckCircle2,
  Clock,
  TrendingUp,
  Target,
  Flame,
  Calendar,
  ArrowUp,
  ArrowDown,
  Minus,
} from "lucide-react";
import { useAppStore } from "@/lib/store";
import { cn } from "@/lib/utils";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function InsightsPage() {
  const tasks = useAppStore((s) => s.tasks);
  const goals = useAppStore((s) => s.goals);

  const analytics = useMemo(() => {
    const now = new Date();
    const today = now.toISOString().slice(0, 10);

    const completed = tasks.filter((t) => t.completed);
    const total = tasks.length;
    const completionRate = total > 0 ? Math.round((completed.length / total) * 100) : 0;

    // Weekly stats (last 7 days)
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const weekAgoStr = weekAgo.toISOString().slice(0, 10);
    const thisWeekTasks = tasks.filter((t) => t.date >= weekAgoStr && t.date <= today);
    const thisWeekCompleted = thisWeekTasks.filter((t) => t.completed);
    const weekCompletionRate = thisWeekTasks.length > 0
      ? Math.round((thisWeekCompleted.length / thisWeekTasks.length) * 100) : 0;

    // Previous week for comparison
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    const twoWeeksAgoStr = twoWeeksAgo.toISOString().slice(0, 10);
    const lastWeekTasks = tasks.filter((t) => t.date >= twoWeeksAgoStr && t.date < weekAgoStr);
    const lastWeekCompleted = lastWeekTasks.filter((t) => t.completed);
    const weekTrend = thisWeekCompleted.length - lastWeekCompleted.length;

    // Daily breakdown (last 7 days)
    const dailyBreakdown = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(now.getTime() - (6 - i) * 24 * 60 * 60 * 1000);
      const dateStr = d.toISOString().slice(0, 10);
      const dayTasks = tasks.filter((t) => t.date === dateStr);
      const dayCompleted = dayTasks.filter((t) => t.completed);
      return {
        day: DAYS[d.getDay()],
        date: d.getDate(),
        total: dayTasks.length,
        completed: dayCompleted.length,
        isToday: dateStr === today,
      };
    });

    // Priority distribution
    const byPriority = {
      high: tasks.filter((t) => t.priority === "high"),
      medium: tasks.filter((t) => t.priority === "medium"),
      low: tasks.filter((t) => t.priority === "low"),
    };
    const priorityCompletion = {
      high: byPriority.high.length > 0
        ? Math.round((byPriority.high.filter((t) => t.completed).length / byPriority.high.length) * 100) : 0,
      medium: byPriority.medium.length > 0
        ? Math.round((byPriority.medium.filter((t) => t.completed).length / byPriority.medium.length) * 100) : 0,
      low: byPriority.low.length > 0
        ? Math.round((byPriority.low.filter((t) => t.completed).length / byPriority.low.length) * 100) : 0,
    };

    // Streak calculation
    let streak = 0;
    for (let i = 0; i < 90; i++) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = d.toISOString().slice(0, 10);
      const dayCompleted = tasks.filter((t) => t.date === dateStr && t.completed);
      if (dayCompleted.length > 0) {
        streak++;
      } else if (i > 0) {
        break;
      }
    }

    // Goal progress average
    const activeGoals = goals.filter((g) => !g.completed);
    const avgGoalProgress = activeGoals.length > 0
      ? Math.round(activeGoals.reduce((sum, g) => sum + g.progress, 0) / activeGoals.length) : 0;

    // Productivity score (0-100)
    const productivityScore = Math.min(100, Math.round(
      (completionRate * 0.4) + (weekCompletionRate * 0.3) + (streak * 5 * 0.3)
    ));

    return {
      total,
      completed: completed.length,
      completionRate,
      weekCompletionRate,
      weekTrend,
      thisWeekCompleted: thisWeekCompleted.length,
      dailyBreakdown,
      byPriority,
      priorityCompletion,
      streak,
      activeGoals: activeGoals.length,
      avgGoalProgress,
      productivityScore,
    };
  }, [tasks, goals]);

  const maxDailyTasks = Math.max(1, ...analytics.dailyBreakdown.map((d) => d.total));

  return (
    <div className="mx-auto max-w-6xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <BarChart3 className="size-6 text-primary" />
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Insights</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Your productivity patterns and progress analytics
          </p>
        </div>
      </div>

      {/* Top stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          icon={CheckCircle2}
          label="Completion Rate"
          value={`${analytics.completionRate}%`}
          sub={`${analytics.completed} of ${analytics.total} tasks`}
          color="text-green-400"
          bgColor="bg-green-500/10"
          delay={0}
        />
        <StatCard
          icon={Flame}
          label="Current Streak"
          value={`${analytics.streak}`}
          sub={analytics.streak === 1 ? "day" : "days"}
          color="text-orange-400"
          bgColor="bg-orange-500/10"
          delay={0.05}
        />
        <StatCard
          icon={Target}
          label="Goal Progress"
          value={`${analytics.avgGoalProgress}%`}
          sub={`${analytics.activeGoals} active goals`}
          color="text-blue-400"
          bgColor="bg-blue-500/10"
          delay={0.1}
        />
        <StatCard
          icon={TrendingUp}
          label="Productivity"
          value={`${analytics.productivityScore}`}
          sub="score out of 100"
          color="text-purple-400"
          bgColor="bg-purple-500/10"
          delay={0.15}
        />
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-3 gap-5">
        {/* Weekly activity chart - spans 2 cols */}
        <div className="col-span-2 rounded-xl border border-border bg-card p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-sm font-semibold text-foreground">Weekly Activity</h3>
            <div className="flex items-center gap-1.5 text-xs">
              {analytics.weekTrend > 0 ? (
                <span className="flex items-center gap-1 text-green-400">
                  <ArrowUp className="size-3" />
                  +{analytics.weekTrend} vs last week
                </span>
              ) : analytics.weekTrend < 0 ? (
                <span className="flex items-center gap-1 text-red-400">
                  <ArrowDown className="size-3" />
                  {analytics.weekTrend} vs last week
                </span>
              ) : (
                <span className="flex items-center gap-1 text-muted-foreground">
                  <Minus className="size-3" />
                  Same as last week
                </span>
              )}
            </div>
          </div>

          <div className="flex items-end gap-3 h-40">
            {analytics.dailyBreakdown.map((day, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full flex-1 flex items-end gap-0.5">
                  {/* Completed bar */}
                  <motion.div
                    className={cn(
                      "flex-1 rounded-t-md",
                      day.isToday ? "bg-primary" : "bg-primary/60"
                    )}
                    initial={{ height: 0 }}
                    animate={{ height: `${day.total > 0 ? (day.completed / maxDailyTasks) * 100 : 0}%` }}
                    transition={{ duration: 0.5, delay: i * 0.06, ease: "easeOut" }}
                  />
                  {/* Remaining bar */}
                  <motion.div
                    className="flex-1 rounded-t-md bg-secondary"
                    initial={{ height: 0 }}
                    animate={{ height: `${day.total > 0 ? ((day.total - day.completed) / maxDailyTasks) * 100 : 5}%` }}
                    transition={{ duration: 0.5, delay: i * 0.06 + 0.1, ease: "easeOut" }}
                  />
                </div>
                <div className="text-center">
                  <p className={cn(
                    "text-[10px] font-medium",
                    day.isToday ? "text-primary" : "text-muted-foreground"
                  )}>
                    {day.day}
                  </p>
                  <p className="text-[10px] text-muted-foreground/60">{day.date}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-4 mt-4 text-[10px] text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="size-2 rounded-sm bg-primary" /> Completed
            </span>
            <span className="flex items-center gap-1.5">
              <span className="size-2 rounded-sm bg-secondary" /> Remaining
            </span>
          </div>
        </div>

        {/* This week summary */}
        <div className="rounded-xl border border-border bg-card p-6 flex flex-col">
          <h3 className="text-sm font-semibold text-foreground mb-4">This Week</h3>
          <div className="flex-1 flex flex-col justify-center">
            <div className="text-center">
              <motion.p
                className="text-5xl font-bold text-foreground tabular-nums"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              >
                {analytics.thisWeekCompleted}
              </motion.p>
              <p className="text-sm text-muted-foreground mt-1">tasks completed</p>
            </div>
            <div className="mt-4">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
                <span>Week completion</span>
                <span className="font-medium text-foreground">{analytics.weekCompletionRate}%</span>
              </div>
              <div className="h-2 rounded-full bg-secondary overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-primary"
                  initial={{ width: 0 }}
                  animate={{ width: `${analytics.weekCompletionRate}%` }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-3 gap-5 mt-5">
        {/* Priority breakdown */}
        <div className="rounded-xl border border-border bg-card p-6">
          <h3 className="text-sm font-semibold text-foreground mb-4">By Priority</h3>
          <div className="space-y-4">
            {([
              { key: "high" as const, label: "High", color: "bg-red-500", textColor: "text-red-400" },
              { key: "medium" as const, label: "Medium", color: "bg-amber-500", textColor: "text-amber-400" },
              { key: "low" as const, label: "Low", color: "bg-blue-500", textColor: "text-blue-400" },
            ]).map((p, i) => (
              <div key={p.key}>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-muted-foreground">{p.label}</span>
                  <span className={cn("font-medium", p.textColor)}>
                    {analytics.priorityCompletion[p.key]}%
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                  <motion.div
                    className={cn("h-full rounded-full", p.color)}
                    initial={{ width: 0 }}
                    animate={{ width: `${analytics.priorityCompletion[p.key]}%` }}
                    transition={{ duration: 0.5, delay: i * 0.1, ease: "easeOut" }}
                  />
                </div>
                <p className="text-[10px] text-muted-foreground mt-1">
                  {analytics.byPriority[p.key].filter((t) => t.completed).length} of {analytics.byPriority[p.key].length} done
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Goal progress */}
        <div className="rounded-xl border border-border bg-card p-6">
          <h3 className="text-sm font-semibold text-foreground mb-4">Goal Progress</h3>
          <GoalProgressList />
        </div>

        {/* Productivity tips */}
        <div className="rounded-xl border border-border bg-card p-6 flex flex-col">
          <h3 className="text-sm font-semibold text-foreground mb-4">Focus Areas</h3>
          <div className="flex-1 space-y-3">
            <FocusItem
              icon={Clock}
              title="Consistency"
              description={analytics.streak > 3
                ? `Great ${analytics.streak}-day streak! Keep it up.`
                : "Try to complete at least one task daily."
              }
              positive={analytics.streak > 3}
            />
            <FocusItem
              icon={Target}
              title="Goal Alignment"
              description={analytics.avgGoalProgress > 50
                ? "Your goals are progressing well."
                : "Focus on your goals to build momentum."
              }
              positive={analytics.avgGoalProgress > 50}
            />
            <FocusItem
              icon={TrendingUp}
              title="Momentum"
              description={analytics.weekTrend >= 0
                ? "Your productivity is trending upward."
                : "You completed fewer tasks this week. Refocus."
              }
              positive={analytics.weekTrend >= 0}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  color,
  bgColor,
  delay,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  sub: string;
  color: string;
  bgColor: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay, ease: "easeOut" }}
      className="rounded-xl border border-border bg-card p-4"
    >
      <div className={cn("inline-flex size-9 items-center justify-center rounded-lg mb-3", bgColor)}>
        <Icon className={cn("size-4", color)} />
      </div>
      <p className="text-2xl font-bold text-foreground tabular-nums">{value}</p>
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground mt-0.5">{label}</p>
      <p className="text-xs text-muted-foreground mt-1">{sub}</p>
    </motion.div>
  );
}

function GoalProgressList() {
  const goals = useAppStore((s) => s.goals);
  const activeGoals = goals.filter((g) => !g.completed).slice(0, 4);

  if (activeGoals.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">No active goals yet.</p>
    );
  }

  const colorMap: Record<string, string> = {
    orange: "bg-orange-500",
    blue: "bg-blue-500",
    green: "bg-green-500",
    purple: "bg-purple-500",
  };

  return (
    <div className="space-y-3">
      {activeGoals.map((goal, i) => (
        <motion.div
          key={goal.id}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: i * 0.05 }}
        >
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-foreground font-medium truncate pr-2">{goal.title}</span>
            <span className="text-muted-foreground tabular-nums shrink-0">{goal.progress}%</span>
          </div>
          <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
            <motion.div
              className={cn("h-full rounded-full", colorMap[goal.color] || "bg-primary")}
              initial={{ width: 0 }}
              animate={{ width: `${goal.progress}%` }}
              transition={{ duration: 0.5, delay: i * 0.1, ease: "easeOut" }}
            />
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function FocusItem({
  icon: Icon,
  title,
  description,
  positive,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  positive: boolean;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className={cn(
        "mt-0.5 size-7 rounded-lg flex items-center justify-center shrink-0",
        positive ? "bg-green-500/10" : "bg-amber-500/10"
      )}>
        <Icon className={cn("size-3.5", positive ? "text-green-400" : "text-amber-400")} />
      </div>
      <div>
        <p className="text-xs font-medium text-foreground">{title}</p>
        <p className="text-[10px] text-muted-foreground leading-relaxed">{description}</p>
      </div>
    </div>
  );
}
