-- Tables
create table if not exists public.habits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  title text not null,
  category text not null,
  reminder_time text,
  reminder_enabled boolean not null default false,
  archived boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.habit_checkins (
  id uuid primary key default gen_random_uuid(),
  habit_id uuid references public.habits on delete cascade not null,
  user_id uuid references auth.users not null,
  checkin_date date not null,
  created_at timestamptz not null default now(),
  unique (habit_id, checkin_date)
);

-- Enable RLS
alter table public.habits enable row level security;
alter table public.habit_checkins enable row level security;

-- Policies
create policy "Users manage their habits" on public.habits
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users manage their checkins" on public.habit_checkins
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Helpful index
create index if not exists habit_checkins_user_id_idx on public.habit_checkins (user_id, checkin_date);
