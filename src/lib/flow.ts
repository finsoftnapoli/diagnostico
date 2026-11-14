// Percorso del questionario: una domanda per schermata, poi ambizioni, sfide e dati dell'azienda.
// Funzioni pure, usate dal questionario e dall'Ottogramma che si disegna mentre si risponde.
import { AREAS, PROFILE_FIELDS, QUESTIONS } from "./questionnaire";
import { MIN_TEXT } from "./sanitize";
import type { AreaCode, Responses } from "./types";
import { isValidItalianVat } from "./vat";

export type Step =
  { kind: "start" } | { kind: "question"; index: number } | { kind: "objectives" } | { kind: "issues" } | { kind: "profile" };

/** Le 24 domande nell'ordine degli ambiti. */
export const ORDERED_QUESTIONS = AREAS.flatMap((a) => QUESTIONS.filter((q) => q.area === a.code));

export const STEPS: Step[] = [
  { kind: "start" },
  ...ORDERED_QUESTIONS.map((_, index) => ({ kind: "question" as const, index })),
  { kind: "objectives" },
  { kind: "issues" },
  { kind: "profile" },
];

export const stepOf = (kind: Exclude<Step["kind"], "question">) => STEPS.findIndex((s) => s.kind === kind);

/** Cosa manca per proseguire dal passo, oppure null. */
export function stepProblem(s: Step, r: Responses): string | null {
  switch (s.kind) {
    case "start": {
      if (!r.consents.service) return "Per proseguire accettate l'informativa e le condizioni del servizio.";
      const vat = r.profile["PR-10"]?.trim();
      if (vat && !isValidItalianVat(vat))
        return "La partita IVA non sembra corretta: correggetela oppure lasciatela vuota, la chiederemo alla fine.";
      return null;
    }
    case "question": {
      const q = ORDERED_QUESTIONS[s.index];
      if (!r.levels[q.id]) return "Scelga la situazione più vicina alla Sua.";
      if (!r.checks[q.id]) return "Risponda anche alla verifica rapida.";
      return null;
    }
    case "objectives":
      if (!r.objectives.length) return "Scelga almeno un obiettivo.";
      if (r.objectivesText.trim().length < MIN_TEXT)
        return `Racconti le Sue ambizioni in almeno ${MIN_TEXT} caratteri: è da qui che parte il report.`;
      return null;
    case "issues":
      if (!r.issues.length) return "Scelga almeno una sfida.";
      if (r.issuesText.trim().length < MIN_TEXT)
        return `Descrivete le sfide in almeno ${MIN_TEXT} caratteri: è da qui che parte il report.`;
      return null;
    case "profile": {
      const miss = PROFILE_FIELDS.filter((f) => f.required && !r.profile[f.id]?.trim());
      if (miss.length) return `Mancano: ${miss.map((f) => f.label.toLowerCase()).join(", ")}.`;
      if (!isValidItalianVat(r.profile["PR-10"] ?? "")) return "Controlli la partita IVA: deve avere 11 cifre valide.";
      return null;
    }
  }
}

/** Campi del profilo ancora da compilare (per evidenziarli). */
export function missingProfileFields(r: Responses): string[] {
  const miss = PROFILE_FIELDS.filter((f) => f.required && !r.profile[f.id]?.trim()).map((f) => f.id);
  if (!miss.includes("PR-10") && !isValidItalianVat(r.profile["PR-10"] ?? "")) miss.push("PR-10");
  return miss;
}

/** Primo passo non ancora completo: da qui si riprende una bozza, qualunque versione del percorso l'abbia salvata. */
export function firstIncomplete(r: Responses): number {
  const i = STEPS.findIndex((s) => stepProblem(s, r) !== null);
  return i < 0 ? STEPS.length - 1 : i;
}

export interface LiveArea {
  code: AreaCode;
  /** Livello medio delle risposte date finora (1-4), null se nessuna. */
  level: number | null;
  answered: number;
  total: number;
  done: boolean;
}

/** Stato dell'Ottogramma mentre si risponde. */
export function liveAreas(r: Responses): LiveArea[] {
  return AREAS.map((a) => {
    const qs = QUESTIONS.filter((q) => q.area === a.code);
    const lv = qs.map((q) => r.levels[q.id]).filter((l): l is number => typeof l === "number" && l >= 1 && l <= 4);
    return {
      code: a.code,
      level: lv.length ? lv.reduce((x, y) => x + y, 0) / lv.length : null,
      answered: lv.length,
      total: qs.length,
      done: qs.every((q) => r.levels[q.id] && r.checks[q.id]),
    };
  });
}

/** Stima dei minuti che restano dal passo indicato. */
export function minutesLeft(step: number): number {
  let seconds = 0;
  for (const s of STEPS.slice(step)) seconds += s.kind === "question" ? 20 : s.kind === "start" ? 30 : 110;
  return Math.max(1, Math.round(seconds / 60));
}
