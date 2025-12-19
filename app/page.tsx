"use client";

import { useState, useMemo, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type TimeUnit = "weeks" | "months" | "years";

export default function Home() {
  // Default to 25 years ago per DESIGN.md
  const defaultDate = useMemo(() => {
    const now = new Date();
    return new Date(now.getFullYear() - 25, now.getMonth(), now.getDate());
  }, []);

  const [birthDate, setBirthDate] = useState<Date>(defaultDate);
  const [timeUnit, setTimeUnit] = useState<TimeUnit>("weeks");
  const [showWaitlist, setShowWaitlist] = useState(false);
  const [waitlistDismissed, setWaitlistDismissed] = useState(false);
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const lifespan = 90; // Fixed at 90 years

  // Show waitlist modal after 30 seconds
  useEffect(() => {
    if (waitlistDismissed) return;
    
    const timer = setTimeout(() => {
      setShowWaitlist(true);
    }, 3000); // 30 seconds

    return () => clearTimeout(timer);
  }, [waitlistDismissed]);

  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleWaitlistSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setIsSubmitting(true);
    setSubmitError(null);
    
    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        if (data.alreadyRegistered) {
          setSubmitError("You're already on the waitlist!");
        } else {
          setSubmitError(data.error || "Something went wrong");
        }
        setIsSubmitting(false);
        return;
      }
      
      setSubmitSuccess(true);
      setTimeout(() => {
        setShowWaitlist(false);
        setWaitlistDismissed(true);
      }, 2000);
    } catch {
      setSubmitError("Failed to connect. Please try again.");
    }
    
    setIsSubmitting(false);
  };

  const handleSkipToDemo = () => {
    setShowWaitlist(false);
    setWaitlistDismissed(true);
  };

  // Calculate life stats
  const stats = useMemo(() => {
    const now = new Date();
    const msPerWeek = 7 * 24 * 60 * 60 * 1000;
    const msLived = now.getTime() - birthDate.getTime();
    const weeksLived = Math.floor(msLived / msPerWeek);
    const totalWeeks = lifespan * 52;
    const weeksRemaining = Math.max(0, totalWeeks - weeksLived);
    const percentComplete = Math.min(100, (weeksLived / totalWeeks) * 100);
    const yearsRemaining = Math.max(0, lifespan - Math.floor(weeksLived / 52));
    const mealsRemaining = weeksRemaining * 21;
    const awakeHours = weeksRemaining * 112;

    return {
      weeksLived,
      weeksRemaining,
      percentComplete,
      summersLeft: yearsRemaining,
      mondaysLeft: weeksRemaining,
      mealsRemaining,
      awakeHours,
    };
  }, [birthDate, lifespan]);

  // Calculate grid data based on time unit
  const gridData = useMemo(() => {
    const now = new Date();
    const birthYear = birthDate.getFullYear();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    const startOfYear = new Date(currentYear, 0, 1);
    const msIntoYear = now.getTime() - startOfYear.getTime();
    const currentWeek = Math.floor(msIntoYear / (7 * 24 * 60 * 60 * 1000));
    
    // Calculate age in years
    const ageInYears = currentYear - birthYear;

    if (timeUnit === "years") {
      // Decades view: 9 rows x 10 columns = 90 years
      const decades = [];
      for (let decade = 0; decade < 9; decade++) {
        const years = [];
        for (let yearInDecade = 0; yearInDecade < 10; yearInDecade++) {
          const age = decade * 10 + yearInDecade;
          let status: "past" | "current" | "future";
          if (age < ageInYears) {
            status = "past";
          } else if (age === ageInYears) {
            status = "current";
          } else {
            status = "future";
          }
          years.push({ age, status });
        }
        decades.push({ decade, years });
      }
      return { type: "years" as const, decades };
    } else if (timeUnit === "months") {
      // 90 rows x 12 columns
      const rows = [];
      for (let age = 0; age <= lifespan; age++) {
        const months = [];
        for (let month = 0; month < 12; month++) {
          let status: "past" | "current" | "future";
          if (age < ageInYears) {
            status = "past";
          } else if (age > ageInYears) {
            status = "future";
          } else {
            // Current year
            if (month < currentMonth) {
              status = "past";
            } else if (month === currentMonth) {
              status = "current";
            } else {
              status = "future";
            }
          }
          months.push({ month, status });
        }
        rows.push({ age, months });
      }
      return { type: "months" as const, rows };
    } else {
      // Weeks: 90 rows x 52 columns
      const rows = [];
      for (let age = 0; age <= lifespan; age++) {
        const weeks = [];
        for (let week = 0; week < 52; week++) {
          let status: "past" | "current" | "future";
          if (age < ageInYears) {
            status = "past";
          } else if (age > ageInYears) {
            status = "future";
          } else {
            // Current year
            if (week < currentWeek) {
              status = "past";
            } else if (week === currentWeek) {
              status = "current";
            } else {
              status = "future";
            }
          }
          weeks.push({ week, status });
        }
        rows.push({ age, weeks });
      }
      return { type: "weeks" as const, rows };
    }
  }, [birthDate, lifespan, timeUnit]);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = new Date(e.target.value);
    if (!isNaN(date.getTime())) {
      setBirthDate(date);
    }
  };

  // Stoic insight quote
  const insight = useMemo(() => {
    return `"You've burned through ${stats.weeksLived.toLocaleString()} weeks, with only ${stats.weeksRemaining.toLocaleString()} weeks left until nothing. "Someday" is a lie you tell yourself; the clock is a countdown, not a promise."`;
  }, [stats.weeksLived, stats.weeksRemaining]);

  return (
    <main className="relative z-10 h-screen flex overflow-hidden bg-zinc-950">
      {/* Sidebar - Left */}
      <aside className="w-80 shrink-0 border-r border-zinc-800 p-6 flex flex-col overflow-y-auto">
        {/* Logo/Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-serif text-white leading-tight">
            Life in
          </h1>
          <h1 className="text-3xl font-serif text-red-500 leading-tight italic">
            Weeks.
          </h1>
        </div>

        {/* Date of Birth */}
        <div className="mb-8">
          <label className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider block mb-2">
            Date of Birth
          </label>
          <Input
            type="date"
            value={birthDate.toISOString().split("T")[0]}
            onChange={handleDateChange}
            className="w-full h-10 text-sm bg-zinc-900 border-zinc-700 text-white"
            max={new Date().toISOString().split("T")[0]}
          />
        </div>

        {/* Hero Stat */}
        <div className="mb-2">
          <p className="text-7xl font-bold text-white tracking-tight">
            {Math.round(stats.percentComplete)}%
          </p>
          <div className="w-16 h-1 bg-red-500 mt-3 mb-3" />
          <p className="text-sm text-zinc-500">
            of your 90 years is gone.
          </p>
        </div>

        {/* Insight Quote */}
        <div className="my-8 border-l-2 border-red-500 pl-4">
          <p className="text-sm text-zinc-400 italic leading-relaxed">
            {insight}
          </p>
        </div>

        {/* Life Currency Stats */}
        <div className="space-y-3 mt-auto">
          <div className="flex justify-between items-center py-2 border-t border-zinc-800">
            <span className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider">Summers</span>
            <span className="font-mono text-lg text-white">{stats.summersLeft}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-t border-zinc-800">
            <span className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider">Mondays</span>
            <span className="font-mono text-lg text-white">{stats.mondaysLeft.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-t border-zinc-800">
            <span className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider">Meals</span>
            <span className="font-mono text-lg text-white">{stats.mealsRemaining.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-t border-zinc-800 border-b">
            <span className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider">Awake Hrs</span>
            <span className="font-mono text-lg text-white">{stats.awakeHours.toLocaleString()}</span>
          </div>
        </div>

        {/* Granularity Toggle */}
        <div className="mt-6">
          <label className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider block mb-3">
            Granularity
          </label>
          <div className="flex bg-zinc-900 rounded-lg p-1">
            {(["years", "months", "weeks"] as TimeUnit[]).map((unit) => (
              <button
                key={unit}
                onClick={() => setTimeUnit(unit)}
                className={cn(
                  "flex-1 py-2 text-xs font-medium rounded-md transition-all uppercase tracking-wide",
                  timeUnit === unit
                    ? "bg-zinc-700 text-white"
                    : "text-zinc-500 hover:text-zinc-300"
                )}
              >
                {unit}
              </button>
            ))}
          </div>
        </div>
      </aside>

      {/* Main Stage - Right */}
      <div className="flex-1 flex flex-col min-w-0 p-4">
        {/* Grid Container with axes */}
        <div className="flex-1 min-h-0 flex">
          {/* Age axis labels - positioned to align with grid rows */}
          {gridData.type === "weeks" && (
            <div className="flex flex-col pr-2 shrink-0 pt-5">
              {gridData.rows.map((row, idx) => (
                <div key={row.age} className="flex-1 flex items-center justify-end min-h-0">
                  {row.age % 5 === 0 && (
                    <span className="text-[10px] text-zinc-600 font-mono leading-none">
                      {row.age}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
          {gridData.type === "months" && (
            <div className="flex flex-col pr-2 shrink-0 pt-5">
              {gridData.rows.map((row) => (
                <div key={row.age} className="flex-1 flex items-center justify-end min-h-0">
                  {row.age % 10 === 0 && (
                    <span className="text-[10px] text-zinc-600 font-mono leading-none">
                      {row.age}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="flex-1 flex flex-col min-h-0">
            {/* Week axis labels */}
            {gridData.type === "weeks" && (
              <div className="flex mb-1 shrink-0 h-4">
                {Array.from({ length: 52 }, (_, i) => i + 1).map((week) => (
                  <div key={week} className="flex-1 min-w-0 flex justify-center">
                    {week === 1 || week % 5 === 0 ? (
                      <span className="text-[10px] text-zinc-600 font-mono leading-none">
                        {week}
                      </span>
                    ) : null}
                  </div>
                ))}
              </div>
            )}
            {gridData.type === "months" && (
              <div className="flex mb-1 shrink-0 h-4">
                {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                  <div key={month} className="flex-1 min-w-0 flex justify-center">
                    <span className="text-[10px] text-zinc-600 font-mono leading-none">
                      {month}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Grid */}
            <div className="flex-1 min-h-0">
              {gridData.type === "years" && (
                <YearsGrid decades={gridData.decades} />
              )}
              {gridData.type === "months" && (
                <MonthsGrid rows={gridData.rows} />
              )}
              {gridData.type === "weeks" && (
                <WeeksGrid rows={gridData.rows} />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Waitlist Popup - Bottom Right */}
      {showWaitlist && (
        <div 
          className="fixed bottom-6 right-6 z-50 w-80 bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl overflow-hidden"
          style={{
            animation: "slideInRight 0.4s cubic-bezier(0.16, 1, 0.3, 1)"
          }}
        >
          {/* Close Button */}
          <button
            onClick={handleSkipToDemo}
            className="absolute top-3 right-3 text-zinc-500 hover:text-white transition-colors z-10"
            aria-label="Close"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>

          {/* Header */}
          <div className="p-4 pb-3">
            <span className="inline-block px-2 py-0.5 text-[10px] font-medium text-emerald-400 border border-zinc-600 rounded-full uppercase tracking-wider mb-3">
              Beta Access
            </span>
            <h3 className="text-xl font-serif text-white mb-1">
              Life in Weeks
            </h3>
            <p className="text-xs text-zinc-400">
              Get early access to the full experience.
            </p>
          </div>

          {/* Form */}
          <div className="px-4 pb-4">
            {submitSuccess ? (
              <div className="text-center py-4">
                <div className="text-emerald-400 text-2xl mb-2">✓</div>
                <p className="text-sm text-white font-medium">You&apos;re on the list!</p>
                <p className="text-xs text-zinc-400 mt-1">Check your email for confirmation.</p>
              </div>
            ) : (
              <form onSubmit={handleWaitlistSubmit} className="space-y-2">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-10 text-sm bg-zinc-800 border-zinc-600 text-white placeholder:text-zinc-500 font-mono"
                  required
                />
                {submitError && (
                  <p className="text-xs text-red-400">{submitError}</p>
                )}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-10 bg-white text-black font-semibold text-xs uppercase tracking-wider rounded-md hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Joining..." : "Join Waitlist"}
                </button>
              </form>
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-2 bg-zinc-950/50 border-t border-zinc-800">
            <p className="text-[10px] text-zinc-500 text-center italic">
              Memento Mori
            </p>
          </div>
        </div>
      )}

      {/* Popup Animation */}
      <style jsx>{`
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(100%) translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0) translateY(0);
          }
        }
      `}</style>
    </main>
  );
}

// Years Grid: Diamonds in 9 rows x 10 columns
function YearsGrid({ decades }: { decades: Array<{ decade: number; years: Array<{ age: number; status: "past" | "current" | "future" }> }> }) {
  return (
    <div className="h-full flex flex-col justify-center items-center gap-3">
      {decades.map((decadeData) => (
        <div key={decadeData.decade} className="flex gap-4 items-center">
          {decadeData.years.map((year) => (
            <div
              key={year.age}
              className={cn(
                "w-10 h-12 rotate-45 cursor-pointer"
                ,
                year.status === "past" && "bg-red-500",
                year.status === "current" && "bg-red-400",
                year.status === "future" && "bg-transparent border-2 border-zinc-700 hover:border-zinc-500"
              )}
              title={`Age ${year.age}`}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

// Months Grid: Circles in 90 rows x 12 columns
function MonthsGrid({ rows }: { rows: Array<{ age: number; months: Array<{ month: number; status: "past" | "current" | "future" }> }> }) {
  return (
    <div className="h-full flex flex-col gap-[2px]">
      {rows.map((row) => (
        <div key={row.age} className="flex gap-[2px] flex-1 min-h-0">
          {row.months.map((month) => (
            <div
              key={month.month}
              className={cn(
                "flex-1 min-w-0 rounded-full cursor-pointer"
                ,
                month.status === "past" && "bg-red-500",
                month.status === "current" && "bg-red-400",
                month.status === "future" && "bg-transparent border border-zinc-700 hover:border-zinc-500"
              )}
              title={`Age ${row.age}, Month ${month.month + 1}`}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

// Weeks Grid: Squares in 90 rows x 52 columns
function WeeksGrid({ rows }: { rows: Array<{ age: number; weeks: Array<{ week: number; status: "past" | "current" | "future" }> }> }) {
  return (
    <div className="h-full flex flex-col gap-[1px]">
      {rows.map((row) => (
        <div key={row.age} className="flex gap-[1px] flex-1 min-h-0">
          {row.weeks.map((week) => (
            <div
              key={week.week}
              className={cn(
                "flex-1 min-w-0 cursor-pointer bg-transparent border"
                ,
                week.status === "past" && "bg-red-500",
                week.status === "current" && "bg-red-400",
                week.status === "future"
              )}
              title={`Age ${row.age}, Week ${week.week + 1}`}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
