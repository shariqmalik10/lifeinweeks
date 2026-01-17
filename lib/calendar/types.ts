export type Slot = "Morning" | "Afternoon" | "Evening";

export const SLOTS: Slot[] = ["Morning", "Afternoon", "Evening"];

export const CATEGORIES = [
  { id: "work", label: "Work" },
  { id: "exercise", label: "Exercise" },
  { id: "learn_ai", label: "Learn AI" },
  { id: "learn_english", label: "Learn English" },
  { id: "social", label: "Social" },
  { id: "explore", label: "Explore" },
  { id: "travel", label: "Travel" },
] as const;

export type CategoryId = (typeof CATEGORIES)[number]["id"];

export type DayCheckIns = Record<Slot, CategoryId | null>;

export type CheckInsByDay = Record<string, DayCheckIns>;

export type WeeklyGoals = Partial<Record<CategoryId, number>>;


