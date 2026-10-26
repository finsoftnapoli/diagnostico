import { describe, expect, it } from "vitest";
import { incompleteReason, sanitizeResponses } from "./sanitize";

describe("pulizia delle risposte", () => {
  it("scarta valori non ammessi", () => {
    const r = sanitizeResponses({
      levels: { "STR-1": 9, "FIN-1": 3, "XXX-1": 2 },
      checks: { "STR-1": "Forse", "FIN-1": "Mensile" },
      objectives: ["OB-01", "OB-01", "ZZ", "OB-02", "OB-03", "OB-04"],
      importance: { STR: 5, FIN: 3 },
      objectivesTextAreas: ["STR", "BAD"],
      consents: { service: "true", benchmark: true },
      profile: { "PR-02": "€2-5M", "PR-03": "inventato" },
    });
    expect(r.levels).toEqual({ "FIN-1": 3 });
    expect(r.checks).toEqual({ "FIN-1": "Mensile" });
    expect(r.objectives).toEqual(["OB-01", "OB-02", "OB-03"]);
    expect(r.importance).toEqual({ FIN: 3 });
    expect(r.textAreas).toEqual(["STR"]);
    expect(r.consents).toEqual({ service: false, benchmark: true, marketing: false });
    expect(r.profile).toEqual({ "PR-02": "€2-5M" });
    expect(incompleteReason(r)).toBe("manca il consenso al servizio");
  });

  it("non salva mai i nomi delle persone e tiene solo id validi dei documenti", () => {
    const r = sanitizeResponses({
      people: [{ name: "Mario Rossi", role: "Amministratore unico" }],
      documents: { visura: "3f2b7a8e-1c4d-4e5f-9a6b-7c8d9e0f1a2b", bilancio: true },
      governance: { organo: "amministratore unico", amministratori: 1, organoControllo: false, soci: 2, quotaSocioPrincipale: 60 },
    });
    expect(r.people).toBeUndefined();
    expect(JSON.stringify(r)).not.toContain("Mario Rossi");
    expect(r.documents).toEqual({ visura: "3f2b7a8e-1c4d-4e5f-9a6b-7c8d9e0f1a2b", bilancio: undefined });
    expect(r.governance?.soci).toBe(2);
  });
});
