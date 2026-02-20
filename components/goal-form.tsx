"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Plus,
  Dumbbell,
  Languages,
  DollarSign,
  BookOpen,
  Target,
  Flag,
  TrendingUp,
  Calendar,
  Briefcase,
  Plane,
  Code,
  Trash2,
  ChevronRight,
  Info,
  Save,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { useAppStore } from "@/lib/store";
import type { Goal, GoalColor, GoalCategory, ReminderFrequency } from "@/lib/types";
import { GOAL_CATEGORIES, REMINDER_OPTIONS } from "@/lib/types";
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
  { value: "briefcase", Icon: Briefcase, label: "Career" },
  { value: "plane", Icon: Plane, label: "Travel" },
  { value: "code", Icon: Code, label: "Tech" },
];

const categoryIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  health: Dumbbell,
  finance: DollarSign,
  career: Briefcase,
  personal: Flag,
  skill: Languages,
  leisure: Plane,
};

interface GoalFormProps {
  editGoal?: Goal | null;
  onClose?: () => void;
  triggerButton?: boolean;
}

export function GoalForm({ editGoal, onClose, triggerButton = true }: GoalFormProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [color, setColor] = useState<GoalColor>("orange");
  const [icon, setIcon] = useState("target");
  const [category, setCategory] = useState<GoalCategory>("personal");
  const [targetMetric, setTargetMetric] = useState("");
  const [reminderFrequency, setReminderFrequency] = useState<ReminderFrequency>("weekly");
  const [description, setDescription] = useState("");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const { addGoal, updateGoal, deleteGoal, profile, settings } = useAppStore();

  // Auto-open when used without trigger button (e.g., from CreateMilestoneCard)
  useEffect(() => {
    if (!triggerButton && !editGoal) {
      setOpen(true);
    }
  }, [triggerButton, editGoal]);

  const approxWeek = useMemo(() => {
    if (!targetDate || !profile?.birth_date) return null;
    const birth = new Date(profile.birth_date);
    const target = new Date(targetDate);
    const msPerWeek = 7 * 24 * 60 * 60 * 1000;
    return Math.floor((target.getTime() - birth.getTime()) / msPerWeek);
  }, [targetDate, profile?.birth_date]);

  useEffect(() => {
    if (editGoal) {
      setTitle(editGoal.title);
      setTargetDate(editGoal.target_date);
      setColor(editGoal.color);
      setIcon(editGoal.icon || "target");
      setCategory(editGoal.category || "personal");
      setTargetMetric(editGoal.target_metric || "");
      setReminderFrequency(editGoal.reminder_frequency || "weekly");
      setDescription(editGoal.description || "");
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
    setCategory("personal");
    setTargetMetric("");
    setReminderFrequency("weekly");
    setDescription("");
    setProgress(0);
    setError(null);
    setShowIconPicker(false);
    setShowDeleteConfirm(false);
  };

  const handleClose = () => {
    setOpen(false);
    resetForm();
    onClose?.();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedTitle = title.trim();
    if (!trimmedTitle) { setError("Goal name is required"); return; }
    if (trimmedTitle.length < 2) { setError("Goal name must be at least 2 characters"); return; }
    if (trimmedTitle.length > 100) { setError("Goal name must be less than 100 characters"); return; }
    if (!targetDate) { setError("Target date is required"); return; }

    const input = {
      title: trimmedTitle,
      target_date: targetDate,
      color,
      icon,
      category,
      target_metric: targetMetric.trim() || undefined,
      reminder_frequency: reminderFrequency,
      description: description.trim() || undefined,
      progress: editGoal ? progress : 0,
    };

    if (editGoal) {
      updateGoal(editGoal.id, input);
    } else {
      addGoal(input);
    }
    handleClose();
  };

  const handleDelete = () => {
    if (editGoal) {
      deleteGoal(editGoal.id);
      handleClose();
    }
  };

  const CategoryIcon = categoryIcons[category] || Flag;
  const SelectedIcon = iconOptions.find(o => o.value === icon)?.Icon || Target;

  if (editGoal) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent onClose={handleClose} className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl">Edit Goal Configuration</DialogTitle>
            <DialogDescription>
              Update details for &ldquo;{editGoal.title}&rdquo;
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-5 mt-2">
            {/* Goal Name */}
            <div className="space-y-2">
              <Label htmlFor="edit-title" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Goal Name
              </Label>
              <Input
                id="edit-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Health & Fitness"
                autoFocus
                maxLength={100}
              />
            </div>

            {/* Category + Icon row */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Category</Label>
                <Select value={category} onValueChange={(v) => setCategory(v as GoalCategory)}>
                  <SelectTrigger>
                    <span>{GOAL_CATEGORIES.find(c => c.value === category)?.label || "Select..."}</span>
                  </SelectTrigger>
                  <SelectContent>
                    {GOAL_CATEGORIES.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Icon</Label>
                <div className="flex items-center gap-3">
                  <div className={cn("size-10 rounded-lg flex items-center justify-center", `bg-${color}-500/20`)}>
                    <SelectedIcon className={cn("size-5", `text-${color}-400`)} />
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowIconPicker(!showIconPicker)}
                    className="text-xs font-medium text-primary hover:underline"
                  >
                    Change Icon
                  </button>
                </div>
                <AnimatePresence>
                  {showIconPicker && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="flex flex-wrap gap-1.5 pt-1"
                    >
                      {iconOptions.map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => { setIcon(opt.value); setShowIconPicker(false); }}
                          className={cn(
                            "flex items-center justify-center size-9 rounded-lg border transition-colors",
                            icon === opt.value
                              ? "border-primary bg-primary/10"
                              : "border-border hover:border-foreground/50"
                          )}
                          title={opt.label}
                        >
                          <opt.Icon className="size-4" />
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Target & Timeline section */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
                Target & Timeline
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-target-date" className="text-xs text-muted-foreground">Target Date</Label>
                  <Input
                    id="edit-target-date"
                    type="date"
                    value={targetDate}
                    onChange={(e) => setTargetDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Reminder Frequency</Label>
                  <Select value={reminderFrequency} onValueChange={(v) => setReminderFrequency(v as ReminderFrequency)}>
                    <SelectTrigger>
                      <span>{REMINDER_OPTIONS.find(r => r.value === reminderFrequency)?.label || "Select..."}</span>
                    </SelectTrigger>
                    <SelectContent>
                      {REMINDER_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Progress slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs text-muted-foreground">Current Progress</Label>
                <span className="text-sm font-bold text-primary tabular-nums">{progress}%</span>
              </div>
              <div className="relative">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={progress}
                  onChange={(e) => setProgress(Number(e.target.value))}
                  className="w-full accent-primary h-2"
                />
                <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                  <span>0%</span>
                  <span>50%</span>
                  <span>100%</span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="edit-description" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Description / Motivation
              </Label>
              <textarea
                id="edit-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What motivates you to achieve this goal?"
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-y"
                maxLength={500}
              />
            </div>

            {/* Color picker */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Color</Label>
              <div className="flex gap-2">
                {colorOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setColor(opt.value)}
                    className={cn(
                      "size-7 rounded-full transition-all",
                      opt.class,
                      color === opt.value && "ring-2 ring-foreground ring-offset-2 ring-offset-background"
                    )}
                    aria-label={opt.label}
                  />
                ))}
              </div>
            </div>

            {/* Delete goal section */}
            <div
              className="flex items-center justify-between rounded-lg border border-red-500/30 bg-red-500/5 px-4 py-3 cursor-pointer hover:bg-red-500/10 transition-colors"
              onClick={() => setShowDeleteConfirm(true)}
            >
              <div className="flex items-center gap-2.5">
                <Trash2 className="size-4 text-red-500" />
                <div>
                  <span className="text-sm font-medium text-red-500">Delete Goal</span>
                  <p className="text-xs text-muted-foreground">This action cannot be undone.</p>
                </div>
              </div>
              <ChevronRight className="size-4 text-muted-foreground" />
            </div>

            <AnimatePresence>
              {showDeleteConfirm && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-center gap-2 pt-1"
                >
                  <p className="text-sm text-red-400 flex-1">Are you sure?</p>
                  <Button type="button" variant="outline" size="sm" onClick={() => setShowDeleteConfirm(false)}>
                    No
                  </Button>
                  <Button type="button" variant="destructive" size="sm" onClick={handleDelete}>
                    Yes, Delete
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>

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
              <Button type="submit" className="gap-2">
                <Save className="size-4" />
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    );
  }

  // CREATE mode
  return (
    <>
      {triggerButton && (
        <Button onClick={() => setOpen(true)} className="gap-2">
          <Plus className="size-4" />
          Add New Goal
        </Button>
      )}

      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent onClose={handleClose} className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl">Create New Milestone</DialogTitle>
            <DialogDescription>
              Set a new target for your life journey.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-5 mt-2">
            {/* Goal Name */}
            <div className="space-y-2">
              <Label htmlFor="goal-title" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Goal Name
              </Label>
              <div className="relative">
                <Flag className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  id="goal-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Learn Spanish"
                  className="pl-10"
                  autoFocus
                  maxLength={100}
                />
              </div>
            </div>

            {/* Category + Target Metric row */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Category</Label>
                <Select value={category} onValueChange={(v) => setCategory(v as GoalCategory)}>
                  <SelectTrigger>
                    <div className="flex items-center gap-2">
                      <CategoryIcon className="size-4 text-muted-foreground" />
                      <span>{GOAL_CATEGORIES.find(c => c.value === category)?.label || "Select..."}</span>
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    {GOAL_CATEGORIES.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="target-metric" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Target Metric
                </Label>
                <div className="relative">
                  <TrendingUp className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    id="target-metric"
                    value={targetMetric}
                    onChange={(e) => setTargetMetric(e.target.value)}
                    placeholder="e.g., $10,000"
                    className="pl-10"
                    maxLength={50}
                  />
                </div>
              </div>
            </div>

            {/* Target Completion Date */}
            <div className="space-y-2">
              <Label htmlFor="target-date" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Target Completion Date
              </Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  id="target-date"
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="pl-10"
                />
              </div>
              {approxWeek && (
                <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Info className="size-3 text-blue-400" />
                  Aiming for approx. Week {approxWeek.toLocaleString()}
                </p>
              )}
            </div>

            {/* Icon selection */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Icon</Label>
              <div className="flex flex-wrap gap-1.5">
                {iconOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setIcon(opt.value)}
                    className={cn(
                      "flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs transition-colors",
                      icon === opt.value
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border text-muted-foreground hover:border-foreground/50"
                    )}
                  >
                    <opt.Icon className="size-3.5" />
                    <span>{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Color picker */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Color</Label>
              <div className="flex gap-2">
                {colorOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setColor(opt.value)}
                    className={cn(
                      "size-7 rounded-full transition-all",
                      opt.class,
                      color === opt.value && "ring-2 ring-foreground ring-offset-2 ring-offset-background"
                    )}
                    aria-label={opt.label}
                  />
                ))}
              </div>
            </div>

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
              <Button type="submit" className="gap-2">
                <Plus className="size-4" />
                Create Milestone
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

export function GoalFormTrigger({ onOpen }: { onOpen: () => void }) {
  return (
    <Button onClick={onOpen} className="gap-2">
      <Plus className="size-4" />
      Add New Goal
    </Button>
  );
}
