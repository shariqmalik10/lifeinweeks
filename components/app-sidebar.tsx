"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import {
  LayoutGrid,
  Calendar,
  Target,
  Settings,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/lib/store";

const navItems = [
  {
    name: "OVERVIEW",
    href: "/app",
    icon: LayoutGrid,
  },
  {
    name: "PLANNER",
    href: "/app/planner",
    icon: Calendar,
  },
  {
    name: "GOALS",
    href: "/app/goals",
    icon: Target,
  },
  {
    name: "SETTINGS",
    href: "/app/settings",
    icon: Settings,
  },
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
        "group relative flex items-center gap-3 py-3 pl-6 pr-4 text-sm font-medium transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        isActive
          ? "text-foreground"
          : "text-muted-foreground hover:text-foreground"
      )}
    >
      {isActive && (
        <motion.div
          layoutId="activeNav"
          className="absolute inset-y-1 left-0 w-1 rounded-r-full bg-primary"
          initial={false}
          transition={{
            type: "spring",
            stiffness: 500,
            damping: 35,
          }}
        />
      )}
      <Icon className="size-5 shrink-0" />
      <span className="tracking-wide">{children}</span>
    </Link>
  );
}

interface UserAvatarProps {
  firstName?: string;
  lastName?: string;
  email?: string;
}

function UserAvatar({ firstName, lastName, email }: UserAvatarProps) {
  const initials =
    firstName && lastName
      ? `${firstName[0]}${lastName[0]}`.toUpperCase()
      : email?.[0]?.toUpperCase() || "U";

  const displayName =
    firstName && lastName ? `${firstName} ${lastName}` : email || "User";

  return (
    <div className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-secondary/50">
      <div className="flex size-10 items-center justify-center rounded-full bg-primary text-sm font-semibold italic text-primary-foreground">
        {initials}
      </div>
      <div className="flex-1 min-w-0">
        <div className="truncate text-sm font-medium text-foreground">
          {displayName}
        </div>
        <div className="text-xs text-muted-foreground">Pro Plan</div>
      </div>
      <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
    </div>
  );
}

interface AppSidebarProps {
  userEmail?: string;
}

export function AppSidebar({ userEmail }: AppSidebarProps) {
  const pathname = usePathname();
  const profile = useAppStore((state) => state.profile);

  // Determine active route
  const isActive = (href: string) => {
    if (href === "/app") {
      return pathname === "/app" || pathname === "/app/dashboard";
    }
    return pathname.startsWith(href);
  };

  return (
    <aside className="fixed inset-y-0 left-0 z-30 flex w-[var(--sidebar-width)] flex-col border-r border-border bg-card">
      {/* Logo - matching landing page style */}
      <div className="flex flex-col justify-center px-6 pb-6 pt-8">
        <Link href="/app" className="flex flex-col">
          <span className="text-2xl font-light tracking-tight text-foreground">
            Life in
          </span>
          <span className="font-serif text-3xl italic text-primary">
            Weeks.
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4">
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

      {/* User section */}
      <div className="border-t border-border p-4">
        <Link href="/app/settings">
          <UserAvatar
            firstName={profile?.first_name}
            lastName={profile?.last_name}
            email={userEmail || profile?.email}
          />
        </Link>
      </div>
    </aside>
  );
}
