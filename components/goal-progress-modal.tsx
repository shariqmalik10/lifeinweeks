"use client";

import { useState, useCallback } from "react";
import { motion } from "motion/react";
import { X } from "lucide-react";
import {
  Dumbbell,
  Languages,
  DollarSign,
  BookOpen,
  Target,
  Briefcase,
  Plane,
  Code,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/lib/store";
import type { Goal, GoalColor } from "@/lib/types";

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

const goalIconBgMap: Record<GoalColor, string> = {
  orange: "bg-orange-500/20",
  blue: "bg-blue-500/20",
  green: "bg-green-500/20",
  purple: "bg-purple-500/20",
};

const goalIconTextMap: Record<GoalColor, string> = {
  orange: "text-orange-400",
  blue: "text-blue-400",
  green: "text-green-400",
  purple: "text-purple-400",
};

const quickTags = ["#milestone", "#struggle", "#routine"];

interface GoalProgressModalProps {
  goal: Goal;
  onClose: () => void;
}

export function GoalProgressModal({ goal, onClose }: GoalProgressModalProps) {
  const updateGoal = useAppStore((s) => s.updateGoal);
  const [progress, setProgress] = useState(goal.progress);
  const [note, setNote] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const GoalIcon = iconMap[goal.icon || "target"] || Target;

  const handleSubmit = useCallback(() => {
    updateGoal(goal.id, {
      progress,
      description: note.trim()
        ? `${goal.description ? goal.description + "\n" : ""}[${new Date().toLocaleDateString()}] ${note.trim()} ${selectedTags.join(" ")}`
        : goal.description,
    });
    onClose();
  }, [goal, progress, note, selectedTags, updateGoal, onClose]);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.2 }}
        className="relative z-10 w-full max-w-md rounded-xl border border-border bg-card shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 pb-4">
          <div className="flex items-center gap-3">
            <div className={cn("size-10 rounded-lg flex items-center justify-center", goalIconBgMap[goal.color])}>
              <GoalIcon className={cn("size-5", goalIconTextMap[goal.color])} />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">{goal.title}</h3>
              <p className="text-xs text-muted-foreground">
                Target: {new Date(goal.target_date).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors p-1"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Progress Slider */}
        <div className="px-5 pb-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Current Progress
            </p>
            <span className="text-2xl font-bold text-primary tabular-nums">{progress}%</span>
          </div>
          <div className="relative">
            <input
              type="range"
              min="0"
              max="100"
              value={progress}
              onChange={(e) => setProgress(Number(e.target.value))}
              className="w-full accent-primary h-2 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
              <span>0%</span>
              <span>50%</span>
              <span>100%</span>
            </div>
          </div>
        </div>

        {/* Note */}
        <div className="px-5 pb-3">
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
            Add a Note
          </p>
          <div className="relative">
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="What did you achieve this week? e.g., Hit a new PR on deadlift..."
              className="w-full min-h-[80px] rounded-lg border border-border bg-background px-3 py-2.5 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
              maxLength={280}
            />
            <span className="absolute bottom-2 right-3 text-[10px] text-muted-foreground">
              {note.length}/280
            </span>
          </div>
        </div>

        {/* Quick Tags */}
        <div className="px-5 pb-5">
          <div className="flex gap-2">
            {quickTags.map((tag) => (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-medium border transition-colors",
                  selectedTags.includes(tag)
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-muted-foreground hover:border-muted-foreground"
                )}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 px-5 pb-5">
          <button
            onClick={onClose}
            className="flex-1 rounded-lg border border-border py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
          >
            <Target className="size-4" />
            Update Progress
          </button>
        </div>
      </motion.div>
    </div>
  );
}
