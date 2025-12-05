"use client";

import { useState, useCallback } from "react";
import { StatsPanel } from "./stats-panel";
import { ViewControls, TimeUnit } from "./view-controls";
import { LifeGrid } from "./life-grid";

interface LifeDashboardProps {
  birthDate: Date;
  lifespan?: number;
  aiInsight?: string;
}

export function LifeDashboard({ birthDate, lifespan = 90, aiInsight }: LifeDashboardProps) {
  const [timeUnit, setTimeUnit] = useState<TimeUnit>("weeks");
  const [focusRemaining, setFocusRemaining] = useState(false);
  const [highlightYear, setHighlightYear] = useState<number | null>(null);

  const birthYear = birthDate.getFullYear();
  const deathYear = birthYear + lifespan;

  const handleJumpToYear = useCallback((year: number) => {
    setHighlightYear(year);
    // Clear highlight after animation
    setTimeout(() => setHighlightYear(null), 2000);
  }, []);

  return (
    <div className="w-full space-y-8">
      {/* Stats Panel */}
      <StatsPanel 
        birthDate={birthDate} 
        lifespan={lifespan} 
        aiInsight={aiInsight}
      />

      {/* View Controls */}
      <ViewControls
        timeUnit={timeUnit}
        onTimeUnitChange={setTimeUnit}
        focusRemaining={focusRemaining}
        onFocusRemainingChange={setFocusRemaining}
        onJumpToYear={handleJumpToYear}
        minYear={birthYear}
        maxYear={deathYear}
      />

      {/* Life Grid */}
      <LifeGrid
        birthDate={birthDate}
        lifespan={lifespan}
        timeUnit={timeUnit}
        focusRemaining={focusRemaining}
        highlightYear={highlightYear}
      />
    </div>
  );
}

