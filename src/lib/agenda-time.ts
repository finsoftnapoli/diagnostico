// Date e orari dell'agenda: tutto in ora italiana, con l'ora legale gestita.

export const ROME = "Europe/Rome";
const pad = (n: number) => String(n).padStart(2, "0");

const fmt = new Intl.DateTimeFormat("en-GB", {
  timeZone: ROME,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

/** Data (AAAA-MM-GG) e ora (HH:MM) italiane di un istante. */
export function romeParts(d: Date): { date: string; time: string } {
  const p = Object.fromEntries(fmt.formatToParts(d).map((x) => [x.type, x.value]));
  return { date: `${p.year}-${p.month}-${p.day}`, time: `${p.hour}:${p.minute}` };
}

/** Converte data e ora italiane in istante UTC, tenendo conto dell'ora legale. */
export function romeToUtc(date: string, time: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}$/.test(time)) return null;
  const [y, mo, d] = date.split("-").map(Number);
  const [h, mi] = time.split(":").map(Number);
  if (mo < 1 || mo > 12 || d < 1 || d > 31 || h > 23 || mi > 59) return null;
  const wall = Date.UTC(y, mo - 1, d, h, mi);
  const offsetAt = (ms: number) => {
    const p = romeParts(new Date(ms));
    const [yy, mm, dd] = p.date.split("-").map(Number);
    const [hh, mn] = p.time.split(":").map(Number);
    return Date.UTC(yy, mm - 1, dd, hh, mn) - ms;
  };
  const first = wall - offsetAt(wall);
  return new Date(wall - offsetAt(first));
}

export const toMinutes = (time: string) => {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
};
export const toTime = (minutes: number) => `${pad(Math.floor(minutes / 60))}:${pad(minutes % 60)}`;

/** Somma giorni a una data AAAA-MM-GG. */
export function addDays(date: string, n: number): string {
  const [y, m, d] = date.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d + n)).toISOString().slice(0, 10);
}

/** 0 = lunedì … 6 = domenica. */
export function weekdayIndex(date: string): number {
  const [y, m, d] = date.split("-").map(Number);
  return (new Date(Date.UTC(y, m - 1, d)).getUTCDay() + 6) % 7;
}

/** Il lunedì della settimana che contiene la data. */
export const mondayOf = (date: string) => addDays(date, -weekdayIndex(date));

/**
 * Modello settimanale: per le prossime `weeks` settimane, nei giorni indicati (0 = lunedì),
 * un orario ogni `duration` minuti tra `from` e `to`. Restituisce coppie data/ora di inizio.
 */
export function expandTemplate(p: {
  startDate: string;
  weeks: number;
  days: number[];
  from: string;
  to: string;
  duration: number;
}): { date: string; time: string }[] {
  const out: { date: string; time: string }[] = [];
  const first = toMinutes(p.from);
  const last = toMinutes(p.to);
  if (p.duration <= 0) return out;
  const monday = mondayOf(p.startDate);
  for (let w = 0; w < p.weeks; w++)
    for (const day of [...new Set(p.days)].sort()) {
      const date = addDays(monday, w * 7 + day);
      if (date < p.startDate) continue;
      for (let t = first; t + p.duration <= last; t += p.duration) out.push({ date, time: toTime(t) });
    }
  return out;
}

export interface Interval {
  start: number;
  end: number;
}

/** Vero se l'intervallo [start, start + minuti) si sovrappone a un periodo occupato. */
export const overlapsBusy = (busy: Interval[], startMs: number, minutes: number) => {
  const end = startMs + minutes * 60000;
  return busy.some((b) => b.start < end && b.end > startMs);
};
