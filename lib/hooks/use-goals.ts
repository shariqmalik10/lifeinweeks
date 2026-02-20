import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as api from "@/lib/api/goals";
import { useAppStore } from "@/lib/store";
import { hasEnvVars } from "@/lib/utils";
import type { Goal, GoalInput } from "@/lib/types";

const GOALS_KEY = ["goals"] as const;

export function useGoals() {
  const localGoals = useAppStore((s) => s.goals);

  const query = useQuery({
    queryKey: GOALS_KEY,
    queryFn: api.fetchGoals,
    enabled: !!hasEnvVars,
  });

  return {
    goals: hasEnvVars ? (query.data ?? []) : localGoals,
    isLoading: hasEnvVars ? query.isLoading : false,
    error: query.error,
  };
}

export function useGoal(id: string) {
  const localGoals = useAppStore((s) => s.goals);
  const localGoal = localGoals.find((g) => g.id === id) ?? null;

  const query = useQuery({
    queryKey: [...GOALS_KEY, id],
    queryFn: () => api.fetchGoalById(id),
    enabled: !!hasEnvVars && !!id,
  });

  return {
    goal: hasEnvVars ? (query.data ?? null) : localGoal,
    isLoading: hasEnvVars ? query.isLoading : false,
  };
}

export function useCreateGoal() {
  const qc = useQueryClient();
  const localAdd = useAppStore((s) => s.addGoal);

  return useMutation({
    mutationFn: (input: GoalInput) => {
      if (!hasEnvVars) {
        localAdd(input);
        return Promise.resolve(null);
      }
      return api.createGoal(input);
    },
    onSuccess: () => {
      if (hasEnvVars) qc.invalidateQueries({ queryKey: GOALS_KEY });
    },
  });
}

export function useUpdateGoal() {
  const qc = useQueryClient();
  const localUpdate = useAppStore((s) => s.updateGoal);

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Goal> }) => {
      if (!hasEnvVars) {
        localUpdate(id, updates);
        return Promise.resolve(null);
      }
      return api.updateGoal(id, updates);
    },
    onSuccess: () => {
      if (hasEnvVars) qc.invalidateQueries({ queryKey: GOALS_KEY });
    },
  });
}

export function useDeleteGoal() {
  const qc = useQueryClient();
  const localDelete = useAppStore((s) => s.deleteGoal);

  return useMutation({
    mutationFn: (id: string) => {
      if (!hasEnvVars) {
        localDelete(id);
        return Promise.resolve();
      }
      return api.deleteGoal(id);
    },
    onSuccess: () => {
      if (hasEnvVars) qc.invalidateQueries({ queryKey: GOALS_KEY });
    },
  });
}
