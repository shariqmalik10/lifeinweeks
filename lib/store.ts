"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Task, Goal, UserProfile, UserSettings, TaskInput, GoalInput } from "./types";

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

// Sanitize string input to prevent XSS
function sanitizeString(str: string): string {
  return str
    .replace(/[<>]/g, "")
    .trim()
    .slice(0, 500); // Max length limit
}

interface AppStore {
  // UI state
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;

  // User profile
  profile: UserProfile | null;
  setProfile: (profile: UserProfile | null) => void;
  updateProfile: (updates: Partial<UserProfile>) => void;

  // User settings
  settings: UserSettings;
  updateSettings: (updates: Partial<UserSettings>) => void;

  // Tasks
  tasks: Task[];
  addTask: (input: TaskInput) => Task;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleTaskComplete: (id: string) => void;
  getTasksForDate: (date: string) => Task[];
  getUpcomingTasks: (limit?: number) => Task[];

  // Goals
  goals: Goal[];
  addGoal: (input: GoalInput) => Goal;
  updateGoal: (id: string, updates: Partial<Goal>) => void;
  deleteGoal: (id: string) => void;
}

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      // UI state
      sidebarCollapsed: false,
      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),

      profile: null,
      setProfile: (profile) => set({ profile }),
      updateProfile: (updates) =>
        set((state) => ({
          profile: state.profile
            ? {
                ...state.profile,
                ...updates,
                first_name: updates.first_name
                  ? sanitizeString(updates.first_name)
                  : state.profile.first_name,
                last_name: updates.last_name
                  ? sanitizeString(updates.last_name)
                  : state.profile.last_name,
                updated_at: new Date().toISOString(),
              }
            : null,
        })),

      // Settings
      settings: {
        id: "default",
        user_id: "default",
        dark_mode: false,
        email_notifications: true,
        lifespan_years: 90,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      updateSettings: (updates) =>
        set((state) => ({
          settings: {
            ...state.settings,
            ...updates,
            updated_at: new Date().toISOString(),
          },
        })),

      tasks: [],
      addTask: (input) => {
        const now = new Date().toISOString();
        const task: Task = {
          id: generateId(),
          user_id: get().profile?.id || "default",
          title: sanitizeString(input.title),
          description: input.description ? sanitizeString(input.description) : undefined,
          date: input.date,
          time: input.time,
          priority: input.priority,
          completed: false,
          created_at: now,
          updated_at: now,
        };
        set((state) => ({ tasks: [...state.tasks, task] }));
        return task;
      },
      updateTask: (id, updates) =>
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id
              ? {
                  ...task,
                  ...updates,
                  title: updates.title ? sanitizeString(updates.title) : task.title,
                  description: updates.description
                    ? sanitizeString(updates.description)
                    : task.description,
                  updated_at: new Date().toISOString(),
                }
              : task
          ),
        })),
      deleteTask: (id) =>
        set((state) => ({
          tasks: state.tasks.filter((task) => task.id !== id),
        })),
      toggleTaskComplete: (id) =>
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id
              ? {
                  ...task,
                  completed: !task.completed,
                  updated_at: new Date().toISOString(),
                }
              : task
          ),
        })),
      getTasksForDate: (date) => {
        return get().tasks.filter((task) => task.date === date);
      },
      getUpcomingTasks: (limit = 10) => {
        const today = new Date().toISOString().slice(0, 10);
        return get()
          .tasks.filter((task) => task.date >= today && !task.completed)
          .sort((a, b) => {
            if (a.date !== b.date) return a.date.localeCompare(b.date);
            const priorityOrder = { high: 0, medium: 1, low: 2 };
            return priorityOrder[a.priority] - priorityOrder[b.priority];
          })
          .slice(0, limit);
      },

      goals: [],
      addGoal: (input) => {
        const now = new Date().toISOString();
        const goal: Goal = {
          id: generateId(),
          user_id: get().profile?.id || "default",
          title: sanitizeString(input.title),
          description: input.description ? sanitizeString(input.description) : undefined,
          target_date: input.target_date,
          progress: input.progress ?? 0,
          color: input.color,
          icon: input.icon,
          created_at: now,
          updated_at: now,
        };
        set((state) => ({ goals: [...state.goals, goal] }));
        return goal;
      },
      updateGoal: (id, updates) =>
        set((state) => ({
          goals: state.goals.map((goal) =>
            goal.id === id
              ? {
                  ...goal,
                  ...updates,
                  title: updates.title ? sanitizeString(updates.title) : goal.title,
                  description: updates.description
                    ? sanitizeString(updates.description)
                    : goal.description,
                  progress: updates.progress !== undefined
                    ? Math.max(0, Math.min(100, updates.progress))
                    : goal.progress,
                  updated_at: new Date().toISOString(),
                }
              : goal
          ),
        })),
      deleteGoal: (id) =>
        set((state) => ({
          goals: state.goals.filter((goal) => goal.id !== id),
        })),
    }),
    {
      name: "lifeinweeks-storage",
      version: 2,
      migrate: (persisted: unknown, version: number) => {
        const state = persisted as Record<string, unknown>;
        if (version < 2) {
          const profile = state.profile as { id?: string } | null;
          if (profile?.id === "demo") {
            state.profile = null;
            state.tasks = [];
            state.goals = [];
          }
        }
        return state as AppStore;
      },
      partialize: (state) => ({
        profile: state.profile,
        settings: state.settings,
        tasks: state.tasks,
        goals: state.goals,
        sidebarCollapsed: state.sidebarCollapsed,
      }),
    }
  )
);
