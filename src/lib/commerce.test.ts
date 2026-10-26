import { writeFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { priceCart } from "@/config/offers";
import { validateBilling } from "./billing";
import { calendarInvite } from "./ics";
import { buildFatturaPA, invoiceTotals, progressivoInvio, sellerFromEnv } from "./invoice";
import { cleanNarrative, DIAGNOSTIC_SPEC } from "./narrative-spec";

const seller = sellerFromEnv({
  SELLER_VAT: "IT01234567897",
  SELLER_ADDRESS: "Via Roma 1",
  SELLER_CAP: "80100",
  SELLER_CITY: "Napoli",
  SELLER_PROVINCE: "na",
  SELLER_REA_UFFICIO: "NA",
  SELLER_REA_NUMERO: "123456",
})!;

describe("acquisti e fatture", () => {
  it("calcola righe, imponibile e IVA dal catalogo", () => {
    const c = priceCart([{ sku: "modulo", area: "FIN" }, { sku: "consulenza" }], () => "Finanza e controllo");
    expect(c.netCents).toBe(30000);
    expect(c.vatCents).toBe(6600);
    expect(c.totalCents).toBe(36600);
    expect(c.lines[0].description).toContain("Finanza e controllo");
    expect(priceCart([{ sku: "bundle" }], (x) => x).totalCents).toBe(61000);
  });

  it("controlla i dati di fatturazione", () => {
    const ok = validateBilling({ denominazione: "Alfa Srl", vat_number: "IT 00743110157", address: "Via Po 3", cap: "20100", city: "Milano", province: "mi", sdi_code: "m5uxcr1" });
    expect(ok.ok && ok.billing.vat_number).toBe("00743110157");
    expect(ok.ok && ok.billing.sdi_code).toBe("M5UXCR1");
    const ko = validateBilling({ denominazione: "A", vat_number: "123", cap: "1", province: "M1" });
    expect(ko.ok).toBe(false);
    if (!ko.ok) expect(Object.keys(ko.errors)).toEqual(expect.arrayContaining(["denominazione", "vat_number", "cap", "province", "address", "city"]));
  });

  it("richiede i dati completi del cedente", () => {
    expect(seller.vat).toBe("01234567897");
    expect(sellerFromEnv({ SELLER_VAT: "01234567897", SELLER_ADDRESS: "[sede legale da completare]", SELLER_CAP: "80100", SELLER_CITY: "Napoli", SELLER_PROVINCE: "NA" })).toBeNull();
  });

  it("costruisce la fattura elettronica", () => {
    const lines = priceCart([{ sku: "modulo", area: "FIN" }, { sku: "consulenza" }], () => "Finanza e controllo").lines;
    const xml = buildFatturaPA({
      seller,
      buyer: { denominazione: "Alfa Meccanica S.r.l. & figli", vat_number: "00743110157", tax_code: null, address: "Via Po 3", cap: "20100", city: "Milano", province: "MI", sdi_code: null, pec: "alfa@pec.it" },
      number: "1/DIA",
      date: "2026-10-26",
      progressivo: progressivoInvio(2026, 1),
      lines,
      vatRate: 22,
      payment: "stripe",
    });
    expect(xml).toContain("<CodiceDestinatario>0000000</CodiceDestinatario>");
    expect(xml).toContain("<PECDestinatario>alfa@pec.it</PECDestinatario>");
    expect(xml).toContain("<ImportoTotaleDocumento>366.00</ImportoTotaleDocumento>");
    expect(xml).toContain("<Imposta>66.00</Imposta>");
    expect(xml).toContain("Alfa Meccanica S.r.l. &amp; figli");
    expect(xml).toContain("<ModalitaPagamento>MP08</ModalitaPagamento>");
    expect(invoiceTotals(lines, 22)).toEqual({ net: 30000, vat: 6600, total: 36600 });
    if (process.env.INVOICE_SAMPLE) writeFileSync(process.env.INVOICE_SAMPLE, xml);
  });

  it("prepara l'invito di calendario", () => {
    const ics = calendarInvite({ uid: "x@d", start: new Date("2026-11-03T09:00:00Z"), minutes: 60, title: "Consulenza; prova", description: "Temi", organizer: "info@finsoft.biz" });
    expect(ics).toContain("DTSTART:20261103T090000Z");
    expect(ics).toContain("DTEND:20261103T100000Z");
    expect(ics).toContain("SUMMARY:Consulenza\\; prova");
    expect(ics.split("\r\n").every((l) => l.length <= 75)).toBe(true);
  });

  it("pulisce il report corretto dallo staff senza cambiare ambiti né numero di priorità", () => {
    const original = { executiveSummary: "A", crossCutting: "B", priorities: [{ area: "FIN", title: "t", diagnosis: "d", actions: ["x"] }], quickWins: ["q"], closing: "c" };
    const edited = { executiveSummary: " Nuovo ", crossCutting: "B", priorities: [{ area: "STR", title: "T2", diagnosis: "d2", actions: ["a", "", "b"] }, { area: "MKT" }], quickWins: ["", "q2"], closing: "c", extra: "no" };
    const out = cleanNarrative(DIAGNOSTIC_SPEC, edited, original);
    expect(out).toEqual({ executiveSummary: "Nuovo", crossCutting: "B", priorities: [{ area: "FIN", title: "T2", diagnosis: "d2", actions: ["a", "b"] }], quickWins: ["q2"], closing: "c" });
  });
});
