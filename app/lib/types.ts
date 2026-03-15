export type Habit = {
  id: string;
  title: string;
  category: string;
  reminder_time: string | null;
  reminder_enabled: boolean;
  archived: boolean;
  created_at: string;
};

export type HabitWithStats = Habit & {
  checkedToday: boolean;
  currentStreak: number;
  longestStreak: number;
  weeklyRate: number;
  monthlyRate: number;
  badge?: "gold" | "neutral";
  badgeLabel?: string;
};

export type SessionUser = {
  id: string;
  email: string | null;
};
