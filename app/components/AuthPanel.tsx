"use client";

import { useState } from "react";
import { supabase, supabaseEnabled } from "../lib/supabaseClient";

export default function AuthPanel() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [message, setMessage] = useState<string | null>(null);

  async function handleAuth() {
    setMessage(null);
    if (!supabaseEnabled || !supabase) {
      setMessage("Supabase is not configured. Use demo mode or add env vars.");
      return;
    }
    if (!email || !password) {
      setMessage("Email and password are required.");
      return;
    }

    if (mode === "signup") {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) {
        setMessage(error.message);
      } else {
        setMessage("Check your inbox to confirm your account.");
      }
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    if (error) {
      setMessage(error.message);
    }
  }

  return (
    <div className="card">
      <div className="header">
        <div>
          <h1 className="title">Habit Tracker</h1>
          <p className="subtitle">
            Build consistency with simple daily check-ins.
          </p>
        </div>
      </div>
      {!supabaseEnabled ? (
        <p className="subtitle">
          Supabase is not configured. Set the env vars to enable sign in.
        </p>
      ) : null}
      <div className="grid grid-2" style={{ marginTop: 16 }}>
        <div>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            className="input"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
          />
        </div>
        <div>
          <label htmlFor="password">Password</label>
          <input
            id="password"
            className="input"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="At least 6 characters"
          />
        </div>
      </div>
      {message ? <p className="subtitle">{message}</p> : null}
      <div
        className="habit-actions"
        style={{ marginTop: 16, justifyContent: "space-between" }}
      >
        <button className="button" onClick={handleAuth}>
          {mode === "signup" ? "Create account" : "Sign in"}
        </button>
        <button
          className="button secondary"
          onClick={() =>
            setMode((prev) => (prev === "signup" ? "signin" : "signup"))
          }
        >
          {mode === "signup" ? "Have an account? Sign in" : "New here? Sign up"}
        </button>
      </div>
    </div>
  );
}
