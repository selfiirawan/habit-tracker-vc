"use client";

import HabitForm from "../../components/HabitForm";
import HabitList from "../../components/HabitList";
import { useAppContext } from "../../components/AppProvider";

export default function HabitsPage() {
  const { habits, createHabit, toggleCheck, archiveHabit } = useAppContext();

  return (
    <div className="content-stack">
      <HabitForm onCreate={createHabit} />
      <HabitList
        habits={habits}
        onToggleCheck={toggleCheck}
        onArchive={archiveHabit}
      />
    </div>
  );
}
