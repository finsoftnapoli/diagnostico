import { describe, expect, it } from "vitest";
import { averageScores, latestByMember, misalignments, type MemberResult } from "./team";

const m = (label: string, levels: Record<string, number>, fin: number): MemberResult => ({
  id: label, label, completedAt: "2026-10-26", scores: { FIN: fin }, levels,
});

describe("confronto tra colleghi", () => {
  it("segnala le domande con più di un livello di distanza", () => {
    const res = misalignments([m("titolare", { "FIN-2": 4, "FIN-1": 2 }, 80), m("cfo", { "FIN-2": 1, "FIN-1": 3 }, 30)]);
    expect(res.map((x) => x.questionId)).toEqual(["FIN-2"]);
    expect(res[0].byMember).toEqual([{ label: "titolare", level: 4 }, { label: "cfo", level: 1 }]);
  });
  it("calcola la media e tiene l'ultima compilazione di ciascuno", () => {
    expect(averageScores([m("a", {}, 80), m("b", {}, 30)]).FIN).toBe(55);
    const rows = [
      { userId: "u1", completedAt: "2026-01-01" },
      { userId: "u1", completedAt: "2026-06-01" },
      { userId: "u2", completedAt: "2026-03-01" },
    ];
    expect(latestByMember(rows).map((r) => r.completedAt)).toEqual(["2026-03-01", "2026-06-01"]);
  });
});
