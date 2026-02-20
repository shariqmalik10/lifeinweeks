"use client";

import { useMemo } from "react";
import { motion } from "motion/react";
import Link from "next/link";
import {
  Dumbbell,
  Languages,
  DollarSign,
  BookOpen,
  Target,
  Calendar,
  TrendingUp,
  ArrowRight,
  Briefcase,
  Plane,
  Code,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Goal, GoalColor } from "@/lib/types";

const colorStyles: Record<GoalColor, {
  border: string;
  iconBg: string;
  progressFill: string;
  progressTrack: string;
  accent: string;
  urgentText: string;
}> = {
  orange: {
    border: "border-orange-500/30",
    iconBg: "bg-orange-500/20",
    progressFill: "bg-orange-500",
    progressTrack: "bg-orange-500/20",
    accent: "text-orange-400",
    urgentText: "text-orange-400",
  },
  blue: {
    border: "border-blue-500/30",
    iconBg: "bg-blue-500/20",
    progressFill: "bg-blue-500",
    progressTrack: "bg-blue-500/20",
    accent: "text-blue-400",
    urgentText: "text-blue-400",
  },
  green: {
    border: "border-green-500/30",
    iconBg: "bg-green-500/20",
    progressFill: "bg-green-500",
    progressTrack: "bg-green-500/20",
    accent: "text-green-400",
    urgentText: "text-green-400",
  },
  purple: {
    border: "border-purple-500/30",
    iconBg: "bg-purple-500/20",
    progressFill: "bg-purple-500",
    progressTrack: "bg-purple-500/20",
    accent: "text-purple-400",
    urgentText: "text-purple-400",
  },
};

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

interface GoalCardProps {
  goal: Goal;
  onEdit?: (goal: Goal) => void;
}

export function GoalCard({ goal }: GoalCardProps) {
  const styles = colorStyles[goal.color];
  const IconComponent = iconMap[goal.icon || "target"] || Target;

  const { daysLeft, targetLabel, isUrgent, trendText } = useMemo(() => {
    const target = new Date(goal.target_date);
    const now = new Date();
    const diff = Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    const month = target.toLocaleString("en-US", { month: "short" });
    const year = target.getFullYear();

    const weeksSinceCreated = Math.max(1, Math.floor(
      (now.getTime() - new Date(goal.created_at).getTime()) / (7 * 24 * 60 * 60 * 1000)
    ));
    const weeklyRate = goal.progress / weeksSinceCreated;

    let trend: string;
    if (goal.target_metric) {
      trend = `+${goal.target_metric.replace(/[^0-9.]/g, '') ? '$' + Math.round(parseFloat(goal.target_metric.replace(/[^0-9.]/g, '')) * weeklyRate / 100).toLocaleString() : Math.round(weeklyRate)}/${weeksSinceCreated > 4 ? 'mo' : 'week'}`;
    } else if (weeklyRate >= 1) {
      trend = `+${Math.round(weeklyRate)}% week`;
    } else {
      trend = "Stable";
    }

    return {
      daysLeft: Math.max(0, diff),
      targetLabel: `${month} ${year}`,
      isUrgent: diff > 0 && diff <= 90,
      trendText: trend,
    };
  }, [goal]);

  return (
    <Link href={`/app/goals/${goal.id}`}>
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.97 }}
        transition={{ duration: 0.2 }}
        className={cn(
          "group relative rounded-xl border bg-card p-5 transition-colors hover:bg-card/80 cursor-pointer",
          styles.border
        )}
      >
        {/* Icon */}
        <div className={cn("mb-4 inline-flex size-10 items-center justify-center rounded-xl", styles.iconBg)}>
          <IconComponent className={cn("size-5", styles.accent)} />
        </div>

        {/* Title */}
        <h3 className="text-base font-semibold text-foreground">{goal.title}</h3>

        {/* Target date and days left */}
        <div className="mt-1.5 flex items-center gap-1.5 text-xs text-muted-foreground">
          <Calendar className="size-3" />
          <span>Target: {targetLabel}</span>
          <span className="mx-0.5">·</span>
          <span className={cn(isUrgent ? "text-red-400 font-medium" : styles.accent)}>
            {daysLeft} Days Left
          </span>
        </div>

        {/* Progress and trend */}
        <div className="mt-4 flex items-end justify-between">
          <span className="text-2xl font-bold tabular-nums text-foreground">
            {goal.progress}%
          </span>
          <span className={cn("flex items-center gap-1 text-xs font-medium", styles.accent)}>
            {trendText !== "Stable" ? (
              <>
                <TrendingUp className="size-3" />
                {trendText}
              </>
            ) : (
              <>
                <ArrowRight className="size-3" />
                {trendText}
              </>
            )}
          </span>
        </div>

        {/* Two-tone progress bar */}
        <div className="mt-2.5 h-1.5 w-full rounded-full bg-secondary overflow-hidden">
          <motion.div
            className={cn("h-full rounded-full", styles.progressFill)}
            initial={{ width: 0 }}
            animate={{ width: `${goal.progress}%` }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />
        </div>
      </motion.div>
    </Link>
  );
}

export function CreateMilestoneCard({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border/60 bg-transparent p-5 min-h-[200px] transition-colors hover:border-muted-foreground/40 hover:bg-secondary/20 cursor-pointer group"
    >
      <div className="flex size-12 items-center justify-center rounded-full bg-secondary/50 mb-3 group-hover:bg-secondary transition-colors">
        <span className="text-2xl text-muted-foreground">+</span>
      </div>
      <span className="text-sm font-medium text-muted-foreground">
        Create New Milestone
      </span>
    </button>
  );
}
