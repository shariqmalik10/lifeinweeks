import { createClient } from "@/lib/supabase/client";
import type { Goal, GoalInput } from "@/lib/types";

const supabase = () => createClient();

export async function fetchGoals(): Promise<Goal[]> {
  const { data, error } = await supabase()
    .from("goals")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function fetchGoalById(id: string): Promise<Goal | null> {
  const { data, error } = await supabase()
    .from("goals")
    .select("*")
    .eq("id", id)
    .single();
  if (error && error.code !== "PGRST116") throw error;
  return data;
}

export async function createGoal(input: GoalInput): Promise<Goal> {
  const { data: { user } } = await supabase().auth.getUser();
  const { data, error } = await supabase()
    .from("goals")
    .insert({ ...input, user_id: user?.id, progress: input.progress ?? 0 })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateGoal(id: string, updates: Partial<Goal>): Promise<Goal> {
  const { data, error } = await supabase()
    .from("goals")
    .update(updates)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteGoal(id: string): Promise<void> {
  const { error } = await supabase().from("goals").delete().eq("id", id);
  if (error) throw error;
}
