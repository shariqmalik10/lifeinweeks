import { createClient } from "@/lib/supabase/client";
import type { UserProfile, UserSettings, UserProfileInput, UserSettingsInput } from "@/lib/types";

const supabase = () => createClient();

export async function fetchProfile(): Promise<UserProfile | null> {
  const { data: { user } } = await supabase().auth.getUser();
  if (!user) return null;
  const { data, error } = await supabase()
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();
  if (error && error.code !== "PGRST116") throw error;
  return data;
}

export async function updateProfile(updates: UserProfileInput): Promise<UserProfile> {
  const { data: { user } } = await supabase().auth.getUser();
  if (!user) throw new Error("Not authenticated");
  const { data, error } = await supabase()
    .from("profiles")
    .update(updates)
    .eq("id", user.id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function fetchSettings(): Promise<UserSettings | null> {
  const { data: { user } } = await supabase().auth.getUser();
  if (!user) return null;
  const { data, error } = await supabase()
    .from("user_settings")
    .select("*")
    .eq("user_id", user.id)
    .single();
  if (error && error.code !== "PGRST116") throw error;
  return data;
}

export async function updateSettings(updates: UserSettingsInput): Promise<UserSettings> {
  const { data: { user } } = await supabase().auth.getUser();
  if (!user) throw new Error("Not authenticated");
  const { data, error } = await supabase()
    .from("user_settings")
    .update(updates)
    .eq("user_id", user.id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function signOut(): Promise<void> {
  const { error } = await supabase().auth.signOut();
  if (error) throw error;
}
