// Descrizione dei campi dei report scritti dall'AI, per la revisione dello staff: lo stesso schema
// guida l'editor nell'area staff e la pulizia dei testi salvati dal server.

export type FieldSpec =
  /** words: lunghezza consigliata in parole, per la revisione. */
  | { key: string; label: string; type: "text"; rows?: number; max?: number; words?: [number, number]; hint?: string }
  /** items: numero di voci consigliato. */
  | { key: string; label: string; type: "list"; max?: number; items?: [number, number]; hint?: string }
  | { key: string; label: string; type: "fixed" }
  /** reorderable: lo staff può riordinare o togliere elementi (mai aggiungerne). */
  | { key: string; label: string; type: "group"; fields: FieldSpec[]; itemTitle: string; reorderable?: boolean; hint?: string };

export const DIAGNOSTIC_SPEC: FieldSpec[] = [
  {
    key: "executiveSummary",
    label: "Sintesi per la direzione",
    type: "text",
    rows: 10,
    max: 6000,
    words: [150, 380],
    hint: "Stato complessivo, equilibrio del profilo, legame con ambizioni e sfide. È la prima pagina che il cliente legge.",
  },
  {
    key: "crossCutting",
    label: "Lettura d'insieme",
    type: "text",
    rows: 5,
    max: 3000,
    words: [80, 260],
    hint: "Squilibri tra ambiti ed effetti a catena: cosa tiene insieme le debolezze.",
  },
  {
    key: "priorities",
    label: "Priorità",
    type: "group",
    itemTitle: "area",
    reorderable: true,
    hint: "Di norma coincidono con le tre priorità calcolate dal diagnostico; l'ordine è quello in cui il cliente le legge.",
    fields: [
      { key: "area", label: "Ambito", type: "fixed" },
      { key: "title", label: "Titolo", type: "text", rows: 1, max: 200, words: [3, 14] },
      { key: "diagnosis", label: "Diagnosi", type: "text", rows: 5, max: 3000, words: [50, 180] },
      { key: "actions", label: "Azioni (una per riga)", type: "list", max: 600, items: [2, 4] },
    ],
  },
  {
    key: "quickWins",
    label: "Interventi rapidi (uno per riga)",
    type: "list",
    max: 600,
    items: [2, 4],
    hint: "Azioni a basso costo da avviare subito.",
  },
  { key: "closing", label: "Prossimo passo", type: "text", rows: 4, max: 2000, words: [40, 140] },
];

export const MODULE_SPEC: FieldSpec[] = [
  { key: "summary", label: "Sintesi", type: "text", rows: 8, max: 5000, words: [120, 320] },
  {
    key: "themes",
    label: "Sotto-ambiti",
    type: "group",
    itemTitle: "theme",
    fields: [
      { key: "theme", label: "Sotto-ambito", type: "fixed" },
      { key: "diagnosis", label: "Diagnosi", type: "text", rows: 4, max: 2500, words: [30, 120] },
      { key: "actions", label: "Azioni (una per riga)", type: "list", max: 600, items: [1, 3] },
    ],
  },
  {
    key: "roadmap",
    label: "Piano di lavoro",
    type: "group",
    itemTitle: "horizon",
    fields: [
      { key: "horizon", label: "Orizzonte", type: "fixed" },
      { key: "actions", label: "Interventi (uno per riga)", type: "list", max: 600, items: [2, 4] },
    ],
  },
  { key: "kpis", label: "Indicatori da seguire (uno per riga)", type: "list", max: 300, items: [4, 6] },
  { key: "closing", label: "Prossimo passo", type: "text", rows: 4, max: 2000, words: [40, 140] },
];

/**
 * Pulisce un report modificato: tiene solo i campi previsti, converte in testo, accorcia,
 * e lascia invariati i campi fissi (per esempio l'ambito) prendendoli dall'originale.
 */
export function cleanNarrative(spec: FieldSpec[], edited: unknown, original: unknown): Record<string, unknown> {
  const e = (edited && typeof edited === "object" ? edited : {}) as Record<string, unknown>;
  const o = (original && typeof original === "object" ? original : {}) as Record<string, unknown>;
  const out: Record<string, unknown> = {};
  for (const f of spec) {
    if (f.type === "fixed") out[f.key] = o[f.key];
    else if (f.type === "text")
      out[f.key] = String(e[f.key] ?? "")
        .replace(/\r\n/g, "\n")
        .trim()
        .slice(0, f.max ?? 5000);
    else if (f.type === "list")
      out[f.key] = (Array.isArray(e[f.key]) ? (e[f.key] as unknown[]) : [])
        .map((x) =>
          String(x ?? "")
            .replace(/\s+/g, " ")
            .trim()
            .slice(0, f.max ?? 600),
        )
        .filter(Boolean)
        .slice(0, 12);
    else {
      const items = Array.isArray(e[f.key]) ? (e[f.key] as unknown[]) : [];
      const origItems = Array.isArray(o[f.key]) ? (o[f.key] as unknown[]) : [];
      if (f.reorderable) {
        // si possono riordinare o togliere, mai aggiungere: ogni elemento si riconosce dal campo fisso
        const idOf = (x: unknown) => String((x as Record<string, unknown> | null)?.[f.itemTitle] ?? "");
        const seen = new Set<string>();
        const kept = items
          .map((it) => ({ it, orig: origItems.find((oi) => idOf(oi) === idOf(it)) }))
          .filter(({ it, orig }) => orig !== undefined && !seen.has(idOf(it)) && (seen.add(idOf(it)), true))
          .map(({ it, orig }) => cleanNarrative(f.fields, it, orig));
        out[f.key] = kept.length ? kept : origItems.map((oi) => cleanNarrative(f.fields, oi, oi));
      } else {
        // gli elementi (temi, orizzonti) non si aggiungono né si riordinano: si correggono i testi
        out[f.key] = origItems.map((oi, i) => cleanNarrative(f.fields, items[i], oi));
      }
    }
  }
  return out;
}
