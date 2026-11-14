// Lettura dei calendari esterni (link ICS): di ogni evento occupato si tengono solo inizio e fine.
import ical from "node-ical";
import { addDays, romeToUtc, type Interval } from "./agenda-time";

/** Accetta solo indirizzi https pubblici (anche webcal://): niente reti interne. */
export function safeFeedUrl(raw: string): string | null {
  let s = raw.trim();
  if (/^webcals?:\/\//i.test(s)) s = s.replace(/^webcals?:/i, "https:");
  if (s.length > 2000) return null;
  let u: URL;
  try {
    u = new URL(s);
  } catch {
    return null;
  }
  if (u.protocol !== "https:" || u.username || u.password) return null;
  const h = u.hostname.toLowerCase();
  if (h === "localhost" || h.startsWith("[") || /\.(local|localhost|internal|lan|home)$/.test(h) || !h.includes(".")) return null;
  const v4 = h.match(/^(\d+)\.(\d+)\.(\d+)\.(\d+)$/);
  if (v4) {
    const [a, b] = [Number(v4[1]), Number(v4[2])];
    if (
      a === 10 ||
      a === 127 ||
      a === 0 ||
      (a === 169 && b === 254) ||
      (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && b === 168) ||
      a >= 224
    )
      return null;
  }
  return u.toString();
}

const localDate = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

type Instance = { start: Date; end: Date; fullDay: boolean };

/** Orari occupati tra `from` e `to`: ricorrenze, eccezioni e fusi orari risolti; esclusi eventi «disponibile» e annullati. */
export async function parseBusy(text: string, from: Date, to: Date, max = 5000): Promise<Interval[]> {
  const data = await ical.async.parseICS(text);
  const out: Interval[] = [];
  for (const e of Object.values(data)) {
    if (!e || e.type !== "VEVENT") continue;
    if (String(e.transparency ?? "").toUpperCase() === "TRANSPARENT") continue;
    if (String(e.status ?? "").toUpperCase() === "CANCELLED") continue;
    let instances: Instance[] = [];
    if (e.rrule) {
      instances = ical
        .expandRecurringEvent(e, { from, to, excludeExdates: true, includeOverrides: true })
        .map((x) => ({ start: x.start, end: x.end, fullDay: !!x.isFullDay }));
    } else if (e.start) {
      instances = [{ start: e.start, end: e.end ?? e.start, fullDay: e.datetype === "date" }];
    }
    for (const x of instances) {
      let start = x.start.getTime();
      let end = x.end.getTime();
      if (x.fullDay) {
        // evento di giornata intera: l'intero giorno italiano (le date senza ora si leggono con l'ora locale del processo)
        const first = localDate(x.start);
        const last = x.end > x.start ? localDate(x.end) : addDays(first, 1);
        start = romeToUtc(first, "00:00")?.getTime() ?? start;
        end = romeToUtc(last, "00:00")?.getTime() ?? end;
      }
      if (!(end > start) || end <= from.getTime() || start >= to.getTime()) continue;
      out.push({ start, end });
      if (out.length >= max) return out;
    }
  }
  return out;
}
