"use client";

import { HabitWithStats } from "../page";

export default function Dashboard({ habits }: { habits: HabitWithStats[] }) {
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

  return (
    <div className="grid grid-2">
      <div className="card">
        <h3 style={{ marginTop: 0 }}>Progress dashboard</h3>
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
        <div className="grid grid-3" style={{ marginTop: 12 }}>
          {habits.map((habit) => (
            <div key={habit.id}>
              <strong>{habit.title}</strong>
              <p className="subtitle">
                {habit.badgeLabel || "Start a 3-day streak"}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
