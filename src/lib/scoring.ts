// Motore di punteggio e priorità. Replica le regole del foglio "Esempio_priorita"
// della banca delle domande v0.2. Ogni modifica va verificata con `npm test`.
import { AREAS, ISSUES, OBJECTIVES, QUESTIONS } from "./questionnaire";
import type { AreaCode, Choice, Responses } from "./types";

/** Parametri del modello: da calibrare nel pilota. */
export const PARAMS = {
  /** Punti per livello 1-4. */
  levelPoints: [0, 33, 67, 100],
  /** Peso dell'importanza dichiarata (1 = poco rilevante, 2 = rilevante, 3 = decisiva). */
  importanceWeights: [1, 2, 3],
  /** Peso della posizione per obiettivi e criticità (1°, 2°, 3°). */
  rankWeights: [1, 0.67, 0.33],
  /** Legame dell'ambito con un obiettivo o una criticità. */
  primaryLink: 1,
  secondaryLink: 0.5,
  bonusObjectives: 1.0,
  bonusIssues: 1.0,
  bonusText: 0.25,
  priorities: 3,
} as const;

export interface AreaResult {
  code: AreaCode;
  name: string;
  score: number | null; // 0-100, null se nessuna risposta
  answered: number;
  importance: number;
  objectivesIndex: number; // 0-1
  issuesIndex: number; // 0-1
  fromText: boolean;
  priorityIndex: number;
  rank: number;
  isPriority: boolean;
  /** Motivi leggibili per cui l'ambito è prioritario. */
  reasons: string[];
}

export interface Flag {
  questionId: string;
  area: AreaCode;
  level: number;
  answer: string;
  message: string;
}

export interface Result {
  areas: AreaResult[];
  priorities: AreaResult[];
  flags: Flag[];
  overall: number | null;
}

const round = (x: number, d = 0) => {
  const f = 10 ** d;
  return Math.round((x + Number.EPSILON) * f) / f;
};

function link(choice: Choice | undefined, area: AreaCode): number {
  if (!choice) return 0;
  if (choice.primary === area) return PARAMS.primaryLink;
  if (choice.secondary.includes(area)) return PARAMS.secondaryLink;
  return 0;
}

/** Indice 0-1 del legame di un ambito con le scelte ordinate (obiettivi o criticità). */
export function linkIndex(selected: string[], catalogue: Choice[], area: AreaCode): number {
  const w = PARAMS.rankWeights;
  const total = w.reduce((a, b) => a + b, 0);
  let sum = 0;
  selected.slice(0, w.length).forEach((code, i) => {
    sum += w[i] * link(catalogue.find((c) => c.code === code), area);
  });
  return round(sum / total, 2);
}

export function computeResult(r: Responses): Result {
  const rows: AreaResult[] = AREAS.map((a) => {
    const qs = QUESTIONS.filter((q) => q.area === a.code);
    const pts = qs
      .map((q) => r.levels[q.id])
      .filter((l): l is number => typeof l === "number" && l >= 1 && l <= 4)
      .map((l): number => PARAMS.levelPoints[l - 1]);
    const score = pts.length ? round(pts.reduce((x, y) => x + y, 0) / pts.length) : null;
    const importance = r.importance[a.code] ?? 2;
    const objectivesIndex = linkIndex(r.objectives, OBJECTIVES, a.code);
    const issuesIndex = linkIndex(r.issues, ISSUES, a.code);
    const fromText = r.textAreas.includes(a.code);
    const priorityIndex =
      score === null
        ? 0
        : round(
            (100 - score) *
              PARAMS.importanceWeights[importance - 1] *
              (1 +
                PARAMS.bonusObjectives * objectivesIndex +
                PARAMS.bonusIssues * issuesIndex +
                PARAMS.bonusText * (fromText ? 1 : 0)),
          );
    return {
      code: a.code,
      name: a.name,
      score,
      answered: pts.length,
      importance,
      objectivesIndex,
      issuesIndex,
      fromText,
      priorityIndex,
      rank: 0,
      isPriority: false,
      reasons: [],
    };
  });

  // Rango: a parità di indice vale l'ordine degli ambiti (come RANK + COUNTIF nel foglio).
  const order = [...rows].sort((x, y) => y.priorityIndex - x.priorityIndex);
  order.forEach((row, i) => {
    row.rank = i + 1;
    row.isPriority = i < PARAMS.priorities && row.score !== null;
  });
  rows.forEach((row) => (row.reasons = reasonsFor(row, r)));

  const flags: Flag[] = [];
  for (const q of QUESTIONS) {
    const level = r.levels[q.id];
    const answer = r.checks[q.id];
    const f = q.check.flag;
    if (f && level >= f.minLevel && answer && f.answers.includes(answer)) {
      flags.push({
        questionId: q.id,
        area: q.area,
        level,
        answer,
        message: `Hai indicato il livello ${level} su "${q.theme}", ma alla domanda "${q.check.text}" hai risposto "${answer}". Il livello potrebbe essere sovrastimato.`,
      });
    }
  }

  const scored = rows.filter((x) => x.score !== null);
  const overall = scored.length
    ? round(scored.reduce((s, x) => s + (x.score as number), 0) / scored.length)
    : null;

  return { areas: rows, priorities: order.filter((x) => x.isPriority), flags, overall };
}

const IMPORTANCE_LABEL = ["poco rilevante", "rilevante", "decisivo"];

function reasonsFor(row: AreaResult, r: Responses): string[] {
  const out: string[] = [];
  if (row.score !== null) out.push(`Punteggio ${row.score} su 100`);
  out.push(`Indicato come ${IMPORTANCE_LABEL[row.importance - 1]} per i vostri obiettivi`);
  const ob = r.objectives
    .map((c) => OBJECTIVES.find((o) => o.code === c))
    .filter((o): o is Choice => !!o && link(o, row.code) > 0)
    .map((o) => o.label.toLowerCase());
  if (ob.length) out.push(`Legato agli obiettivi: ${ob.join("; ")}`);
  const cr = r.issues
    .map((c) => ISSUES.find((o) => o.code === c))
    .filter((o): o is Choice => !!o && link(o, row.code) > 0)
    .map((o) => o.label.toLowerCase());
  if (cr.length) out.push(`Legato alle criticità: ${cr.join("; ")}`);
  if (row.fromText) out.push("Richiamato nelle tue descrizioni");
  return out;
}

export function emptyResponses(): Responses {
  return {
    profile: {},
    objectives: [],
    objectivesText: "",
    issues: [],
    issuesText: "",
    objectivesTextAreas: [],
    issuesTextAreas: [],
    textAreas: [],
    levels: {},
    checks: {},
    importance: {},
    consents: { service: false, benchmark: false, marketing: false },
  };
}
