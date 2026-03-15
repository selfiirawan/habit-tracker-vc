import { addDaysISO } from "./date";

export function computeStreak(checkins: string[], todayISO: string) {
  const set = new Set(checkins);
  let current = 0;
  let cursor = todayISO;
  while (set.has(cursor)) {
    current += 1;
    cursor = addDaysISO(cursor, -1);
  }

  let longest = 0;
  const sorted = [...set].sort();
  let run = 0;
  let prev = "";
  for (const date of sorted) {
    if (!prev) {
      run = 1;
    } else {
      const expected = addDaysISO(prev, 1);
      run = date === expected ? run + 1 : 1;
    }
    if (run > longest) longest = run;
    prev = date;
  }

  return { current, longest };
}

export function completionRate(checkins: string[], days: number, todayISO: string) {
  const set = new Set(checkins);
  let completed = 0;
  for (let i = 0; i < days; i += 1) {
    const date = addDaysISO(todayISO, -i);
    if (set.has(date)) completed += 1;
  }
  return completed / days;
}
