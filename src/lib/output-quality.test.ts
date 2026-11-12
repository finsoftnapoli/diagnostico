// Controllo di qualità dei testi che il cliente legge: report del diagnostico e dei moduli (dati del PDF, letture dei
// punteggi, sintesi) ed email, su profili di risposta molto diversi. Cerca refusi meccanici, valori mancanti e,
// nei report, il registro sbagliato (si dà del "voi" all'azienda).
import { describe, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
import { normativeBenchmark } from "@/config/benchmark";
import { modulePdfData } from "@/pdf/module-data";
import { reportPdfData } from "@/pdf/report-data";
import { authEmail } from "./auth-email";
import { invitationEmail, reportReadyEmail } from "./email";
import { sampleModuleNarrative, sampleModuleResponses, sampleNarrative, sampleResponses } from "./fixtures/sample";
import { computeModule } from "./module-scoring";
import { MODULE_QUESTIONS } from "./modules";
import { purchaseEmail } from "./purchase-email";
import { QUESTIONS } from "./questionnaire";
import { areaReading, overallReading } from "./score-meaning";
import type { AreaCode, Responses } from "./types";

/** Tutte le stringhe contenute in un valore, con il percorso per ritrovarle. */
function strings(v: unknown, path = "", out: [string, string][] = []): [string, string][] {
  if (typeof v === "string") out.push([path, v]);
  else if (Array.isArray(v)) v.forEach((x, i) => strings(x, `${path}[${i}]`, out));
  else if (v && typeof v === "object") for (const [k, x] of Object.entries(v)) strings(x, path ? `${path}.${k}` : k, out);
  return out;
}

const MECHANICAL: [RegExp, string][] = [
  [/\.\.(?!\.)/, "punto doppio"],
  [/ [,.;:]/, "spazio prima della punteggiatura"],
  [/ {2,}/, "spazi doppi"],
  [/\b(undefined|NaN|null|Infinity)\b|\[object/, "valore mancante"],
  [/[{}]|\$\{|%s/, "segnaposto non risolto"],
  [/\(\s*\)|«\s*»/, "parentesi o virgolette vuote"],
  [/\d\.\d+\s?%/, "decimale con il punto"],
];
// "sei" è anche il numero: non si cerca.
const TU = /\b(tuo|tua|tuoi|tue|hai|puoi|devi|vuoi|ti avviseremo|riceverai|troverai)\b/i;

function problems(texts: [string, string][], voi: boolean): string[] {
  const out: string[] = [];
  for (const [path, s] of texts) {
    for (const [re, what] of MECHANICAL) if (re.test(s)) out.push(`${what} in ${path}: «${s.slice(0, 120)}»`);
    if (voi && TU.test(s)) out.push(`registro "tu" in ${path}: «${s.slice(0, 120)}»`);
  }
  return out;
}

/** Profili di risposta: tutto informale, tutto avanzato, alterno, casuale ripetibile, senza bilancio e obiettivi. */
function profiles(): [string, Responses][] {
  const base = sampleResponses();
  const withLevels = (f: (i: number) => number, tweak?: (r: Responses) => void): Responses => {
    const r = structuredClone(base);
    QUESTIONS.forEach((q, i) => (r.levels[q.id] = f(i)));
    tweak?.(r);
    return r;
  };
  let seed = 7;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  return [
    ["esempio", base],
    ["tutto informale", withLevels(() => 1)],
    ["tutto avanzato", withLevels(() => 4)],
    ["alterno", withLevels((i) => (i % 2 ? 4 : 1))],
    ["casuale", withLevels(() => 1 + Math.floor(rnd() * 4))],
    [
      "senza bilancio, obiettivi e sfide",
      withLevels(
        () => 2,
        (r) => {
          delete r.financials;
          delete r.governance;
          r.objectives = [];
          r.issues = [];
          r.objectivesText = "";
          r.issuesText = "";
        },
      ),
    ],
    [
      "fascia alta, con verifiche incoerenti",
      withLevels(
        (i) => 3 + (i % 2),
        (r) => {
          r.profile["PR-02"] = "Oltre €50M";
          QUESTIONS.forEach((q) => q.check && (r.checks[q.id] = q.check.options[0]));
        },
      ),
    ],
  ];
}

describe("qualità dei testi del report del diagnostico", () => {
  for (const [name, r] of profiles()) {
    it(`profilo «${name}»`, () => {
      const d = reportPdfData(r, sampleNarrative, normativeBenchmark(r.profile["PR-02"]), "2026-11-11T10:00:00Z", ["bilancio 2025"]);
      // si controllano i testi calcolati: la parte scritta dagli esperti è verificata in revisione
      const computed = { ...d, narrative: null };
      expect(problems(strings(computed), true)).toEqual([]);
      expect(d.summary.length).toBeGreaterThanOrEqual(2);
      expect(d.reading.length).toBe(2);
      for (const a of d.areas) expect(a.reading.length).toBeGreaterThan(20);
    });
  }

  it("le letture dei punteggi restano corrette su tutta la scala", () => {
    const texts: [string, string][] = [];
    for (let score = 0; score <= 100; score += 1)
      for (const ref of [20, 27, 45, 60]) {
        const levels = Array.from({ length: 24 }, (_, i) => 1 + ((i * score) % 4));
        overallReading(score, ref, levels).forEach((x, i) => texts.push([`overall ${score}/${ref}#${i}`, x]));
        texts.push([`area ${score}/${ref}`, areaReading(score, ref, levels.slice(0, 3))]);
      }
    expect(problems(texts, true)).toEqual([]);
  });
});

describe("qualità dei testi del report dei moduli", () => {
  const cases: [string, (i: number) => number][] = [
    ["esempio", (i) => sampleModuleResponses().levels[MODULE_QUESTIONS.FIN[i].id]],
    ["tutto informale", () => 1],
    ["tutto avanzato", () => 4],
    ["con non applicabili", (i) => (MODULE_QUESTIONS.FIN[i].na && i % 2 ? 0 : 2)],
  ];
  for (const [name, f] of cases) {
    it(`modulo «${name}»`, () => {
      const r = sampleModuleResponses();
      MODULE_QUESTIONS.FIN.forEach((q, i) => (r.levels[q.id] = f(i)));
      for (const reference of [{ value: 30, label: "Riferimento aziende sotto €1M" }, null]) {
        const d = modulePdfData({
          area: "FIN" as AreaCode,
          company: "Alfa S.r.l.",
          result: computeModule("FIN", r),
          diagnosticScore: 20,
          reference,
          narrative: sampleModuleNarrative,
          completedAt: "2026-11-11T10:00:00Z",
        });
        const computed = { ...d, narrative: null };
        expect(problems(strings(computed), true)).toEqual([]);
        expect(d.subs).toHaveLength(8);
      }
    });
  }
});

describe("qualità delle email al cliente", () => {
  const link = "https://esempio.it/area";
  const mails = [
    purchaseEmail({
      company: "Alfa S.r.l.",
      items: [{ sku: "modulo", area: "FIN", description: "x", netCents: 10000 }],
      netCents: 10000,
      vatCents: 2200,
      totalCents: 12200,
      paidAt: new Date("2026-11-12T10:00:00Z"),
      invoiceNo: "1/DIA",
      booked: false,
      slotLost: false,
      link,
    }),
    invitationEmail({ inviter: "Mario", company: "Alfa S.r.l.", name: null, link, expires: new Date("2026-11-20T10:00:00Z") }),
    reportReadyEmail({ company: "Alfa S.r.l.", link }),
    reportReadyEmail({ company: "Alfa S.r.l.", link, module: "FIN" }),
    ...["magiclink", "signup", "invite", "email_change", "recovery"].map((action) => authEmail({ action, token: "123456", link })),
  ];
  it("oggetto e testo senza refusi meccanici né valori mancanti", () => {
    const texts = mails.flatMap((m, i): [string, string][] => [
      [`email ${i} oggetto`, m.subject],
      [`email ${i} testo`, m.text.replace(/\n+/g, " ")],
    ]);
    expect(problems(texts, false)).toEqual([]);
  });
  it("l'HTML non contiene valori mancanti né la ragione sociale con il punto doppio", () => {
    for (const m of mails) {
      expect(m.html).not.toMatch(/\b(undefined|NaN|null)\b|\[object|S\.r\.l\.\./);
      expect(m.html).toContain("<table");
    }
  });
});
