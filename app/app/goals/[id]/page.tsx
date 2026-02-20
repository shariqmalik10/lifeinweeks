"use client";

import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "motion/react";
import {
  ArrowLeft,
  Edit2,
  Plus,
  TrendingUp,
  Calendar,
  Dumbbell,
  Languages,
  DollarSign,
  BookOpen,
  Target,
  Briefcase,
  Plane,
  Code,
  CheckCircle2,
  Circle,
  Flag,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/lib/store";
import { GoalForm } from "@/components/goal-form";
import { cn } from "@/lib/utils";
import type { Goal } from "@/lib/types";
import { DAILY_QUOTES, getDailyQuote } from "@/lib/types";

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

const colorAccent: Record<string, string> = {
  orange: "text-orange-400",
  blue: "text-blue-400",
  green: "text-green-400",
  purple: "text-purple-400",
};

const colorBg: Record<string, string> = {
  orange: "bg-orange-500/20",
  blue: "bg-blue-500/20",
  green: "bg-green-500/20",
  purple: "bg-purple-500/20",
};

const colorFill: Record<string, string> = {
  orange: "bg-orange-500",
  blue: "bg-blue-500",
  green: "bg-green-500",
  purple: "bg-purple-500",
};

export default function GoalDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const goals = useAppStore((s) => s.goals);
  const updateGoal = useAppStore((s) => s.updateGoal);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);

  const goal = useMemo(() => goals.find((g) => g.id === id), [goals, id]);

  if (!goal) {
    return (
      <div className="mx-auto max-w-4xl flex flex-col items-center justify-center min-h-[50vh]">
        <h2 className="text-xl font-semibold text-foreground mb-2">Goal not found</h2>
        <p className="text-muted-foreground mb-4">This goal may have been deleted.</p>
        <Button variant="outline" onClick={() => router.push("/app/goals")}>
          Back to Goals
        </Button>
      </div>
    );
  }

  const IconComponent = iconMap[goal.icon || "target"] || Target;
  const accent = colorAccent[goal.color] || "text-primary";
  const bgAccent = colorBg[goal.color] || "bg-primary/20";
  const fillAccent = colorFill[goal.color] || "bg-primary";

  const now = new Date();
  const targetDate = new Date(goal.target_date);
  const createdDate = new Date(goal.created_at);
  const totalDays = Math.max(1, (targetDate.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
  const elapsedDays = (now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24);
  const daysLeft = Math.max(0, Math.ceil((targetDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
  const percentComplete = goal.progress;

  const targetDateFormatted = targetDate.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const monthlyBars = useMemo(() => {
    const months = 6;
    const bars = [];
    for (let i = months - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthProgress = Math.max(0, Math.min(100,
        (goal.progress / months) * (months - i) + Math.random() * 10 - 5
      ));
      bars.push({
        month: d.toLocaleString("en-US", { month: "short" }),
        value: Math.round(monthProgress),
        isCurrent: i === 0,
      });
    }
    return bars;
  }, [goal.progress]);

  const quote = getDailyQuote();

  const weeklyStreak = useMemo(() => {
    const weeks = 7;
    return Array.from({ length: weeks }, (_, i) => ({
      active: i < 5,
      current: i === 4,
    }));
  }, []);

  const handleLogProgress = () => {
    const newProgress = Math.min(100, goal.progress + 5);
    updateGoal(goal.id, { progress: newProgress });
  };

  return (
    <div className="mx-auto max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/app/goals")}
            className="p-1.5 rounded-lg hover:bg-secondary/60 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="size-5" />
          </button>
          <div className={cn("size-8 rounded-lg flex items-center justify-center", bgAccent)}>
            <IconComponent className={cn("size-4", accent)} />
          </div>
          <h1 className="text-xl font-semibold text-foreground">{goal.title}</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2" onClick={() => setEditingGoal(goal)}>
            <Edit2 className="size-4" />
            Edit Goal
          </Button>
          <Button className="gap-2" onClick={handleLogProgress}>
            <Plus className="size-4" />
            Log Progress
          </Button>
        </div>
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-3 gap-5">
        {/* Left - Progress card (2 cols) */}
        <div className="col-span-2 rounded-xl border border-border bg-card p-6">
          <div className="flex items-start justify-between mb-1">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">
                {goal.target_metric ? "Total Progress" : "Overall Progress"}
              </p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-4xl font-bold text-foreground tabular-nums">
                  {goal.target_metric || `${goal.progress}%`}
                </span>
                {goal.target_metric && (
                  <span className="text-lg text-muted-foreground">
                    / {goal.target_metric}
                  </span>
                )}
              </div>
            </div>
            <div className="text-right">
              <span className={cn("inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full border", accent, "border-current/20")}>
                <TrendingUp className="size-3" />
                +{Math.round(goal.progress / Math.max(1, Math.round(elapsedDays / 30)))}% this month
              </span>
              <p className="text-xs text-muted-foreground mt-1.5">
                Target Date: {targetDateFormatted}
              </p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-4 h-2 w-full rounded-full bg-secondary overflow-hidden">
            <motion.div
              className={cn("h-full rounded-full", fillAccent)}
              initial={{ width: 0 }}
              animate={{ width: `${percentComplete}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </div>
          <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
            <span>Start: {createdDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
            <span>{percentComplete}% Complete</span>
            <span>{daysLeft} Days Left</span>
          </div>

          {/* Monthly bar chart */}
          <div className="mt-6 flex items-end gap-3 h-28">
            {monthlyBars.map((bar, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                {bar.isCurrent && (
                  <span className={cn("text-[10px] font-medium px-1.5 py-0.5 rounded", fillAccent, "text-white")}>
                    Current
                  </span>
                )}
                <div className="w-full flex-1 flex items-end">
                  <motion.div
                    className={cn(
                      "w-full rounded-t-md",
                      bar.isCurrent ? fillAccent : "bg-secondary",
                      bar.isCurrent && "border-2 border-dashed border-muted-foreground/30"
                    )}
                    initial={{ height: 0 }}
                    animate={{ height: `${Math.max(10, bar.value)}%` }}
                    transition={{ duration: 0.5, delay: i * 0.05 }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right - Quote and streak card */}
        <div className="rounded-xl border border-border bg-card p-6 flex flex-col">
          <div className="flex-1">
            <div className="text-2xl mb-3">
              {goal.category === "finance" ? "💡" : goal.category === "health" ? "🏃" : "✨"}
            </div>
            <blockquote className="text-sm italic text-foreground/80 leading-relaxed">
              &ldquo;{quote}&rdquo;
            </blockquote>
          </div>
          <div className="mt-6">
            <p className="text-xs font-medium text-muted-foreground mb-2">Weekly Streak</p>
            <div className="flex gap-1.5">
              {weeklyStreak.map((w, i) => (
                <div
                  key={i}
                  className={cn(
                    "h-2 flex-1 rounded-full",
                    w.active ? fillAccent : "bg-secondary"
                  )}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom section */}
      <div className="grid grid-cols-2 gap-5 mt-5">
        {/* Contributing habits */}
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-foreground">Contributing Habits</h3>
            <button className="size-7 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
              <Plus className="size-4" />
            </button>
          </div>
          <div className="space-y-3">
            {[
              { name: goal.title === "Save $10,000" ? "Brew Coffee at Home" : "Morning Workout", freq: "Daily", detail: goal.title === "Save $10,000" ? "Saves ~$5" : "30 min", done: false },
              { name: goal.title === "Save $10,000" ? "Pack Lunch" : "Track Progress", freq: goal.title === "Save $10,000" ? "Mon-Fri" : "Weekly", detail: goal.title === "Save $10,000" ? "Saves ~$12" : "Log results", done: true },
              { name: goal.title === "Save $10,000" ? "No New Subs" : "Review & Adjust", freq: "Monthly", detail: "Check", done: false },
            ].map((habit, i) => (
              <div key={i} className="flex items-center gap-3 py-2">
                <div className={cn("size-8 rounded-lg flex items-center justify-center", bgAccent)}>
                  <Flag className={cn("size-4", accent)} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{habit.name}</p>
                  <p className="text-xs text-muted-foreground">{habit.freq} · {habit.detail}</p>
                </div>
                {habit.done ? (
                  <CheckCircle2 className="size-5 text-green-500" />
                ) : (
                  <Circle className="size-5 text-muted-foreground/40" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Milestone history */}
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-foreground">Milestone History</h3>
            <span className="text-xs text-muted-foreground">Last 30 Days</span>
          </div>
          <div className="space-y-4">
            {[
              {
                icon: Plus,
                iconColor: "text-primary",
                title: `Updated Progress to ${goal.progress}%`,
                detail: "Progress logged",
                time: "Today",
              },
              {
                icon: Flag,
                iconColor: accent,
                title: `Reached ${Math.floor(goal.progress / 25) * 25}% Milestone`,
                detail: "Keep going!",
                time: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
              },
              {
                icon: ArrowRight,
                iconColor: "text-blue-400",
                title: "Goal Created",
                detail: "Started tracking",
                time: createdDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
              },
            ].map((entry, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="size-8 rounded-full bg-secondary flex items-center justify-center shrink-0 mt-0.5">
                  <entry.icon className={cn("size-4", entry.iconColor)} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{entry.title}</p>
                  <p className="text-xs text-muted-foreground">{entry.detail}</p>
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap">{entry.time}</span>
              </div>
            ))}
          </div>
          <button className="mt-4 text-xs text-muted-foreground hover:text-foreground transition-colors w-full text-center">
            View All History
          </button>
        </div>
      </div>

      {/* Footer status bar */}
      <div className="mt-6 flex items-center justify-between border-t border-border pt-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-green-500" />
            On Track
          </span>
          <span className="flex items-center gap-1.5">
            <Calendar className="size-3" />
            Updated 2m ago
          </span>
        </div>
        <span className="uppercase tracking-wider font-medium font-mono text-[10px]">
          Goal ID: #{goal.id.slice(0, 12).toUpperCase()}
        </span>
      </div>

      {/* Edit dialog */}
      {editingGoal && (
        <GoalForm
          editGoal={editingGoal}
          onClose={() => setEditingGoal(null)}
          triggerButton={false}
        />
      )}
    </div>
  );
}
