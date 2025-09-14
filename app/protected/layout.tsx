import { AuthButton } from "@/components/auth-button";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { hasEnvVars } from "@/lib/utils";
import Link from "next/link";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen flex flex-col">
      <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
        <div className="w-full max-w-5xl flex justify-between items-center p-3 px-5 text-sm">
          <div className="flex gap-5 items-center font-semibold">
            <Link href={"/"}>My App</Link>
          </div>
          <div className="flex items-center gap-4">
            {hasEnvVars && <AuthButton />}
            <ThemeSwitcher />
          </div>
        </div>
      </nav>
      <div className="flex-1 max-w-5xl mx-auto p-5 w-full">{children}</div>
    </main>
  );
}
