"use client";

import { HabitWithStats } from "../page";

export default function HabitList({
  habits,
  onToggleCheck,
  onArchive
}: {
  habits: HabitWithStats[];
  onToggleCheck: (habitId: string, checked: boolean) => Promise<void>;
  onArchive: (habitId: string) => Promise<void>;
}) {
  if (habits.length === 0) {
    return (
      <div className="card">
        <p className="subtitle">No habits yet. Add your first habit above.</p>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="header">
        <div>
          <h2 style={{ margin: 0 }}>Today&apos;s check-in</h2>
          <p className="subtitle">Tap the circle to log today.</p>
        </div>
      </div>
      <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 12 }}>
        {habits.map((habit) => (
          <div key={habit.id} className="habit-row">
            <div className="habit-info">
              <strong>{habit.title}</strong>
              <span className="subtitle">
                {habit.category} · {habit.currentStreak} day streak
              </span>
              <div className="habit-actions">
                <span className="badge">Longest {habit.longestStreak}</span>
                {habit.badge ? (
                  <span className={`badge ${habit.badge}`}>{habit.badgeLabel}</span>
                ) : null}
              </div>
            </div>
            <div className="habit-actions">
              <button
                className={`check-toggle ${habit.checkedToday ? "checked" : ""}`}
                onClick={() => onToggleCheck(habit.id, habit.checkedToday)}
                aria-label={habit.checkedToday ? "Undo check-in" : "Check in"}
              >
                {habit.checkedToday ? "✓" : "+"}
              </button>
              <button className="button secondary" onClick={() => onArchive(habit.id)}>
                Archive
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
