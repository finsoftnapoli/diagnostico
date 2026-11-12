// Controlli automatici sul contenuto di un report prima dell'invio al cliente senza revisione dello staff.
// Un problema "bloccante" trattiene il report per la revisione; una "nota" resta visibile allo staff.
import type { FieldSpec } from "./narrative-spec";
import { reviewChecks } from "./review-checks";

export interface ReleaseVerdict {
  /** Vero se il report può partire senza revisione. */
  ok: boolean;
  blocking: string[];
  notes: string[];
  /** Esito della seconda lettura indipendente, quando è stata fatta. */
  secondOpinion?: { ok: boolean; issues: string[] } | null;
  at?: string;
  /** Controlli superati: momento da cui il report parte da solo verso il cliente. */
  releaseAfter?: string;
  /** Lo staff ha fermato l'invio automatico: il report parte solo con un'approvazione. */
  hold?: boolean;
}

type Json = unknown;

/** Tutte le stringhe di un valore, con il percorso. */
export function strings(v: Json, path = "", out: [string, string][] = []): [string, string][] {
  if (typeof v === "string") out.push([path, v]);
  else if (Array.isArray(v)) v.forEach((x, i) => strings(x, `${path}[${i}]`, out));
  else if (v && typeof v === "object") for (const [k, x] of Object.entries(v)) strings(x, path ? `${path}.${k}` : k, out);
  return out;
}

/** Numero scritto all'italiana ("1.200,5") o all'inglese. */
function parseNumber(s: string): number {
  const t = /^\d{1,3}(\.\d{3})+(,\d+)?$/.test(s) ? s.replace(/\./g, "").replace(",", ".") : s.replace(",", ".");
  return Number(t);
}

const NUM = /\d+(?:[.,]\d+)*/g;

/** Tutti i numeri presenti nei dati dati al sistema (anche dentro i testi), più le distanze tra punteggio e riferimento. */
export function allowedNumbers(input: Json): number[] {
  const out = new Set<number>([100]);
  const walk = (v: Json) => {
    if (typeof v === "number" && Number.isFinite(v)) out.add(v);
    else if (typeof v === "string") for (const m of v.match(NUM) ?? []) out.add(parseNumber(m));
    else if (Array.isArray(v)) v.forEach(walk);
    else if (v && typeof v === "object") {
      const o = v as Record<string, unknown>;
      const a = o.punteggio;
      for (const k of ["riferimento", "riferimentoFascia"])
        if (typeof a === "number" && typeof o[k] === "number") out.add(Math.abs(a - (o[k] as number)));
      Object.values(o).forEach(walk);
    }
  };
  walk(input);
  const top = input as Record<string, unknown>;
  const pairs: [unknown, unknown][] = [
    [top?.punteggioComplessivo, top?.riferimentoFascia],
    [top?.punteggioModulo, top?.punteggioAmbitoNelDiagnostico],
  ];
  for (const [a, b] of pairs) if (typeof a === "number" && typeof b === "number") out.add(Math.abs(a - b));
  return [...out];
}

const known = (x: number, allowed: number[]) =>
  allowed.some((a) => Math.abs(a - x) < 0.06 || Math.round(a) === x || Math.round(a * 10) / 10 === x);

const BLOCKING_PATTERNS: { re: RegExp; message: string }[] = [
  {
    re: /\[[^\]]*\]|\bTODO\b|\bXX+\b|\?\?\?|\blorem\b|[{}]|\b(?:undefined|NaN|null)\b/i,
    message: "contiene un segnaposto o un valore mancante",
  },
  { re: /\.\.(?!\.)| {2,}| [,;:](?!\))/, message: "ha un refuso di punteggiatura" },
  {
    re: /\b(?:in quanto (?:IA|AI|modello)|come (?:modello|assistente|intelligenza artificiale)|sono un(?:'| )?(?:IA|AI|assistente)|generat[oa] (?:automaticamente|da(?:ll[a'])? ?(?:IA|AI|intelligenza))|modello linguistico|ChatGPT|Claude|Anthropic|OpenAI|\bprompt\b)/i,
    message: "parla di sé come di un sistema automatico",
  },
  {
    re: /\b(?:garantisc\w*|garantiamo|certamente|sicuramente|senza dubbio|senz'altro otterrete)\b/i,
    message: "contiene promesse o certezze",
  },
  {
    re: /\b(?:tuo|tua|tuoi|tue|hai|puoi|devi|vuoi|potresti|dovresti|ti consigli\w+|ti suggeri\w+)\b/i,
    message: "dà del tu invece del voi",
  },
  {
    re: /\b(?:secondo (?:uno studio|una ricerca|i dati|l['’]istat|recenti)|studi (?:dimostrano|mostrano)|ricerche (?:dimostrano|mostrano)|statisticamente|è dimostrato)\b/i,
    message: "cita studi o statistiche esterne non presenti nei dati",
  },
  { re: /https?:\/\/|\bwww\.|[\w.+-]+@[\w-]+\.[a-z]{2,}|\+39\s?\d/i, message: "contiene un indirizzo web, un'email o un telefono" },
  {
    re: /\b(?:licenzi\w+|evasion\w*|elusion\w*|in nero|fare causa|denunci\w+|fallimento imminente|insolven\w+)\b/i,
    message: "tocca un tema delicato (personale, fisco, contenzioso, crisi) che richiede la lettura di un esperto",
  },
];

const MARKET = /\b(?:media|settore|mercato|aziende simili|concorrent\w+|benchmark|in italia|delle pmi|delle imprese)\b/i;

function numberIssues(where: string, text: string, allowed: number[], blocking: string[], notes: string[]) {
  for (const m of text.matchAll(/(\d{1,3})\s*(?:su 100|\/100|punti\b)/gi)) {
    const x = Number(m[1]);
    if (!known(x, allowed)) blocking.push(`${where}: cita un punteggio che non risulta dai dati («${m[0]}»)`);
  }
  for (const m of text.matchAll(/(\d+(?:[.,]\d+)?)\s?%/g)) {
    const x = parseNumber(m[1]);
    if (known(x, allowed)) continue;
    const sentence = text.slice(
      Math.max(0, text.lastIndexOf(".", m.index) + 1),
      text.indexOf(".", m.index + m[0].length) + 1 || text.length,
    );
    if (MARKET.test(sentence)) blocking.push(`${where}: cita una percentuale di mercato o di settore che non risulta dai dati («${m[0]}»)`);
    else notes.push(`${where}: indica una percentuale non presente nei dati («${m[0]}»): va letta come obiettivo proposto`);
  }
  for (const m of text.matchAll(/(?:€\s?(\d+(?:[.,]\d+)*))|(?:(\d+(?:[.,]\d+)*)\s?(?:€|euro|mila euro|milioni(?: di euro)?|mln))/gi)) {
    const x = parseNumber(m[1] ?? m[2]);
    if (!known(x, allowed)) blocking.push(`${where}: cita un importo che non risulta dai dati («${m[0].trim()}»)`);
  }
}

/** Controlli deterministici: struttura, registro, segnaposto, numeri citati. */
export function releaseChecks(opts: {
  spec: FieldSpec[];
  narrative: Json;
  /** I dati forniti per scrivere il report: da qui si ricavano i numeri che il testo può citare. */
  input: Json;
  expected?: Record<string, string[]>;
  labels?: Record<string, string>;
  /** Ragione sociale dell'azienda: altre denominazioni societarie nel testo trattengono il report. */
  company?: string | null;
}): ReleaseVerdict {
  const blocking: string[] = [];
  const notes: string[] = [];
  for (const i of reviewChecks(opts.spec, opts.narrative as Record<string, unknown>, { expected: opts.expected, labels: opts.labels })) {
    const line = `${i.where}: ${i.message}`;
    if (i.level === "errore" || /che il diagnostico indica come priorità|non è tra le priorità calcolate/.test(i.message))
      blocking.push(line);
    else if (/^è (?:breve|lungo)/.test(i.message)) notes.push(line);
  }
  const allowed = allowedNumbers(opts.input);
  const own = (opts.company ?? "").toLowerCase().replace(/[^a-z0-9]/g, "");
  for (const [path, text] of strings(opts.narrative)) {
    // i codici (ambito, titoli fissi) non sono testo da leggere
    if (text.length < 12) continue;
    const where = path.replace(/\[(\d+)\]/g, (_, n) => ` ${Number(n) + 1}`).replace(/\./g, " · ");
    for (const p of BLOCKING_PATTERNS) {
      const hit = text.match(p.re);
      if (hit) blocking.push(`${where}: ${p.message} («${hit[0].trim() || "spazi"}»)`);
    }
    numberIssues(where, text, allowed, blocking, notes);
    for (const m of text.matchAll(
      /\b([A-ZÀ-Ý][\w&'.-]*(?: [A-ZÀ-Ý&][\w&'.-]*){0,3}) (?:S\.?r\.?l\.?|S\.?p\.?A\.?|S\.?a\.?s\.?|S\.?n\.?c\.?)(?=[\s,.;:)]|$)/g,
    )) {
      const name = m[0].toLowerCase().replace(/[^a-z0-9]/g, "");
      if (own && (own.includes(name) || name.includes(own.replace(/(srl|spa|sas|snc)$/, "")))) continue;
      blocking.push(`${where}: nomina un'altra società («${m[0]}»)`);
    }
  }
  const uniq = (xs: string[]) => [...new Set(xs)];
  return { ok: blocking.length === 0, blocking: uniq(blocking), notes: uniq(notes) };
}
