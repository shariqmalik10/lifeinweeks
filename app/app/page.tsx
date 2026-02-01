"use client";

import { useMemo } from "react";
import { LifeGrid, LifeStats } from "@/components/life-grid";
import { MiniCalendar } from "@/components/mini-calendar";
import { TodaySection } from "@/components/today-section";
import { useAppStore } from "@/lib/store";
import { getCurrentPhase } from "@/lib/types";

export default function OverviewPage() {
  const { profile, settings } = useAppStore();

  // Calculate birth date with fallback
  const birthDate = useMemo(() => {
    if (profile?.birth_date) {
      return new Date(profile.birth_date);
    }
    // Default to 30 years ago if no birth date set
    const now = new Date();
    return new Date(now.getFullYear() - 30, now.getMonth(), now.getDate());
  }, [profile?.birth_date]);

  const currentPhase = useMemo(() => {
    return getCurrentPhase(birthDate);
  }, [birthDate]);

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      {/* Header with stats */}
      <LifeStats
        birthDate={birthDate}
        lifespanYears={settings.lifespan_years}
        currentPhase={currentPhase.name}
      />

      {/* Life Grid */}
      <LifeGrid birthDate={birthDate} lifespanYears={settings.lifespan_years} />

      {/* Calendar and Today Section */}
      <div className="grid gap-8 lg:grid-cols-[1fr,320px]">
        <MiniCalendar />
        <TodaySection />
      </div>
    </div>
  );
}


