"use client";

import { useMemo, useState } from "react";
import { motion } from "motion/react";
import { Sunrise, Calendar, Clock, Plane, SlidersHorizontal } from "lucide-react";
import { LifeGrid } from "@/components/life-grid";
import { ContextPanel } from "@/components/context-panel";
import { GranularityToggle, type TimeUnit } from "@/components/granularity-toggle";
import { GoalForm } from "@/components/goal-form";
import { BirthDatePicker } from "@/components/birth-date-picker";
import { MobileContextSheet } from "@/components/mobile-context-sheet";
import { useAppStore } from "@/lib/store";

const STOIC_QUOTES = [
  "The clock is a countdown, not a promise.",
  "You could leave life right now. Let that determine what you do, think, and say.",
  "It is not that we have a short time to live, but that we waste a good deal of it.",
  "The only way to do great work is to love what you do.",
  "Time is the most valuable thing a man can spend.",
];

export default function MissionControlPage() {
  const { profile, settings, updateProfile } = useAppStore();
  const [timeUnit, setTimeUnit] = useState<TimeUnit>("weeks");
  const [showGoalForm, setShowGoalForm] = useState(false);
  const lifespan = settings.lifespan_years;

  const birthDate = useMemo(() => {
    if (profile?.birth_date) return new Date(profile.birth_date);
    const now = new Date();
    return new Date(now.getFullYear() - 25, now.getMonth(), now.getDate());
  }, [profile?.birth_date]);

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

    const monthsLived = Math.floor(msLived / (30.44 * msPerDay));
    const totalMonths = lifespan * 12;
    const monthsRemaining = Math.max(0, totalMonths - monthsLived);

    return {
      weeksLived,
      weeksRemaining,
      percentComplete,
      sunsetsRemaining: daysRemaining,
      weekendsRemaining: weeksRemaining,
      awakeHours: weeksRemaining * 112,
      tripsRemaining: yearsRemaining * 2,
      summersLeft: yearsRemaining,
      wintersLeft: yearsRemaining,
      monthsLeft: monthsRemaining,
    };
  }, [birthDate, lifespan]);

  const quote = useMemo(() => {
    const dayOfYear = Math.floor(
      (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24)
    );
    return STOIC_QUOTES[dayOfYear % STOIC_QUOTES.length];
  }, []);

  const handleDateChange = (date: Date) => {
    updateProfile({ birth_date: date.toISOString().slice(0, 10) });
  };

  const unitSpecificStats = useMemo(() => {
    if (timeUnit === "weeks") {
      return [
        { icon: Sunrise, label: "Sunsets", value: stats.sunsetsRemaining.toLocaleString() },
        { icon: Calendar, label: "Weekends", value: stats.weekendsRemaining.toLocaleString() },
        { icon: Clock, label: "Awake Hrs", value: stats.awakeHours.toLocaleString() },
        { icon: Plane, label: "Trips", value: stats.tripsRemaining.toLocaleString() },
      ];
    }
    if (timeUnit === "months") {
      return [
        { icon: Sunrise, label: "Summers Left", value: stats.summersLeft.toLocaleString() },
        { icon: Calendar, label: "Winters Left", value: stats.wintersLeft.toLocaleString() },
        { icon: Clock, label: "Months Left", value: stats.monthsLeft.toLocaleString() },
        { icon: Plane, label: "Trips", value: stats.tripsRemaining.toLocaleString() },
      ];
    }
    // years
    const yearsLived = Math.floor(stats.weeksLived / 52);
    const yearsLeft = lifespan - yearsLived;
    return [
      { icon: Calendar, label: "Passed", value: `${Math.round(stats.percentComplete)}%`, sub: "of life expectancy" },
      { icon: Clock, label: "Remaining", value: `${yearsLeft}`, sub: "years to design" },
    ];
  }, [timeUnit, stats, lifespan]);

  return (
    <div className="flex h-dvh max-md:flex-col max-md:h-auto">
      {/* Center Zone: Stats + Grid */}
      <div className="flex-1 flex flex-col min-w-0 min-h-0 p-5 max-md:p-4">
        {/* Top Bar: Date of Birth + Granularity Toggle */}
        <div className="flex items-center justify-between mb-4 shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Date of Birth
            </span>
            <BirthDatePicker value={birthDate} onChange={handleDateChange} />
          </div>
          <div className="flex items-center gap-3">
            <GranularityToggle value={timeUnit} onChange={setTimeUnit} />
            <button className="p-2 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors max-md:hidden">
              <SlidersHorizontal className="size-4" />
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="flex items-start gap-5 mb-4 shrink-0 max-md:flex-col">
          {/* Big percentage */}
          <div className="shrink-0">
            <motion.p
              key={`percent-${Math.round(stats.percentComplete)}`}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-6xl font-bold text-primary tabular-nums leading-none"
            >
              {Math.round(stats.percentComplete)}%
            </motion.p>
            <p className="text-sm text-muted-foreground mt-1">
              of your {lifespan} years is gone.
            </p>
          </div>

          {/* Stat cards */}
          <div className="flex gap-3 flex-wrap max-md:w-full">
            {unitSpecificStats.map((stat) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="rounded-lg border border-border bg-card px-4 py-3 min-w-[120px] max-md:flex-1"
              >
                <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
                  <stat.icon className="size-3.5" />
                  <span className="text-[10px] font-medium uppercase tracking-wider">{stat.label}</span>
                </div>
                <p className="text-xl font-bold text-foreground tabular-nums">{stat.value}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Insight Quote */}
        <div className="mb-4 shrink-0">
          <div className="border-l-2 border-primary pl-4">
            <p className="text-sm text-muted-foreground italic leading-relaxed">
              &ldquo;{quote}&rdquo;
            </p>
          </div>
        </div>

        {/* Life Grid */}
        <div className="flex-1 min-h-0">
          <LifeGrid
            birthDate={birthDate}
            lifespanYears={lifespan}
            timeUnit={timeUnit}
          />
        </div>
      </div>

      {/* Right Context Panel (desktop) */}
      <ContextPanel
        timeUnit={timeUnit}
        birthDate={birthDate}
        lifespan={lifespan}
        onAddGoal={() => setShowGoalForm(true)}
      />

      {/* Mobile Context Sheet */}
      <MobileContextSheet
        timeUnit={timeUnit}
        birthDate={birthDate}
        lifespan={lifespan}
        onAddGoal={() => setShowGoalForm(true)}
      />

      {/* Goal creation form */}
      {showGoalForm && (
        <GoalForm
          triggerButton={false}
          editGoal={null}
          onClose={() => setShowGoalForm(false)}
        />
      )}
    </div>
  );
}
