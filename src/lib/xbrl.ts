// Lettura del bilancio in formato XBRL (tassonomia itcc-ci di XBRL Italia, il file depositato al Registro Imprese).
// I valori sono già strutturati e in euro: si leggono senza AI, solo dall'esercizio più recente e dai prospetti
// principali (i dati delle tabelle di nota integrativa, con dimensioni, sono ignorati).
import type { BilancioData } from "./documents";
import { isValidItalianVat, normalizeVat } from "./vat";

const decode = (s: string) => {
  let out = s;
  // alcuni file codificano due volte i caratteri speciali (es. &amp;#39;)
  for (let i = 0; i < 2; i++)
    out = out
      .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
      .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
      .replace(/&quot;/g, '"')
      .replace(/&apos;/g, "'")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&amp;/g, "&");
  return out.trim();
};

/** Testo del file secondo la codifica (BOM o dichiarazione XML; UTF-8 se non indicata). */
export function xmlText(bytes: Uint8Array): string {
  if (bytes[0] === 0xff && bytes[1] === 0xfe) return new TextDecoder("utf-16le").decode(bytes);
  if (bytes[0] === 0xfe && bytes[1] === 0xff) return new TextDecoder("utf-16be").decode(bytes);
  const decl = new TextDecoder("latin1").decode(bytes.subarray(0, 200));
  const enc = decl.match(/encoding=["']([\w-]+)["']/i)?.[1]?.toLowerCase();
  const label = enc && /^(iso-8859-1|latin1|windows-1252|cp1252)$/.test(enc) ? "windows-1252" : "utf-8";
  return new TextDecoder(label).decode(bytes);
}

/** Vero se il testo sembra un'istanza XBRL. */
export function looksLikeXbrl(text: string): boolean {
  const head = text
    .slice(0, 20000)
    .replace(/^\uFEFF/, "")
    .trimStart();
  return head.startsWith("<") && /<([\w.-]+:)?xbrl[\s>]/.test(head);
}

const attr = (attrs: string, name: string) => attrs.match(new RegExp(`\\b${name}\\s*=\\s*["']([^"']+)["']`))?.[1];

/**
 * Fatti dell'esercizio più recente, per nome dell'elemento (senza prefisso). La data di riferimento è la chiusura
 * dell'ultimo stato patrimoniale (o conto economico) presente: il file può contenere altre date, per esempio quelle
 * di approvazione o di deposito.
 */
function currentFacts(xml: string): { facts: Map<string, string>; anyDate: Map<string, string>; year: number | null } {
  const contexts = new Map<string, string>();
  for (const m of xml.matchAll(/<(?:[\w.-]+:)?context\b([^>]*)>([\s\S]*?)<\/(?:[\w.-]+:)?context>/g)) {
    const id = attr(m[1], "id");
    const body = m[2];
    if (!id || /<(?:[\w.-]+:)?(segment|scenario)\b/.test(body)) continue; // contesti con dimensioni: tabelle di dettaglio
    const date = body.match(/<(?:[\w.-]+:)?(?:instant|endDate)>\s*(\d{4}-\d{2}-\d{2})/)?.[1];
    if (date) contexts.set(id, date);
  }
  // tutti i fatti per nome e data
  const byName = new Map<string, Map<string, string>>();
  for (const m of xml.matchAll(/<([\w.-]+):([A-Za-z0-9_]+)\b([^>]*?)>([^<]*)<\/\1:\2>/g)) {
    const ref = attr(m[3], "contextRef");
    const date = ref ? contexts.get(ref) : undefined;
    if (!date) continue;
    const dates = byName.get(m[2]) ?? new Map<string, string>();
    if (!dates.has(date)) dates.set(date, m[4]);
    byName.set(m[2], dates);
  }
  const latestOf = (name: string) => [...(byName.get(name)?.keys() ?? [])].sort().at(-1);
  const ref = latestOf("TotaleAttivo") ?? latestOf("TotaleValoreProduzione") ?? latestOf("TotalePatrimonioNetto");
  const facts = new Map<string, string>();
  const anyDate = new Map<string, string>();
  for (const [name, dates] of byName) {
    if (ref && dates.has(ref)) facts.set(name, dates.get(ref)!);
    anyDate.set(name, dates.get([...dates.keys()].sort().at(-1)!)!);
  }
  return { facts, anyDate, year: ref ? Number(ref.slice(0, 4)) : null };
}

/** Riepilogo per i log quando un file non si legge: nessun dato dell'azienda, solo la struttura. */
export function xbrlDiagnostics(xml: string): string {
  const contexts = (xml.match(/<(?:[\w.-]+:)?context\b/g) ?? []).length;
  const prefixes = [...new Set([...xml.matchAll(/<([\w.-]+):[A-Z][A-Za-z0-9_]+\b[^>]*contextRef/g)].map((m) => m[1]))].slice(0, 5);
  const root = xml.slice(0, 20000).match(/<([\w.-]+:)?xbrl[\s>]/)?.[0] ?? "nessuna radice xbrl";
  return `lunghezza ${xml.length}, radice ${root.trim()}, contesti ${contexts}, prefissi ${prefixes.join(",") || "nessuno"}, inizio ${JSON.stringify(xml.slice(0, 60))}`;
}

/** Converte un'istanza XBRL nei dati del bilancio; null se il file non contiene i prospetti. */
export function parseXbrl(xml: string): BilancioData | null {
  if (!looksLikeXbrl(xml)) return null;
  const { facts, anyDate, year } = currentFacts(xml);
  const has = (name: string) => facts.has(name);
  const num = (...names: string[]): number | null => {
    for (const n of names) {
      const raw = facts.get(n);
      if (raw === undefined) continue;
      const v = Number(raw.trim());
      if (Number.isFinite(v)) return v;
    }
    return null;
  };
  // i dati anagrafici possono stare in un contesto con un'altra data
  const text = (name: string) => {
    const v = facts.get(name) ?? anyDate.get(name);
    return v ? decode(v) : null;
  };

  const totaleAttivo = num("TotaleAttivo");
  const valoreProduzione = num("TotaleValoreProduzione");
  if (totaleAttivo === null && valoreProduzione === null) return null;

  // EBITDA: differenza A − B più ammortamenti e svalutazioni (B.10) e accantonamenti (B.12, B.13).
  // Nel conto economico XBRL le voci a zero possono mancare: si calcola solo se è presente il totale dei costi.
  const ebit = num("DifferenzaValoreCostiProduzione");
  const ebitda =
    ebit !== null && has("TotaleCostiProduzione")
      ? ebit +
        (num("CostiProduzioneAmmortamentiSvalutazioniTotaleAmmortamentiSvalutazioni") ?? 0) +
        (num("CostiProduzioneAccantonamentiRischi") ?? 0) +
        (num("CostiProduzioneAltriAccantonamenti") ?? 0)
      : null;

  // Debiti finanziari: solo se il bilancio dettaglia i debiti per natura (non negli schemi abbreviati e micro).
  const DEBITI_FIN = [
    "DebitiObbligazioniTotaleObbligazioni",
    "DebitiObbligazioniConvertibiliTotaleObbligazioniConvertibili",
    "DebitiDebitiVersoSociFinanziamentiTotaleDebitiVersoSociFinanziamenti",
    "DebitiDebitiVersoBancheTotaleDebitiVersoBanche",
    "DebitiDebitiVersoAltriFinanziatoriTotaleDebitiVersoAltriFinanziatori",
  ];
  const dettaglioDebiti = [...facts.keys()].some((k) => k.startsWith("DebitiDebiti") || k.startsWith("DebitiObbligazioni"));
  const debitiFinanziari = dettaglioDebiti ? DEBITI_FIN.reduce((s, n) => s + (num(n) ?? 0), 0) : null;

  const vat = [text("DatiAnagraficiPartitaIva"), text("DatiAnagraficiCodiceFiscale")]
    .map((v) => (v ? normalizeVat(v) : null))
    .find((v) => v && isValidItalianVat(v));
  const dip = num("TotaleDipendentiNumeroMedio", "NumeroMedioDipendentiTotaleDipendenti");

  return {
    ragione_sociale: text("DatiAnagraficiDenominazione"),
    partita_iva: vat ?? null,
    anno_esercizio: year,
    ricavi: num("ValoreProduzioneRicaviVenditePrestazioni"),
    valore_produzione: valoreProduzione,
    ebitda,
    ebit,
    utile_netto: num("UtilePerditaEsercizio", "PatrimonioNettoUtilePerditaEsercizio"),
    costo_personale: num("CostiProduzionePersonaleTotaleCostiPersonale"),
    patrimonio_netto: num("TotalePatrimonioNetto"),
    totale_attivo: totaleAttivo,
    debiti_finanziari: debitiFinanziari,
    disponibilita_liquide: num("TotaleDisponibilitaLiquide"),
    crediti_commerciali: num("CreditiVersoClientiTotaleCreditiVersoClienti"),
    debiti_fornitori: num("DebitiDebitiVersoFornitoriTotaleDebitiVersoFornitori"),
    rimanenze: num("TotaleRimanenze"),
    dipendenti: dip === null ? null : Math.round(dip),
  };
}
