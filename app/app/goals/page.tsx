"use client";

import { useState } from "react";
import { AnimatePresence } from "motion/react";
import { GoalCard } from "@/components/goal-card";
import { GoalForm } from "@/components/goal-form";
import { useAppStore } from "@/lib/store";
import type { Goal } from "@/lib/types";

export default function GoalsPage() {
  const goals = useAppStore((state) => state.goals);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);

  return (
    <div className="mx-auto max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-balance text-3xl font-semibold italic text-foreground">
            Goals & Milestones
          </h1>
          <p className="mt-1 text-pretty text-muted-foreground">
            Track your long-term progress
          </p>
        </div>
        <GoalForm editGoal={editingGoal} onClose={() => setEditingGoal(null)} />
      </div>

      {/* Goals grid */}
      <div className="mt-8">
        {goals.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            <AnimatePresence mode="popLayout">
              {goals.map((goal) => (
                <GoalCard
                  key={goal.id}
                  goal={goal}
                  onEdit={setEditingGoal}
                />
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/50 py-16">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-foreground">
                No goals yet
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Create your first goal to start tracking your progress
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
