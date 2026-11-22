/** Date helpers that work on wall-clock strings without depending on the server's own timezone. */

const pad = (n: number) => String(n).padStart(2, "0");

/** Parse `YYYY-MM-DD` or `YYYY-MM-DDTHH:mm` as if it were UTC (wall-clock arithmetic). */
export function wall(s: string): Date {
  const [d, t = "00:00"] = s.split("T");
  const [y, m, day] = d.split("-").map(Number);
  const [hh, mm] = t.split(":").map(Number);
  return new Date(Date.UTC(y, m - 1, day, hh || 0, mm || 0));
}

export function toDateStr(d: Date): string {
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
}

export function datePart(s: string): string {
  return s.slice(0, 10);
}

export function addDays(date: string, days: number): string {
  const d = wall(date);
  d.setUTCDate(d.getUTCDate() + days);
  return toDateStr(d);
}

export function addYears(date: string, years: number): string {
  const d = wall(date);
  d.setUTCFullYear(d.getUTCFullYear() + years);
  return toDateStr(d);
}

/** Add Indian working days (skips Saturday and Sunday; public holidays are not modelled). */
export function addWorkingDays(date: string, days: number): string {
  const d = wall(date);
  let added = 0;
  while (added < days) {
    d.setUTCDate(d.getUTCDate() + 1);
    const wd = d.getUTCDay();
    if (wd !== 0 && wd !== 6) added++;
  }
  return toDateStr(d);
}

export function minutesBetweenWall(a: string, b: string): number {
  return Math.round((wall(b).getTime() - wall(a).getTime()) / 60000);
}

/** Offset (minutes) of `tz` from UTC at the given UTC instant. */
function tzOffsetMinutes(tz: string, utc: Date): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).formatToParts(utc);
  const get = (t: string) => Number(parts.find((p) => p.type === t)?.value);
  const asUtc = Date.UTC(get("year"), get("month") - 1, get("day"), get("hour"), get("minute"));
  return Math.round((asUtc - utc.getTime()) / 60000);
}

/** Convert a wall-clock time at `tz` to a real UTC instant. */
export function zonedToUtc(local: string, tz: string): Date {
  const guess = wall(local);
  let offset = tzOffsetMinutes(tz, guess);
  let utc = new Date(guess.getTime() - offset * 60000);
  const offset2 = tzOffsetMinutes(tz, utc);
  if (offset2 !== offset) {
    offset = offset2;
    utc = new Date(guess.getTime() - offset * 60000);
  }
  return utc;
}

/** Today's date in India. */
export function todayIST(now: Date = new Date()): string {
  return toDateStr(new Date(now.getTime() + 330 * 60000));
}

export function daysUntil(due: string, today: string): number {
  return Math.round((wall(due).getTime() - wall(today).getTime()) / 86400000);
}

export function formatDate(date: string): string {
  return wall(date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
}

export function formatDateTime(local: string): string {
  return wall(local).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "UTC",
  });
}

export function inr(n: number): string {
  return "₹" + Math.round(n).toLocaleString("en-IN");
}

export function money(m: { min: number; max: number }): string {
  return m.min === m.max ? inr(m.max) : `${inr(m.min)} – ${inr(m.max)}`;
}
