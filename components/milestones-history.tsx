"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Search,
  Dumbbell,
  Languages,
  DollarSign,
  BookOpen,
  Target,
  Briefcase,
  Plane,
  Code,
  Calendar,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Goal, GoalCategory } from "@/lib/types";

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

const categoryLabels: Record<string, string> = {
  health: "Health",
  finance: "Finance",
  career: "Career",
  personal: "Personal",
  skill: "Skill",
  leisure: "Leisure",
};

const categoryColors: Record<string, { bg: string; text: string; fill: string }> = {
  health: { bg: "bg-orange-500/20", text: "text-orange-400", fill: "bg-orange-500" },
  finance: { bg: "bg-green-500/20", text: "text-green-400", fill: "bg-green-500" },
  career: { bg: "bg-cyan-500/20", text: "text-cyan-400", fill: "bg-cyan-500" },
  personal: { bg: "bg-purple-500/20", text: "text-purple-400", fill: "bg-purple-500" },
  skill: { bg: "bg-amber-500/20", text: "text-amber-400", fill: "bg-amber-500" },
  leisure: { bg: "bg-pink-500/20", text: "text-pink-400", fill: "bg-pink-500" },
};

const filterOptions = ["All", "Health", "Finance", "Career", "Personal"] as const;

interface MilestonesHistoryProps {
  goals: Goal[];
}

// Demo completed milestones when none exist
function getDemoCompletedGoals(): Goal[] {
  const now = new Date();
  return [
    {
      id: "hist-1", user_id: "demo", title: "Run a Half Marathon",
      target_date: new Date(now.getFullYear() - 1, 9, 12).toISOString().slice(0, 10),
      progress: 100, color: "orange", icon: "dumbbell", category: "health",
      completed: true, completed_at: new Date(now.getFullYear() - 1, 9, 12).toISOString(),
      created_at: new Date(now.getFullYear() - 1, 6, 1).toISOString(),
      updated_at: new Date(now.getFullYear() - 1, 9, 12).toISOString(),
    },
    {
      id: "hist-2", user_id: "demo", title: "Save $10,000 Fund",
      target_date: new Date(now.getFullYear() - 1, 8, 15).toISOString().slice(0, 10),
      progress: 100, color: "green", icon: "dollar", category: "finance",
      completed: true, completed_at: new Date(now.getFullYear() - 1, 8, 15).toISOString(),
      created_at: new Date(now.getFullYear() - 2, 0, 1).toISOString(),
      updated_at: new Date(now.getFullYear() - 1, 8, 15).toISOString(),
    },
    {
      id: "hist-3", user_id: "demo", title: "Learn Basic Spanish",
      target_date: new Date(now.getFullYear() - 1, 7, 2).toISOString().slice(0, 10),
      progress: 100, color: "blue", icon: "languages", category: "skill",
      completed: true, completed_at: new Date(now.getFullYear() - 1, 7, 2).toISOString(),
      created_at: new Date(now.getFullYear() - 2, 1, 1).toISOString(),
      updated_at: new Date(now.getFullYear() - 1, 7, 2).toISOString(),
    },
    {
      id: "hist-4", user_id: "demo", title: "Read 12 Books",
      target_date: new Date(now.getFullYear() - 2, 11, 20).toISOString().slice(0, 10),
      progress: 100, color: "purple", icon: "book", category: "personal",
      completed: true, completed_at: new Date(now.getFullYear() - 2, 11, 20).toISOString(),
      created_at: new Date(now.getFullYear() - 3, 0, 1).toISOString(),
      updated_at: new Date(now.getFullYear() - 2, 11, 20).toISOString(),
    },
    {
      id: "hist-5", user_id: "demo", title: "Senior Promotion",
      target_date: new Date(now.getFullYear() - 2, 5, 15).toISOString().slice(0, 10),
      progress: 100, color: "blue", icon: "briefcase", category: "career",
      completed: true, completed_at: new Date(now.getFullYear() - 2, 5, 15).toISOString(),
      created_at: new Date(now.getFullYear() - 4, 5, 1).toISOString(),
      updated_at: new Date(now.getFullYear() - 2, 5, 15).toISOString(),
    },
    {
      id: "hist-6", user_id: "demo", title: "Visit Japan",
      target_date: new Date(now.getFullYear() - 2, 3, 10).toISOString().slice(0, 10),
      progress: 100, color: "purple", icon: "plane", category: "leisure",
      completed: true, completed_at: new Date(now.getFullYear() - 2, 3, 10).toISOString(),
      created_at: new Date(now.getFullYear() - 2, 2, 15).toISOString(),
      updated_at: new Date(now.getFullYear() - 2, 3, 10).toISOString(),
    },
    {
      id: "hist-7", user_id: "demo", title: "Build First App",
      target_date: new Date(now.getFullYear() - 2, 0, 15).toISOString().slice(0, 10),
      progress: 100, color: "green", icon: "code", category: "skill",
      completed: true, completed_at: new Date(now.getFullYear() - 2, 0, 15).toISOString(),
      created_at: new Date(now.getFullYear() - 2, 0, 1).toISOString(),
      updated_at: new Date(now.getFullYear() - 2, 0, 15).toISOString(),
    },
  ];
}

export function MilestonesHistory({ goals }: MilestonesHistoryProps) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<string>("All");

  const allGoals = useMemo(() => {
    return goals.length > 0 ? goals : getDemoCompletedGoals();
  }, [goals]);

  const filteredGoals = useMemo(() => {
    return allGoals.filter((g) => {
      const matchesSearch = !search || g.title.toLowerCase().includes(search.toLowerCase());
      const matchesFilter = filter === "All" || (g.category && categoryLabels[g.category]?.toLowerCase() === filter.toLowerCase());
      return matchesSearch && matchesFilter;
    });
  }, [allGoals, search, filter]);

  const stats = useMemo(() => {
    const thisYear = new Date().getFullYear();
    const thisYearGoals = allGoals.filter((g) => g.completed_at && new Date(g.completed_at).getFullYear() === thisYear);
    return {
      total: allGoals.length,
      streak: 12,
      thisYear: thisYearGoals.length,
    };
  }, [allGoals]);

  const getWeeksTaken = (goal: Goal) => {
    if (!goal.completed_at) return 0;
    const start = new Date(goal.created_at);
    const end = new Date(goal.completed_at);
    return Math.max(1, Math.round((end.getTime() - start.getTime()) / (7 * 24 * 60 * 60 * 1000)));
  };

  return (
    <div className="mt-8">
      {/* Header with stats */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Milestones History</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Review your completed goals and achievements over time.
          </p>
        </div>
        <div className="flex gap-3">
          {[
            { label: "Total", value: stats.total },
            { label: "Streak", value: `${stats.streak} Wks` },
            { label: "This Year", value: stats.thisYear },
          ].map((stat) => (
            <div key={stat.label} className="rounded-lg border border-border bg-card px-4 py-2 text-center min-w-[80px]">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{stat.label}</p>
              <p className="text-lg font-bold text-foreground tabular-nums">{stat.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Search and filters */}
      <div className="flex items-center gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search past goals..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-9 pl-10 pr-3 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <select className="h-9 px-3 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
          <option>All Years</option>
          {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map((y) => (
            <option key={y}>{y}</option>
          ))}
        </select>
        <div className="flex gap-1.5">
          {filterOptions.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
                filter === f
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              )}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Goals grid */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <AnimatePresence mode="popLayout">
          {filteredGoals.map((goal) => {
            const cat = goal.category || "personal";
            const colors = categoryColors[cat] || categoryColors.personal;
            const Icon = iconMap[goal.icon || "target"] || Target;
            const weeksTaken = getWeeksTaken(goal);
            const completedDate = goal.completed_at
              ? new Date(goal.completed_at).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" })
              : "N/A";

            return (
              <motion.div
                key={goal.id}
                layout
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.97 }}
                className="rounded-xl border border-border bg-card p-5"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className={cn("size-10 rounded-xl flex items-center justify-center", colors.bg)}>
                    <Icon className={cn("size-5", colors.text)} />
                  </div>
                  <span className={cn("text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border border-border", "text-muted-foreground")}>
                    {categoryLabels[cat] || "Personal"}
                  </span>
                </div>

                <h3 className="text-sm font-semibold text-foreground mt-2">{goal.title}</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Completed {completedDate}
                </p>

                <div className="mt-4 flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Time Taken</span>
                  <span className={cn("text-xs font-bold tabular-nums", colors.text)}>
                    {weeksTaken} Week{weeksTaken !== 1 ? "s" : ""}
                  </span>
                </div>
                <div className="mt-1.5 h-1.5 w-full rounded-full bg-secondary overflow-hidden">
                  <div className={cn("h-full rounded-full", colors.fill)} style={{ width: `${Math.min(100, weeksTaken * 2)}%` }} />
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {filteredGoals.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Calendar className="size-10 text-muted-foreground/40 mb-3" />
          <h3 className="text-lg font-semibold text-foreground">No completed milestones yet</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Complete your active goals to build your history.
          </p>
        </div>
      )}

      {filteredGoals.length > 6 && (
        <div className="flex justify-center mt-8">
          <button className="px-6 py-2 rounded-lg border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors">
            Load More History
          </button>
        </div>
      )}
    </div>
  );
}
