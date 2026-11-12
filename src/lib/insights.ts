// Spunti del report, ricavati in modo deterministico da risposte e punteggi.
// Nessun testo inventato: frasi costruite dalla banca delle domande e dalle scelte dell'utente.
// Dalla fase 2 l'AI userà questi stessi elementi per scrivere il commento.
import type { Benchmark } from "@/config/benchmark";
import { AREAS, ISSUES, OBJECTIVES, QUESTIONS } from "./questionnaire";
import type { AreaResult, Result } from "./scoring";
import { levelEquivalent } from "./score-meaning";
import type { AreaCode, Question, Responses } from "./types";

import { LEVEL_NAMES } from "./levels";
export { LEVEL_NAMES };

export function levelLabel(score: number | null) {
  if (score === null) return "—";
  if (score < 25) return LEVEL_NAMES[0];
  if (score < 50) return LEVEL_NAMES[1];
  if (score < 75) return LEVEL_NAMES[2];
  return LEVEL_NAMES[3];
}

export interface ThemeView {
  id: string;
  area: AreaCode;
  theme: string;
  level: number;
  current: string;
  next: string | null; // descrizione del livello successivo
  sizeNote: string | null;
}

export interface NextStep {
  area: AreaCode;
  steps: ThemeView[]; // 1-2 temi su cui agire per primi
}

export interface Readiness {
  code: string;
  label: string;
  score: number; // media pesata degli ambiti collegati
  verdict: "base solida" | "da rafforzare" | "ostacolo";
  weakest: ThemeView | null;
  areas: AreaCode[];
}

export interface IssueCause {
  code: string;
  label: string;
  causes: ThemeView[]; // temi a livello 1-2 negli ambiti collegati
}

export interface Insights {
  overall: number | null;
  overallLabel: string;
  benchmarkAvg: number;
  deltaVsBenchmark: number | null;
  spread: number; // differenza tra ambito più forte e più debole
  balanced: boolean;
  strongest: AreaResult[];
  weakest: AreaResult[];
  aboveBenchmark: AreaCode[];
  belowBenchmark: AreaCode[];
  strengths: ThemeView[]; // temi a livello 3-4
  themes: ThemeView[];
  nextSteps: NextStep[];
  readiness: Readiness[];
  issueCauses: IssueCause[];
  summary: string[];
}

const nameOf = (c: AreaCode) => AREAS.find((a) => a.code === c)?.name ?? c;

/** Fascia di fatturato → chiave usata nelle note di adattamento delle domande. */
function sizeKey(band: string | undefined): string | null {
  if (band === "Meno di €1M" || band === "€1-2M" || band === "€2-5M" || band === "€5-10M") return "€2-10M";
  if (band === "€50-100M" || band === "€100M e oltre") return "€50-100M";
  return null;
}

function themeView(q: Question, r: Responses, band: string | undefined): ThemeView {
  const level = r.levels[q.id] ?? 1;
  const key = sizeKey(band);
  return {
    id: q.id,
    area: q.area,
    theme: q.theme,
    level,
    current: q.levels[level - 1],
    next: level < 4 ? q.levels[level] : null,
    sizeNote: key && q.sizeNote?.startsWith(key) ? q.sizeNote.split(":").slice(1).join(":").trim() : null,
  };
}

export function buildInsights(r: Responses, res: Result, bench: Benchmark): Insights {
  const band = r.profile["PR-02"];
  const themes = QUESTIONS.map((q) => themeView(q, r, band));
  const scored = res.areas.filter((a) => a.score !== null);
  const byScore = [...scored].sort((a, b) => (b.score as number) - (a.score as number));
  const spread = byScore.length ? (byScore[0].score as number) - (byScore[byScore.length - 1].score as number) : 0;
  const benchmarkAvg = Math.round(AREAS.reduce((s, a) => s + bench.values[a.code], 0) / AREAS.length);
  const aboveBenchmark = scored.filter((a) => (a.score as number) >= bench.values[a.code] + 5).map((a) => a.code);
  const belowBenchmark = scored.filter((a) => (a.score as number) <= bench.values[a.code] - 5).map((a) => a.code);

  const nextSteps: NextStep[] = res.priorities.map((p) => ({
    area: p.code,
    steps: themes
      .filter((t) => t.area === p.code && t.next)
      .sort((a, b) => a.level - b.level)
      .slice(0, 2),
  }));

  const readiness: Readiness[] = r.objectives
    .map((code) => OBJECTIVES.find((o) => o.code === code))
    .filter((o) => !!o)
    .map((o) => {
      const weights: [AreaCode, number][] = [[o.primary, 1], ...o.secondary.map((s): [AreaCode, number] => [s, 0.5])];
      let sum = 0;
      let tot = 0;
      for (const [c, w] of weights) {
        const sc = res.areas.find((a) => a.code === c)?.score;
        if (sc === null || sc === undefined) continue;
        sum += sc * w;
        tot += w;
      }
      const score = tot ? Math.round(sum / tot) : 0;
      const linked = themes.filter((t) => weights.some(([c]) => c === t.area)).sort((a, b) => a.level - b.level);
      return {
        code: o.code,
        label: o.label,
        score,
        verdict: score >= 60 ? "base solida" : score >= 35 ? "da rafforzare" : "ostacolo",
        weakest: linked[0] ?? null,
        areas: weights.map(([c]) => c),
      } satisfies Readiness;
    });

  const issueCauses: IssueCause[] = r.issues
    .map((code) => ISSUES.find((o) => o.code === code))
    .filter((o) => !!o)
    .map((o) => {
      const areas = [o.primary, ...o.secondary];
      return {
        code: o.code,
        label: o.label,
        causes: themes
          .filter((t) => areas.includes(t.area) && t.level <= 2)
          .sort((a, b) => a.level - b.level || areas.indexOf(a.area) - areas.indexOf(b.area))
          .slice(0, 3),
      };
    });

  const strengths = themes.filter((t) => t.level >= 3).sort((a, b) => b.level - a.level);
  const overall = res.overall;
  const deltaVsBenchmark = overall === null ? null : overall - benchmarkAvg;

  const summary: string[] = [];
  if (overall !== null) {
    const rel =
      deltaVsBenchmark === null || Math.abs(deltaVsBenchmark) < 5
        ? "in linea con il riferimento della vostra fascia"
        : deltaVsBenchmark > 0
          ? `${deltaVsBenchmark} punti sopra il riferimento della vostra fascia`
          : `${-deltaVsBenchmark} punti sotto il riferimento della vostra fascia`;
    summary.push(`${cap(levelEquivalent(overall))} (${overall} su 100), ${rel}.`);
  }
  if (byScore.length >= 2) {
    const top = byScore[0];
    const low = byScore[byScore.length - 1];
    summary.push(
      spread > 30
        ? `Profilo sbilanciato: ${nameOf(top.code)} è l'ambito più avanti, ${nameOf(low.code)} il più indietro. Gli ambiti deboli rischiano di frenare quelli forti.`
        : "Profilo abbastanza omogeneo: gli otto ambiti sono a livelli di maturità vicini tra loro.",
    );
  }
  const blocked = readiness.filter((x) => x.verdict === "ostacolo");
  if (blocked.length)
    summary.push(
      `Per ${listIt(blocked.map((b) => `«${b.label.toLowerCase()}»`))} gli ambiti che servono sono oggi deboli: è il primo nodo da sciogliere.`,
    );
  if (res.priorities.length) summary.push(`Le priorità su cui concentrarvi: ${listIt(res.priorities.map((p) => nameOf(p.code)))}.`);
  if (res.flags.length)
    summary.push(
      `${res.flags.length === 1 ? "Una risposta va verificata" : `${res.flags.length} risposte vanno verificate`}: in quei punti il quadro potrebbe essere ottimista.`,
    );

  return {
    overall,
    overallLabel: levelLabel(overall),
    benchmarkAvg,
    deltaVsBenchmark,
    spread,
    balanced: spread <= 30,
    strongest: byScore.slice(0, 2),
    weakest: byScore.slice(-2).reverse(),
    aboveBenchmark,
    belowBenchmark,
    strengths,
    themes,
    nextSteps,
    readiness,
    issueCauses,
    summary,
  };
}

const cap = (x: string) => x.charAt(0).toUpperCase() + x.slice(1);

/** "a, b e c" */
function listIt(xs: string[]): string {
  return xs.length <= 1 ? (xs[0] ?? "") : `${xs.slice(0, -1).join(", ")} e ${xs[xs.length - 1]}`;
}
