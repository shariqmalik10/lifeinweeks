"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, BarChart3, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { name: "Timeline", href: "/app", icon: LayoutGrid },
  { name: "Insights", href: "/app/insights", icon: BarChart3 },
  { name: "Settings", href: "/app/settings", icon: Settings },
];

export function MobileBottomNav() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/app") return pathname === "/app" || pathname === "/app/dashboard";
    return pathname.startsWith(href);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-card/95 backdrop-blur-md md:hidden">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 px-4 py-1.5 rounded-lg transition-colors",
                active ? "text-primary" : "text-muted-foreground"
              )}
            >
              <item.icon className={cn("size-5", active && "text-primary")} />
              <span className="text-[10px] font-medium">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
