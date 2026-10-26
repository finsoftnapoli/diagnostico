// Ripulisce le risposte che arrivano dal browser prima di salvarle: tiene solo valori ammessi.
import { AREAS, ISSUES, OBJECTIVES, PROFILE_FIELDS, QUESTIONS } from "./questionnaire";
import { emptyResponses } from "./scoring";
import type { AreaCode, Responses } from "./types";
import { isValidItalianVat, normalizeVat } from "./vat";

/** Lunghezza minima dei testi su ambizioni e sfide (uguale a quella del questionario). */
export const MIN_TEXT = 40;

const AREA_CODES = new Set<string>(AREAS.map((a) => a.code));
const str = (v: unknown, max = 600) => (typeof v === "string" ? v.slice(0, max).trim() : "");
const areas = (v: unknown): AreaCode[] =>
  Array.isArray(v) ? (Array.from(new Set(v.filter((x) => AREA_CODES.has(x)))) as AreaCode[]) : [];
const codes = (v: unknown, allowed: Set<string>) =>
  Array.isArray(v) ? Array.from(new Set(v.filter((x) => allowed.has(x)))).slice(0, 3) : [];

export function sanitizeResponses(input: unknown): Responses {
  const r = (input ?? {}) as Record<string, unknown>;
  const out = emptyResponses();
  const profile = (r.profile ?? {}) as Record<string, unknown>;
  for (const f of PROFILE_FIELDS) {
    let v = str(profile[f.id], 160);
    if (f.id === "PR-10") v = normalizeVat(v);
    if (!v) continue;
    if (f.type === "select" && !f.options?.includes(v)) continue;
    out.profile[f.id] = v;
  }
  out.objectives = codes(r.objectives, new Set(OBJECTIVES.map((o) => o.code)));
  out.issues = codes(r.issues, new Set(ISSUES.map((o) => o.code)));
  out.objectivesText = str(r.objectivesText, 1200);
  out.issuesText = str(r.issuesText, 1200);
  out.objectivesTextAreas = areas(r.objectivesTextAreas);
  out.issuesTextAreas = areas(r.issuesTextAreas);
  out.textAreas = Array.from(new Set([...out.objectivesTextAreas, ...out.issuesTextAreas]));
  const levels = (r.levels ?? {}) as Record<string, unknown>;
  const checks = (r.checks ?? {}) as Record<string, unknown>;
  for (const q of QUESTIONS) {
    const l = levels[q.id];
    if (typeof l === "number" && Number.isInteger(l) && l >= 1 && l <= 4) out.levels[q.id] = l;
    const c = checks[q.id];
    if (typeof c === "string" && q.check.options.includes(c)) out.checks[q.id] = c;
  }
  const imp = (r.importance ?? {}) as Record<string, unknown>;
  for (const a of AREAS) {
    const v = imp[a.code];
    if (typeof v === "number" && [1, 2, 3].includes(v)) out.importance[a.code] = v;
  }
  const c = (r.consents ?? {}) as Record<string, unknown>;
  out.consents = { service: c.service === true, benchmark: c.benchmark === true, marketing: c.marketing === true };
  const fin = r.financials as Record<string, unknown> | undefined;
  if (fin && typeof fin === "object") {
    const keys = [
      "year", "employees", "ricavi", "valore_produzione", "ebitda", "ebit", "utile_netto", "costo_personale",
      "patrimonio_netto", "totale_attivo", "debiti_finanziari", "disponibilita_liquide", "crediti_commerciali",
      "debiti_fornitori", "rimanenze",
    ] as const;
    const f = {} as Record<(typeof keys)[number], number | null>;
    for (const k of keys) f[k] = typeof fin[k] === "number" && Number.isFinite(fin[k]) ? (fin[k] as number) : null;
    out.financials = f;
  }
  const uuid = (v: unknown) => (typeof v === "string" && /^[0-9a-f-]{36}$/i.test(v) ? v : undefined);
  const docs = r.documents as Record<string, unknown> | undefined;
  if (docs && typeof docs === "object") {
    const d = { visura: uuid(docs.visura), bilancio: uuid(docs.bilancio) };
    if (d.visura || d.bilancio) out.documents = d;
  }
  const g = r.governance as Record<string, unknown> | undefined;
  if (g && typeof g === "object") {
    const num = (v: unknown) => (typeof v === "number" && Number.isFinite(v) ? v : null);
    out.governance = {
      organo: typeof g.organo === "string" ? g.organo.slice(0, 60) : null,
      amministratori: num(g.amministratori),
      organoControllo: typeof g.organoControllo === "boolean" ? g.organoControllo : null,
      soci: num(g.soci),
      quotaSocioPrincipale: num(g.quotaSocioPrincipale),
    };
  }
  const ctx = r.context as Record<string, unknown> | undefined;
  if (ctx && uuid(ctx.companyId)) out.context = { companyId: ctx.companyId as string, companyName: str(ctx.companyName, 160) };
  // le persone suggerite dalla visura non vengono mai salvate
  return out;
}

/** Il questionario è completo? Restituisce il motivo se non lo è. */
export function incompleteReason(r: Responses): string | null {
  if (!r.consents.service) return "manca il consenso al servizio";
  if (PROFILE_FIELDS.some((f) => f.required && !r.profile[f.id])) return "profilo incompleto";
  if (!isValidItalianVat(r.profile["PR-10"] ?? "")) return "partita IVA non valida";
  if (!r.objectives.length || !r.issues.length) return "obiettivi o sfide mancanti";
  if (r.objectivesText.length < MIN_TEXT || r.issuesText.length < MIN_TEXT) return "descrizioni di ambizioni e sfide troppo brevi";
  if (QUESTIONS.some((q) => !r.levels[q.id])) return "domande senza risposta";
  return null;
}
