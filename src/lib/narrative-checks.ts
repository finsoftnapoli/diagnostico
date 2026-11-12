// Controlli di completezza dei report scritti dal modello: una risposta formalmente valida può essere quasi vuota.
import type { ModuleNarrative } from "./module-report";
import type { ReportNarrative } from "./report";

/** Controllo di completezza: stringa vuota se il report è utilizzabile. */
export function narrativeProblem(n: ReportNarrative, expectedPriorities: string[]): string {
  const filled = (s: string | undefined, min: number) => (s ?? "").trim().length >= min;
  if (!filled(n.executiveSummary, 200)) return "sintesi mancante o troppo breve";
  if (!filled(n.crossCutting, 120)) return "lettura d'insieme mancante";
  const missing = expectedPriorities.filter((c) => !n.priorities.some((p) => p.area === c));
  if (missing.length) return `priorità mancanti: ${missing.join(", ")}`;
  const weak = n.priorities.find(
    (p) => !filled(p.title, 5) || !filled(p.diagnosis, 120) || (p.actions ?? []).filter((a) => filled(a, 15)).length < 2,
  );
  if (weak) return `priorità ${weak.area} senza diagnosi o azioni`;
  if ((n.quickWins ?? []).filter((q) => filled(q, 15)).length < 2) return "interventi rapidi mancanti";
  if (!filled(n.closing, 80)) return "chiusura mancante";
  return "";
}

/** Controllo di completezza: stringa vuota se il report del modulo è utilizzabile. */
export function moduleNarrativeProblem(n: ModuleNarrative): string {
  const filled = (s: string | undefined, min: number) => (s ?? "").trim().length >= min;
  if (!filled(n.summary, 200)) return "sintesi mancante o troppo breve";
  const weak = n.themes.find((t) => !filled(t.diagnosis, 60) || t.actions.filter((a) => filled(a, 10)).length < 1);
  if (weak) return `sotto-ambito «${weak.theme}» senza diagnosi o azioni`;
  if (n.roadmap.some((h) => h.actions.filter((a) => filled(a, 10)).length < 2)) return "piano di lavoro incompleto";
  if ((n.kpis ?? []).filter((k) => filled(k, 10)).length < 3) return "indicatori mancanti";
  if (!filled(n.closing, 80)) return "chiusura mancante";
  return "";
}
