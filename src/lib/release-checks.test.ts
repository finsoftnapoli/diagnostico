import { describe, expect, it } from "vitest";
import { sampleModuleNarrative, sampleNarrative } from "./fixtures/sample";
import { DIAGNOSTIC_SPEC, MODULE_SPEC } from "./narrative-spec";
import { allowedNumbers, releaseChecks } from "./release-checks";

const input = {
  azienda: { ragioneSociale: "Alfa S.r.l." },
  punteggioComplessivo: 15,
  riferimentoFascia: 27,
  ambiti: [{ codice: "STR", punteggio: 22, riferimento: 30 }],
  ambizioniTesto: "Vogliamo crescere del 30% all'estero e arrivare a 1.200.000 euro di ricavi.",
  bilancio: { margineEbitdaPct: 50.8 },
};
const expected = { priorities: sampleNarrative.priorities.map((p) => p.area) };
const check = (patch: (n: typeof sampleNarrative) => void) => {
  const n = structuredClone(sampleNarrative);
  patch(n);
  return releaseChecks({ spec: DIAGNOSTIC_SPEC, narrative: n, input, expected, company: "Alfa S.r.l." });
};

describe("controlli prima dell'invio automatico", () => {
  it("i report di esempio passano", () => {
    expect(check(() => {}).blocking).toEqual([]);
    expect(releaseChecks({ spec: MODULE_SPEC, narrative: sampleModuleNarrative, input: {}, company: "Alfa S.r.l." }).blocking).toEqual([]);
  });

  it("raccoglie i numeri dei dati, anche nei testi, e le distanze dal riferimento", () => {
    const a = allowedNumbers(input);
    for (const x of [15, 27, 12, 22, 30, 8, 50.8, 1200000, 100]) expect(a).toContain(x);
  });

  it("trattiene un punteggio, una percentuale di mercato o un importo che non risultano dai dati", () => {
    expect(check((n) => (n.executiveSummary += " Il punteggio è 41 su 100.")).ok).toBe(false);
    expect(check((n) => (n.executiveSummary += " Il punteggio è 15 su 100, 12 punti sotto il riferimento.")).ok).toBe(true);
    expect(check((n) => (n.crossCutting += " Il 68% delle aziende del settore ha già un piano scritto.")).blocking[0]).toMatch(
      /percentuale di mercato/,
    );
    const target = check((n) => (n.quickWins[0] += " Obiettivo: ridurre del 10% i tempi di risposta."));
    expect(target.ok).toBe(true);
    expect(target.notes[0]).toMatch(/obiettivo proposto/);
    expect(check((n) => (n.closing += " Un investimento di 25.000 euro basta.")).ok).toBe(false);
    expect(check((n) => (n.closing += " Il margine del 50,8% lo consente, come i 1.200.000 euro di ricavi attesi.")).ok).toBe(true);
  });

  it("trattiene registro sbagliato, promesse, riferimenti a sistemi automatici, fonti esterne e temi delicati", () => {
    expect(check((n) => (n.closing += " Ti consigliamo di partire dal budget.")).blocking[0]).toMatch(/del tu/);
    expect(check((n) => (n.closing += " Così otterrete sicuramente risultati.")).blocking[0]).toMatch(/promesse/);
    expect(check((n) => (n.closing += " Questo testo è stato generato automaticamente.")).blocking[0]).toMatch(/sistema automatico/);
    expect(check((n) => (n.closing += " Secondo uno studio, chi pianifica cresce di più.")).blocking[0]).toMatch(/studi/);
    expect(check((n) => (n.closing += " Valutate di licenziare il responsabile commerciale.")).blocking[0]).toMatch(/delicato/);
    expect(check((n) => (n.closing += " Scrivete a mario@esempio.it.")).blocking[0]).toMatch(/email/);
    expect(check((n) => (n.closing += " Finanza è a 11 su 100? No: è a 22.")).blocking.join(" ")).toMatch(/autocorrezione/);
    expect(check((n) => (n.closing += " Come ha fatto Beta Impianti S.p.A. lo scorso anno.")).blocking[0]).toMatch(/altra società/);
    expect(check((n) => (n.closing += " Alfa S.r.l. ha le basi per farlo.")).ok).toBe(true);
  });

  it("trattiene campi vuoti e priorità diverse da quelle calcolate", () => {
    expect(check((n) => (n.closing = "")).ok).toBe(false);
    expect(check((n) => n.priorities.pop()).blocking.join(" ")).toMatch(/priorità/);
  });

  it("un'azienda che lavora sull'intelligenza artificiale può essere descritta come tale", () => {
    expect(check((n) => (n.executiveSummary += " La suite basata su agenti di intelligenza artificiale è il cuore del piano.")).ok).toBe(
      true,
    );
  });
});
