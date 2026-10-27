// Catalogo dei servizi a pagamento: unico punto in cui cambiare prezzi e descrizioni.
// Prezzi in euro IVA esclusa; l'IVA si aggiunge al momento dell'acquisto.

export const VAT_RATE = 22;

export type Sku = "modulo" | "consulenza" | "bundle";

export interface Product {
  sku: Sku;
  name: string;
  /** Prezzo unitario IVA esclusa, in euro. */
  price: number;
  /** Descrizione in fattura. */
  invoiceText: string;
  bullets: string[];
}

const PRICE = { modulo: 100, consulenza: 200, bundle: 500 } as const;
/** Ore di consulenza incluse nel percorso completo. */
export const BUNDLE_HOURS = 2;
const BUNDLE_SAVING = 8 * PRICE.modulo + BUNDLE_HOURS * PRICE.consulenza - PRICE.bundle;

export const PRODUCTS: Record<Sku, Product> = {
  modulo: {
    sku: "modulo",
    name: "Approfondimento per ambito",
    price: PRICE.modulo,
    invoiceText: "Modulo di approfondimento diagnostico",
    bullets: [
      "L'Ottogramma dell'ambito: 8 sotto-ambiti, 16-18 domande di dettaglio",
      "Punteggio per sotto-ambito, subito, e confronto con il diagnostico",
      "Report con piano di lavoro a 3, 6 e 12 mesi e indicatori da seguire, rivisto dai nostri esperti",
    ],
  },
  consulenza: {
    sku: "consulenza",
    name: "Consulenza senior da remoto",
    price: PRICE.consulenza,
    invoiceText: "Consulenza direzionale da remoto (1 ora)",
    bullets: [
      "Un'ora in videochiamata con un consulente senior",
      "Lettura del tuo Ottogramma e validazione delle priorità",
      "Prime azioni con tempi e responsabili; scegli tu data e ora",
    ],
  },
  bundle: {
    sku: "bundle",
    name: "Percorso completo",
    price: PRICE.bundle,
    invoiceText: "Percorso diagnostico completo: 8 moduli di approfondimento e 2 ore di consulenza",
    bullets: [
      "Tutti gli 8 approfondimenti per ambito",
      "2 ore di consulenza senior da remoto, anche in due sessioni",
      `Risparmi €${BUNDLE_SAVING} rispetto ai singoli servizi acquistati separatamente`,
    ],
  },
};

/** Durata di una sessione di consulenza prenotabile. */
export const SESSION_MIN = 60;

export const euro = (v: number) => `€${v.toLocaleString("it-IT", { minimumFractionDigits: Number.isInteger(v) ? 0 : 2, maximumFractionDigits: 2 })}`;
export const withVat = (net: number) => Math.round(net * (100 + VAT_RATE)) / 100;

export interface CartLine {
  sku: Sku;
  area?: string;
}

export interface PricedLine extends CartLine {
  description: string;
  netCents: number;
  topic?: string;
}

/** Righe con prezzo e totali, calcolati sempre dal server. */
export function priceCart(lines: CartLine[], areaName: (code: string) => string) {
  const priced: PricedLine[] = lines.map((l) => ({
    ...l,
    description: l.sku === "modulo" && l.area ? `${PRODUCTS.modulo.invoiceText}: ${areaName(l.area)}` : PRODUCTS[l.sku].invoiceText,
    netCents: PRODUCTS[l.sku].price * 100,
  }));
  const net = priced.reduce((s, l) => s + l.netCents, 0);
  const vat = Math.round((net * VAT_RATE) / 100);
  return { lines: priced, netCents: net, vatCents: vat, totalCents: net + vat };
}
