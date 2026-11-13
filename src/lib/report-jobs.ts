import "server-only";
import { BRAND } from "@/config/brand";
import { companyDocInputs } from "./company-docs";
import { siteUrl } from "@/config/site";
import { heldReportEmail, isEmailConfigured, reportReadyEmail, reviewDigestEmail, scheduledReportEmail, sendEmail } from "./email";
import { generateModuleReport } from "./module-report";
import { autoReleaseEnabled } from "./release";
import { logError } from "./observe";
import type { ReleaseVerdict } from "./release-checks";
import { nextMorning, releaseLabel } from "./release-schedule";
import { generateNarrative } from "./report-narrative";
import { computeResult } from "./scoring";
import { supabaseService } from "./supabase/server";
import type { Responses } from "./types";

// Genera i report approfonditi e ne controlla il contenuto. Un report che supera i controlli parte da solo
// la mattina successiva alla compilazione; uno che non li supera resta "da rivedere". Lo staff è avvisato in entrambi i casi.
/** Minuti di attesa prima che l'esecuzione pianificata riprenda una compilazione (la generazione parte già all'invio). */
const DELAY_MIN = 10;
/** Report generati in parallelo e tempo massimo di lavoro per esecuzione (la funzione ha 300 secondi). */
const CONCURRENCY = 4;
const BUDGET_MS = 220_000;
/** Un report non riuscito si riprova alle esecuzioni successive fino a questo numero di tentativi. */
const MAX_ATTEMPTS = 3;

type Db = ReturnType<typeof supabaseService>;
type Table = "assessments" | "module_assessments";
type AssessmentRow = { id: string; user_id: string | null; company_id: string | null; responses: unknown; report_attempts: number };
type ModuleRow = { id: string; report_attempts: number };
/** `release`: il report può partire da solo se supera i controlli (non quando lo rigenera lo staff). */
type Options = { release?: boolean };

const staffEmail = () => process.env.STAFF_NOTIFY_EMAIL ?? BRAND.contactEmail;

async function companyOf(db: Db, table: Table, id: string) {
  const { data } = await db.from(table).select("companies(name)").eq("id", id).maybeSingle();
  return (data?.companies as unknown as { name: string } | null)?.name ?? "azienda";
}

/**
 * Salva il report generato. Se supera i controlli se ne programma l'invio per la mattina successiva alla compilazione;
 * altrimenti resta trattenuto. In entrambi i casi lo staff è avvisato.
 */
async function saveGenerated(db: Db, table: Table, id: string, base: Record<string, unknown>, verdict: ReleaseVerdict, opts: Options) {
  const auto = !!opts.release && verdict.ok && autoReleaseEnabled();
  let releaseAfter: string | null = null;
  if (auto) {
    const { data: row } = await db.from(table).select("completed_at").eq("id", id).maybeSingle();
    releaseAfter = nextMorning(row?.completed_at ? new Date(row.completed_at as string) : new Date()).toISOString();
  }
  const { error } = await db
    .from(table)
    .update({
      ...base,
      report_checks: releaseAfter ? { ...verdict, releaseAfter } : verdict,
      report_status: "review",
      report_released_by: null,
      report_released_at: null,
    })
    .eq("id", id);
  if (error) {
    // colonne del rilascio automatico non ancora presenti nel database: si resta alla revisione dello staff
    console.warn("Rilascio automatico non disponibile:", error.message);
    await db
      .from(table)
      .update({ ...base, report_status: "review" })
      .eq("id", id);
    releaseAfter = null;
  }
  if (!opts.release) return;
  const staffLink = `${siteUrl()}/admin/${table === "assessments" ? "" : "modulo/"}${id}`;
  const what = table === "assessments" ? "il report del diagnostico" : "il report dell'approfondimento";
  try {
    if (isEmailConfigured()) {
      const company = await companyOf(db, table, id);
      const reasons = [...verdict.blocking, ...(verdict.secondOpinion?.issues ?? [])];
      await sendEmail({
        to: staffEmail(),
        ...(releaseAfter
          ? scheduledReportEmail({
              company,
              what,
              when: releaseLabel(releaseAfter),
              notes: [...verdict.notes, ...(verdict.secondOpinion?.issues ?? [])],
              link: staffLink,
            })
          : heldReportEmail({
              company,
              what,
              reasons: reasons.length ? reasons : ["Rilascio automatico disattivato o non disponibile."],
              link: staffLink,
            })),
      });
    }
  } catch (e) {
    console.error("Avviso sul report non inviato:", e instanceof Error ? e.message : e);
  }
}

/** Report con i controlli superati e l'ora di invio raggiunta, non fermati dallo staff: partono verso il cliente. */
export async function releaseDueReports(db: Db, origin: string) {
  const now = new Date().toISOString();
  let released = 0;
  let held = 0;
  for (const table of ["assessments", "module_assessments"] as const) {
    const { data, error } = await db.from(table).select("id, report_checks").eq("report_status", "review");
    if (error) {
      // colonne assenti finché la migrazione non è eseguita: tutti i report in revisione sono da rivedere
      const { count } = await db.from(table).select("id", { count: "exact", head: true }).eq("report_status", "review");
      held += count ?? 0;
      continue;
    }
    for (const r of (data ?? []) as { id: string; report_checks: ReleaseVerdict | null }[]) {
      const c = r.report_checks;
      const scheduled = !!c?.ok && !!c.releaseAfter && !c.hold;
      if (!scheduled) held++;
      if (!scheduled || (c.releaseAfter as string) > now || !autoReleaseEnabled()) continue;
      const { data: done } = await db
        .from(table)
        .update({ report_status: "ready", report_ready_at: now, report_released_by: "auto", report_released_at: now })
        .eq("id", r.id)
        .eq("report_status", "review")
        .select("id")
        .maybeSingle();
      if (!done) continue;
      released++;
      await notifyReportReady(db, table, r.id, origin).catch((e) =>
        console.error("Email al cliente non inviata:", e instanceof Error ? e.message : e),
      );
    }
  }
  return { released, held };
}

async function saveFailed(db: Db, table: Table, id: string, attempts: number, opts: Options, e: unknown) {
  const why = e instanceof Error ? e.message : String(e);
  console.error("Generazione report non riuscita:", why);
  await logError("server", `Generazione report non riuscita: ${why}`, `${table}/${id}`);
  await db.from(table).update({ report_status: "failed", report_attempts: attempts }).eq("id", id);
  // all'ultimo tentativo lo staff va avvisato: il report non arriverà da solo
  if (opts.release && attempts >= MAX_ATTEMPTS && isEmailConfigured())
    await sendEmail({
      to: staffEmail(),
      ...heldReportEmail({
        company: await companyOf(db, table, id),
        what: table === "assessments" ? "il report del diagnostico" : "il report dell'approfondimento",
        reasons: [why],
        link: `${siteUrl()}/admin/${table === "assessments" ? "" : "modulo/"}${id}`,
        failed: true,
      }),
    }).catch(() => {});
}

/** Genera (o rigenera) il report di una compilazione, lo controlla e, se previsto, lo rilascia. */
export async function generateAssessmentReport(db: Db, a: AssessmentRow, opts: Options = {}) {
  try {
    // documenti archiviati dopo la compilazione (bilancio più recente, business plan, ecc.)
    const inputs = a.user_id && a.company_id ? await companyDocInputs(db, a.user_id, a.company_id, a.responses as Responses) : null;
    const { narrative, verdict } = await generateNarrative(a.responses as Responses, inputs);
    await saveGenerated(
      db,
      "assessments",
      a.id,
      { report_narrative: narrative, report_inputs: inputs?.documentIds.length ? inputs : null, report_attempts: a.report_attempts + 1 },
      verdict,
      opts,
    );
    return narrative;
  } catch (e) {
    await saveFailed(db, "assessments", a.id, a.report_attempts + 1, opts, e);
    return null;
  }
}

/** Genera (o rigenera) il report di un modulo di approfondimento, lo controlla e, se previsto, lo rilascia. */
export async function generateModuleReportFor(db: Db, m: ModuleRow, opts: Options = {}) {
  try {
    const { narrative, verdict } = await generateModuleReport(db, m.id);
    await saveGenerated(
      db,
      "module_assessments",
      m.id,
      { report_narrative: narrative, report_attempts: m.report_attempts + 1 },
      verdict,
      opts,
    );
    return narrative;
  } catch (e) {
    await saveFailed(db, "module_assessments", m.id, m.report_attempts + 1, opts, e);
    return null;
  }
}

/** Genera subito il report di una compilazione appena inviata (in coda alla risposta). */
export async function generateNow(table: Table, id: string) {
  const db = supabaseService();
  // si prende in carico solo se nessun altro lo sta già generando
  const { data: claimed } = await db
    .from(table)
    .update({ report_attempts: 1 })
    .eq("id", id)
    .eq("report_status", "pending")
    .eq("report_attempts", 0)
    .select(table === "assessments" ? "id, user_id, company_id, responses, report_attempts" : "id, report_attempts")
    .maybeSingle();
  if (!claimed) return;
  // il tentativo è già contato dalla presa in carico
  const row = { ...(claimed as object), report_attempts: 0 };
  if (table === "assessments") await generateAssessmentReport(db, row as AssessmentRow, { release: true });
  else await generateModuleReportFor(db, row as ModuleRow, { release: true });
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
    ...((diag ?? []) as AssessmentRow[]).map((a) => () => generateAssessmentReport(db, a, { release: true })),
    ...((mods ?? []) as ModuleRow[]).map((m) => () => generateModuleReportFor(db, m, { release: true })),
  ];
  const total = queue.length;
  let generated = 0;
  async function worker() {
    while (queue.length && Date.now() - started < BUDGET_MS) if (await queue.shift()!()) generated++;
  }
  await Promise.all(Array.from({ length: CONCURRENCY }, worker));

  // i report controllati partono all'ora programmata; promemoria allo staff se ne restano di trattenuti
  const { released, held: toReview } = await releaseDueReports(db, siteUrl());
  if (toReview && isEmailConfigured())
    await sendEmail({ to: staffEmail(), ...reviewDigestEmail({ count: toReview, link: `${origin}/admin` }) }).catch((e) =>
      console.error("Avviso revisione non inviato:", e instanceof Error ? e.message : e),
    );
  return { generated, failed: total - queue.length - generated, remaining: queue.length, released, toReview };
}

/** Email al cliente quando il report è rilasciato, dai controlli automatici o dallo staff. */
export async function notifyReportReady(db: Db, table: Table, id: string, origin: string) {
  if (!isEmailConfigured()) return;
  if (table === "assessments") {
    const { data } = await db.from("assessments").select("respondent_email, responses, companies(name)").eq("id", id).maybeSingle();
    if (!data?.respondent_email) return;
    const company = (data.companies as unknown as { name: string } | null)?.name ?? "la vostra azienda";
    const priorities = data.responses ? computeResult(data.responses as Responses).priorities.map((p) => p.code) : [];
    await sendEmail({
      to: data.respondent_email,
      ...reportReadyEmail({ company, link: `${origin}/area/report/${id}`, priorities, servicesLink: `${origin}/area/servizi` }),
    });
    await db.from("assessments").update({ report_notified_at: new Date().toISOString() }).eq("id", id);
  } else {
    const { data } = await db.from("module_assessments").select("user_id, area, companies(name)").eq("id", id).maybeSingle();
    if (!data) return;
    const { data: u } = await db.auth.admin.getUserById(data.user_id as string);
    if (!u.user?.email) return;
    const company = (data.companies as unknown as { name: string } | null)?.name ?? "la vostra azienda";
    await sendEmail({
      to: u.user.email,
      ...reportReadyEmail({ company, link: `${origin}/area/modulo/${id}`, module: data.area as string }),
    });
  }
}
