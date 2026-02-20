"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { AppSidebar } from "@/components/app-sidebar";
import { useAppStore } from "@/lib/store";

interface UserMeta {
  fullName?: string;
  avatarUrl?: string;
}

interface AppLayoutClientProps {
  children: React.ReactNode;
  userEmail?: string;
  userId?: string;
  userMeta?: UserMeta;
}

export function AppLayoutClient({ children, userEmail, userId, userMeta }: AppLayoutClientProps) {
  const { profile, setProfile, settings, sidebarCollapsed } = useAppStore();
  const pathname = usePathname();
  const initialized = useRef(false);

  useEffect(() => {
    if (!userEmail || initialized.current) return;

    const needsInit = !profile || profile.id === "demo" || profile.email !== userEmail;
    if (!needsInit) {
      initialized.current = true;
      return;
    }

    const nameParts = userMeta?.fullName?.split(" ") ?? [];
    const firstName = nameParts[0] || undefined;
    const lastName = nameParts.slice(1).join(" ") || undefined;

    setProfile({
      id: userId || userEmail,
      email: userEmail,
      first_name: profile?.first_name && profile.id !== "demo" ? profile.first_name : firstName,
      last_name: profile?.last_name && profile.id !== "demo" ? profile.last_name : lastName,
      avatar_url: profile?.avatar_url || userMeta?.avatarUrl,
      birth_date: profile?.birth_date && profile.id !== "demo" ? profile.birth_date : undefined,
      created_at: profile?.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
    initialized.current = true;
  }, [userEmail, userId, userMeta, profile, setProfile]);

  useEffect(() => {
    const root = document.documentElement;
    if (settings.dark_mode) {
      root.setAttribute("data-theme", "dark");
    } else {
      root.removeAttribute("data-theme");
    }
  }, [settings.dark_mode]);

  return (
    <div className="min-h-dvh bg-background">
      <AppSidebar userEmail={userEmail} />
      <main
        className="min-h-dvh transition-all duration-300 ease-in-out"
        style={{
          marginLeft: sidebarCollapsed
            ? "var(--sidebar-collapsed-width)"
            : "var(--sidebar-width)",
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="min-h-dvh p-8"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
