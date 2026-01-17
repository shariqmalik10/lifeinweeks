import type { CheckInsByDay, DayCheckIns, Slot, WeeklyGoals } from "./types";

const CHECKINS_PREFIX = "liw:checkins:";
const GOALS_PREFIX = "liw:goals:";

function checkinsKey(userKey: string) {
  return `${CHECKINS_PREFIX}${userKey}`;
}

function goalsKey(userKey: string) {
  return `${GOALS_PREFIX}${userKey}`;
}

function safeParseJson<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function readCheckIns(userKey: string): CheckInsByDay {
  if (typeof window === "undefined") return {};
  const parsed = safeParseJson<CheckInsByDay>(
    window.localStorage.getItem(checkinsKey(userKey)),
  );
  return parsed ?? {};
}

export function writeCheckIns(userKey: string, data: CheckInsByDay) {
  window.localStorage.setItem(checkinsKey(userKey), JSON.stringify(data));
}

export function readGoals(userKey: string): WeeklyGoals {
  if (typeof window === "undefined") return {};
  const parsed = safeParseJson<WeeklyGoals>(
    window.localStorage.getItem(goalsKey(userKey)),
  );
  return parsed ?? {};
}

export function writeGoals(userKey: string, data: WeeklyGoals) {
  window.localStorage.setItem(goalsKey(userKey), JSON.stringify(data));
}

export function defaultDayCheckIns(): DayCheckIns {
  return { Morning: null, Afternoon: null, Evening: null };
}

export function setCheckIn(params: {
  userKey: string;
  dayKey: string; // YYYY-MM-DD
  slot: Slot;
  categoryId: string | null;
}) {
  const current = readCheckIns(params.userKey);
  const day = current[params.dayKey] ?? defaultDayCheckIns();
  const next: CheckInsByDay = {
    ...current,
    [params.dayKey]: {
      ...day,
      [params.slot]: params.categoryId as any,
    },
  };
  writeCheckIns(params.userKey, next);
  return next;
}


