import { describe, expect, it } from "vitest";
import { narrativeProblem } from "./narrative-checks";

const long = (n: number) => "x".repeat(n);
const ok = {
  executiveSummary: long(300),
  crossCutting: long(200),
  priorities: ["MKT", "INN", "STR"].map((area) => ({ area, title: "Titolo", diagnosis: long(200), actions: [long(30), long(30)] })),
  quickWins: [long(30), long(30)],
  closing: long(100),
};

describe("completezza del report", () => {
  it("accetta un report completo", () => {
    expect(narrativeProblem(ok as never, ["MKT", "INN", "STR"])).toBe("");
  });
  it("scarta priorità mancanti, vuote e interventi rapidi assenti", () => {
    expect(narrativeProblem({ ...ok, priorities: ok.priorities.slice(0, 1) } as never, ["MKT", "INN", "STR"])).toMatch(/priorità mancanti/);
    expect(
      narrativeProblem({ ...ok, priorities: [{ ...ok.priorities[0], diagnosis: "", actions: [] }, ...ok.priorities.slice(1)] } as never, [
        "MKT",
        "INN",
        "STR",
      ]),
    ).toMatch(/senza diagnosi/);
    expect(narrativeProblem({ ...ok, quickWins: [] } as never, ["MKT"])).toMatch(/interventi rapidi/);
  });
});
