import { describe, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
import { pickInputs } from "./company-docs";
import { emptyResponses } from "./scoring";

const fin = (year: number) => ({ year, ricavi: year * 1000 }) as never;
const plan = { titolo: "Piano", periodo: "2026-2028", sintesi: "Crescita", obiettivi: [], iniziative: [], investimenti: null, rischi: [], ambiti: [] };

describe("documenti per il report", () => {
  it("usa il bilancio archiviato solo se più recente di quello della compilazione", () => {
    const r = { ...emptyResponses(), financials: fin(2024) };
    const docs = [
      { id: "b23", kind: "bilancio", period: 2023, created_at: "2026-10-26T10:00:00Z", extracted: { financials: fin(2023) } },
      { id: "b25", kind: "bilancio", period: 2025, created_at: "2026-10-20T10:00:00Z", extracted: { financials: fin(2025) } },
      { id: "bp", kind: "business_plan", period: 2026, created_at: "2026-10-25T10:00:00Z", extracted: { plan } },
      { id: "x", kind: "altro", period: null, created_at: "2026-10-25T10:00:00Z", extracted: null },
    ];
    const i = pickInputs(docs, r);
    expect(i.financials).toEqual(fin(2025));
    expect(i.plan?.periodo).toBe("2026-2028");
    expect(i.others).toBeUndefined();
    expect(i.documentIds).toEqual(["b25", "bp"]);
    expect(pickInputs(docs, { ...r, financials: fin(2025) }).financials).toBeUndefined();
  });
});
