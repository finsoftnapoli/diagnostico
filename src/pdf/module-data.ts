// Dati del report di un modulo (Ottogramma dell'ambito) in PDF: tutto già calcolato e in parole.
import { BRAND } from "@/config/brand";
import { levelLabel } from "@/lib/insights";
import type { ModuleNarrative } from "@/lib/module-report";
import type { ModuleResult } from "@/lib/module-scoring";
import { MODULE_QUESTIONS } from "@/lib/modules";
import { AREAS } from "@/lib/questionnaire";
import { areaReading, levelEquivalent, moduleReading } from "@/lib/score-meaning";
import type { AreaCode } from "@/lib/types";

export interface ModulePdfTheme {
  id: string;
  theme: string;
  level: number | null;
  now: string | null;
  next: string | null;
  flag: string | null;
}

export interface ModulePdfSub {
  code: string;
  n: number;
  name: string;
  short: string;
  description: string;
  score: number | null;
  level: string;
  weak: boolean;
  reading: string;
  expert: { diagnosis: string; actions: string[] } | null;
  themes: ModulePdfTheme[];
}

export interface ModulePdfData {
  /** Vero se un esperto ha rivisto e approvato il report prima dell'invio. */
  reviewed: boolean;
  company: string;
  area: AreaCode;
  areaName: string;
  date: string;
  score: number | null;
  level: string;
  equivalent: string;
  diagnosticScore: number | null;
  diagnosticNote: string;
  reference: { value: number; label: string } | null;
  reading: string[];
  strongest: string[];
  weakest: string[];
  subs: ModulePdfSub[];
  narrative: ModuleNarrative;
  brand: string;
  owner: string;
  reportName: string;
}

export function modulePdfData(input: {
  area: AreaCode;
  company: string;
  result: ModuleResult;
  diagnosticScore: number | null;
  reference: { value: number; label: string } | null;
  narrative: ModuleNarrative;
  completedAt: string;
  reviewed?: boolean;
}): ModulePdfData {
  const { area, result, diagnosticScore, reference, narrative } = input;
  const qs = MODULE_QUESTIONS[area];
  const score = result.score;
  const scored = result.subs.filter((x) => x.score !== null);
  const byScore = [...scored].sort((x, y) => (x.score as number) - (y.score as number));
  const weak = new Set(byScore.slice(0, 2).map((x) => x.code));
  const levels = result.themes.filter((x) => x.level !== null).map((x) => x.level as number);
  const expert = new Map(narrative.themes.map((x) => [x.theme, { diagnosis: x.diagnosis, actions: x.actions }]));

  const diagnosticNote =
    score === null || diagnosticScore === null
      ? ""
      : Math.abs(score - diagnosticScore) <= 8
        ? "L'approfondimento conferma il quadro del diagnostico iniziale."
        : score > diagnosticScore
          ? "L'esame di dettaglio mostra un quadro migliore di quello emerso dal diagnostico iniziale."
          : "L'esame di dettaglio mostra un quadro più fragile di quello emerso dal diagnostico iniziale.";

  const reading = moduleReading(score, reference?.value ?? null, levels);

  return {
    reviewed: !!input.reviewed,
    company: input.company || "La vostra azienda",
    area,
    areaName: AREAS.find((a) => a.code === area)?.name ?? area,
    date: new Date(input.completedAt).toLocaleDateString("it-IT", {
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: "Europe/Rome",
    }),
    score,
    level: levelLabel(score),
    equivalent: score === null ? "" : levelEquivalent(score),
    diagnosticScore,
    diagnosticNote,
    reference,
    reading,
    strongest: [...byScore]
      .reverse()
      .slice(0, 2)
      .map((x) => `${x.name} (${x.score})`),
    weakest: byScore.slice(0, 2).map((x) => `${x.name} (${x.score})`),
    subs: result.subs.map((sa, i) => {
      const themes = result.themes.filter((x) => x.sub === sa.code);
      const lv = themes.filter((x) => x.level !== null).map((x) => x.level as number);
      return {
        code: sa.code,
        n: i + 1,
        name: sa.name,
        short: sa.short,
        description: sa.description,
        score: sa.score,
        level: sa.score === null ? "Non applicabile" : levelLabel(sa.score),
        weak: weak.has(sa.code),
        reading: sa.score === null ? "Nessun tema applicabile all'azienda." : areaReading(sa.score, null, lv),
        expert: expert.get(sa.name) ?? null,
        themes: themes.map((th) => {
          const q = qs.find((x) => x.id === th.id);
          return {
            id: th.id,
            theme: th.theme,
            level: th.level,
            now: q && th.level ? q.levels[th.level - 1] : null,
            next: q && th.level && th.level < 4 ? q.levels[th.level] : null,
            flag: th.flag,
          };
        }),
      };
    }),
    narrative,
    brand: BRAND.name,
    owner: BRAND.ownerLegal,
    reportName: BRAND.reportName,
  };
}
