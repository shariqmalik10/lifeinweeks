import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as api from "@/lib/api/profile";
import { useAppStore } from "@/lib/store";
import { hasEnvVars } from "@/lib/utils";
import type { UserProfileInput, UserSettingsInput } from "@/lib/types";

const PROFILE_KEY = ["profile"] as const;
const SETTINGS_KEY = ["settings"] as const;

export function useProfile() {
  const localProfile = useAppStore((s) => s.profile);

  const query = useQuery({
    queryKey: PROFILE_KEY,
    queryFn: api.fetchProfile,
    enabled: !!hasEnvVars,
  });

  return {
    profile: hasEnvVars ? (query.data ?? null) : localProfile,
    isLoading: hasEnvVars ? query.isLoading : false,
  };
}

export function useUpdateProfile() {
  const qc = useQueryClient();
  const localUpdate = useAppStore((s) => s.updateProfile);

  return useMutation({
    mutationFn: (updates: UserProfileInput) => {
      if (!hasEnvVars) {
        localUpdate(updates);
        return Promise.resolve(null);
      }
      return api.updateProfile(updates);
    },
    onSuccess: () => {
      if (hasEnvVars) qc.invalidateQueries({ queryKey: PROFILE_KEY });
    },
  });
}

export function useSettings() {
  const localSettings = useAppStore((s) => s.settings);

  const query = useQuery({
    queryKey: SETTINGS_KEY,
    queryFn: api.fetchSettings,
    enabled: !!hasEnvVars,
  });

  return {
    settings: hasEnvVars ? (query.data ?? localSettings) : localSettings,
    isLoading: hasEnvVars ? query.isLoading : false,
  };
}

export function useUpdateSettings() {
  const qc = useQueryClient();
  const localUpdate = useAppStore((s) => s.updateSettings);

  return useMutation({
    mutationFn: (updates: UserSettingsInput) => {
      if (!hasEnvVars) {
        localUpdate(updates);
        return Promise.resolve(null);
      }
      return api.updateSettings(updates);
    },
    onSuccess: () => {
      if (hasEnvVars) qc.invalidateQueries({ queryKey: SETTINGS_KEY });
    },
  });
}

export function useSignOut() {
  return useMutation({
    mutationFn: () => {
      if (!hasEnvVars) {
        localStorage.removeItem("lifeinweeks-storage");
        window.location.href = "/";
        return Promise.resolve();
      }
      return api.signOut();
    },
    onSuccess: () => {
      if (hasEnvVars) window.location.href = "/";
    },
  });
}
