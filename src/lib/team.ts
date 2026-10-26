// Confronto tra le compilazioni dei membri di un'azienda: profilo medio e disallineamenti.
import { AREAS, QUESTIONS } from "./questionnaire";
import type { AreaCode } from "./types";

export interface MemberResult {
  id: string;
  label: string; // email o nome
  completedAt: string;
  scores: Partial<Record<AreaCode, number | null>>;
  levels: Record<string, number>;
}

export interface Misalignment {
  questionId: string;
  area: AreaCode;
  theme: string;
  min: number;
  max: number;
  byMember: { label: string; level: number }[];
}

/** Tiene la compilazione più recente di ciascun membro. */
export function latestByMember<T extends { userId: string; completedAt: string }>(rows: T[]): T[] {
  const m = new Map<string, T>();
  for (const r of rows) {
    const cur = m.get(r.userId);
    if (!cur || cur.completedAt < r.completedAt) m.set(r.userId, r);
  }
  return [...m.values()].sort((a, b) => a.completedAt.localeCompare(b.completedAt));
}

export function averageScores(members: MemberResult[]): Record<AreaCode, number> {
  const out = {} as Record<AreaCode, number>;
  for (const a of AREAS) {
    const xs = members.map((m) => m.scores[a.code]).filter((x): x is number => typeof x === "number");
    out[a.code] = xs.length ? Math.round(xs.reduce((s, x) => s + x, 0) / xs.length) : 0;
  }
  return out;
}

/** Domande in cui le risposte dei membri distano più di un livello. */
export function misalignments(members: MemberResult[]): Misalignment[] {
  if (members.length < 2) return [];
  const out: Misalignment[] = [];
  for (const q of QUESTIONS) {
    const byMember = members.filter((m) => m.levels[q.id]).map((m) => ({ label: m.label, level: m.levels[q.id] }));
    if (byMember.length < 2) continue;
    const levels = byMember.map((b) => b.level);
    const min = Math.min(...levels);
    const max = Math.max(...levels);
    if (max - min > 1) out.push({ questionId: q.id, area: q.area, theme: q.theme, min, max, byMember });
  }
  return out.sort((a, b) => b.max - b.min - (a.max - a.min));
}
