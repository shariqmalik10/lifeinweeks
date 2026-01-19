"use client";

import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type TimeUnit = "weeks" | "months" | "years";

function clampDateToToday(date: Date) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (date.getTime() > today.getTime()) return today;
  return date;
}

function isoDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

export default function DashboardPage() {
  const defaultDate = useMemo(() => {
    const now = new Date();
    return new Date(now.getFullYear() - 25, now.getMonth(), now.getDate());
  }, []);

  const [birthDate, setBirthDate] = useState<Date>(defaultDate);
  const [timeUnit, setTimeUnit] = useState<TimeUnit>("weeks");
  const lifespanYears = 90;

  const stats = useMemo(() => {
    const now = new Date();
    const msPerDay = 24 * 60 * 60 * 1000;
    const msPerWeek = 7 * msPerDay;
    const msLived = now.getTime() - birthDate.getTime();
    const weeksLived = Math.max(0, Math.floor(msLived / msPerWeek));
    const daysLived = Math.max(0, Math.floor(msLived / msPerDay));
    const totalWeeks = lifespanYears * 52;
    const totalDays = lifespanYears * 365;
    const weeksRemaining = Math.max(0, totalWeeks - weeksLived);
    const daysRemaining = Math.max(0, totalDays - daysLived);
    const percentComplete = Math.min(100, (weeksLived / totalWeeks) * 100);
    const yearsRemaining = Math.max(
      0,
      lifespanYears - Math.floor(weeksLived / 52),
    );

    return {
      weeksLived,
      weeksRemaining,
      daysRemaining,
      yearsRemaining,
      percentComplete,
    };
  }, [birthDate, lifespanYears]);

  const gridData = useMemo(() => {
    const now = new Date();
    const birthYear = birthDate.getFullYear();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    const startOfYear = new Date(currentYear, 0, 1);
    const msIntoYear = now.getTime() - startOfYear.getTime();
    const currentWeek = Math.floor(msIntoYear / (7 * 24 * 60 * 60 * 1000));
    const ageInYears = currentYear - birthYear;

    if (timeUnit === "years") {
      const decades = [];
      for (let decade = 0; decade < 9; decade++) {
        const years = [];
        for (let yearInDecade = 0; yearInDecade < 10; yearInDecade++) {
          const age = decade * 10 + yearInDecade;
          let status: "past" | "current" | "future";
          if (age < ageInYears) status = "past";
          else if (age === ageInYears) status = "current";
          else status = "future";
          years.push({ age, status });
        }
        decades.push({ decade, years });
      }
      return { type: "years" as const, decades };
    }

    if (timeUnit === "months") {
      const rows = [];
      for (let age = 0; age <= lifespanYears; age++) {
        const months = [];
        for (let month = 0; month < 12; month++) {
          let status: "past" | "current" | "future";
          if (age < ageInYears) status = "past";
          else if (age > ageInYears) status = "future";
          else {
            if (month < currentMonth) status = "past";
            else if (month === currentMonth) status = "current";
            else status = "future";
          }
          months.push({ month, status });
        }
        rows.push({ age, months });
      }
      return { type: "months" as const, rows };
    }

    const rows = [];
    for (let age = 0; age <= lifespanYears; age++) {
      const weeks = [];
      for (let week = 0; week < 52; week++) {
        let status: "past" | "current" | "future";
        if (age < ageInYears) status = "past";
        else if (age > ageInYears) status = "future";
        else {
          if (week < currentWeek) status = "past";
          else if (week === currentWeek) status = "current";
          else status = "future";
        }
        weeks.push({ week, status });
      }
      rows.push({ age, weeks });
    }
    return { type: "weeks" as const, rows };
  }, [birthDate, lifespanYears, timeUnit]);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = new Date(e.target.value);
    if (!Number.isNaN(date.getTime())) {
      setBirthDate(clampDateToToday(date));
    }
  };

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-balance text-2xl font-semibold text-white">
          Your life, in {timeUnit}
        </h1>
        <p className="text-pretty text-base text-zinc-400">
          This dashboard is a separate, logged-in experience. The public landing
          visualization stays unchanged.
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
          <div className="text-sm font-medium text-zinc-500">Date of birth</div>
          <div className="mt-2">
            <Input
              type="date"
              value={isoDate(birthDate)}
              onChange={handleDateChange}
              max={isoDate(new Date())}
              className="h-10 bg-zinc-950 text-base text-zinc-100"
            />
          </div>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
          <div className="text-sm font-medium text-zinc-500">Progress</div>
          <div className="mt-2 flex items-baseline gap-2">
            <div className="tabular-nums text-4xl font-semibold text-white">
              {Math.round(stats.percentComplete)}%
            </div>
            <div className="text-base text-zinc-400">complete</div>
          </div>
          <div className="mt-3 h-2 w-full rounded-full bg-zinc-900">
            <div
              className="h-2 rounded-full bg-zinc-200"
              style={{ width: `${stats.percentComplete}%` }}
            />
          </div>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
          <div className="text-sm font-medium text-zinc-500">Remaining</div>
          <div className="mt-2 grid grid-cols-2 gap-3">
            <div>
              <div className="tabular-nums text-xl font-semibold text-white">
                {stats.yearsRemaining.toLocaleString()}
              </div>
              <div className="text-sm text-zinc-500">years</div>
            </div>
            <div>
              <div className="tabular-nums text-xl font-semibold text-white">
                {stats.weeksRemaining.toLocaleString()}
              </div>
              <div className="text-sm text-zinc-500">weeks</div>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-end justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-balance text-lg font-semibold text-white">
              Visualization
            </h2>
            <p className="text-pretty text-base text-zinc-400">
              Switch granularity to zoom out.
            </p>
          </div>

          <div className="flex rounded-lg border border-zinc-800 bg-zinc-950 p-1">
            {(["years", "months", "weeks"] as TimeUnit[]).map((unit) => {
              const active = timeUnit === unit;
              return (
                <button
                  key={unit}
                  type="button"
                  onClick={() => setTimeUnit(unit)}
                  className={cn(
                    "rounded-md px-3 py-2 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950",
                    active
                      ? "bg-zinc-200 text-zinc-950"
                      : "text-zinc-300 hover:bg-zinc-900",
                  )}
                >
                  {unit}
                </button>
              );
            })}
          </div>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
          {gridData.type === "years" && <YearsGrid decades={gridData.decades} />}
          {gridData.type === "months" && <MonthsGrid rows={gridData.rows} />}
          {gridData.type === "weeks" && <WeeksGrid rows={gridData.rows} />}
        </div>
      </section>
    </div>
  );
}

function Cell({ status }: { status: "past" | "current" | "future" }) {
  return (
    <div
      className={cn(
        "aspect-square w-full rounded-[6px] border",
        status === "past" && "border-zinc-700 bg-zinc-200",
        status === "current" && "border-zinc-600 bg-zinc-400",
        status === "future" && "border-zinc-800 bg-transparent",
      )}
    />
  );
}

function YearsGrid({
  decades,
}: {
  decades: Array<{
    decade: number;
    years: Array<{ age: number; status: "past" | "current" | "future" }>;
  }>;
}) {
  return (
    <div className="grid w-full gap-3">
      {decades.map((decadeData) => (
        <div
          key={decadeData.decade}
          className="grid gap-2"
          style={{ gridTemplateColumns: "repeat(10, minmax(0, 1fr))" }}
        >
          {decadeData.years.map((year) => (
            <Cell key={year.age} status={year.status} />
          ))}
        </div>
      ))}
    </div>
  );
}

function MonthsGrid({
  rows,
}: {
  rows: Array<{
    age: number;
    months: Array<{ month: number; status: "past" | "current" | "future" }>;
  }>;
}) {
  return (
    <div className="grid w-full gap-1">
      {rows.map((row) => (
        <div
          key={row.age}
          className="grid gap-1"
          style={{ gridTemplateColumns: "repeat(12, minmax(0, 1fr))" }}
        >
          {row.months.map((month) => (
            <Cell key={month.month} status={month.status} />
          ))}
        </div>
      ))}
    </div>
  );
}

function WeeksGrid({
  rows,
}: {
  rows: Array<{
    age: number;
    weeks: Array<{ week: number; status: "past" | "current" | "future" }>;
  }>;
}) {
  return (
    <div className="grid w-full gap-1 overflow-x-auto">
      {rows.map((row) => (
        <div
          key={row.age}
          className="grid gap-1"
          style={{ gridTemplateColumns: "repeat(52, minmax(0, 1fr))" }}
        >
          {row.weeks.map((week) => (
            <Cell key={week.week} status={week.status} />
          ))}
        </div>
      ))}
    </div>
  );
}


