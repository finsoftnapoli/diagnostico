import { describe, expect, it } from "vitest";
import { nextMorning } from "./release-schedule";

describe("invio del report la mattina successiva", () => {
  it("in inverno le 9 italiane sono le 8 UTC del giorno dopo", () => {
    expect(nextMorning(new Date("2026-11-12T15:30:00Z")).toISOString()).toBe("2026-11-13T08:00:00.000Z");
  });
  it("in estate le 9 italiane sono le 7 UTC", () => {
    expect(nextMorning(new Date("2026-07-01T10:00:00Z")).toISOString()).toBe("2026-07-02T07:00:00.000Z");
  });
  it("conta il giorno italiano, non quello UTC: le 23:30 UTC d'inverno sono già il giorno dopo", () => {
    expect(nextMorning(new Date("2026-11-12T23:30:00Z")).toISOString()).toBe("2026-11-14T08:00:00.000Z");
  });
  it("una compilazione del mattino presto parte comunque il giorno dopo", () => {
    expect(nextMorning(new Date("2026-11-12T06:00:00Z")).toISOString()).toBe("2026-11-13T08:00:00.000Z");
  });
  it("attraversa il cambio dell'ora", () => {
    expect(nextMorning(new Date("2026-10-24T12:00:00Z")).toISOString()).toBe("2026-10-25T08:00:00.000Z");
    expect(nextMorning(new Date("2027-03-27T12:00:00Z")).toISOString()).toBe("2027-03-28T07:00:00.000Z");
  });
});
