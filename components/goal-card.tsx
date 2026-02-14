"use client";

import { useState } from "react";
import { motion } from "motion/react";
import {
  MoreVertical,
  Dumbbell,
  Languages,
  DollarSign,
  BookOpen,
  Target,
  Trash2,
  Edit2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/lib/store";
import type { Goal, GoalColor } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";

const colorStyles: Record<GoalColor, { border: string; bg: string; progress: string }> = {
  orange: {
    border: "border-orange-500/50",
    bg: "bg-orange-500/20",
    progress: "bg-orange-500",
  },
  blue: {
    border: "border-blue-500/50",
    bg: "bg-blue-500/20",
    progress: "bg-blue-500",
  },
  green: {
    border: "border-green-500/50",
    bg: "bg-green-500/20",
    progress: "bg-green-500",
  },
  purple: {
    border: "border-purple-500/50",
    bg: "bg-purple-500/20",
    progress: "bg-purple-500",
  },
};

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  dumbbell: Dumbbell,
  languages: Languages,
  dollar: DollarSign,
  book: BookOpen,
  target: Target,
};

interface GoalCardProps {
  goal: Goal;
  onEdit?: (goal: Goal) => void;
}

export function GoalCard({ goal, onEdit }: GoalCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const deleteGoal = useAppStore((state) => state.deleteGoal);
  const updateGoal = useAppStore((state) => state.updateGoal);

  const styles = colorStyles[goal.color];
  const IconComponent = iconMap[goal.icon || "target"] || Target;

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleDelete = () => {
    deleteGoal(goal.id);
    setShowDeleteConfirm(false);
  };

  const handleProgressChange = (delta: number) => {
    const newProgress = Math.max(0, Math.min(100, goal.progress + delta));
    updateGoal(goal.id, { progress: newProgress });
  };

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.15 }}
        className={cn(
          "relative rounded-xl border-l-4 bg-card p-5",
          styles.border
        )}
      >
        {/* Menu button */}
        <div className="absolute right-3 top-3">
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowMenu(!showMenu)}
              className="rounded-md p-1 text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              aria-label="Goal options"
            >
              <MoreVertical className="size-4" />
            </button>

            {showMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowMenu(false)}
                />
                <div className="absolute right-0 top-full z-20 mt-1 w-36 rounded-md border border-border bg-card py-1 shadow-lg">
                  <button
                    type="button"
                    onClick={() => {
                      setShowMenu(false);
                      onEdit?.(goal);
                    }}
                    className="flex w-full items-center gap-2 px-3 py-1.5 text-sm hover:bg-secondary"
                  >
                    <Edit2 className="size-4" />
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowMenu(false);
                      setShowDeleteConfirm(true);
                    }}
                    className="flex w-full items-center gap-2 px-3 py-1.5 text-sm text-red-500 hover:bg-secondary"
                  >
                    <Trash2 className="size-4" />
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Icon */}
        <div
          className={cn(
            "mb-4 inline-flex size-10 items-center justify-center rounded-lg",
            styles.bg
          )}
        >
          <IconComponent className="size-5 text-foreground/70" />
        </div>

        {/* Title and target */}
        <h3 className="text-base font-semibold italic text-foreground">
          {goal.title}
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Target: {formatDate(goal.target_date)}
        </p>

        {/* Progress */}
        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="tabular-nums font-medium text-foreground">
              {goal.progress}%
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
            <motion.div
              className={cn("h-full rounded-full", styles.progress)}
              initial={{ width: 0 }}
              animate={{ width: `${goal.progress}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
          {/* Quick progress buttons */}
          <div className="flex justify-end gap-1">
            <button
              type="button"
              onClick={() => handleProgressChange(-5)}
              className="rounded px-2 py-0.5 text-xs text-muted-foreground hover:bg-secondary"
              aria-label="Decrease progress by 5%"
            >
              -5%
            </button>
            <button
              type="button"
              onClick={() => handleProgressChange(5)}
              className="rounded px-2 py-0.5 text-xs text-muted-foreground hover:bg-secondary"
              aria-label="Increase progress by 5%"
            >
              +5%
            </button>
          </div>
        </div>
      </motion.div>

      {/* Delete confirmation dialog */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent onClose={() => setShowDeleteConfirm(false)}>
          <DialogHeader>
            <DialogTitle>Delete Goal</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &ldquo;{goal.title}&rdquo;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
