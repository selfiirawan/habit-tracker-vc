# Habit Tracker

Minimal habit tracker built with Next.js (App Router) and Supabase.

## Features
- Daily habit check-ins
- Streak tracking + badges
- Reminders (browser notifications while the app is open)
- Progress dashboard and weekly/monthly reports
- Habit categories
- Dark mode + motivational quotes

## Setup
1. Create a Supabase project.
2. Run the SQL in `supabase/schema.sql` in the Supabase SQL editor.
3. Enable Email/Password auth in Supabase Authentication settings.
4. Copy `.env.local.example` to `.env.local` and fill in keys.

## Run
```bash
npm install
npm run dev
```

## Notes
- Reminders are client-side and only fire while the app is open.
- The UI is fully responsive and optimized for mobile.
