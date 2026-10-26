import { describe, expect, it } from "vitest";
import { EXAMPLE } from "./questionnaire";
import { computeResult, emptyResponses } from "./scoring";
import type { AreaCode, Responses } from "./types";

function exampleResponses(): Responses {
  return {
    ...emptyResponses(),
    levels: { ...EXAMPLE.levels },
    importance: { ...EXAMPLE.importance } as Responses["importance"],
    objectives: [...EXAMPLE.objectives],
    issues: [...EXAMPLE.issues],
    textAreas: [...EXAMPLE.textAreas] as AreaCode[],
  };
}

// Valori calcolati dal foglio Esempio_priorita (banca delle domande v0.2).
const EXPECTED: Record<AreaCode, [number, number, number, number, number]> = {
  // punteggio, indice obiettivi, indice criticità, indice priorità, rango
  STR: [11, 0.33, 0.34, 513, 2],
  FIN: [22, 0.5, 0.67, 566, 1],
  MKT: [33, 0.25, 0, 168, 4],
  PER: [22, 0.42, 0.17, 431, 3],
  OPS: [56, 0.25, 0, 110, 6],
  DIG: [22, 0, 0.08, 168, 5],
  INN: [22, 0, 0, 78, 7],
  SOS: [22, 0, 0, 78, 8],
};

describe("motore di punteggio", () => {
  it("riproduce il foglio di esempio", () => {
    const res = computeResult(exampleResponses());
    for (const a of res.areas) {
      const [score, ob, cr, prio, rank] = EXPECTED[a.code];
      expect([a.code, a.score, a.objectivesIndex, a.issuesIndex, a.priorityIndex, a.rank]).toEqual([
        a.code, score, ob, cr, prio, rank,
      ]);
    }
    expect(res.priorities.map((p) => p.code)).toEqual(["FIN", "STR", "PER"]);
  });

  it("segnala la possibile sovrastima", () => {
    const r = exampleResponses();
    r.levels["FIN-2"] = 4;
    r.checks["FIN-2"] = "No";
    r.checks["STR-1"] = "No"; // livello 2: nessun segnale
    const res = computeResult(r);
    expect(res.flags.map((f) => f.questionId)).toEqual(["FIN-2"]);
  });

  it("gestisce un questionario vuoto", () => {
    const res = computeResult(emptyResponses());
    expect(res.overall).toBeNull();
    expect(res.priorities).toHaveLength(0);
  });
});
