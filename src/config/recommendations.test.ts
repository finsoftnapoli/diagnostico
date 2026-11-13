import { describe, expect, it } from "vitest";
import { QUESTIONS } from "@/lib/questionnaire";
import { recommendationFor, RECOMMENDATIONS, SOURCES } from "./recommendations";

describe("libreria delle raccomandazioni", () => {
  it("ha una scheda per ogni tema e per ogni passaggio di livello", () => {
    expect(RECOMMENDATIONS).toHaveLength(QUESTIONS.length * 3);
    for (const q of QUESTIONS) for (const from of [1, 2, 3]) expect(recommendationFor(q.id, from), `${q.id} da ${from}`).not.toBeNull();
    expect(recommendationFor(QUESTIONS[0].id, 4)).toBeNull();
  });
  it("ogni scheda è completa e cita solo riferimenti esistenti", () => {
    for (const x of RECOMMENDATIONS) {
      expect(x.actions).toHaveLength(3);
      for (const t of [x.title, x.tool, x.indicator, x.time, x.pitfall, ...x.actions]) expect(t.trim().length).toBeGreaterThan(5);
      for (const s of x.sources ?? []) expect(SOURCES[s]).toBeDefined();
    }
  });
  it("usa il registro del servizio: niente «tu», niente percentuali di mercato", () => {
    const all = RECOMMENDATIONS.flatMap((x) => [x.title, x.tool, x.indicator, x.pitfall, ...x.actions]).join(" ");
    expect(all).not.toMatch(/\b(tuo|tua|tuoi|tue|devi|puoi)\b/i);
    expect(all).not.toMatch(/\d+\s?%/);
  });
});
