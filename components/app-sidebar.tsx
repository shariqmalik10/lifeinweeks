"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import {
  LayoutGrid,
  BarChart3,
  LogOut,
  Settings,
} from "lucide-react";
import { cn, hasEnvVars } from "@/lib/utils";
import { useAppStore } from "@/lib/store";
import { createClient } from "@/lib/supabase/client";

const navItems = [
  { name: "Timeline", href: "/app", icon: LayoutGrid },
  { name: "Insights", href: "/app/insights", icon: BarChart3 },
];

interface NavLinkProps {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
  isActive: boolean;
}

function NavLink({ href, icon: Icon, children, isActive }: NavLinkProps) {
  return (
    <Link
      href={href}
      className={cn(
        "group relative flex items-center gap-3 rounded-lg mx-2 px-3 py-2.5 text-sm font-medium transition-all",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
        isActive
          ? "bg-primary/10 text-primary"
          : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
      )}
    >
      {isActive && (
        <motion.div
          layoutId="activeNav"
          className="absolute inset-0 rounded-lg bg-primary/10"
          initial={false}
          transition={{ type: "spring", stiffness: 500, damping: 35 }}
        />
      )}
      <Icon className={cn("size-5 shrink-0 relative z-10", isActive && "text-primary")} />
      <span className="relative z-10 tracking-wide">{children}</span>
    </Link>
  );
}

interface AppSidebarProps {
  userEmail?: string;
}

export function AppSidebar({ userEmail }: AppSidebarProps) {
  const pathname = usePathname();
  const profile = useAppStore((s) => s.profile);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const isActive = (href: string) => {
    if (href === "/app") return pathname === "/app" || pathname === "/app/dashboard";
    return pathname.startsWith(href);
  };

  const initials = useMemo(() => {
    if (profile?.first_name && profile?.last_name) {
      return `${profile.first_name[0]}${profile.last_name[0]}`.toUpperCase();
    }
    return (userEmail || profile?.email)?.[0]?.toUpperCase() || "U";
  }, [profile, userEmail]);

  const displayName = useMemo(() => {
    if (profile?.first_name) {
      return profile.first_name;
    }
    return userEmail || profile?.email || "User";
  }, [profile, userEmail]);

  return (
    <aside className="fixed inset-y-0 left-0 z-30 flex flex-col w-[var(--sidebar-width)] border-r border-border bg-card max-md:hidden">
      {/* Logo */}
      <div className="px-4 pt-6 pb-6">
        <Link href="/app" className="flex flex-col leading-tight">
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
            Life in Weeks
          </span>
          <span className="text-[10px] text-muted-foreground mt-0.5">
            Mission Control
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-2 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.href}
            href={item.href}
            icon={item.icon}
            isActive={isActive(item.href)}
          >
            {item.name}
          </NavLink>
        ))}
      </nav>

      {/* Profile section at bottom */}
      <div className="border-t border-border p-3">
        <div
          className="relative"
          onMouseEnter={() => setShowProfileMenu(true)}
          onMouseLeave={() => setShowProfileMenu(false)}
        >
          <div className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-secondary/50 cursor-pointer">
            <div className="flex size-8 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground shrink-0">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <div className="truncate text-sm font-medium text-foreground">
                {displayName}
              </div>
            </div>
          </div>

          <AnimatePresence>
            {showProfileMenu && (
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 4 }}
                transition={{ duration: 0.15 }}
                className="absolute bottom-full mb-1 left-0 right-0 rounded-lg border border-border bg-card shadow-xl overflow-hidden z-50"
              >
                <Link
                  href="/app/settings"
                  className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors"
                >
                  <Settings className="size-4" />
                  <span>Settings</span>
                </Link>
                <div className="border-t border-border" />
                <button
                  onClick={async () => {
                    if (hasEnvVars) {
                      const supabase = createClient();
                      await supabase.auth.signOut();
                    }
                    localStorage.removeItem("lifeinweeks-storage");
                    window.location.href = "/";
                  }}
                  className="flex w-full items-center gap-2.5 px-3 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-secondary/60 transition-colors"
                >
                  <LogOut className="size-4" />
                  <span>Sign out</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </aside>
  );
}
