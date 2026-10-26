import "server-only";
import { companyDocInputs } from "./company-docs";
import { isEmailConfigured, reportReadyEmail, sendEmail } from "./email";
import { generateNarrative } from "./report-narrative";
import { supabaseService } from "./supabase/server";
import type { Responses } from "./types";

// Genera i report approfonditi in differita e avvisa via email. Il ritardo fa sì che il report
// non sia istantaneo: si elaborano le compilazioni completate da più di DELAY_MIN minuti.
const DELAY_MIN = 15;
/** Report generati in parallelo e tempo massimo di lavoro per esecuzione (la funzione ha 300 secondi). */
const CONCURRENCY = 4;
const BUDGET_MS = 220_000;
/** Un report non riuscito si riprova alle esecuzioni successive fino a questo numero di tentativi. */
const MAX_ATTEMPTS = 3;

type Row = { id: string; user_id: string | null; company_id: string | null; responses: unknown; respondent_email: string | null; report_attempts: number; companies: unknown };

export async function generatePendingReports(origin: string) {
  const db = supabaseService();
  const started = Date.now();
  const cutoff = new Date(started - DELAY_MIN * 60 * 1000).toISOString();
  const { data } = await db
    .from("assessments")
    .select("id, user_id, company_id, responses, respondent_email, report_attempts, companies(name)")
    .eq("status", "completed")
    .in("report_status", ["pending", "failed"])
    .lt("report_attempts", MAX_ATTEMPTS)
    .lte("completed_at", cutoff)
    .order("completed_at")
    .limit(200);
  const queue = [...((data ?? []) as Row[])];
  const stats = { generated: 0, failed: 0, notified: 0, remaining: 0 };

  async function one(a: Row) {
    try {
      // documenti archiviati dopo la compilazione (bilancio più recente, business plan, ecc.)
      const inputs = a.user_id && a.company_id ? await companyDocInputs(db, a.user_id, a.company_id, a.responses as Responses) : null;
      const narrative = await generateNarrative(a.responses as Responses, inputs);
      await db
        .from("assessments")
        .update({
          report_narrative: narrative,
          report_inputs: inputs?.documentIds.length ? inputs : null,
          report_status: "ready",
          report_ready_at: new Date().toISOString(),
          report_attempts: a.report_attempts + 1,
        })
        .eq("id", a.id);
      stats.generated++;
      const company = (a.companies as { name: string } | null)?.name ?? "la tua azienda";
      if (isEmailConfigured() && a.respondent_email) {
        try {
          await sendEmail({ to: a.respondent_email, ...reportReadyEmail({ company, link: `${origin}/area/report/${a.id}` }) });
          await db.from("assessments").update({ report_notified_at: new Date().toISOString() }).eq("id", a.id);
          stats.notified++;
        } catch (e) {
          console.error("Email report non inviata:", e instanceof Error ? e.message : e);
        }
      }
    } catch (e) {
      console.error("Generazione report non riuscita:", e instanceof Error ? e.message : e);
      await db.from("assessments").update({ report_status: "failed", report_attempts: a.report_attempts + 1 }).eq("id", a.id);
      stats.failed++;
    }
  }

  // più report in parallelo, finché c'è tempo: quelli rimasti passano all'esecuzione successiva
  async function worker() {
    while (queue.length && Date.now() - started < BUDGET_MS) await one(queue.shift()!);
  }
  await Promise.all(Array.from({ length: CONCURRENCY }, worker));
  stats.remaining = queue.length;
  return stats;
}
