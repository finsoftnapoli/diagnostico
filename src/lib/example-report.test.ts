import { describe, expect, it } from "vitest";
import { EXAMPLE_NARRATIVE, exampleResponses } from "./example-report";
import { computeResult } from "./scoring";

describe("report di esempio", () => {
  const res = computeResult(exampleResponses());
  it("le priorità del testo sono quelle calcolate dal motore, nello stesso ordine", () => {
    expect(EXAMPLE_NARRATIVE.priorities.map((p) => p.area)).toEqual(res.priorities.map((p) => p.code));
  });
  it("i conteggi citati nella sintesi corrispondono alle risposte", () => {
    const levels = Object.values(exampleResponses().levels);
    expect(levels.filter((l) => l === 1)).toHaveLength(7);
    expect(levels.filter((l) => l === 2)).toHaveLength(15);
    expect(EXAMPLE_NARRATIVE.executiveSummary).toContain("7 sono al livello «Informale» e 15 al livello «Base»");
    expect(res.areas.reduce((a, b) => ((b.score ?? 0) > (a.score ?? 0) ? b : a)).code).toBe("OPS");
  });
});
