import { describe, expect, it } from "vitest";
import { purchaseEmail, type PurchaseEmailInput } from "./purchase-email";

const base: PurchaseEmailInput = {
  company: "Alfa <Srl>",
  items: [{ sku: "modulo", area: "FIN", description: "Modulo di approfondimento diagnostico: Finanza e controllo", netCents: 10000 }],
  netCents: 10000,
  vatCents: 2200,
  totalCents: 12200,
  paidAt: new Date("2026-11-12T10:00:00Z"),
  invoiceNo: "1/DIA",
  booked: false,
  slotLost: false,
  link: "https://esempio.it/area/servizi",
};

describe("email di conferma dell'acquisto", () => {
  it("riepiloga ordine, totali e fattura con i prossimi passi del modulo", () => {
    const m = purchaseEmail(base);
    expect(m.subject).toBe("Acquisto confermato: il tuo approfondimento è attivo");
    expect(m.html).toContain("Approfondimento Finanza e controllo");
    expect(m.html).toContain("€122");
    expect(m.html).toContain("Fattura n. 1/DIA");
    expect(m.html).toContain("Inizia l&#39;approfondimento");
    expect(m.html).toContain("Alfa &lt;Srl&gt;");
    expect(m.html).not.toContain("<Srl>");
    expect(m.text).toContain("Totale pagato €122");
    expect(m.text).toContain("Finsoft S.r.l.\n".trim());
    expect(m.text).not.toContain("S.r.l..");
  });

  it("adatta titolo e passi a consulenza e percorso completo", () => {
    const c = purchaseEmail({ ...base, booked: true, items: [{ sku: "consulenza", description: "x", netCents: 20000 }] });
    expect(c.subject).toBe("Acquisto confermato: la tua consulenza è prenotata");
    expect(c.html).toContain("La consulenza è in calendario");
    const b = purchaseEmail({ ...base, items: [{ sku: "bundle", description: "x", netCents: 50000 }] });
    expect(b.subject).toBe("Acquisto confermato: il tuo percorso completo è attivo");
    expect(b.html).toContain("Prenota le 2 ore di consulenza");
    const lost = purchaseEmail({ ...base, slotLost: true, items: [{ sku: "consulenza", description: "x", netCents: 20000 }] });
    expect(lost.html).toContain("non era più disponibile");
    expect(lost.html).toContain("Scegli data e ora della consulenza");
  });
});
