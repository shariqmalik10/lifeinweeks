import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as api from "@/lib/api/tasks";
import { useAppStore } from "@/lib/store";
import { hasEnvVars } from "@/lib/utils";
import type { Task, TaskInput } from "@/lib/types";

const TASKS_KEY = ["tasks"] as const;

export function useTasks() {
  const localTasks = useAppStore((s) => s.tasks);

  const query = useQuery({
    queryKey: TASKS_KEY,
    queryFn: api.fetchTasks,
    enabled: !!hasEnvVars,
  });

  return {
    tasks: hasEnvVars ? (query.data ?? []) : localTasks,
    isLoading: hasEnvVars ? query.isLoading : false,
    error: query.error,
  };
}

export function useTasksForDate(date: string) {
  const localTasks = useAppStore((s) => s.getTasksForDate(date));

  const query = useQuery({
    queryKey: [...TASKS_KEY, date],
    queryFn: () => api.fetchTasksForDate(date),
    enabled: !!hasEnvVars && !!date,
  });

  return {
    tasks: hasEnvVars ? (query.data ?? []) : localTasks,
    isLoading: hasEnvVars ? query.isLoading : false,
  };
}

export function useCreateTask() {
  const qc = useQueryClient();
  const localAdd = useAppStore((s) => s.addTask);

  return useMutation({
    mutationFn: (input: TaskInput) => {
      if (!hasEnvVars) {
        localAdd(input);
        return Promise.resolve(null);
      }
      return api.createTask(input);
    },
    onSuccess: () => {
      if (hasEnvVars) qc.invalidateQueries({ queryKey: TASKS_KEY });
    },
  });
}

export function useUpdateTask() {
  const qc = useQueryClient();
  const localUpdate = useAppStore((s) => s.updateTask);

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Task> }) => {
      if (!hasEnvVars) {
        localUpdate(id, updates);
        return Promise.resolve(null);
      }
      return api.updateTask(id, updates);
    },
    onSuccess: () => {
      if (hasEnvVars) qc.invalidateQueries({ queryKey: TASKS_KEY });
    },
  });
}

export function useDeleteTask() {
  const qc = useQueryClient();
  const localDelete = useAppStore((s) => s.deleteTask);

  return useMutation({
    mutationFn: (id: string) => {
      if (!hasEnvVars) {
        localDelete(id);
        return Promise.resolve();
      }
      return api.deleteTask(id);
    },
    onSuccess: () => {
      if (hasEnvVars) qc.invalidateQueries({ queryKey: TASKS_KEY });
    },
  });
}

export function useToggleTask() {
  const qc = useQueryClient();
  const localToggle = useAppStore((s) => s.toggleTaskComplete);

  return useMutation({
    mutationFn: ({ id, completed }: { id: string; completed: boolean }) => {
      if (!hasEnvVars) {
        localToggle(id);
        return Promise.resolve(null);
      }
      return api.toggleTaskComplete(id, completed);
    },
    onSuccess: () => {
      if (hasEnvVars) qc.invalidateQueries({ queryKey: TASKS_KEY });
    },
  });
}
