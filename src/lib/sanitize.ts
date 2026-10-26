// Ripulisce le risposte che arrivano dal browser prima di salvarle: tiene solo valori ammessi.
import { AREAS, ISSUES, OBJECTIVES, PROFILE_FIELDS, QUESTIONS } from "./questionnaire";
import { emptyResponses } from "./scoring";
import type { AreaCode, Responses } from "./types";

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
    const v = str(profile[f.id], 120);
    if (!v) continue;
    if (f.type === "select" && !f.options?.includes(v)) continue;
    out.profile[f.id] = v;
  }
  out.objectives = codes(r.objectives, new Set(OBJECTIVES.map((o) => o.code)));
  out.issues = codes(r.issues, new Set(ISSUES.map((o) => o.code)));
  out.objectivesText = str(r.objectivesText);
  out.issuesText = str(r.issuesText);
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
  return out;
}

/** Il questionario è completo? Restituisce il motivo se non lo è. */
export function incompleteReason(r: Responses): string | null {
  if (!r.consents.service) return "manca il consenso al servizio";
  if (PROFILE_FIELDS.some((f) => f.required && !r.profile[f.id])) return "profilo incompleto";
  if (!r.objectives.length || !r.issues.length) return "obiettivi o criticità mancanti";
  if (QUESTIONS.some((q) => !r.levels[q.id])) return "domande senza risposta";
  if (AREAS.some((a) => !r.importance[a.code])) return "importanza mancante";
  return null;
}
