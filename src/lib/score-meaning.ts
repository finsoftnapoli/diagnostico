// Lettura dei punteggi in parole: cosa significano 14, 22 o 45 in termini di pratiche dell'azienda.
// Si parla di livelli di maturità e di "passi" da un livello al successivo, senza esporre il calcolo.
import { LEVEL_NAMES } from "./insights";

/** Cosa caratterizza ciascun livello di maturità, in una frase. */
export const LEVEL_DESCRIPTIONS = [
  "Le pratiche si affidano all'esperienza e all'iniziativa delle persone: poche regole scritte, decisioni caso per caso.",
  "Esistono alcune regole e strumenti, ma si applicano in modo discontinuo e dipendono da chi se ne occupa.",
  "Processi, responsabilità e strumenti sono definiti e usati con regolarità in tutta l'azienda.",
  "Le pratiche sono misurate con indicatori, riviste periodicamente e migliorate nel tempo.",
] as const;

const NUM = ["nessuno", "uno", "due", "tre", "quattro", "cinque", "sei", "sette", "otto", "nove", "dieci"];
/** Numeri in lettere fino a dieci, se tutto il gruppo è piccolo; altrimenti in cifre, per coerenza. */
const numIn = (n: number, total: number) => (total <= 10 ? NUM[n] : String(n));

/** Livello medio equivalente a un punteggio, a parole: "pratiche in media Informali, con qualche elemento Di base". */
export function levelEquivalent(score: number): string {
  const avg = 1 + score / (100 / 3); // 0 → 1, 100 → 4
  const low = Math.min(3, Math.floor(avg));
  const frac = avg - low;
  const name = (i: number) => `«${LEVEL_NAMES[i - 1]}»`;
  if (avg >= 3.9) return `pratiche in media al livello ${name(4)}`;
  if (frac < 0.2) return `pratiche in media al livello ${name(low)}`;
  if (frac > 0.8) return `pratiche in media al livello ${name(low + 1)}`;
  if (frac < 0.45) return `pratiche in media tra ${name(low)} e ${name(low + 1)}, più vicine a ${name(low)}`;
  if (frac > 0.55) return `pratiche in media tra ${name(low)} e ${name(low + 1)}, più vicine a ${name(low + 1)}`;
  return `pratiche in media a metà tra ${name(low)} e ${name(low + 1)}`;
}

/** Composizione per livello: "dei 24 temi, 17 sono al livello Informale, 6 Di base e 1 Strutturato". */
export function levelMix(levels: number[], what = "temi"): string {
  const n = levels.length;
  const counts = [1, 2, 3, 4].map((l) => levels.filter((x) => x === l).length);
  const present = counts.map((c, i) => ({ c, i })).filter((x) => x.c > 0);
  if (!present.length) return "";
  if (present.length === 1) {
    const lvl = `al livello «${LEVEL_NAMES[present[0].i]}»`;
    if (n === 1) return `L'unico tema è ${lvl}`;
    const all = n === 2 ? "Entrambi i" : n === 3 ? "Tutti e tre i" : `Tutti i ${numIn(n, n)}`;
    return `${all} ${what} sono ${lvl}`;
  }
  const parts = present.map(({ c, i }) => `${numIn(c, n)} ${c === 1 ? "è" : "sono"} al livello «${LEVEL_NAMES[i]}»`);
  const list = parts.length === 2 ? parts.join(" e ") : `${parts.slice(0, -1).join(", ")} e ${parts[parts.length - 1]}`;
  return `Dei ${numIn(n, n)} ${what}, ${list}`;
}

/** Quanti passi di livello (un tema che sale di un livello) servono per colmare un divario su un gruppo di temi. */
export function stepsToClose(gap: number, themes: number): number {
  if (gap <= 0 || themes <= 0) return 0;
  return Math.ceil(gap / (100 / (3 * themes)) - 0.15);
}

/** Lettura di un ambito: composizione dei temi e distanza dal riferimento in passi di livello. */
export function areaReading(score: number | null, ref: number | null, levels: number[]): string {
  if (score === null) return "Non valutato.";
  const mix = levelMix(levels);
  if (ref === null) return `${mix}.`;
  const gap = ref - score;
  if (Math.abs(gap) < 5) return `${mix}: in linea con il riferimento della vostra fascia.`;
  if (gap < 0) return `${mix}: sopra il riferimento della vostra fascia, un punto di forza su cui costruire.`;
  const steps = stepsToClose(gap, levels.length);
  return `${mix}. Per arrivare al riferimento della vostra fascia ${steps === 1 ? "basta far salire di un livello un tema" : `servono circa ${NUM[Math.min(steps, 10)]} passi di livello su questi temi`}.`;
}

/** Il divario detto come temi da far salire di un livello. */
function stepsPhrase(steps: number, themes: number): string {
  if (steps >= themes * 0.8) return `per raggiungerlo servirebbe far salire di un livello quasi tutti i ${themes} temi`;
  if (steps >= themes * 0.45) return `per raggiungerlo servirebbe far salire di un livello circa metà dei ${themes} temi`;
  return `per raggiungerlo basterebbe far salire di un livello circa ${steps} temi su ${themes}`;
}

/** Lettura del punteggio complessivo, in due o tre frasi. */
export function overallReading(overall: number | null, ref: number, levels: number[]): string[] {
  if (overall === null) return [];
  const out = [`Un punteggio di ${overall} su 100 corrisponde a ${levelEquivalent(overall)}. ${levelMix(levels)}.`];
  const gap = ref - overall;
  out.push(
    Math.abs(gap) < 5
      ? `È in linea con il riferimento delle aziende ben gestite della vostra fascia (${ref}), che corrisponde a ${levelEquivalent(ref)}.`
      : gap > 0
        ? `Il riferimento delle aziende ben gestite della vostra fascia è ${ref}, cioè ${levelEquivalent(ref)}: ${stepsPhrase(stepsToClose(gap, levels.length), levels.length)}.`
        : `Siete sopra il riferimento delle aziende ben gestite della vostra fascia (${ref}, ${levelEquivalent(ref)}).`,
  );
  return out;
}
