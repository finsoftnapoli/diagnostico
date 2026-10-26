import { describe, expect, it } from "vitest";
import { computeModule, moduleIncomplete, sanitizeModuleResponses } from "./module-scoring";
import { MODULE_QUESTIONS } from "./modules";

describe("moduli di approfondimento", () => {
  it("ha domande coerenti per tutti gli 8 ambiti", () => {
    for (const [area, qs] of Object.entries(MODULE_QUESTIONS)) {
      expect(qs.length).toBeGreaterThanOrEqual(8);
      expect(new Set(qs.map((q) => q.id)).size).toBe(qs.length);
      for (const q of qs) {
        expect(q.levels).toHaveLength(4);
        expect(q.area).toBe(area);
      }
    }
  });

  it("scarta risposte non valide e calcola il punteggio senza i temi non applicabili", () => {
    const qs = MODULE_QUESTIONS.OPS;
    const levels: Record<string, number> = {};
    const checks: Record<string, string> = {};
    for (const q of qs) {
      levels[q.id] = q.na ? 0 : 3;
      if (q.check) checks[q.id] = q.check.options[0];
    }
    const r = sanitizeModuleResponses("OPS", { levels: { ...levels, "XXX-1": 4 }, checks, notes: "  nota " });
    expect(r.levels["XXX-1"]).toBeUndefined();
    expect(r.notes).toBe("nota");
    expect(moduleIncomplete("OPS", r)).toBeNull();
    const res = computeModule("OPS", r);
    expect(res.score).toBe(67);
    expect(res.themes.filter((t) => t.level === null)).toHaveLength(qs.filter((q) => q.na).length);
    // "non applicabile" non è ammesso dove non previsto
    const bad = sanitizeModuleResponses("FIN", { levels: { "FIN-A01": 0 } });
    expect(bad.levels["FIN-A01"]).toBeUndefined();
  });

  it("segnala la possibile sovrastima", () => {
    const r = sanitizeModuleResponses("FIN", { levels: { "FIN-A01": 4 }, checks: { "FIN-A01": "No" } });
    const t = computeModule("FIN", r).themes.find((x) => x.id === "FIN-A01")!;
    expect(t.flag).toContain("possibile sovrastima");
    expect(moduleIncomplete("FIN", r)).toContain("manca la risposta");
  });
});
