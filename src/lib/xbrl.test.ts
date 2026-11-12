import { describe, expect, it } from "vitest";
import { looksLikeXbrl, parseXbrl } from "./xbrl";

const ctx = (id: string, period: string, dim = "") =>
  `<xbrli:context id="${id}"><xbrli:entity><xbrli:identifier scheme="http://www.infocamere.it">00743110157</xbrli:identifier>${dim}</xbrli:entity><xbrli:period>${period}</xbrli:period></xbrli:context>`;
const f = (name: string, ref: string, v: string | number) =>
  `<itcc-ci:${name} contextRef="${ref}" unitRef="EUR" decimals="0">${v}</itcc-ci:${name}>`;

// Bilancio ordinario sintetico: esercizio 2024 e precedente 2023, più una tabella di nota integrativa con dimensioni.
const ORDINARIO = `﻿<?xml version="1.0" encoding="UTF-8"?>
<xbrli:xbrl xmlns:xbrli="http://www.xbrl.org/2003/instance" xmlns:itcc-ci="http://www.infocamere.it/itnn/fr/itcc/ci/2018-11-04">
${ctx("i24", "<xbrli:instant>2024-12-31</xbrli:instant>")}
${ctx("d24", "<xbrli:startDate>2024-01-01</xbrli:startDate><xbrli:endDate>2024-12-31</xbrli:endDate>")}
${ctx("i23", "<xbrli:instant>2023-12-31</xbrli:instant>")}
${ctx("d23", "<xbrli:startDate>2023-01-01</xbrli:startDate><xbrli:endDate>2023-12-31</xbrli:endDate>")}
${ctx("i24dim", "<xbrli:instant>2024-12-31</xbrli:instant>", '<xbrli:segment><xbrldi:explicitMember dimension="x">y</xbrldi:explicitMember></xbrli:segment>')}
<itcc-ci:DatiAnagraficiDenominazione contextRef="i24">ALFA SOCIETA&amp;#39; PER AZIONI</itcc-ci:DatiAnagraficiDenominazione>
<itcc-ci:DatiAnagraficiCodiceFiscale contextRef="i24">00743110157</itcc-ci:DatiAnagraficiCodiceFiscale>
${f("TotaleAttivo", "i24dim", 1)}
${f("TotaleAttivo", "i24", 8_000_000)}
${f("TotaleAttivo", "i23", 7_000_000)}
${f("TotalePatrimonioNetto", "i24", 2_500_000)}
${f("TotaleDisponibilitaLiquide", "i24", 600_000)}
${f("TotaleRimanenze", "i24", 900_000)}
${f("CreditiVersoClientiTotaleCreditiVersoClienti", "i24", 1_800_000)}
${f("DebitiDebitiVersoBancheTotaleDebitiVersoBanche", "i24", 1_500_000)}
${f("DebitiDebitiVersoAltriFinanziatoriTotaleDebitiVersoAltriFinanziatori", "i24", 200_000)}
${f("DebitiDebitiVersoFornitoriTotaleDebitiVersoFornitori", "i24", 1_100_000)}
${f("ValoreProduzioneRicaviVenditePrestazioni", "d24", 10_000_000)}
${f("ValoreProduzioneRicaviVenditePrestazioni", "d23", 9_000_000)}
${f("TotaleValoreProduzione", "d24", 10_300_000)}
${f("CostiProduzionePersonaleTotaleCostiPersonale", "d24", 2_400_000)}
${f("CostiProduzioneAmmortamentiSvalutazioniTotaleAmmortamentiSvalutazioni", "d24", 400_000)}
${f("CostiProduzioneAltriAccantonamenti", "d24", 50_000)}
${f("TotaleCostiProduzione", "d24", 9_500_000)}
${f("DifferenzaValoreCostiProduzione", "d24", 800_000)}
${f("UtilePerditaEsercizio", "d24", 450_000)}
<itcc-ci:TotaleDipendentiNumeroMedio contextRef="d24" unitRef="pure" decimals="0">42</itcc-ci:TotaleDipendentiNumeroMedio>
</xbrli:xbrl>`;

describe("bilancio XBRL", () => {
  it("riconosce un'istanza XBRL e scarta altri file", () => {
    expect(looksLikeXbrl(ORDINARIO)).toBe(true);
    expect(looksLikeXbrl("%PDF-1.4")).toBe(false);
    expect(looksLikeXbrl("<html><body>xbrl</body></html>")).toBe(false);
    expect(parseXbrl("<root/>")).toBeNull();
  });

  it("legge l'esercizio più recente dai prospetti principali", () => {
    const b = parseXbrl(ORDINARIO)!;
    expect(b).toMatchObject({
      ragione_sociale: "ALFA SOCIETA' PER AZIONI",
      partita_iva: "00743110157",
      anno_esercizio: 2024,
      ricavi: 10_000_000,
      valore_produzione: 10_300_000,
      ebit: 800_000,
      ebitda: 1_250_000,
      utile_netto: 450_000,
      costo_personale: 2_400_000,
      patrimonio_netto: 2_500_000,
      totale_attivo: 8_000_000,
      debiti_finanziari: 1_700_000,
      disponibilita_liquide: 600_000,
      crediti_commerciali: 1_800_000,
      debiti_fornitori: 1_100_000,
      rimanenze: 900_000,
      dipendenti: 42,
    });
  });

  it("ignora date successive alla chiusura (approvazione, deposito) e accetta attributi tra apici singoli", () => {
    const conAltreDate = ORDINARIO.replace(
      "<itcc-ci:DatiAnagraficiDenominazione",
      `${ctx("dep", "<xbrli:instant>2025-05-28</xbrli:instant>")}
<itcc-ci:DatiAnagraficiPartitaIva contextRef='dep'>00743110157</itcc-ci:DatiAnagraficiPartitaIva>
<itcc-ci:DataDepositoBilancio contextRef='dep'>2025-05-28</itcc-ci:DataDepositoBilancio>
<itcc-ci:DatiAnagraficiDenominazione`,
    ).replace(/contextRef="(\w+)"/g, "contextRef='$1'");
    const b = parseXbrl(conAltreDate)!;
    expect(b.anno_esercizio).toBe(2024);
    expect(b.totale_attivo).toBe(8_000_000);
    expect(b.ricavi).toBe(10_000_000);
    expect(b.partita_iva).toBe("00743110157");
  });

  it("negli schemi senza dettaglio dei debiti lascia vuoti i debiti finanziari", () => {
    const micro = ORDINARIO.replace(/<itcc-ci:Debiti[^\n]*\n/g, "");
    expect(parseXbrl(micro)!.debiti_finanziari).toBeNull();
  });
});

describe("codifica del file XBRL", () => {
  it("rispetta la codifica dichiarata", async () => {
    const { xmlText } = await import("./xbrl");
    const latin = Uint8Array.from([...Buffer.from('<?xml version="1.0" encoding="ISO-8859-1"?><a>SOCIET'), 0xc0, ...Buffer.from("</a>")]);
    expect(xmlText(latin)).toContain("SOCIETÀ");
    expect(xmlText(new TextEncoder().encode('<?xml version="1.0"?><a>SOCIETÀ</a>'))).toContain("SOCIETÀ");
  });
});

describe("formati dei documenti caricati", () => {
  it("accetta l'XBRL solo per il bilancio", async () => {
    const { docFormat } = await import("./doc-format");
    const file = (name: string, type = "", size = 1000) => ({ name, type, size });
    expect(docFormat(file("bilancio.xbrl"), "bilancio")).toEqual({ formato: "xbrl", contentType: "application/xml" });
    expect(docFormat(file("Bilancio.XML", "text/xml"), "bilancio")).toMatchObject({ formato: "xbrl" });
    expect(docFormat(file("visura.pdf", "application/pdf"), "visura")).toMatchObject({ formato: "pdf" });
    expect(docFormat(file("visura.xbrl"), "visura")).toHaveProperty("error");
    expect(docFormat(file("nota.txt", "text/plain"), "bilancio")).toEqual({ error: "Il file deve essere un PDF o un XBRL." });
    expect(docFormat(file("grande.pdf", "application/pdf", 30 * 1024 * 1024), "bilancio")).toHaveProperty("error");
  });
});
