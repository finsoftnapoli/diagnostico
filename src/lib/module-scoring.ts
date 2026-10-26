// Punteggio dei moduli di approfondimento: stesse regole del diagnostico (livello 1-4 → 0-100).
// Ogni modulo è un Ottogramma dell'ambito: punteggio di ciascuno degli 8 sotto-ambiti = media delle sue
// domande applicabili; punteggio del modulo = media dei sotto-ambiti. Domande non applicabili escluse,
// segnali di possibile sovrastima dalle domande di verifica.
import { MODULE_QUESTIONS, MODULE_SUBAREAS, type ModuleQuestion } from "./modules";
import { PARAMS } from "./scoring";
import type { AreaCode } from "./types";

export interface ModuleResponses {
  /** Livello 1-4; 0 = non applicabile (solo dove ammesso). */
  levels: Record<string, number>;
  checks: Record<string, string>;
  /** Note libere dell'utente per l'analista (facoltative). */
  notes?: string;
}

export interface ThemeResult {
  id: string;
  /** Sotto-ambito della domanda. */
  sub?: string;
  theme: string;
  level: number | null; // null = non applicabile o senza risposta
  score: number | null;
  flag: string | null;
}

export interface SubareaResult {
  code: string;
  name: string;
  short: string;
  description: string;
  /** null se tutte le domande del sotto-ambito sono non applicabili. */
  score: number | null;
}

export interface ModuleResult {
  area: AreaCode;
  score: number | null;
  subs: SubareaResult[];
  themes: ThemeResult[];
  answered: number;
  total: number;
}

export const emptyModuleResponses = (): ModuleResponses => ({ levels: {}, checks: {}, notes: "" });

/** Accetta solo risposte valide per le domande del modulo. */
export function sanitizeModuleResponses(area: AreaCode, raw: unknown): ModuleResponses {
  const r = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const lv = (r.levels && typeof r.levels === "object" ? r.levels : {}) as Record<string, unknown>;
  const ck = (r.checks && typeof r.checks === "object" ? r.checks : {}) as Record<string, unknown>;
  const out = emptyModuleResponses();
  for (const q of MODULE_QUESTIONS[area] ?? []) {
    const l = Number(lv[q.id]);
    if (Number.isInteger(l) && ((l >= 1 && l <= 4) || (l === 0 && q.na))) out.levels[q.id] = l;
    const c = ck[q.id];
    if (q.check && typeof c === "string" && q.check.options.includes(c)) out.checks[q.id] = c;
  }
  out.notes = typeof r.notes === "string" ? r.notes.replace(/\r\n/g, "\n").trim().slice(0, 3000) : "";
  return out;
}

/** Motivo per cui il modulo non è completo, oppure null. */
export function moduleIncomplete(area: AreaCode, r: ModuleResponses): string | null {
  for (const q of MODULE_QUESTIONS[area]) {
    if (r.levels[q.id] === undefined) return `manca la risposta su «${q.theme}»`;
    if (q.check && r.levels[q.id] > 0 && !r.checks[q.id]) return `manca la verifica su «${q.theme}»`;
  }
  return null;
}

const flagOf = (q: ModuleQuestion, level: number, answer: string | undefined) =>
  q.check && level >= q.check.flag.minLevel && answer && q.check.flag.answers.includes(answer)
    ? `Livello ${level} su «${q.theme}», ma alla verifica «${q.check.text}» la risposta è «${answer}»: possibile sovrastima.`
    : null;

export function computeModule(area: AreaCode, r: ModuleResponses): ModuleResult {
  const qs = MODULE_QUESTIONS[area];
  const themes: ThemeResult[] = qs.map((q) => {
    const l = r.levels[q.id];
    const level = l && l >= 1 ? l : null;
    return {
      id: q.id,
      sub: q.sub,
      theme: q.theme,
      level,
      score: level ? PARAMS.levelPoints[level - 1] : null,
      flag: level ? flagOf(q, level, r.checks[q.id]) : null,
    };
  });
  const mean = (xs: number[]) => (xs.length ? Math.round(xs.reduce((a, b) => a + b, 0) / xs.length) : null);
  const subs: SubareaResult[] = MODULE_SUBAREAS[area].map((sa) => ({
    ...sa,
    score: mean(themes.filter((t) => t.sub === sa.code && t.score !== null).map((t) => t.score as number)),
  }));
  return {
    area,
    score: mean(subs.filter((x) => x.score !== null).map((x) => x.score as number)),
    subs,
    themes,
    answered: qs.filter((q) => r.levels[q.id] !== undefined).length,
    total: qs.length,
  };
}
