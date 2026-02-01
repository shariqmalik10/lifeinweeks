// Task types
export type TaskPriority = "high" | "medium" | "low";

export interface Task {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  date: string; // ISO date string YYYY-MM-DD
  time?: string; // HH:mm format
  priority: TaskPriority;
  completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface TaskInput {
  title: string;
  description?: string;
  date: string;
  time?: string;
  priority: TaskPriority;
}

// Goal types
export type GoalColor = "orange" | "blue" | "green" | "purple";

export interface Goal {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  target_date: string; // ISO date string
  progress: number; // 0-100
  color: GoalColor;
  icon?: string; // lucide icon name
  created_at: string;
  updated_at: string;
}

export interface GoalInput {
  title: string;
  description?: string;
  target_date: string;
  progress?: number;
  color: GoalColor;
  icon?: string;
}

// User settings types
export interface UserProfile {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  birth_date?: string; // ISO date string
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface UserSettings {
  id: string;
  user_id: string;
  dark_mode: boolean;
  email_notifications: boolean;
  lifespan_years: number;
  created_at: string;
  updated_at: string;
}

export interface UserProfileInput {
  first_name?: string;
  last_name?: string;
  birth_date?: string;
}

export interface UserSettingsInput {
  dark_mode?: boolean;
  email_notifications?: boolean;
  lifespan_years?: number;
}

// Life phase types
export interface LifePhase {
  name: string;
  start_age: number;
  end_age: number;
}

export const LIFE_PHASES: LifePhase[] = [
  { name: "Childhood", start_age: 0, end_age: 12 },
  { name: "Adolescence", start_age: 13, end_age: 19 },
  { name: "Early Adulthood", start_age: 20, end_age: 29 },
  { name: "Exploration & Building", start_age: 30, end_age: 44 },
  { name: "Midlife", start_age: 45, end_age: 59 },
  { name: "Mature Adulthood", start_age: 60, end_age: 74 },
  { name: "Late Adulthood", start_age: 75, end_age: 90 },
];

export function getCurrentPhase(birthDate: Date): LifePhase {
  const now = new Date();
  const ageInYears = Math.floor(
    (now.getTime() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000)
  );
  
  return (
    LIFE_PHASES.find(
      (phase) => ageInYears >= phase.start_age && ageInYears <= phase.end_age
    ) || LIFE_PHASES[LIFE_PHASES.length - 1]
  );
}

// Inspirational quotes
export const DAILY_QUOTES = [
  "Design is intelligence made visible.",
  "The purpose of life is a life of purpose.",
  "Time is the most valuable thing a man can spend.",
  "Life is what happens when you're busy making other plans.",
  "The best time to plant a tree was 20 years ago. The second best time is now.",
  "Your life is your message to the world. Make it inspiring.",
  "Every moment is a fresh beginning.",
  "The only way to do great work is to love what you do.",
  "Life is either a daring adventure or nothing at all.",
  "What we fear doing most is usually what we most need to do.",
];

export function getDailyQuote(): string {
  const today = new Date();
  const dayOfYear = Math.floor(
    (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) /
      (1000 * 60 * 60 * 24)
  );
  return DAILY_QUOTES[dayOfYear % DAILY_QUOTES.length];
}
