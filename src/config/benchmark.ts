// Riferimento di confronto per fascia di fatturato.
//
// FINCHÉ NON CI SONO ABBASTANZA COMPILAZIONI REALI, il confronto usa questi valori:
// il punteggio (0-100) che ci si aspetta da un'azienda ben gestita della stessa fascia,
// definito da Finsoft sulla base dell'esperienza. Non è una media di aziende reali e
// nel report è dichiarato come "riferimento indicativo". Valori da rivedere e validare nel pilota.
//
// Quando un segmento raggiunge MIN_SAMPLE compilazioni, il report usa la mediana reale (vedi /api/confronto).
import type { AreaCode } from "@/lib/types";

export const MIN_SAMPLE = 30;

export const REVENUE_BANDS = [
  "Meno di €1M",
  "€1-2M",
  "€2-5M",
  "€5-10M",
  "€10-25M",
  "€25-50M",
  "€50-100M",
  "€100M e oltre",
] as const;

// Una colonna per fascia, nello stesso ordine di REVENUE_BANDS.
const REF: Record<AreaCode, number[]> = {
  STR: [30, 35, 40, 45, 55, 60, 67, 72],
  FIN: [35, 40, 45, 50, 60, 67, 75, 80],
  MKT: [30, 35, 40, 45, 50, 55, 60, 65],
  PER: [25, 30, 35, 40, 50, 55, 62, 67],
  OPS: [35, 40, 45, 50, 55, 62, 67, 72],
  DIG: [25, 30, 35, 40, 50, 55, 62, 67],
  INN: [20, 25, 30, 33, 40, 45, 50, 55],
  SOS: [15, 20, 25, 30, 35, 42, 50, 57],
};

export interface Benchmark {
  kind: "riferimento" | "mediana";
  label: string;
  note: string;
  sample?: number;
  values: Record<AreaCode, number>;
}

export function normativeBenchmark(band: string | undefined): Benchmark {
  // senza fascia indicata si usa la fascia centrale del target (€5-10M)
  const found = REVENUE_BANDS.indexOf((band ?? "") as (typeof REVENUE_BANDS)[number]);
  const i = found >= 0 ? found : 3;
  const b = REVENUE_BANDS[i];
  const values = Object.fromEntries(Object.entries(REF).map(([k, v]) => [k, v[i]])) as Record<AreaCode, number>;
  return {
    kind: "riferimento",
    label: `Riferimento aziende ${bandText(b)}`,
    note: `Livello atteso per un'azienda ben gestita con fatturato ${bandText(b)}, definito dai nostri esperti. Sarà sostituito dalla mediana delle aziende reali quando nel tuo segmento ci saranno almeno ${MIN_SAMPLE} compilazioni.`,
    values,
  };
}

/** Fascia in forma leggibile dentro una frase: "€5-10M" → "€5-10M", "Meno di €1M" → "sotto €1M". */
export function bandText(b: string): string {
  if (b.startsWith("Meno di")) return b.replace("Meno di", "sotto");
  if (b.endsWith("e oltre")) return `da ${b.replace(" e oltre", "")} in su`;
  return b;
}
