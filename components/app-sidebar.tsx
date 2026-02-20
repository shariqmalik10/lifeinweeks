"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import {
  LayoutGrid,
  Target,
  Clock,
  BarChart3,
  Settings,
  PanelLeftClose,
  PanelLeft,
  Calendar,
  LogOut,
} from "lucide-react";
import { cn, hasEnvVars } from "@/lib/utils";
import { useAppStore } from "@/lib/store";
import { createClient } from "@/lib/supabase/client";

const navItems = [
  { name: "Overview", href: "/app", icon: LayoutGrid },
  { name: "Goals", href: "/app/goals", icon: Target },
  { name: "Planner", href: "/app/planner", icon: Calendar },
  { name: "Timeline", href: "/app/timeline", icon: Clock },
  { name: "Insights", href: "/app/insights", icon: BarChart3 },
];

interface NavLinkProps {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
  isActive: boolean;
  collapsed: boolean;
}

function NavLink({ href, icon: Icon, children, isActive, collapsed }: NavLinkProps) {
  return (
    <Link
      href={href}
      className={cn(
        "group relative flex items-center gap-3 rounded-lg mx-3 px-3 py-2.5 text-sm font-medium transition-all",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
        isActive
          ? "bg-primary/10 text-primary"
          : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground",
        collapsed && "justify-center px-0 mx-2"
      )}
      title={collapsed ? String(children) : undefined}
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
      {!collapsed && (
        <span className="relative z-10 tracking-wide">{children}</span>
      )}
    </Link>
  );
}

interface AppSidebarProps {
  userEmail?: string;
}

export function AppSidebar({ userEmail }: AppSidebarProps) {
  const pathname = usePathname();
  const profile = useAppStore((s) => s.profile);
  const settings = useAppStore((s) => s.settings);
  const collapsed = useAppStore((s) => s.sidebarCollapsed);
  const toggleSidebar = useAppStore((s) => s.toggleSidebar);
  const [showSettings, setShowSettings] = useState(false);

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
    if (profile?.first_name && profile?.last_name) {
      return `${profile.first_name} ${profile.last_name}`;
    }
    return userEmail || profile?.email || "User";
  }, [profile, userEmail]);

  const weekInfo = useMemo(() => {
    if (!profile?.birth_date) return null;
    const birth = new Date(profile.birth_date);
    const now = new Date();
    const msPerWeek = 7 * 24 * 60 * 60 * 1000;
    const currentWeek = Math.floor((now.getTime() - birth.getTime()) / msPerWeek);
    const totalWeeks = (settings?.lifespan_years || 90) * 52;
    return { currentWeek, totalWeeks };
  }, [profile?.birth_date, settings?.lifespan_years]);

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-30 flex flex-col border-r border-border bg-card transition-all duration-300 ease-in-out",
        collapsed ? "w-[var(--sidebar-collapsed-width)]" : "w-[var(--sidebar-width)]"
      )}
    >
      {/* Header: Logo + collapse toggle */}
      <div className={cn(
        "flex items-center pt-6 pb-4",
        collapsed ? "justify-center px-2" : "justify-between px-5"
      )}>
        {!collapsed ? (
          <Link href="/app" className="flex flex-col leading-tight">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              Life in Weeks
            </span>
            <span className="text-[10px] text-muted-foreground mt-0.5">
              Mission Control
            </span>
          </Link>
        ) : (
          <Link href="/app" className="flex items-center justify-center size-9 rounded-lg bg-primary text-primary-foreground font-bold text-sm">
            LW
          </Link>
        )}
        <button
          onClick={toggleSidebar}
          className={cn(
            "text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md hover:bg-secondary/60",
            collapsed && "mt-3"
          )}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <PanelLeft className="size-4" /> : <PanelLeftClose className="size-4" />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-2 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.href}
            href={item.href}
            icon={item.icon}
            isActive={isActive(item.href)}
            collapsed={collapsed}
          >
            {item.name}
          </NavLink>
        ))}
      </nav>

      {/* User section with settings hover */}
      <div className="border-t border-border p-3">
        <div
          className="relative"
          onMouseEnter={() => setShowSettings(true)}
          onMouseLeave={() => setShowSettings(false)}
        >
          <div className={cn(
            "flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-secondary/50 cursor-pointer",
            collapsed && "justify-center p-1.5"
          )}>
            <div className="flex size-9 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground shrink-0">
              {initials}
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <div className="truncate text-sm font-medium text-foreground">
                  {displayName}
                </div>
                {weekInfo && (
                  <div className="mt-0.5">
                    <div className="text-[10px] text-primary tabular-nums">
                      Week {weekInfo.currentWeek.toLocaleString()} of {weekInfo.totalWeeks.toLocaleString()}
                    </div>
                    <div className="mt-1 h-1 w-full rounded-full bg-secondary overflow-hidden">
                      <div
                        className="h-full rounded-full bg-primary transition-all"
                        style={{ width: `${Math.min(100, (weekInfo.currentWeek / weekInfo.totalWeeks) * 100)}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Settings popup on hover */}
          <AnimatePresence>
            {showSettings && (
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 4 }}
                transition={{ duration: 0.15 }}
                className={cn(
                  "absolute bottom-full mb-1 rounded-lg border border-border bg-card shadow-xl overflow-hidden z-50",
                  collapsed ? "left-full ml-2 bottom-0 mb-0 w-40" : "left-0 right-0"
                )}
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
