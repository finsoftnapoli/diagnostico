import { describe, expect, it } from "vitest";
import { normativeBenchmark } from "@/config/benchmark";
import { buildInsights } from "./insights";
import { EXAMPLE } from "./questionnaire";
import { computeResult, emptyResponses } from "./scoring";
import type { AreaCode, Responses } from "./types";

function example(): Responses {
  return {
    ...emptyResponses(),
    profile: { "PR-02": "€5-10M" },
    levels: { ...EXAMPLE.levels },
    objectives: [...EXAMPLE.objectives],
    issues: [...EXAMPLE.issues],
    textAreas: [...EXAMPLE.textAreas] as AreaCode[],
  };
}

describe("spunti del report", () => {
  const r = example();
  const ins = buildInsights(r, computeResult(r), normativeBenchmark("€5-10M"));

  it("propone il livello successivo come prossimo passo nelle priorità", () => {
    expect(ins.nextSteps.map((n) => n.area)).toEqual(["FIN", "STR", "PER"]);
    const fin = ins.nextSteps[0].steps[0];
    expect(fin.id).toBe("FIN-2"); // liquidità a livello 1: il tema più debole di finanza
    expect(fin.next).toMatch(/previsione occasionali|Si fanno previsioni occasionali/);
  });

  it("valuta la prontezza per ogni obiettivo", () => {
    expect(ins.readiness.map((x) => x.code)).toEqual(["OB-04", "OB-06", "OB-07"]);
    // migliorare la marginalità: FIN 22 (peso 1), OPS 56 e MKT 33 (peso 0,5) → 33
    expect(ins.readiness[0].score).toBe(33);
    expect(ins.readiness[0].verdict).toBe("ostacolo");
  });

  it("collega le sfide ai temi deboli", () => {
    const liq = ins.issueCauses.find((c) => c.code === "CR-02")!;
    expect(liq.causes[0].id).toBe("FIN-2");
  });

  it("riporta le note per fascia dimensionale", () => {
    const str2 = ins.themes.find((t) => t.id === "STR-2")!;
    expect(str2.sizeNote).toMatch(/riunione settimanale/);
  });

  it("confronta con il riferimento della fascia", () => {
    expect(ins.benchmarkAvg).toBe(42);
    expect(ins.belowBenchmark).toContain("FIN");
    expect(ins.summary[0]).toMatch(/sotto il riferimento/);
  });
});
