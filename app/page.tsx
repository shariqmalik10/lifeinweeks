import { AuthModal } from "@/components/auth-modal";
import { ThemeSwitcher } from "@/components/theme-switcher";
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col">
      <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
        <div className="w-full max-w-5xl flex justify-between items-center p-3 px-5 text-sm">
          <div className="flex gap-5 items-center font-semibold">
            <Link href={"/"}>My App</Link>
          </div>
          <div className="flex items-center gap-4">
            <AuthModal />
            <ThemeSwitcher />
          </div>
        </div>
      </nav>

      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-6xl font-bold mb-6">Welcome to My App</h1>
          <p className="text-xl text-muted-foreground max-w-2xl">
            Your application is ready to go! Sign in to get started.
          </p>
        </div>
      </div>
    </main>
  );
}
