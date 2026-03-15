"use client";

import { useAppContext } from "../../components/AppProvider";

export default function ReportsPage() {
  const { habits } = useAppContext();
  const weekly = Math.round(
    (habits.reduce((sum, habit) => sum + habit.weeklyRate, 0) /
      (habits.length || 1)) *
      100
  );
  const monthly = Math.round(
    (habits.reduce((sum, habit) => sum + habit.monthlyRate, 0) /
      (habits.length || 1)) *
      100
  );

  return (
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
          <p className="subtitle">{weekly}% completion</p>
        </div>
        <div>
          <strong>Monthly momentum</strong>
          <p className="subtitle">{monthly}% completion</p>
        </div>
      </div>
    </div>
  );
}
