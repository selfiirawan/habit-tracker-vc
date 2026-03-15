"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase, supabaseEnabled } from "./lib/supabaseClient";
import { completionRate, computeStreak } from "./lib/streaks";
import { getLocalDateISO } from "./lib/date";
import { getDailyQuote } from "./lib/quotes";
import {
  archiveHabit as demoArchiveHabit,
  createHabit as demoCreateHabit,
  listCheckins as demoListCheckins,
  listHabits as demoListHabits,
  toggleCheckin as demoToggleCheckin
} from "./lib/demoStore";
import AuthPanel from "./components/AuthPanel";
import HabitForm, { HabitInput } from "./components/HabitForm";
import HabitList from "./components/HabitList";
import Dashboard from "./components/Dashboard";

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

type Checkin = {
  id: string;
  habit_id: string;
  checkin_date: string;
};

type SessionUser = {
  id: string;
  email: string | null;
};

export default function HomePage() {
  const [sessionUser, setSessionUser] = useState<SessionUser | null>(null);
  const [habits, setHabits] = useState<HabitWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [quoteSeed, setQuoteSeed] = useState(0);
  const [theme, setTheme] = useState<"light" | "dark">("light");

  const todayISO = useMemo(() => getLocalDateISO(), []);

  useEffect(() => {
    const storedTheme = window.localStorage.getItem("theme");
    if (storedTheme === "dark") {
      setTheme("dark");
      document.documentElement.setAttribute("data-theme", "dark");
    }
    setQuoteSeed(new Date().getDate());

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
    loadHabits();
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

  async function loadHabits() {
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

  async function handleCreateHabit(input: HabitInput) {
    if (!sessionUser) return;
    if (!supabaseEnabled || !supabase) {
      demoCreateHabit(input);
      loadHabits();
      return;
    }

    await supabase.from("habits").insert({
      user_id: sessionUser.id,
      title: input.title,
      category: input.category,
      reminder_time: input.reminder_time,
      reminder_enabled: input.reminder_enabled
    });
    loadHabits();
  }

  async function handleToggleCheck(habitId: string, checked: boolean) {
    if (!sessionUser) return;
    if (!supabaseEnabled || !supabase) {
      demoToggleCheckin(habitId, todayISO);
      loadHabits();
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
    loadHabits();
  }

  async function handleArchive(habitId: string) {
    if (!supabaseEnabled || !supabase) {
      demoArchiveHabit(habitId);
      loadHabits();
      return;
    }

    await supabase
      .from("habits")
      .update({ archived: true })
      .eq("id", habitId);
    loadHabits();
  }

  async function handleSignOut() {
    if (!supabaseEnabled || !supabase) {
      return;
    }
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

  if (loading) {
    return (
      <div className="container">
        <div className="card">
          <p className="subtitle">Loading your workspace...</p>
        </div>
      </div>
    );
  }

  if (!sessionUser) {
    return (
      <div className="container">
        <AuthPanel />
      </div>
    );
  }

  return (
    <div className="container">
      {!supabaseEnabled ? (
        <div className="card">
          <span className="badge neutral">Demo mode</span>
          <p className="subtitle">
            Running without Supabase. Data is stored locally in your browser.
          </p>
        </div>
      ) : null}
      <div className="header">
        <div>
          <h1 className="title">Hello, {sessionUser.email}</h1>
          <p className="subtitle">{getDailyQuote(quoteSeed)}</p>
        </div>
        <div className="habit-actions">
          <button className="button secondary" onClick={toggleTheme}>
            {theme === "light" ? "Dark mode" : "Light mode"}
          </button>
          <button className="button secondary" onClick={requestNotifications}>
            Enable reminders
          </button>
          <button className="button" onClick={handleSignOut}>
            Sign out
          </button>
        </div>
      </div>

      <Dashboard habits={habits} />
      <HabitForm onCreate={handleCreateHabit} />
      <HabitList
        habits={habits}
        onToggleCheck={handleToggleCheck}
        onArchive={handleArchive}
      />

      <div className="card">
        <div className="header">
          <div>
            <h2 style={{ margin: 0 }}>Reports</h2>
            <p className="subtitle">Weekly and monthly snapshots.</p>
          </div>
        </div>
        <div className="grid grid-2" style={{ marginTop: 16 }}>
          <div>
            <strong>Weekly focus</strong>
            <p className="subtitle">
              {Math.round(
                habits.reduce((sum, habit) => sum + habit.weeklyRate, 0) /
                  (habits.length || 1) *
                  100
              )}% completion
            </p>
          </div>
          <div>
            <strong>Monthly momentum</strong>
            <p className="subtitle">
              {Math.round(
                habits.reduce((sum, habit) => sum + habit.monthlyRate, 0) /
                  (habits.length || 1) *
                  100
              )}% completion
            </p>
          </div>
        </div>
      </div>

      <div className="footer">Built with Next.js + Supabase. Your data stays yours.</div>
    </div>
  );
}
