"use client";

import Dashboard from "../../components/Dashboard";
import { useAppContext } from "../../components/AppProvider";

export default function DashboardPage() {
  const { habits } = useAppContext();
  return <Dashboard habits={habits} />;
}
