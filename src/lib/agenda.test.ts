import { describe, expect, it } from "vitest";
import { addDays, expandTemplate, mondayOf, overlapsBusy, romeParts, romeToUtc, weekdayIndex } from "./agenda-time";
import { parseBusy, safeFeedUrl } from "./agenda-ics";
import { bookingsFeed } from "./ics";

describe("ora italiana", () => {
  it("converte con ora legale e ora solare", () => {
    expect(romeToUtc("2026-07-01", "10:00")?.toISOString()).toBe("2026-07-01T08:00:00.000Z");
    expect(romeToUtc("2026-11-16", "10:00")?.toISOString()).toBe("2026-11-16T09:00:00.000Z");
    expect(romeToUtc("2026-10-25", "10:00")?.toISOString()).toBe("2026-10-25T09:00:00.000Z");
    expect(romeToUtc("2026-03-29", "10:00")?.toISOString()).toBe("2026-03-29T08:00:00.000Z");
  });
  it("torna indietro con romeParts", () => {
    expect(romeParts(new Date("2026-07-01T22:30:00Z"))).toEqual({ date: "2026-07-02", time: "00:30" });
    expect(romeParts(new Date("2026-11-16T09:00:00Z"))).toEqual({ date: "2026-11-16", time: "10:00" });
  });
  it("rifiuta formati non validi", () => {
    expect(romeToUtc("16/11/2026", "10:00")).toBeNull();
    expect(romeToUtc("2026-11-16", "25:00")).toBeNull();
  });
  it("calcola settimane e giorni", () => {
    expect(weekdayIndex("2026-11-16")).toBe(0);
    expect(weekdayIndex("2026-11-22")).toBe(6);
    expect(mondayOf("2026-11-19")).toBe("2026-11-16");
    expect(addDays("2026-12-30", 3)).toBe("2027-01-02");
  });
});

describe("modello settimanale", () => {
  it("genera un orario ogni durata nelle fasce indicate", () => {
    const r = expandTemplate({ startDate: "2026-11-16", weeks: 2, days: [0, 2], from: "10:00", to: "12:00", duration: 60 });
    expect(r).toEqual([
      { date: "2026-11-16", time: "10:00" },
      { date: "2026-11-16", time: "11:00" },
      { date: "2026-11-18", time: "10:00" },
      { date: "2026-11-18", time: "11:00" },
      { date: "2026-11-23", time: "10:00" },
      { date: "2026-11-23", time: "11:00" },
      { date: "2026-11-25", time: "10:00" },
      { date: "2026-11-25", time: "11:00" },
    ]);
  });
  it("salta i giorni già passati della prima settimana e non supera la fine della fascia", () => {
    const r = expandTemplate({ startDate: "2026-11-18", weeks: 1, days: [0, 2], from: "15:00", to: "17:30", duration: 90 });
    expect(r).toEqual([{ date: "2026-11-18", time: "15:00" }]);
  });
});

describe("sovrapposizioni", () => {
  const busy = [{ start: Date.parse("2026-11-16T09:00:00Z"), end: Date.parse("2026-11-16T10:00:00Z") }];
  it("rileva solo le vere sovrapposizioni", () => {
    expect(overlapsBusy(busy, Date.parse("2026-11-16T09:30:00Z"), 60)).toBe(true);
    expect(overlapsBusy(busy, Date.parse("2026-11-16T08:00:00Z"), 60)).toBe(false);
    expect(overlapsBusy(busy, Date.parse("2026-11-16T10:00:00Z"), 60)).toBe(false);
  });
});

describe("calendari esterni", () => {
  it("accetta https e webcal, rifiuta reti interne", () => {
    expect(safeFeedUrl("webcal://p01-caldav.icloud.com/published/2/abc")).toBe("https://p01-caldav.icloud.com/published/2/abc");
    expect(safeFeedUrl("https://calendar.google.com/calendar/ical/x%40gmail.com/private-abc/basic.ics")).toContain("calendar.google.com");
    for (const bad of [
      "http://example.com/a.ics",
      "https://localhost/a.ics",
      "https://127.0.0.1/a.ics",
      "https://192.168.1.5/a.ics",
      "https://10.0.0.1/a",
      "https://user:pw@example.com/a",
      "https://intranet/a",
      "file:///etc/passwd",
      "non un indirizzo",
    ])
      expect(safeFeedUrl(bad), bad).toBeNull();
  });
  const ics = `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
UID:a1
DTSTART;TZID=Europe/Rome:20261116T100000
DTEND;TZID=Europe/Rome:20261116T113000
RRULE:FREQ=WEEKLY;COUNT=4
EXDATE;TZID=Europe/Rome:20261123T100000
SUMMARY:Riunione
END:VEVENT
BEGIN:VEVENT
UID:b2
DTSTART:20261118T140000Z
DTEND:20261118T150000Z
SUMMARY:Call
END:VEVENT
BEGIN:VEVENT
UID:c3
DTSTART;VALUE=DATE:20261120
DTEND;VALUE=DATE:20261121
TRANSP:TRANSPARENT
SUMMARY:Disponibile
END:VEVENT
BEGIN:VEVENT
UID:d4
DTSTART;VALUE=DATE:20261121
DTEND;VALUE=DATE:20261122
SUMMARY:Fuori sede
END:VEVENT
BEGIN:VEVENT
UID:e5
DTSTART:20261119T080000Z
DTEND:20261119T090000Z
STATUS:CANCELLED
SUMMARY:Annullato
END:VEVENT
END:VCALENDAR`;
  it("legge ricorrenze, eccezioni, giornate intere e salta gli eventi liberi o annullati", async () => {
    const r = await parseBusy(ics, new Date("2026-11-14T00:00:00Z"), new Date("2026-12-31T00:00:00Z"));
    const iso = r.map((x) => [new Date(x.start).toISOString(), new Date(x.end).toISOString()]).sort();
    expect(iso).toEqual([
      ["2026-11-16T09:00:00.000Z", "2026-11-16T10:30:00.000Z"],
      ["2026-11-18T14:00:00.000Z", "2026-11-18T15:00:00.000Z"],
      ["2026-11-20T23:00:00.000Z", "2026-11-21T23:00:00.000Z"],
      ["2026-11-30T09:00:00.000Z", "2026-11-30T10:30:00.000Z"],
      ["2026-12-07T09:00:00.000Z", "2026-12-07T10:30:00.000Z"],
    ]);
  });
});

describe("calendario delle prenotazioni", () => {
  it("produce un calendario valido con le consulenze confermate", () => {
    const t = bookingsFeed("Consulenze", [
      {
        uid: "b1@diagnostico",
        start: new Date("2026-11-16T09:00:00Z"),
        minutes: 60,
        title: "Consulenza: Prova Srl",
        description: "Temi: costi, cassa",
        url: "https://meet.example.com/x",
      },
    ]);
    expect(t).toContain("BEGIN:VCALENDAR");
    expect(t).toContain("DTSTART:20261116T090000Z");
    expect(t).toContain("DTEND:20261116T100000Z");
    expect(t).toContain("TRANSP:OPAQUE");
    expect(t.endsWith("END:VCALENDAR\r\n")).toBe(true);
  });
});
