import type { Habit } from "./types";

export type DemoCheckin = {
  id: string;
  habit_id: string;
  checkin_date: string;
};

const HABITS_KEY = "demo:habits";
const CHECKINS_KEY = "demo:checkins";

function readJSON<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  const raw = window.localStorage.getItem(key);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJSON<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

function uuid() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `demo-${Math.random().toString(36).slice(2)}`;
}

export function listHabits(): Habit[] {
  return readJSON<Habit[]>(HABITS_KEY, []);
}

export function listCheckins(): DemoCheckin[] {
  return readJSON<DemoCheckin[]>(CHECKINS_KEY, []);
}

export function createHabit(input: {
  title: string;
  category: string;
  reminder_time: string | null;
  reminder_enabled: boolean;
}): Habit {
  const habits = listHabits();
  const habit: Habit = {
    id: uuid(),
    title: input.title,
    category: input.category,
    reminder_time: input.reminder_time,
    reminder_enabled: input.reminder_enabled,
    archived: false,
    created_at: new Date().toISOString()
  };
  habits.push(habit);
  writeJSON(HABITS_KEY, habits);
  return habit;
}

export function archiveHabit(habitId: string) {
  const habits = listHabits().map((habit) =>
    habit.id === habitId ? { ...habit, archived: true } : habit
  );
  writeJSON(HABITS_KEY, habits);
}

export function toggleCheckin(habitId: string, dateISO: string) {
  const checkins = listCheckins();
  const index = checkins.findIndex(
    (checkin) =>
      checkin.habit_id === habitId && checkin.checkin_date === dateISO
  );
  if (index >= 0) {
    checkins.splice(index, 1);
  } else {
    checkins.push({
      id: uuid(),
      habit_id: habitId,
      checkin_date: dateISO
    });
  }
  writeJSON(CHECKINS_KEY, checkins);
}
