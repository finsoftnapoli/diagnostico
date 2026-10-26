import "server-only";
import { isEmailConfigured, reportReadyEmail, sendEmail } from "./email";
import { generateNarrative } from "./report-narrative";
import { supabaseService } from "./supabase/server";
import type { Responses } from "./types";

// Genera i report approfonditi in differita e avvisa via email. Il ritardo fa sì che il report
// non sia istantaneo: si elaborano le compilazioni completate da più di DELAY_MIN minuti.
const DELAY_MIN = 15;

export async function generatePendingReports(origin: string) {
  const db = supabaseService();
  const cutoff = new Date(Date.now() - DELAY_MIN * 60 * 1000).toISOString();
  const { data: pending } = await db
    .from("assessments")
    .select("id, responses, respondent_email, companies(name)")
    .eq("status", "completed")
    .eq("report_status", "pending")
    .lte("completed_at", cutoff)
    .order("completed_at")
    .limit(10);

  let generated = 0;
  let failed = 0;
  let notified = 0;
  for (const a of pending ?? []) {
    try {
      const narrative = await generateNarrative(a.responses as Responses);
      await db
        .from("assessments")
        .update({ report_narrative: narrative, report_status: "ready", report_ready_at: new Date().toISOString() })
        .eq("id", a.id);
      generated++;
      const company = (a.companies as unknown as { name: string } | null)?.name ?? "la tua azienda";
      if (isEmailConfigured() && a.respondent_email) {
        try {
          await sendEmail({ to: a.respondent_email, ...reportReadyEmail({ company, link: `${origin}/area/report/${a.id}` }) });
          await db.from("assessments").update({ report_notified_at: new Date().toISOString() }).eq("id", a.id);
          notified++;
        } catch (e) {
          console.error("Email report non inviata:", e instanceof Error ? e.message : e);
        }
      }
    } catch (e) {
      console.error("Generazione report non riuscita:", e instanceof Error ? e.message : e);
      await db.from("assessments").update({ report_status: "failed" }).eq("id", a.id);
      failed++;
    }
  }
  return { generated, failed, notified };
}
