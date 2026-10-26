import { describe, expect, it } from "vitest";
import { computeModule, moduleIncomplete, sanitizeModuleResponses } from "./module-scoring";
import { MODULE_QUESTIONS, MODULE_SUBAREAS } from "./modules";

describe("moduli di approfondimento", () => {
  it("ha 8 sotto-ambiti con 2-3 domande ciascuno in tutti gli 8 ambiti", () => {
    for (const [area, qs] of Object.entries(MODULE_QUESTIONS)) {
      const subs = MODULE_SUBAREAS[area as keyof typeof MODULE_SUBAREAS];
      expect(subs).toHaveLength(8);
      for (const s of subs) expect(qs.filter((q) => q.sub === s.code).length).toBeGreaterThanOrEqual(2);
      for (const s of subs) expect(qs.filter((q) => q.sub === s.code).length).toBeLessThanOrEqual(3);
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
    const bad = sanitizeModuleResponses("FIN", { levels: { "FIN-1.1": 0 } });
    expect(bad.levels["FIN-1.1"]).toBeUndefined();
  });

  it("calcola i sotto-ambiti e il modulo come media dei sotto-ambiti", () => {
    // FIN-1 (2 domande) tutto a livello 4, il resto a livello 1: un sotto-ambito su otto a 100
    const levels: Record<string, number> = {};
    for (const q of MODULE_QUESTIONS.FIN) levels[q.id] = q.sub === "FIN-1" ? 4 : 1;
    const res = computeModule("FIN", sanitizeModuleResponses("FIN", { levels }));
    expect(res.subs.find((s) => s.code === "FIN-1")?.score).toBe(100);
    expect(res.subs.find((s) => s.code === "FIN-8")?.score).toBe(0);
    expect(res.score).toBe(13);
  });

  it("segnala la possibile sovrastima", () => {
    const r = sanitizeModuleResponses("FIN", { levels: { "FIN-1.1": 4 }, checks: { "FIN-1.1": "No" } });
    const t = computeModule("FIN", r).themes.find((x) => x.id === "FIN-1.1")!;
    expect(t.flag).toContain("possibile sovrastima");
    expect(moduleIncomplete("FIN", r)).toContain("manca la risposta");
  });
});
