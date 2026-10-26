// Descrizione dei campi dei report scritti dall'AI, per la revisione dello staff: lo stesso schema
// guida l'editor nell'area staff e la pulizia dei testi salvati dal server.

export type FieldSpec =
  | { key: string; label: string; type: "text"; rows?: number; max?: number }
  | { key: string; label: string; type: "list"; max?: number }
  | { key: string; label: string; type: "fixed" }
  | { key: string; label: string; type: "group"; fields: FieldSpec[]; itemTitle: string };

export const DIAGNOSTIC_SPEC: FieldSpec[] = [
  { key: "executiveSummary", label: "Sintesi per la direzione", type: "text", rows: 10, max: 6000 },
  { key: "crossCutting", label: "Lettura d'insieme", type: "text", rows: 5, max: 3000 },
  {
    key: "priorities",
    label: "Priorità",
    type: "group",
    itemTitle: "area",
    fields: [
      { key: "area", label: "Ambito", type: "fixed" },
      { key: "title", label: "Titolo", type: "text", rows: 1, max: 200 },
      { key: "diagnosis", label: "Diagnosi", type: "text", rows: 5, max: 3000 },
      { key: "actions", label: "Azioni (una per riga)", type: "list", max: 600 },
    ],
  },
  { key: "quickWins", label: "Interventi rapidi (uno per riga)", type: "list", max: 600 },
  { key: "closing", label: "Prossimo passo", type: "text", rows: 4, max: 2000 },
];

export const MODULE_SPEC: FieldSpec[] = [
  { key: "summary", label: "Sintesi", type: "text", rows: 8, max: 5000 },
  {
    key: "themes",
    label: "Temi",
    type: "group",
    itemTitle: "theme",
    fields: [
      { key: "theme", label: "Tema", type: "fixed" },
      { key: "diagnosis", label: "Diagnosi", type: "text", rows: 4, max: 2500 },
      { key: "actions", label: "Azioni (una per riga)", type: "list", max: 600 },
    ],
  },
  {
    key: "roadmap",
    label: "Piano di lavoro",
    type: "group",
    itemTitle: "horizon",
    fields: [
      { key: "horizon", label: "Orizzonte", type: "fixed" },
      { key: "actions", label: "Interventi (uno per riga)", type: "list", max: 600 },
    ],
  },
  { key: "kpis", label: "Indicatori da seguire (uno per riga)", type: "list", max: 300 },
  { key: "closing", label: "Prossimo passo", type: "text", rows: 4, max: 2000 },
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
    else if (f.type === "text") out[f.key] = String(e[f.key] ?? "").replace(/\r\n/g, "\n").trim().slice(0, f.max ?? 5000);
    else if (f.type === "list")
      out[f.key] = (Array.isArray(e[f.key]) ? (e[f.key] as unknown[]) : [])
        .map((x) => String(x ?? "").replace(/\s+/g, " ").trim().slice(0, f.max ?? 600))
        .filter(Boolean)
        .slice(0, 12);
    else {
      const items = Array.isArray(e[f.key]) ? (e[f.key] as unknown[]) : [];
      const origItems = Array.isArray(o[f.key]) ? (o[f.key] as unknown[]) : [];
      // gli elementi (priorità, temi) non si aggiungono né si riordinano: si correggono i testi
      out[f.key] = origItems.map((oi, i) => cleanNarrative(f.fields, items[i], oi));
    }
  }
  return out;
}
