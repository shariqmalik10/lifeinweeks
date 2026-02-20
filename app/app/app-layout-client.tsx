"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { AppSidebar } from "@/components/app-sidebar";
import { useAppStore } from "@/lib/store";

interface AppLayoutClientProps {
  children: React.ReactNode;
  userEmail?: string;
}

export function AppLayoutClient({ children, userEmail }: AppLayoutClientProps) {
  const { profile, setProfile, settings, sidebarCollapsed } = useAppStore();

  useEffect(() => {
    if (userEmail && profile && profile.email !== userEmail) {
      setProfile({
        ...profile,
        id: userEmail,
        email: userEmail,
        updated_at: new Date().toISOString(),
      });
    }
  }, [profile, userEmail, setProfile]);

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
            key={typeof window !== "undefined" ? window.location.pathname : ""}
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
