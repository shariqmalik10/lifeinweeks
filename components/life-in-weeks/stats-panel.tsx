"use client";

import { useMemo } from "react";

interface StatsPanelProps {
  birthDate: Date;
  lifespan?: number;
  aiInsight?: string;
}

interface LifeStats {
  weeksLived: number;
  weeksRemaining: number;
  totalWeeks: number;
  percentComplete: number;
  summersLeft: number;
  mondaysLeft: number;
  mealsRemaining: number;
  awakeHoursRemaining: number;
  yearsLived: number;
  yearsRemaining: number;
}

function calculateLifeStats(birthDate: Date, lifespan: number): LifeStats {
  const now = new Date();
  const msPerWeek = 7 * 24 * 60 * 60 * 1000;
  
  const msLived = now.getTime() - birthDate.getTime();
  const weeksLived = Math.floor(msLived / msPerWeek);
  
  const totalWeeks = lifespan * 52;
  const weeksRemaining = Math.max(0, totalWeeks - weeksLived);
  const percentComplete = Math.min(100, (weeksLived / totalWeeks) * 100);
  
  const yearsLived = Math.floor(weeksLived / 52);
  const yearsRemaining = Math.max(0, lifespan - yearsLived);
  
  return {
    weeksLived,
    weeksRemaining,
    totalWeeks,
    percentComplete,
    summersLeft: yearsRemaining,
    mondaysLeft: weeksRemaining,
    mealsRemaining: weeksRemaining * 21,
    awakeHoursRemaining: weeksRemaining * 112, // 16 hours awake per day * 7
    yearsLived,
    yearsRemaining,
  };
}

function formatNumber(num: number): string {
  return num.toLocaleString();
}

export function StatsPanel({ birthDate, lifespan = 90, aiInsight }: StatsPanelProps) {
  const stats = useMemo(() => calculateLifeStats(birthDate, lifespan), [birthDate, lifespan]);

  return (
    <div className="w-full space-y-6">
      {/* AI Insight Quote */}
      {aiInsight && (
        <div className="text-center py-4 border-b border-border">
          <p className="font-serif text-xl md:text-2xl italic text-foreground/90 leading-relaxed">
            "{aiInsight}"
          </p>
        </div>
      )}

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Life Progress</span>
          <span className="font-serif">{stats.percentComplete.toFixed(1)}%</span>
        </div>
        <div className="h-2 bg-secondary rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary transition-all duration-500 ease-out"
            style={{ width: `${stats.percentComplete}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{formatNumber(stats.weeksLived)} weeks lived</span>
          <span>{formatNumber(stats.weeksRemaining)} weeks remaining</span>
        </div>
      </div>

      {/* Life Currency Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <LifeCurrencyCard
          label="Summers Left"
          value={stats.summersLeft}
          sublabel="years remaining"
        />
        <LifeCurrencyCard
          label="Mondays Left"
          value={stats.mondaysLeft}
          sublabel="weeks remaining"
        />
        <LifeCurrencyCard
          label="Meals Remaining"
          value={stats.mealsRemaining}
          sublabel="~21 per week"
        />
        <LifeCurrencyCard
          label="Awake Hours"
          value={stats.awakeHoursRemaining}
          sublabel="~112 per week"
        />
      </div>
    </div>
  );
}

interface LifeCurrencyCardProps {
  label: string;
  value: number;
  sublabel: string;
}

function LifeCurrencyCard({ label, value, sublabel }: LifeCurrencyCardProps) {
  return (
    <div className="bg-card border border-border rounded-lg p-4 space-y-1">
      <p className="text-xs text-muted-foreground uppercase tracking-wider">{label}</p>
      <p className="font-serif text-2xl md:text-3xl font-medium text-foreground">
        {formatNumber(value)}
      </p>
      <p className="text-xs text-muted-foreground">{sublabel}</p>
    </div>
  );
}

