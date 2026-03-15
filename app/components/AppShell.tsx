"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import AuthPanel from "./AuthPanel";
import { useAppContext } from "./AppProvider";
import { getDailyQuote } from "../lib/quotes";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const {
    loading,
    sessionUser,
    habits,
    supabaseEnabled,
    theme,
    toggleTheme,
    requestNotifications,
    signOut
  } = useAppContext();
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
    <div className="app-shell">
      <div
        className={`sidebar-overlay ${sidebarOpen ? "show" : ""}`}
        onClick={() => setSidebarOpen(false)}
      />
      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="card sidebar-card">
          <div className="brand">
            <div className="brand-mark">HT</div>
            <div>
              <strong>Habit CRM</strong>
              <div className="subtitle">Consistency hub</div>
            </div>
          </div>
          <nav>
            <Link className={pathname === "/dashboard" ? "active" : ""} href="/dashboard">
              <span className="nav-label">
                <span className="nav-icon">D</span>
                Dashboard
              </span>
              <span>›</span>
            </Link>
            <Link className={pathname === "/habits" ? "active" : ""} href="/habits">
              <span className="nav-label">
                <span className="nav-icon">H</span>
                Habits
              </span>
              <span>›</span>
            </Link>
            <Link className={pathname === "/reports" ? "active" : ""} href="/reports">
              <span className="nav-label">
                <span className="nav-icon">R</span>
                Reports
              </span>
              <span>›</span>
            </Link>
          </nav>
          <div className="meta">
            <div className="meta-row">
              <div>Streak focus</div>
              <button
                className="icon-button"
                onClick={toggleTheme}
                aria-label={
                  theme === "light" ? "Switch to dark mode" : "Switch to light mode"
                }
              >
                {theme === "light" ? "☾" : "☀"}
              </button>
            </div>
            <strong>{habits.length} habits active</strong>
          </div>
          <div className="sidebar-actions">
            <button className="button secondary" onClick={requestNotifications}>
              Enable reminders
            </button>
            <button className="button" onClick={signOut}>
              Sign out
            </button>
          </div>
        </div>
      </aside>

      <div className="page">
        {!supabaseEnabled ? (
          <div className="card">
            <span className="badge neutral">Demo mode</span>
            <p className="subtitle">
              Running without Supabase. Data is stored locally in your browser.
            </p>
          </div>
        ) : null}
        <div className="topbar">
          <div className="topbar-title">
            <div>
              <h1 className="title">Hello, {sessionUser.email}</h1>
              <p className="subtitle">{getDailyQuote(new Date().getDate())}</p>
            </div>
            <button
              className="button secondary mobile-toggle"
              onClick={() => setSidebarOpen((prev) => !prev)}
              aria-label={sidebarOpen ? "Close menu" : "Open menu"}
            >
              <span className="menu-dots">⋮</span>
            </button>
          </div>
        </div>
        <div className="content">{children}</div>
        <div className="footer">Built with Next.js + Supabase. Your data stays yours.</div>
      </div>
    </div>
  );
}
