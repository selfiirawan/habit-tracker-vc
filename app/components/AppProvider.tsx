"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { supabase, supabaseEnabled } from "../lib/supabaseClient";
import { completionRate, computeStreak } from "../lib/streaks";
import { getLocalDateISO } from "../lib/date";
import {
  archiveHabit as demoArchiveHabit,
  createHabit as demoCreateHabit,
  listCheckins as demoListCheckins,
  listHabits as demoListHabits,
  toggleCheckin as demoToggleCheckin
} from "../lib/demoStore";
import type { Habit, HabitWithStats, SessionUser } from "../lib/types";
import type { HabitInput } from "./HabitForm";

type Checkin = {
  id: string;
  habit_id: string;
  checkin_date: string;
};

type AppContextValue = {
  loading: boolean;
  sessionUser: SessionUser | null;
  habits: HabitWithStats[];
  todayISO: string;
  supabaseEnabled: boolean;
  refreshHabits: () => Promise<void>;
  createHabit: (input: HabitInput) => Promise<void>;
  toggleCheck: (habitId: string, checked: boolean) => Promise<void>;
  archiveHabit: (habitId: string) => Promise<void>;
  signOut: () => Promise<void>;
  theme: "light" | "dark";
  toggleTheme: () => void;
  requestNotifications: () => Promise<void>;
};

const AppContext = createContext<AppContextValue | null>(null);

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within AppProvider");
  }
  return context;
}

export default function AppProvider({ children }: { children: React.ReactNode }) {
  const [sessionUser, setSessionUser] = useState<SessionUser | null>(null);
  const [habits, setHabits] = useState<HabitWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState<"light" | "dark">("light");

  const todayISO = useMemo(() => getLocalDateISO(), []);

  useEffect(() => {
    const storedTheme = window.localStorage.getItem("theme");
    if (storedTheme === "dark") {
      setTheme("dark");
      document.documentElement.setAttribute("data-theme", "dark");
    }

    if (!supabaseEnabled || !supabase) {
      setSessionUser({ id: "demo-user", email: "demo@local" });
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data }) => {
      const user = data.session?.user;
      setSessionUser(user ? { id: user.id, email: user.email ?? null } : null);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, updatedSession) => {
        const user = updatedSession?.user;
        setSessionUser(user ? { id: user.id, email: user.email ?? null } : null);
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!sessionUser) return;
    refreshHabits();
  }, [sessionUser]);

  useEffect(() => {
    if (habits.length === 0) return;
    const interval = setInterval(() => {
      const now = new Date();
      const currentTime = now.toTimeString().slice(0, 5);
      const today = getLocalDateISO(now);
      habits.forEach((habit) => {
        if (!habit.reminder_enabled || !habit.reminder_time) return;
        if (habit.reminder_time !== currentTime) return;
        const key = `reminder:${habit.id}`;
        const last = window.localStorage.getItem(key);
        if (last === today) return;

        if (Notification.permission === "granted") {
          new Notification("Habit reminder", {
            body: `Time for ${habit.title}`
          });
          window.localStorage.setItem(key, today);
        }
      });
    }, 60_000);

    return () => clearInterval(interval);
  }, [habits]);

  async function refreshHabits() {
    setLoading(true);
    let habitData: Habit[] = [];
    let checkins: Checkin[] = [];
    if (!supabaseEnabled || !supabase) {
      habitData = demoListHabits().filter((habit) => !habit.archived);
      checkins = demoListCheckins();
    } else {
      const { data, error } = await supabase
        .from("habits")
        .select("*")
        .eq("archived", false)
        .order("created_at", { ascending: true });

      if (error) {
        setLoading(false);
        return;
      }

      habitData = data ?? [];
      const habitIds = habitData.map((habit) => habit.id);
      if (habitIds.length > 0) {
        const { data: checkinsData } = await supabase
          .from("habit_checkins")
          .select("id, habit_id, checkin_date")
          .in("habit_id", habitIds);
        checkins = checkinsData ?? [];
      }
    }

    const byHabit = new Map<string, string[]>();
    checkins.forEach((checkin) => {
      const list = byHabit.get(checkin.habit_id) ?? [];
      list.push(checkin.checkin_date);
      byHabit.set(checkin.habit_id, list);
    });

    const enriched = (habitData ?? []).map((habit) => {
      const dates = byHabit.get(habit.id) ?? [];
      const { current, longest } = computeStreak(dates, todayISO);
      const checkedToday = dates.includes(todayISO);
      const weeklyRate = completionRate(dates, 7, todayISO);
      const monthlyRate = completionRate(dates, 30, todayISO);
      const badge = current >= 14 ? "gold" : current >= 3 ? "neutral" : undefined;
      const badgeLabel =
        current >= 14
          ? "14-day streak"
          : current >= 7
          ? "7-day streak"
          : current >= 3
          ? "3-day streak"
          : undefined;

      return {
        ...habit,
        checkedToday,
        currentStreak: current,
        longestStreak: longest,
        weeklyRate,
        monthlyRate,
        badge,
        badgeLabel
      } as HabitWithStats;
    });

    setHabits(enriched);
    setLoading(false);
  }

  async function createHabit(input: HabitInput) {
    if (!sessionUser) return;
    if (!supabaseEnabled || !supabase) {
      demoCreateHabit(input);
      refreshHabits();
      return;
    }

    await supabase.from("habits").insert({
      user_id: sessionUser.id,
      title: input.title,
      category: input.category,
      reminder_time: input.reminder_time,
      reminder_enabled: input.reminder_enabled
    });
    refreshHabits();
  }

  async function toggleCheck(habitId: string, checked: boolean) {
    if (!sessionUser) return;
    if (!supabaseEnabled || !supabase) {
      demoToggleCheckin(habitId, todayISO);
      refreshHabits();
      return;
    }

    if (checked) {
      await supabase
        .from("habit_checkins")
        .delete()
        .eq("habit_id", habitId)
        .eq("checkin_date", todayISO);
    } else {
      await supabase.from("habit_checkins").insert({
        habit_id: habitId,
        user_id: sessionUser.id,
        checkin_date: todayISO
      });
    }
    refreshHabits();
  }

  async function archiveHabit(habitId: string) {
    if (!supabaseEnabled || !supabase) {
      demoArchiveHabit(habitId);
      refreshHabits();
      return;
    }

    await supabase
      .from("habits")
      .update({ archived: true })
      .eq("id", habitId);
    refreshHabits();
  }

  async function signOut() {
    if (!supabaseEnabled || !supabase) return;
    await supabase.auth.signOut();
    setHabits([]);
  }

  function toggleTheme() {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    window.localStorage.setItem("theme", next);
    document.documentElement.setAttribute("data-theme", next);
  }

  async function requestNotifications() {
    if (!("Notification" in window)) return;
    if (Notification.permission === "default") {
      await Notification.requestPermission();
    }
  }

  return (
    <AppContext.Provider
      value={{
        loading,
        sessionUser,
        habits,
        todayISO,
        supabaseEnabled,
        refreshHabits,
        createHabit,
        toggleCheck,
        archiveHabit,
        signOut,
        theme,
        toggleTheme,
        requestNotifications
      }}
    >
      {children}
    </AppContext.Provider>
  );
}
