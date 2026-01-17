import Link from "next/link";
import { redirect } from "next/navigation";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { LogoutButton } from "@/components/logout-button";
import { createClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";
import { getDevUser, isDevBypassEnabled } from "@/lib/auth/dev";

function NavLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "rounded-md px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-900 hover:text-white",
      )}
    >
      {children}
    </Link>
  );
}

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const user = data?.claims ?? (isDevBypassEnabled() ? getDevUser() : null);

  if (!user) {
    redirect("/auth/login");
  }

  return (
    <div className="min-h-dvh bg-zinc-950 text-zinc-50">
      <header className="border-b border-zinc-800">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-1">
            <Link
              href="/app/dashboard"
              className="rounded-md px-2 py-1 text-base font-semibold text-white"
            >
              Life in Weeks
            </Link>
            <span className="text-xs text-zinc-500">App</span>
          </div>

          <nav className="flex items-center gap-1">
            <NavLink href="/app/dashboard">Dashboard</NavLink>
            <NavLink href="/app/calendar">Calendar</NavLink>
          </nav>

          <div className="flex items-center gap-3">
            <span className="max-w-44 truncate text-sm text-zinc-400">
              {user.email}
            </span>
            <LogoutButton />
            <ThemeSwitcher />
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 py-6">{children}</main>
    </div>
  );
}


