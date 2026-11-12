// Quando parte un report che ha superato i controlli: la mattina del giorno successivo alla compilazione, alle 9 (ora italiana).
const ROME = "Europe/Rome";
const romeDate = (d: Date) =>
  new Intl.DateTimeFormat("en-CA", { timeZone: ROME, year: "numeric", month: "2-digit", day: "2-digit" }).format(d);
const romeHour = (d: Date) => Number(new Intl.DateTimeFormat("en-GB", { timeZone: ROME, hour: "2-digit", hourCycle: "h23" }).format(d));

/** Ora di invio in Italia (0-23). */
export const RELEASE_HOUR = 9;

/** Le 9 del mattino, ora italiana, del giorno di calendario successivo a `from`. */
export function nextMorning(from: Date): Date {
  const [y, m, d] = romeDate(from).split("-").map(Number);
  // l'Italia è a +1 o +2 ore da UTC: si prova con entrambe e si tiene quella che dà le 9 locali
  for (const offset of [1, 2]) {
    const t = new Date(Date.UTC(y, m - 1, d + 1, RELEASE_HOUR - offset));
    if (romeHour(t) === RELEASE_HOUR) return t;
  }
  return new Date(Date.UTC(y, m - 1, d + 1, RELEASE_HOUR - 1));
}

/** Data e ora di invio in parole, per email e area staff. */
export const releaseLabel = (iso: string) =>
  new Date(iso).toLocaleString("it-IT", {
    timeZone: ROME,
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  });
