"use client";

import { useState } from "react";

const categories = [
  "Health",
  "Mind",
  "Fitness",
  "Work",
  "Learning",
  "Home",
  "Custom"
];

export type HabitInput = {
  title: string;
  category: string;
  reminder_time: string | null;
  reminder_enabled: boolean;
};

export default function HabitForm({
  onCreate
}: {
  onCreate: (input: HabitInput) => Promise<void>;
}) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState(categories[0]);
  const [reminderTime, setReminderTime] = useState("08:00");
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (!title.trim()) return;
    setLoading(true);
    await onCreate({
      title: title.trim(),
      category,
      reminder_time: reminderEnabled ? reminderTime : null,
      reminder_enabled: reminderEnabled
    });
    setTitle("");
    setCategory(categories[0]);
    setReminderTime("08:00");
    setReminderEnabled(false);
    setLoading(false);
  }

  return (
    <div className="card">
      <div className="header">
        <div>
          <h2 style={{ margin: 0 }}>Create a habit</h2>
          <p className="subtitle">Add a focus you want to build daily.</p>
        </div>
      </div>
      <div className="grid grid-3" style={{ marginTop: 16 }}>
        <div>
          <label htmlFor="habit-title">Habit name</label>
          <input
            id="habit-title"
            className="input"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Drink water"
          />
        </div>
        <div>
          <label htmlFor="habit-category">Category</label>
          <select
            id="habit-category"
            className="input"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="reminder-time">Reminder time</label>
          <input
            id="reminder-time"
            className="input"
            type="time"
            value={reminderTime}
            onChange={(event) => setReminderTime(event.target.value)}
            disabled={!reminderEnabled}
          />
        </div>
      </div>
      <div
        className="habit-actions"
        style={{ marginTop: 16, justifyContent: "space-between" }}
      >
        <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <input
            type="checkbox"
            checked={reminderEnabled}
            onChange={(event) => setReminderEnabled(event.target.checked)}
          />
          Enable reminder
        </label>
        <button className="button" onClick={handleSubmit} disabled={loading}>
          {loading ? "Saving..." : "Add habit"}
        </button>
      </div>
    </div>
  );
}
