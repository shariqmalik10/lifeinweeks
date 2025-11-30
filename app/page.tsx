import { AuthModal } from "@/components/auth-modal";
import { LifeMatrix } from "@/components/life-matrix/life-matrix";
import { ThemeSwitcher } from "@/components/theme-switcher";
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col justify-center items-center py-8">
      <div className="w-[90%] lg:w-4/5 2xl:w-3/5 4xl:w-1/2 space-y-8">
        <div className="space-y-2">
          <h1>Life in Weeks</h1>
          <p>We live short lives. Take action to make the most out of it.</p>
        </div>
        <LifeMatrix />
      </div>
    </main>
  );
}
