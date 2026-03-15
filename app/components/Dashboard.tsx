"use client";

import type { HabitWithStats } from "../lib/types";

export default function Dashboard({ habits }: { habits: HabitWithStats[] }) {
  const badgeThresholds = [3, 7, 14, 30, 60, 100];
  const totalHabits = habits.length;
  const checkedToday = habits.filter((habit) => habit.checkedToday).length;
  const avgStreak =
    totalHabits === 0
      ? 0
      : Math.round(
          habits.reduce((sum, habit) => sum + habit.currentStreak, 0) /
            totalHabits
        );

  const weeklyRate =
    totalHabits === 0
      ? 0
      :
          habits.reduce((sum, habit) => sum + habit.weeklyRate, 0) /
          totalHabits;
  const monthlyRate =
    totalHabits === 0
      ? 0
      :
          habits.reduce((sum, habit) => sum + habit.monthlyRate, 0) /
          totalHabits;
  const bestStreak = habits.reduce(
    (best, habit) => Math.max(best, habit.longestStreak),
    0
  );

  return (
    <div className="grid grid-2">
      <div className="card">
        <div className="header">
          <h3 style={{ margin: 0 }}>Progress dashboard</h3>
          <span className="chip">Today focus</span>
        </div>
        <div className="grid grid-2">
          <div>
            <p className="subtitle">Today</p>
            <strong style={{ fontSize: 22 }}>
              {checkedToday}/{totalHabits}
            </strong>
          </div>
          <div>
            <p className="subtitle">Avg streak</p>
            <strong style={{ fontSize: 22 }}>{avgStreak} days</strong>
          </div>
        </div>
        <div style={{ marginTop: 16 }}>
          <p className="subtitle">Last 7 days completion</p>
          <div className="progress-bar">
            <span style={{ width: `${Math.round(weeklyRate * 100)}%` }} />
          </div>
          <p className="subtitle" style={{ marginTop: 8 }}>
            {Math.round(weeklyRate * 100)}%
          </p>
        </div>
        <div style={{ marginTop: 16 }}>
          <p className="subtitle">Last 30 days completion</p>
          <div className="progress-bar">
            <span style={{ width: `${Math.round(monthlyRate * 100)}%` }} />
          </div>
          <p className="subtitle" style={{ marginTop: 8 }}>
            {Math.round(monthlyRate * 100)}%
          </p>
        </div>
      </div>
      <div className="card">
        <h3 style={{ marginTop: 0 }}>Badges</h3>
        <p className="subtitle">Unlock streak milestones across any habit.</p>
        <div className="badge-shelf" style={{ marginTop: 12 }}>
          {badgeThresholds.map((threshold) => {
            const unlocked = bestStreak >= threshold;
            return (
              <div
                key={threshold}
                className={`badge-slot ${unlocked ? "filled" : ""}`}
              >
                <div className={unlocked ? "badge-icon" : "badge-lock"}>
                  {unlocked ? "STAR" : "LOCK"}
                </div>
                <strong>{threshold}-day streak</strong>
                <p className="subtitle">
                  {unlocked ? "Unlocked" : "Keep going"}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
