import { describe, expect, it } from "vitest";
import { sampleResponses } from "./fixtures/sample";
import { firstIncomplete, liveAreas, minutesLeft, ORDERED_QUESTIONS, stepOf, stepProblem, STEPS } from "./flow";
import { emptyResponses } from "./scoring";

describe("percorso del questionario", () => {
  it("ha avvio, 24 domande, ambizioni, sfide e azienda", () => {
    expect(STEPS).toHaveLength(28);
    expect(ORDERED_QUESTIONS).toHaveLength(24);
    expect(STEPS[0].kind).toBe("start");
    expect(STEPS.at(-1)?.kind).toBe("profile");
    // le domande di uno stesso ambito sono consecutive
    const areas = ORDERED_QUESTIONS.map((q) => q.area);
    expect(areas.filter((a, i) => i === 0 || a !== areas[i - 1])).toHaveLength(8);
  });

  it("riprende dal primo passo incompleto", () => {
    const r = emptyResponses();
    expect(firstIncomplete(r)).toBe(0);
    r.consents.service = true;
    expect(firstIncomplete(r)).toBe(1);
    const q = ORDERED_QUESTIONS[0];
    r.levels[q.id] = 2;
    expect(stepProblem(STEPS[1], r)).toMatch(/verifica/);
    r.checks[q.id] = q.check.options[0];
    expect(firstIncomplete(r)).toBe(2);
    const full = sampleResponses();
    full.consents.service = true;
    expect(firstIncomplete(full)).toBe(STEPS.length - 1);
  });

  it("la partita IVA è facoltativa all'avvio e obbligatoria alla fine", () => {
    const r = sampleResponses();
    r.consents.service = true;
    r.profile["PR-10"] = "";
    expect(stepProblem(STEPS[0], r)).toBeNull();
    expect(stepProblem(STEPS[stepOf("profile")], r)).not.toBeNull();
    r.profile["PR-10"] = "123";
    expect(stepProblem(STEPS[0], r)).toMatch(/partita IVA/);
  });

  it("l'Ottogramma segue le risposte", () => {
    const r = emptyResponses();
    expect(liveAreas(r).every((a) => a.level === null && !a.done)).toBe(true);
    const [q1, q2, q3] = ORDERED_QUESTIONS;
    r.levels[q1.id] = 1;
    r.levels[q2.id] = 3;
    expect(liveAreas(r)[0]).toMatchObject({ level: 2, answered: 2, done: false });
    r.levels[q3.id] = 2;
    for (const q of [q1, q2, q3]) r.checks[q.id] = q.check.options[0];
    expect(liveAreas(r)[0].done).toBe(true);
  });

  it("stima circa un quarto d'ora all'inizio e scende", () => {
    expect(minutesLeft(0)).toBeGreaterThanOrEqual(12);
    expect(minutesLeft(0)).toBeLessThanOrEqual(16);
    expect(minutesLeft(STEPS.length - 1)).toBeLessThanOrEqual(2);
  });
});
