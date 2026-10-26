import "server-only";
import type { PlanSummary } from "./documents";
import type { supabaseService } from "./supabase/server";
import type { Financials, Governance, Responses } from "./types";

type Db = ReturnType<typeof supabaseService>;

export interface ReportInputs {
  financials?: Financials;
  governance?: Governance;
  plan?: PlanSummary;
  others?: PlanSummary[];
  documentIds: string[];
}

type DocRow = { id: string; kind: string; period: number | null; created_at: string; extracted: Record<string, unknown> | null };

/**
 * Dati dai documenti che l'utente ha archiviato per l'azienda: bilancio più recente (se più nuovo di quello
 * della compilazione), governance dell'ultima visura, ultimo business plan e fino a 3 altri documenti.
 */
export async function companyDocInputs(db: Db, userId: string, companyId: string, r: Responses): Promise<ReportInputs> {
  const { data } = await db
    .from("documents")
    .select("id, kind, period, created_at, extracted")
    .eq("user_id", userId)
    .eq("company_id", companyId)
    .order("created_at", { ascending: false })
    .limit(50);
  return pickInputs((data ?? []) as DocRow[], r);
}

/** Scelta dei documenti da usare (separata per poterla verificare nei test). */
export function pickInputs(docs: DocRow[], r: Responses): ReportInputs {
  const out: ReportInputs = { documentIds: [] };
  const bilanci = docs
    .filter((d) => d.kind === "bilancio" && d.extracted?.financials)
    .sort((a, b) => (b.period ?? 0) - (a.period ?? 0) || b.created_at.localeCompare(a.created_at));
  const latest = bilanci[0];
  if (latest) {
    const f = latest.extracted!.financials as Financials;
    const current = r.financials?.year ?? 0;
    if (!r.financials || (f.year ?? 0) > current) {
      out.financials = f;
      out.documentIds.push(latest.id);
    }
  }
  const visura = docs.find((d) => d.kind === "visura" && d.extracted?.governance);
  if (visura && !r.governance) {
    out.governance = visura.extracted!.governance as Governance;
    out.documentIds.push(visura.id);
  }
  const plan = docs.find((d) => d.kind === "business_plan" && d.extracted?.plan);
  if (plan) {
    out.plan = plan.extracted!.plan as PlanSummary;
    out.documentIds.push(plan.id);
  }
  const others = docs.filter((d) => d.kind === "altro" && d.extracted?.plan).slice(0, 3);
  if (others.length) {
    out.others = others.map((d) => d.extracted!.plan as PlanSummary);
    out.documentIds.push(...others.map((d) => d.id));
  }
  return out;
}
