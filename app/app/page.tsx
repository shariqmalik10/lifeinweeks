"use client";

import { useMemo, useState } from "react";
import { motion } from "motion/react";
import { Sunrise, Calendar, Clock, Plane } from "lucide-react";
import { LifeGrid } from "@/components/life-grid";
import { BirthDatePicker } from "@/components/birth-date-picker";
import { useAppStore } from "@/lib/store";
import { cn } from "@/lib/utils";

type TimeUnit = "years" | "months" | "weeks";

export default function OverviewPage() {
  const { profile, settings, updateProfile } = useAppStore();
  const [timeUnit, setTimeUnit] = useState<TimeUnit>("weeks");
  const lifespan = settings.lifespan_years;

  // Calculate birth date with fallback
  const birthDate = useMemo(() => {
    if (profile?.birth_date) {
      return new Date(profile.birth_date);
    }
    // Default to 25 years ago if no birth date set
    const now = new Date();
    return new Date(now.getFullYear() - 25, now.getMonth(), now.getDate());
  }, [profile?.birth_date]);

  // Calculate life stats matching landing page
  const stats = useMemo(() => {
    const now = new Date();
    const msPerDay = 24 * 60 * 60 * 1000;
    const msPerWeek = 7 * msPerDay;
    const msLived = now.getTime() - birthDate.getTime();
    const weeksLived = Math.floor(msLived / msPerWeek);
    const daysLived = Math.floor(msLived / msPerDay);
    const totalWeeks = lifespan * 52;
    const totalDays = lifespan * 365;
    const weeksRemaining = Math.max(0, totalWeeks - weeksLived);
    const daysRemaining = Math.max(0, totalDays - daysLived);
    const percentComplete = Math.min(100, (weeksLived / totalWeeks) * 100);
    const yearsRemaining = Math.max(0, lifespan - Math.floor(weeksLived / 52));

    // Meaningful stats like landing page
    const sunsetsRemaining = daysRemaining;
    const weekendsRemaining = weeksRemaining;
    const awakeHours = weeksRemaining * 112; // ~16 hours/day × 7 days
    const tripsRemaining = yearsRemaining * 2; // ~2 trips per year

    return {
      weeksLived,
      weeksRemaining,
      percentComplete,
      sunsetsRemaining,
      weekendsRemaining,
      awakeHours,
      tripsRemaining,
    };
  }, [birthDate, lifespan]);

  const handleDateChange = (date: Date) => {
    const iso = date.toISOString().slice(0, 10);
    updateProfile({ birth_date: iso });
  };

  return (
    <div className="flex h-[calc(100dvh-4rem)] gap-8">
      {/* Left sidebar - Stats */}
      <div className="w-64 shrink-0 space-y-8 overflow-y-auto">
        {/* Date of birth picker */}
        <div className="space-y-2">
          <label className="text-xs uppercase tracking-wider text-muted-foreground">
            Date of Birth
          </label>
          <BirthDatePicker
            value={birthDate}
            onChange={handleDateChange}
          />
        </div>

        {/* Percentage */}
        <div>
          <div className="tabular-nums text-7xl font-bold text-primary">
            {Math.round(stats.percentComplete)}%
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            of your {lifespan} years is gone.
          </p>
        </div>

        {/* Quote */}
        <blockquote className="border-l-2 border-border pl-4 text-sm italic text-muted-foreground">
          &quot;You&apos;ve burned through {stats.weeksLived.toLocaleString()} weeks, with only{" "}
          {stats.weeksRemaining.toLocaleString()} weeks left until nothing.
          &quot;Someday&quot; is a lie you tell yourself; the clock is a countdown, not
          a promise.&quot;
        </blockquote>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3">
          <StatCard
            icon={Sunrise}
            label="Sunsets"
            value={stats.sunsetsRemaining.toLocaleString()}
          />
          <StatCard
            icon={Calendar}
            label="Weekends"
            value={stats.weekendsRemaining.toLocaleString()}
          />
          <StatCard
            icon={Clock}
            label="Awake Hrs"
            value={stats.awakeHours.toLocaleString()}
          />
          <StatCard
            icon={Plane}
            label="Trips"
            value={stats.tripsRemaining.toLocaleString()}
          />
        </div>

        {/* Granularity toggle */}
        <div className="space-y-2">
          <label className="text-xs uppercase tracking-wider text-muted-foreground">
            Granularity
          </label>
          <div className="flex rounded-lg border border-border bg-card p-1">
            {(["years", "months", "weeks"] as TimeUnit[]).map((unit) => (
              <button
                key={unit}
                type="button"
                onClick={() => setTimeUnit(unit)}
                className={cn(
                  "flex-1 rounded-md px-3 py-1.5 text-xs font-medium uppercase transition-colors",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                  timeUnit === unit
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {unit}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Right side - Life Grid */}
      <div className="flex-1 min-h-0 min-w-0">
        <LifeGrid
          birthDate={birthDate}
          lifespanYears={lifespan}
          timeUnit={timeUnit}
        />
      </div>
    </div>
  );
}

interface StatCardProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}

function StatCard({ icon: Icon, label, value }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="rounded-lg border border-border bg-card p-3"
    >
      <div className="flex items-center gap-2 text-muted-foreground">
        <Icon className="size-4" />
        <span className="text-[10px] uppercase tracking-wider">{label}</span>
      </div>
      <div className="mt-1 tabular-nums text-xl font-semibold text-foreground">
        {value}
      </div>
    </motion.div>
  );
}


