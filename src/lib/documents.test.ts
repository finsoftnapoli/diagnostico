import { describe, expect, it } from "vitest";
import { employeeBand, financialKpis, profileFrom, revenueBand, type BilancioData, type VisuraData } from "./documents";

describe("lettura documenti", () => {
  it("converte la visura nei campi del profilo, scartando valori non ammessi", () => {
    const v: VisuraData = {
      ragione_sociale: "Alfa Meccanica S.r.l.", partita_iva: "IT00743110157", forma_giuridica: "S.r.l.",
      ateco_codice: "28.41", ateco_descrizione: "Macchine utensili", settore: "Macchinari e apparecchiature",
      regione: "Atlantide", comune_sede: "Napoli", anno_costituzione: 1987, addetti: 45,
      organo_amministrativo: "amministratore unico", numero_amministratori: 1, organo_controllo: false,
      numero_soci: 2, quota_socio_principale: 60, persone: [{ nome: "Mario Rossi", ruolo: "Amministratore unico" }],
    };
    expect(profileFrom("visura", v)).toEqual({
      "PR-10": "00743110157", "PR-11": "Alfa Meccanica S.r.l.", "PR-01": "Macchinari e apparecchiature", "PR-03": "20-49", "PR-09": "1987",
    });
  });

  it("ricava la fascia di fatturato dal bilancio", () => {
    expect(revenueBand(7_800_000)).toBe("€5-10M");
    expect(revenueBand(1_200_000)).toBe("€1-2M");
    expect(revenueBand(5_000_000)).toBe("€5-10M");
    expect(revenueBand(800_000)).toBe("Meno di €1M");
    expect(revenueBand(140_000_000)).toBe("€100M e oltre");
    expect(employeeBand(9)).toBe("Meno di 10");
  });

  it("calcola gli indicatori", () => {
    const b = {
      ricavi: 8_000_000, valore_produzione: 8_100_000, ebitda: 400_000, ebit: 200_000, utile_netto: 80_000,
      patrimonio_netto: 900_000, totale_attivo: 6_000_000, debiti_finanziari: 2_200_000, disponibilita_liquide: 200_000,
      crediti_commerciali: 2_400_000, rimanenze: 1_000_000, debiti_fornitori: 1_500_000, costo_personale: 1_800_000,
    } as BilancioData;
    const k = financialKpis({ ...b, year: 2025, employees: 45 });
    expect(k.ebitdaMargin).toBe(5);
    expect(k.pfn).toBe(2_000_000);
    expect(k.pfnOnEbitda).toBe(5);
    expect(k.equityRatio).toBe(15);
    expect(k.dso).toBe(110);
    expect(k.notes.join(" ")).toMatch(/Indebitamento elevato/);
  });
});
