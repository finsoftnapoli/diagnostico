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

export const REVENUE_BANDS = ["€2-5M", "€5-10M", "€10-25M", "€25-50M", "€50-100M"] as const;

const REF: Record<AreaCode, [number, number, number, number, number]> = {
  STR: [40, 45, 55, 60, 67],
  FIN: [45, 50, 60, 67, 75],
  MKT: [40, 45, 50, 55, 60],
  PER: [35, 40, 50, 55, 62],
  OPS: [45, 50, 55, 62, 67],
  DIG: [35, 40, 50, 55, 62],
  INN: [30, 33, 40, 45, 50],
  SOS: [25, 30, 35, 42, 50],
};

export interface Benchmark {
  kind: "riferimento" | "mediana";
  label: string;
  note: string;
  sample?: number;
  values: Record<AreaCode, number>;
}

export function normativeBenchmark(band: string | undefined): Benchmark {
  const i = Math.max(0, REVENUE_BANDS.indexOf((band ?? "") as (typeof REVENUE_BANDS)[number]));
  const b = REVENUE_BANDS[i];
  const values = Object.fromEntries(Object.entries(REF).map(([k, v]) => [k, v[i]])) as Record<AreaCode, number>;
  return {
    kind: "riferimento",
    label: `Riferimento aziende ${b}`,
    note: `Livello atteso per un'azienda ben gestita con fatturato ${b}, definito dai nostri esperti. Sarà sostituito dalla mediana delle aziende reali quando nel tuo segmento ci saranno almeno ${MIN_SAMPLE} compilazioni.`,
    values,
  };
}
