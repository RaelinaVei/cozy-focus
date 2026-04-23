// Lightweight local-first study tracker. Records minutes per day in localStorage.
// Independent from the existing Pomodoro stats so it works across all timers.

const KEY = "prismic-study-history";

export interface DayEntry {
  date: string; // YYYY-MM-DD
  minutes: number;
  sessions: number;
}

const today = () => new Date().toISOString().slice(0, 10);

export function loadHistory(): DayEntry[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as DayEntry[]) : [];
  } catch {
    return [];
  }
}

function save(entries: DayEntry[]) {
  localStorage.setItem(KEY, JSON.stringify(entries));
  window.dispatchEvent(new Event("prismic-study-update"));
}

export function recordStudy(minutes: number, countAsSession: boolean = true) {
  const m = Math.round(minutes);
  if (m <= 0) return;
  const entries = loadHistory();
  const t = today();
  const idx = entries.findIndex((e) => e.date === t);
  const inc = countAsSession ? 1 : 0;
  if (idx >= 0) {
    entries[idx] = {
      ...entries[idx],
      minutes: entries[idx].minutes + m,
      sessions: entries[idx].sessions + inc,
    };
  } else {
    entries.push({ date: t, minutes: m, sessions: inc });
  }
  save(entries);
}

/** Record partial focus time (e.g. user reset before completion). Adds minutes but does not bump session count. */
export function recordPartial(seconds: number) {
  const mins = Math.floor(seconds / 60);
  if (mins >= 1) recordStudy(mins, false);
}

export function getStats() {
  const entries = loadHistory();
  const totalMinutes = entries.reduce((a, b) => a + b.minutes, 0);
  const totalSessions = entries.reduce((a, b) => a + b.sessions, 0);
  const t = today();
  const todayEntry = entries.find((e) => e.date === t);

  // Streak: consecutive days ending today (or yesterday if not yet studied today)
  const dates = new Set(entries.filter((e) => e.minutes > 0).map((e) => e.date));
  let streak = 0;
  const cur = new Date();
  // If today not studied, start from yesterday
  if (!dates.has(t)) cur.setDate(cur.getDate() - 1);
  while (dates.has(cur.toISOString().slice(0, 10))) {
    streak++;
    cur.setDate(cur.getDate() - 1);
  }

  // Last 7 days array (oldest -> newest)
  const last7: DayEntry[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    const found = entries.find((e) => e.date === key);
    last7.push({ date: key, minutes: found?.minutes ?? 0, sessions: found?.sessions ?? 0 });
  }

  return {
    totalMinutes,
    totalSessions,
    todayMinutes: todayEntry?.minutes ?? 0,
    todaySessions: todayEntry?.sessions ?? 0,
    streak,
    last7,
  };
}
