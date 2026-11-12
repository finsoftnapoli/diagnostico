import { describe, expect, it } from "vitest";
import { DIAGNOSTIC_SPEC } from "./narrative-spec";
import { reviewChecks } from "./review-checks";

const w = (n: number) => Array(n).fill("parola").join(" ");
const good = {
  executiveSummary: w(200),
  crossCutting: w(120),
  priorities: ["MKT", "INN", "STR"].map((area) => ({
    area,
    title: "Dare struttura alle vendite",
    diagnosis: w(80),
    actions: ["Azione uno", "Azione due"],
  })),
  quickWins: ["Primo intervento", "Secondo intervento"],
  closing: w(60),
};

describe("controlli di revisione", () => {
  it("non segnala nulla su un report in ordine", () => {
    expect(reviewChecks(DIAGNOSTIC_SPEC, good, { expected: { priorities: ["MKT", "INN", "STR"] } })).toEqual([]);
  });
  it("segnala vuoti, numeri nudi, promesse, segnaposto e priorità diverse da quelle calcolate", () => {
    const bad = {
      ...good,
      executiveSummary: `${w(200)} Finanza è a 0 su 100 contro 35. Vi garantisce risultati. [da completare]`,
      priorities: [...good.priorities.slice(0, 2), { area: "FIN", title: "x", diagnosis: "", actions: [] }],
      quickWins: [],
    };
    const issues = reviewChecks(DIAGNOSTIC_SPEC, bad, {
      expected: { priorities: ["MKT", "INN", "STR"] },
      labels: { STR: "Strategia", FIN: "Finanza" },
    });
    const text = issues.map((i) => `${i.level}|${i.where}|${i.message}`).join("\n");
    expect(text).toMatch(/attenzione\|Sintesi per la direzione\|cita punteggi/);
    expect(text).toMatch(/promesse/);
    expect(text).toMatch(/segnaposto/);
    expect(text).toMatch(/manca Strategia/);
    expect(text).toMatch(/include Finanza/);
    expect(text).toMatch(/errore\|Finanza · Diagnosi\|è vuoto/);
    expect(text).toMatch(/errore\|Interventi rapidi\|non ha voci/);
  });
});
