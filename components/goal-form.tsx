"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Plus, Dumbbell, Languages, DollarSign, BookOpen, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useAppStore } from "@/lib/store";
import type { Goal, GoalColor } from "@/lib/types";
import { cn } from "@/lib/utils";

const colorOptions: { value: GoalColor; label: string; class: string }[] = [
  { value: "orange", label: "Orange", class: "bg-orange-500" },
  { value: "blue", label: "Blue", class: "bg-blue-500" },
  { value: "green", label: "Green", class: "bg-green-500" },
  { value: "purple", label: "Purple", class: "bg-purple-500" },
];

const iconOptions = [
  { value: "dumbbell", Icon: Dumbbell, label: "Fitness" },
  { value: "languages", Icon: Languages, label: "Learning" },
  { value: "dollar", Icon: DollarSign, label: "Finance" },
  { value: "book", Icon: BookOpen, label: "Reading" },
  { value: "target", Icon: Target, label: "General" },
];

interface GoalFormProps {
  editGoal?: Goal | null;
  onClose?: () => void;
}

export function GoalForm({ editGoal, onClose }: GoalFormProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [color, setColor] = useState<GoalColor>("orange");
  const [icon, setIcon] = useState("target");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const { addGoal, updateGoal } = useAppStore();

  // Handle edit mode
  useEffect(() => {
    if (editGoal) {
      setTitle(editGoal.title);
      setTargetDate(editGoal.target_date);
      setColor(editGoal.color);
      setIcon(editGoal.icon || "target");
      setProgress(editGoal.progress);
      setOpen(true);
    }
  }, [editGoal]);

  const resetForm = () => {
    setTitle("");
    setTargetDate(
      new Date(new Date().getFullYear(), 11, 31).toISOString().slice(0, 10)
    );
    setColor("orange");
    setIcon("target");
    setProgress(0);
    setError(null);
  };

  const handleClose = () => {
    setOpen(false);
    resetForm();
    onClose?.();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setError("Title is required");
      return;
    }
    if (trimmedTitle.length < 2) {
      setError("Title must be at least 2 characters");
      return;
    }
    if (trimmedTitle.length > 100) {
      setError("Title must be less than 100 characters");
      return;
    }
    if (!targetDate) {
      setError("Target date is required");
      return;
    }

    if (editGoal) {
      updateGoal(editGoal.id, {
        title: trimmedTitle,
        target_date: targetDate,
        color,
        icon,
        progress,
      });
    } else {
      addGoal({
        title: trimmedTitle,
        target_date: targetDate,
        color,
        icon,
        progress,
      });
    }

    handleClose();
  };

  return (
    <>
      <Button onClick={() => setOpen(true)} className="gap-2">
        <Plus className="size-4" />
        Add New Goal
      </Button>

      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent onClose={handleClose} className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editGoal ? "Edit Goal" : "New Goal"}</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="goal-title">Title</Label>
              <Input
                id="goal-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="What do you want to achieve?"
                autoFocus
                maxLength={100}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="target-date">Target Date</Label>
              <Input
                id="target-date"
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Icon</Label>
              <div className="flex flex-wrap gap-2">
                {iconOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setIcon(opt.value)}
                    className={cn(
                      "flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                      icon === opt.value
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border text-muted-foreground hover:border-foreground/50"
                    )}
                    aria-label={opt.label}
                  >
                    <opt.Icon className="size-4" />
                    <span className="sr-only md:not-sr-only">{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Color</Label>
              <div className="flex gap-2">
                {colorOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setColor(opt.value)}
                    className={cn(
                      "size-8 rounded-full transition-all",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                      opt.class,
                      color === opt.value && "ring-2 ring-foreground ring-offset-2 ring-offset-background"
                    )}
                    aria-label={opt.label}
                  />
                ))}
              </div>
            </div>

            {editGoal && (
              <div className="space-y-2">
                <Label htmlFor="progress">Progress: {progress}%</Label>
                <input
                  id="progress"
                  type="range"
                  min="0"
                  max="100"
                  value={progress}
                  onChange={(e) => setProgress(Number(e.target.value))}
                  className="w-full accent-primary"
                />
              </div>
            )}

            <AnimatePresence>
              {error && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="text-sm text-red-500"
                >
                  {error}
                </motion.p>
              )}
            </AnimatePresence>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit">{editGoal ? "Save Changes" : "Add Goal"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
