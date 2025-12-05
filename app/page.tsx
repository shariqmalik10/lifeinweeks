"use client";

import { useState, useMemo } from "react";
import { HeroInput, LifeDashboard } from "@/components/life-in-weeks";

export default function Home() {
  // Default to 25 years ago per DESIGN.md
  const defaultDate = useMemo(() => {
    const now = new Date();
    return new Date(now.getFullYear() - 25, now.getMonth(), now.getDate());
  }, []);

  const [birthDate, setBirthDate] = useState<Date>(defaultDate);
  const [lifespan, setLifespan] = useState<number>(90);
  const [hasInteracted, setHasInteracted] = useState(false);

  const handleDateSubmit = (date: Date, newLifespan: number) => {
    setBirthDate(date);
    setLifespan(newLifespan);
    setHasInteracted(true);
  };

  // Example AI insight - in production this would come from Gemini API
  const aiInsight = hasInteracted 
    ? "You are dying. Every moment you hesitate is a moment lost forever. Live now."
    : undefined;

  return (
    <main className="relative z-10 min-h-screen">
      {/* Hero Section */}
      <section className="min-h-screen flex flex-col justify-center items-center px-4 py-16">
        <HeroInput onDateSubmit={handleDateSubmit} defaultDate={defaultDate} />
      </section>

      {/* Dashboard Section - Shows after interaction or with default data */}
      {hasInteracted && (
        <section className="px-4 py-16 max-w-6xl mx-auto">
          <LifeDashboard 
            birthDate={birthDate} 
            lifespan={lifespan}
            aiInsight={aiInsight}
          />
        </section>
      )}

      {/* Initial Preview - Shows before interaction */}
      {!hasInteracted && (
        <section className="px-4 pb-16 max-w-6xl mx-auto">
          <div className="text-center space-y-4 mb-8">
            <p className="text-muted-foreground">
              Enter your birth date above to see your life visualized
            </p>
          </div>
          <LifeDashboard 
            birthDate={birthDate} 
            lifespan={lifespan}
          />
        </section>
      )}
    </main>
  );
}
