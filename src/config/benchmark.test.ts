import { describe, expect, it } from "vitest";
import { macroOf, MACRO_BANDS, medianBenchmark, REVENUE_BANDS } from "./benchmark";

describe("confronto con aziende reali", () => {
  it("ogni fascia appartiene a una sola macro-fascia", () => {
    for (const b of REVENUE_BANDS) expect(MACRO_BANDS.filter((m) => (m.bands as string[]).includes(b))).toHaveLength(1);
    expect(macroOf("€10-25M")?.text).toBe("€5-25M");
  });
  it("usa la mediana solo con un campione sufficiente", () => {
    const values = { STR: 50, FIN: 50, MKT: 50, PER: 50, OPS: 50, DIG: 50, INN: 50, SOS: 50 };
    expect(medianBenchmark({ sample: 12, values, scopeText: "€5-25M" })).toBeNull();
    expect(medianBenchmark({ sample: 31, values, scopeText: "€5-25M" })?.label).toBe("Mediana aziende €5-25M");
  });
});
