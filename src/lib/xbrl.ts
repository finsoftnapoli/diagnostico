// Lettura del bilancio in formato XBRL (tassonomia itcc-ci di XBRL Italia, il file depositato al Registro Imprese).
// I valori sono già strutturati e in euro: si leggono senza AI, solo dall'esercizio più recente e dai prospetti
// principali (i dati delle tabelle di nota integrativa, con dimensioni, sono ignorati).
import type { BilancioData } from "./documents";
import { isValidItalianVat, normalizeVat } from "./vat";

type Ctx = { date: string; duration: boolean };

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

/** Testo del file secondo la codifica dichiarata (UTF-8 se non indicata). */
export function xmlText(bytes: Uint8Array): string {
  const decl = new TextDecoder("latin1").decode(bytes.subarray(0, 200));
  const enc = decl.match(/encoding=["']([\w-]+)["']/i)?.[1]?.toLowerCase();
  const label = enc && /^(iso-8859-1|latin1|windows-1252|cp1252)$/.test(enc) ? "windows-1252" : "utf-8";
  return new TextDecoder(label).decode(bytes);
}

/** Vero se il testo sembra un'istanza XBRL. */
export function looksLikeXbrl(text: string): boolean {
  const head = text.slice(0, 4000).replace(/^﻿/, "").trimStart();
  return head.startsWith("<") && /<(\w+:)?xbrl[\s>]/.test(head);
}

/** Fatti dell'esercizio più recente, per nome dell'elemento (senza prefisso). */
function currentFacts(xml: string): { facts: Map<string, string>; year: number | null } {
  const contexts = new Map<string, Ctx>();
  for (const m of xml.matchAll(/<(?:[\w-]+:)?context\b[^>]*\bid="([^"]+)"[^>]*>([\s\S]*?)<\/(?:[\w-]+:)?context>/g)) {
    const body = m[2];
    if (/<(?:[\w-]+:)?(segment|scenario)\b/.test(body)) continue; // contesti con dimensioni: tabelle di dettaglio
    const instant = body.match(/<(?:[\w-]+:)?instant>\s*([\d-]{10})/);
    const end = body.match(/<(?:[\w-]+:)?endDate>\s*([\d-]{10})/);
    if (instant) contexts.set(m[1], { date: instant[1], duration: false });
    else if (end) contexts.set(m[1], { date: end[1], duration: true });
  }
  const dates = [...contexts.values()].map((c) => c.date).sort();
  const latest = dates.at(-1) ?? null;
  const facts = new Map<string, string>();
  if (!latest) return { facts, year: null };
  for (const m of xml.matchAll(/<([\w-]+):([A-Za-z0-9_]+)\b([^>]*?)>([^<]*)<\/\1:\2>/g)) {
    const ref = m[3].match(/\bcontextRef="([^"]+)"/)?.[1];
    const ctx = ref ? contexts.get(ref) : undefined;
    if (!ctx || ctx.date !== latest) continue;
    if (!facts.has(m[2])) facts.set(m[2], m[4]);
  }
  return { facts, year: Number(latest.slice(0, 4)) };
}

/** Converte un'istanza XBRL nei dati del bilancio; null se il file non contiene i prospetti. */
export function parseXbrl(xml: string): BilancioData | null {
  if (!looksLikeXbrl(xml)) return null;
  const { facts, year } = currentFacts(xml);
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
  const text = (name: string) => {
    const v = facts.get(name);
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
