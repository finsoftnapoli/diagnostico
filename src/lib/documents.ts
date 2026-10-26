// Lettura di visura camerale e bilancio: schema dei dati da estrarre e conversione nei campi del profilo.
// Nomi e ruoli di amministratori e soci principali vengono restituiti solo al browser di chi ha caricato
// la visura, per suggerire chi invitare: nel database si salvano solo dati aggregati di governance.
import { PROFILE_FIELDS } from "./questionnaire";
import type { Financials, Governance } from "./types";
import { isValidItalianVat, normalizeVat } from "./vat";

export type DocKind = "visura" | "bilancio";

const options = (id: string) => PROFILE_FIELDS.find((f) => f.id === id)?.options ?? [];
const nullable = (t: "string" | "number" | "integer") => ({ anyOf: [{ type: t }, { type: "null" }] });
const nullableEnum = (values: string[]) => ({ anyOf: [{ type: "string", enum: values }, { type: "null" }] });

export const VISURA_SCHEMA = {
  type: "object",
  properties: {
    ragione_sociale: nullable("string"),
    partita_iva: nullable("string"),
    forma_giuridica: nullable("string"),
    ateco_codice: nullable("string"),
    ateco_descrizione: nullable("string"),
    settore: nullableEnum(options("PR-01")),
    regione: nullableEnum(options("PR-04")),
    comune_sede: nullable("string"),
    anno_costituzione: nullable("integer"),
    addetti: nullable("integer"),
    organo_amministrativo: nullableEnum(["amministratore unico", "consiglio di amministrazione", "più amministratori"]),
    numero_amministratori: nullable("integer"),
    organo_controllo: { anyOf: [{ type: "boolean" }, { type: "null" }] },
    numero_soci: nullable("integer"),
    quota_socio_principale: nullable("number"),
    persone: {
      type: "array",
      items: {
        type: "object",
        properties: { nome: { type: "string" }, ruolo: { type: "string" } },
        required: ["nome", "ruolo"],
        additionalProperties: false,
      },
    },
  },
  required: [
    "ragione_sociale", "partita_iva", "forma_giuridica", "ateco_codice", "ateco_descrizione",
    "settore", "regione", "comune_sede", "anno_costituzione", "addetti",
    "organo_amministrativo", "numero_amministratori", "organo_controllo", "numero_soci", "quota_socio_principale", "persone",
  ],
  additionalProperties: false,
} as const;

export const BILANCIO_SCHEMA = {
  type: "object",
  properties: {
    ragione_sociale: nullable("string"),
    partita_iva: nullable("string"),
    anno_esercizio: nullable("integer"),
    ricavi: nullable("number"),
    valore_produzione: nullable("number"),
    ebitda: nullable("number"),
    ebit: nullable("number"),
    utile_netto: nullable("number"),
    costo_personale: nullable("number"),
    patrimonio_netto: nullable("number"),
    totale_attivo: nullable("number"),
    debiti_finanziari: nullable("number"),
    disponibilita_liquide: nullable("number"),
    crediti_commerciali: nullable("number"),
    debiti_fornitori: nullable("number"),
    rimanenze: nullable("number"),
    dipendenti: nullable("integer"),
  },
  required: [
    "ragione_sociale", "partita_iva", "anno_esercizio", "ricavi", "valore_produzione", "ebitda", "ebit",
    "utile_netto", "costo_personale", "patrimonio_netto", "totale_attivo", "debiti_finanziari",
    "disponibilita_liquide", "crediti_commerciali", "debiti_fornitori", "rimanenze", "dipendenti",
  ],
  additionalProperties: false,
} as const;

export const PROMPTS: Record<DocKind, string> = {
  visura: `Il documento è una visura camerale di un'impresa italiana. Estrai i dati richiesti dallo schema.
Regole:
- Usa solo ciò che è scritto nel documento; se un dato manca usa null. Non stimare.
- "settore": scegli la voce dell'elenco più vicina all'attività prevalente (codice ATECO).
- "regione": la regione della sede legale.
- "addetti": il numero di addetti più recente indicato.
- "organo_controllo": true se sono presenti collegio sindacale, sindaco unico o revisore legale.
- "quota_socio_principale": la percentuale del capitale detenuta dal socio con la quota maggiore.
- "persone": gli amministratori in carica e i soci con almeno il 10% del capitale, con nome e cognome (o denominazione se società) e un ruolo breve, per esempio "Amministratore unico", "Presidente del CdA", "Consigliere", "Socio al 40%". Al massimo 10 persone.
- Non riportare mai codici fiscali, date o luoghi di nascita, indirizzi di residenza o altri dati personali oltre a nome e ruolo.`,
  bilancio: `Il documento è il bilancio d'esercizio di un'impresa italiana (schema civilistico). Estrai i valori dell'esercizio più recente, in euro (converti se espressi in migliaia).
Regole:
- Usa solo ciò che è scritto nel documento; se un dato manca usa null. Non stimare.
- "ricavi": ricavi delle vendite e delle prestazioni (A.1). "valore_produzione": totale A.
- "ebit": differenza tra valore e costi della produzione (A − B).
- "ebitda": ebit più ammortamenti e svalutazioni (B.10) e accantonamenti (B.12, B.13), se ricavabili; altrimenti null.
- "debiti_finanziari": debiti verso banche, altri finanziatori, obbligazioni e soci per finanziamenti (entro e oltre l'esercizio).
- "dipendenti": numero medio dei dipendenti se indicato in nota integrativa.
- Non riportare mai nomi o dati di persone fisiche.`,
};

export interface VisuraData {
  ragione_sociale: string | null;
  partita_iva: string | null;
  forma_giuridica: string | null;
  ateco_codice: string | null;
  ateco_descrizione: string | null;
  settore: string | null;
  regione: string | null;
  comune_sede: string | null;
  anno_costituzione: number | null;
  addetti: number | null;
  organo_amministrativo: string | null;
  numero_amministratori: number | null;
  organo_controllo: boolean | null;
  numero_soci: number | null;
  quota_socio_principale: number | null;
  persone: { nome: string; ruolo: string }[];
}

/** Dati di governance senza nomi: questi si possono salvare. */
export function governanceFrom(v: VisuraData): Governance {
  return {
    organo: v.organo_amministrativo,
    amministratori: v.numero_amministratori,
    organoControllo: v.organo_controllo,
    soci: v.numero_soci,
    quotaSocioPrincipale: v.quota_socio_principale,
  };
}

/** Persone suggerite per l'invito: restano nel browser di chi ha caricato la visura. */
export function peopleFrom(v: VisuraData): { name: string; role: string }[] {
  return (v.persone ?? [])
    .filter((p) => p.nome?.trim())
    .slice(0, 10)
    .map((p) => ({ name: p.nome.trim().slice(0, 120), role: (p.ruolo ?? "").trim().slice(0, 80) }));
}

export type BilancioData = {
  ragione_sociale: string | null;
  partita_iva: string | null;
  anno_esercizio: number | null;
  dipendenti: number | null;
} & Omit<Financials, "year" | "employees">;

/** Fascia di fatturato del profilo a partire dai ricavi in euro. */
export function revenueBand(ricavi: number | null): string | null {
  if (ricavi === null || !Number.isFinite(ricavi) || ricavi <= 0) return null;
  // limite inferiore incluso, superiore escluso: con €5M esatti si è in €5-10M
  const m = ricavi / 1_000_000;
  if (m < 1) return "Meno di €1M";
  if (m < 2) return "€1-2M";
  if (m < 5) return "€2-5M";
  if (m < 10) return "€5-10M";
  if (m < 25) return "€10-25M";
  if (m < 50) return "€25-50M";
  if (m < 100) return "€50-100M";
  return "€100M e oltre";
}

/** Fascia di addetti del profilo. */
export function employeeBand(n: number | null): string | null {
  if (n === null || !Number.isFinite(n) || n < 0) return null;
  if (n < 10) return "Meno di 10";
  if (n < 20) return "10-19";
  if (n < 50) return "20-49";
  if (n < 100) return "50-99";
  if (n < 250) return "100-249";
  return "250 e oltre";
}

const allowed = (id: string, v: string | null) => (v && options(id).includes(v) ? v : null);

/** Campi del profilo ricavabili dal documento (solo valori ammessi). */
export function profileFrom(kind: DocKind, d: VisuraData | BilancioData): Record<string, string> {
  const out: Record<string, string> = {};
  if (d.partita_iva && isValidItalianVat(d.partita_iva)) out["PR-10"] = normalizeVat(d.partita_iva);
  if (d.ragione_sociale) out["PR-11"] = d.ragione_sociale.trim();
  if (kind === "visura") {
    const v = d as VisuraData;
    const settore = allowed("PR-01", v.settore);
    if (settore) out["PR-01"] = settore;
    const regione = allowed("PR-04", v.regione);
    if (regione) out["PR-04"] = regione;
    const add = employeeBand(v.addetti);
    if (add) out["PR-03"] = add;
    if (v.anno_costituzione && v.anno_costituzione > 1800 && v.anno_costituzione <= new Date().getFullYear())
      out["PR-09"] = String(v.anno_costituzione);
  } else {
    const b = d as BilancioData;
    const band = revenueBand(b.ricavi);
    if (band) out["PR-02"] = band;
    const add = employeeBand(b.dipendenti);
    if (add) out["PR-03"] = add;
  }
  return out;
}

export function financialsFrom(b: BilancioData): Financials {
  return {
    year: b.anno_esercizio,
    employees: b.dipendenti,
    ricavi: b.ricavi,
    valore_produzione: b.valore_produzione,
    ebitda: b.ebitda,
    ebit: b.ebit,
    utile_netto: b.utile_netto,
    costo_personale: b.costo_personale,
    patrimonio_netto: b.patrimonio_netto,
    totale_attivo: b.totale_attivo,
    debiti_finanziari: b.debiti_finanziari,
    disponibilita_liquide: b.disponibilita_liquide,
    crediti_commerciali: b.crediti_commerciali,
    debiti_fornitori: b.debiti_fornitori,
    rimanenze: b.rimanenze,
  };
}

export interface FinancialKpis {
  ebitdaMargin: number | null; // %
  rosMargin: number | null; // % EBIT su ricavi
  netMargin: number | null; // %
  pfn: number | null; // debiti finanziari − liquidità
  pfnOnEbitda: number | null;
  equityRatio: number | null; // % patrimonio netto su attivo
  dso: number | null; // giorni di incasso
  dio: number | null; // giorni di magazzino sui ricavi
  revenuePerEmployee: number | null;
  notes: string[];
}

const pct = (a: number | null | undefined, b: number | null | undefined) =>
  a !== null && a !== undefined && b ? Math.round((a / b) * 1000) / 10 : null;

/** Indicatori sintetici e letture orientative (soglie generali, da adattare al settore). */
export function financialKpis(f: Financials): FinancialKpis {
  const ricavi = f.ricavi ?? f.valore_produzione;
  const pfn =
    f.debiti_finanziari !== null && f.debiti_finanziari !== undefined
      ? f.debiti_finanziari - (f.disponibilita_liquide ?? 0)
      : null;
  const pfnOnEbitda = pfn !== null && f.ebitda && f.ebitda > 0 ? Math.round((pfn / f.ebitda) * 10) / 10 : null;
  const k: FinancialKpis = {
    ebitdaMargin: pct(f.ebitda, ricavi),
    rosMargin: pct(f.ebit, ricavi),
    netMargin: pct(f.utile_netto, ricavi),
    pfn,
    pfnOnEbitda,
    equityRatio: pct(f.patrimonio_netto, f.totale_attivo),
    dso: f.crediti_commerciali !== null && f.crediti_commerciali !== undefined && ricavi ? Math.round((f.crediti_commerciali / ricavi) * 365) : null,
    dio: f.rimanenze !== null && f.rimanenze !== undefined && ricavi ? Math.round((f.rimanenze / ricavi) * 365) : null,
    revenuePerEmployee: ricavi && f.employees ? Math.round(ricavi / f.employees) : null,
    notes: [],
  };
  if (k.ebitdaMargin !== null)
    k.notes.push(
      k.ebitdaMargin < 5
        ? `Marginalità operativa bassa (EBITDA ${k.ebitdaMargin}% dei ricavi): poco spazio per investire e assorbire imprevisti.`
        : k.ebitdaMargin < 10
          ? `Marginalità operativa intermedia (EBITDA ${k.ebitdaMargin}% dei ricavi).`
          : `Buona marginalità operativa (EBITDA ${k.ebitdaMargin}% dei ricavi).`,
    );
  if (pfn !== null && pfn < 0) k.notes.push("L'azienda ha più liquidità che debiti finanziari (posizione finanziaria netta positiva).");
  else if (k.pfnOnEbitda !== null)
    k.notes.push(
      k.pfnOnEbitda > 4
        ? `Indebitamento elevato: la posizione finanziaria netta vale ${k.pfnOnEbitda} volte l'EBITDA (sopra 4 le banche tendono a irrigidirsi).`
        : k.pfnOnEbitda > 2.5
          ? `Indebitamento da tenere sotto controllo: ${k.pfnOnEbitda} volte l'EBITDA.`
          : `Indebitamento sostenibile: ${k.pfnOnEbitda} volte l'EBITDA.`,
    );
  if (k.equityRatio !== null && k.equityRatio < 20)
    k.notes.push(`Patrimonio netto pari al ${k.equityRatio}% dell'attivo: struttura finanziaria fragile.`);
  if (k.dso !== null && k.dso > 90) k.notes.push(`I clienti pagano in media in circa ${k.dso} giorni: il capitale circolante assorbe molta cassa.`);
  return k;
}
