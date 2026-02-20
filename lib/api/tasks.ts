import { createClient } from "@/lib/supabase/client";
import type { Task, TaskInput } from "@/lib/types";

const supabase = () => createClient();

export async function fetchTasks(): Promise<Task[]> {
  const { data, error } = await supabase()
    .from("tasks")
    .select("*")
    .order("date", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function fetchTasksForDate(date: string): Promise<Task[]> {
  const { data, error } = await supabase()
    .from("tasks")
    .select("*")
    .eq("date", date)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function createTask(input: TaskInput): Promise<Task> {
  const { data: { user } } = await supabase().auth.getUser();
  const { data, error } = await supabase()
    .from("tasks")
    .insert({ ...input, user_id: user?.id })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateTask(id: string, updates: Partial<Task>): Promise<Task> {
  const { data, error } = await supabase()
    .from("tasks")
    .update(updates)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteTask(id: string): Promise<void> {
  const { error } = await supabase().from("tasks").delete().eq("id", id);
  if (error) throw error;
}

export async function toggleTaskComplete(id: string, completed: boolean): Promise<Task> {
  return updateTask(id, { completed });
}
