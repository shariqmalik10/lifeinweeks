"use client";

import { useState, useMemo } from "react";
import { AnimatePresence } from "motion/react";
import { Trophy, SlidersHorizontal } from "lucide-react";
import { GoalCard, CreateMilestoneCard } from "@/components/goal-card";
import { GoalForm } from "@/components/goal-form";
import { MilestonesHistory } from "@/components/milestones-history";
import { useAppStore } from "@/lib/store";
import type { Goal } from "@/lib/types";
import { cn } from "@/lib/utils";

type ViewTab = "active" | "history";

export default function GoalsPage() {
  const goals = useAppStore((s) => s.goals);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [activeTab, setActiveTab] = useState<ViewTab>("active");

  const activeGoals = useMemo(() => goals.filter((g) => !g.completed), [goals]);
  const completedGoals = useMemo(() => goals.filter((g) => g.completed), [goals]);

  const stats = useMemo(() => {
    const now = new Date();
    const onTrack = activeGoals.filter((g) => {
      const target = new Date(g.target_date);
      const totalDays = (target.getTime() - new Date(g.created_at).getTime()) / (1000 * 60 * 60 * 24);
      const elapsed = (now.getTime() - new Date(g.created_at).getTime()) / (1000 * 60 * 60 * 24);
      const expectedProgress = Math.min(100, (elapsed / totalDays) * 100);
      return g.progress >= expectedProgress * 0.8;
    }).length;
    const urgent = activeGoals.filter((g) => {
      const target = new Date(g.target_date);
      const diff = (target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
      return diff > 0 && diff <= 90;
    }).length;
    return { onTrack, urgent };
  }, [activeGoals]);

  return (
    <div className="mx-auto max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Trophy className="size-6 text-primary" />
          <h1 className="text-2xl font-semibold text-foreground">
            Life Milestones
          </h1>
        </div>
        <div className="flex items-center gap-2">
          {/* Tab switcher */}
          <div className="flex bg-secondary rounded-lg p-0.5 mr-2">
            <button
              onClick={() => setActiveTab("active")}
              className={cn(
                "px-3 py-1.5 text-xs font-medium rounded-md transition-colors",
                activeTab === "active"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Active
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={cn(
                "px-3 py-1.5 text-xs font-medium rounded-md transition-colors",
                activeTab === "history"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              History
            </button>
          </div>

          <GoalForm
            editGoal={editingGoal}
            onClose={() => setEditingGoal(null)}
          />
          <button className="p-2 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors">
            <SlidersHorizontal className="size-4" />
          </button>
        </div>
      </div>

      {activeTab === "active" ? (
        <>
          {/* Active Goals grid */}
          <div className="mt-8">
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              <AnimatePresence mode="popLayout">
                {activeGoals.map((goal) => (
                  <GoalCard
                    key={goal.id}
                    goal={goal}
                    onEdit={setEditingGoal}
                  />
                ))}
              </AnimatePresence>
              <CreateMilestoneCard onClick={() => setShowCreateForm(true)} />
            </div>
          </div>

          {/* Create form triggered by card */}
          {showCreateForm && (
            <GoalForm
              triggerButton={false}
              editGoal={null}
              onClose={() => setShowCreateForm(false)}
            />
          )}

          {/* Status bar */}
          <div className="mt-10 flex items-center justify-between border-t border-border pt-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-4">
              {stats.onTrack > 0 && (
                <span className="flex items-center gap-1.5">
                  <span className="size-2 rounded-full bg-green-500" />
                  {stats.onTrack} Goal{stats.onTrack !== 1 ? "s" : ""} on Track
                </span>
              )}
              {stats.urgent > 0 && (
                <span className="flex items-center gap-1.5">
                  <span className="size-2 rounded-full bg-orange-500" />
                  {stats.urgent} Urgent Goal{stats.urgent !== 1 ? "s" : ""}
                </span>
              )}
            </div>
            <span className="uppercase tracking-wider font-medium">
              System Active · Last Synced 2m ago
            </span>
          </div>
        </>
      ) : (
        <MilestonesHistory goals={completedGoals} />
      )}
    </div>
  );
}
