import "server-only";
import { BRAND } from "@/config/brand";
import { companyDocInputs } from "./company-docs";
import { isEmailConfigured, reportReadyEmail, reviewDigestEmail, sendEmail } from "./email";
import { generateModuleReport } from "./module-report";
import { generateNarrative } from "./report-narrative";
import { supabaseService } from "./supabase/server";
import type { Responses } from "./types";

// Genera i report approfonditi in differita. Il report generato resta "da rivedere": lo staff lo
// controlla, lo corregge se serve e lo approva; solo allora il cliente riceve l'email.
const DELAY_MIN = 15;
/** Report generati in parallelo e tempo massimo di lavoro per esecuzione (la funzione ha 300 secondi). */
const CONCURRENCY = 4;
const BUDGET_MS = 220_000;
/** Un report non riuscito si riprova alle esecuzioni successive fino a questo numero di tentativi. */
const MAX_ATTEMPTS = 3;

type Db = ReturnType<typeof supabaseService>;
type AssessmentRow = { id: string; user_id: string | null; company_id: string | null; responses: unknown; report_attempts: number };
type ModuleRow = { id: string; report_attempts: number };

/** Genera (o rigenera) il report di una compilazione e lo mette in revisione. */
export async function generateAssessmentReport(db: Db, a: AssessmentRow) {
  try {
    // documenti archiviati dopo la compilazione (bilancio più recente, business plan, ecc.)
    const inputs = a.user_id && a.company_id ? await companyDocInputs(db, a.user_id, a.company_id, a.responses as Responses) : null;
    const narrative = await generateNarrative(a.responses as Responses, inputs);
    await db
      .from("assessments")
      .update({
        report_narrative: narrative,
        report_inputs: inputs?.documentIds.length ? inputs : null,
        report_status: "review",
        report_attempts: a.report_attempts + 1,
      })
      .eq("id", a.id);
    return narrative;
  } catch (e) {
    console.error("Generazione report non riuscita:", e instanceof Error ? e.message : e);
    await db.from("assessments").update({ report_status: "failed", report_attempts: a.report_attempts + 1 }).eq("id", a.id);
    return null;
  }
}

/** Genera (o rigenera) il report di un modulo di approfondimento e lo mette in revisione. */
export async function generateModuleReportFor(db: Db, m: ModuleRow) {
  try {
    const narrative = await generateModuleReport(db, m.id);
    await db
      .from("module_assessments")
      .update({ report_narrative: narrative, report_status: "review", report_attempts: m.report_attempts + 1 })
      .eq("id", m.id);
    return narrative;
  } catch (e) {
    console.error("Generazione report modulo non riuscita:", e instanceof Error ? e.message : e);
    await db.from("module_assessments").update({ report_status: "failed", report_attempts: m.report_attempts + 1 }).eq("id", m.id);
    return null;
  }
}

export async function generatePendingReports(origin: string) {
  const db = supabaseService();
  const started = Date.now();
  const cutoff = new Date(started - DELAY_MIN * 60 * 1000).toISOString();
  const [{ data: diag }, { data: mods }] = await Promise.all([
    db
      .from("assessments")
      .select("id, user_id, company_id, responses, report_attempts")
      .eq("status", "completed")
      .in("report_status", ["pending", "failed"])
      .lt("report_attempts", MAX_ATTEMPTS)
      .lte("completed_at", cutoff)
      .order("completed_at")
      .limit(200),
    db
      .from("module_assessments")
      .select("id, report_attempts")
      .eq("status", "completed")
      .in("report_status", ["pending", "failed"])
      .lt("report_attempts", MAX_ATTEMPTS)
      .lte("completed_at", cutoff)
      .order("completed_at")
      .limit(200),
  ]);
  const queue: (() => Promise<unknown>)[] = [
    ...((diag ?? []) as AssessmentRow[]).map((a) => () => generateAssessmentReport(db, a)),
    ...((mods ?? []) as ModuleRow[]).map((m) => () => generateModuleReportFor(db, m)),
  ];
  const total = queue.length;
  let generated = 0;
  async function worker() {
    while (queue.length && Date.now() - started < BUDGET_MS) if (await queue.shift()!()) generated++;
  }
  await Promise.all(Array.from({ length: CONCURRENCY }, worker));

  // un'unica email allo staff con quanto c'è da rivedere
  const [{ count: d }, { count: m }] = await Promise.all([
    db.from("assessments").select("id", { count: "exact", head: true }).eq("report_status", "review"),
    db.from("module_assessments").select("id", { count: "exact", head: true }).eq("report_status", "review"),
  ]);
  const toReview = (d ?? 0) + (m ?? 0);
  if (generated && toReview && isEmailConfigured())
    await sendEmail({ to: process.env.STAFF_NOTIFY_EMAIL ?? BRAND.contactEmail, ...reviewDigestEmail({ count: toReview, link: `${origin}/admin` }) }).catch(
      (e) => console.error("Avviso revisione non inviato:", e instanceof Error ? e.message : e),
    );
  return { generated, failed: total - queue.length - generated, remaining: queue.length, toReview };
}

/** Email al cliente quando lo staff approva un report. */
export async function notifyReportReady(db: Db, table: "assessments" | "module_assessments", id: string, origin: string) {
  if (!isEmailConfigured()) return;
  if (table === "assessments") {
    const { data } = await db.from("assessments").select("respondent_email, companies(name)").eq("id", id).maybeSingle();
    if (!data?.respondent_email) return;
    const company = (data.companies as unknown as { name: string } | null)?.name ?? "la tua azienda";
    await sendEmail({ to: data.respondent_email, ...reportReadyEmail({ company, link: `${origin}/area/report/${id}` }) });
    await db.from("assessments").update({ report_notified_at: new Date().toISOString() }).eq("id", id);
  } else {
    const { data } = await db.from("module_assessments").select("user_id, area, companies(name)").eq("id", id).maybeSingle();
    if (!data) return;
    const { data: u } = await db.auth.admin.getUserById(data.user_id as string);
    if (!u.user?.email) return;
    const company = (data.companies as unknown as { name: string } | null)?.name ?? "la tua azienda";
    await sendEmail({
      to: u.user.email,
      ...reportReadyEmail({ company, link: `${origin}/area/modulo/${id}`, module: data.area as string }),
    });
  }
}
