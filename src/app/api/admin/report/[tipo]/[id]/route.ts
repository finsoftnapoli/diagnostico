// Revisione dei report da parte dello staff: salva le correzioni, rigenera, approva e invia al cliente.
import { NextResponse } from "next/server";
import { cleanNarrative, DIAGNOSTIC_SPEC, MODULE_SPEC } from "@/lib/narrative-spec";
import { generateAssessmentReport, generateModuleReportFor, notifyReportReady } from "@/lib/report-jobs";
import { currentUser, supabaseService } from "@/lib/supabase/server";

export const maxDuration = 300;

export async function POST(request: Request, ctx: RouteContext<"/api/admin/report/[tipo]/[id]">) {
  const { tipo, id } = await ctx.params;
  const { user, isStaff } = await currentUser();
  if (!user || !isStaff) return NextResponse.json({ error: "Riservato allo staff" }, { status: 403 });
  if (!/^[0-9a-f-]{36}$/i.test(id) || (tipo !== "diagnostico" && tipo !== "modulo"))
    return NextResponse.json({ error: "Report non trovato" }, { status: 404 });
  const table = tipo === "diagnostico" ? "assessments" : "module_assessments";
  const spec = tipo === "diagnostico" ? DIAGNOSTIC_SPEC : MODULE_SPEC;
  const body = (await request.json().catch(() => ({}))) as { action?: string; narrative?: unknown };
  const db = supabaseService();
  const { data: row } = await db
    .from(table)
    .select(tipo === "diagnostico" ? "id, user_id, company_id, responses, report_attempts, report_status, report_narrative" : "id, report_attempts, report_status, report_narrative")
    .eq("id", id)
    .maybeSingle();
  if (!row) return NextResponse.json({ error: "Report non trovato" }, { status: 404 });
  const r = row as unknown as { id: string; report_status: string; report_narrative: unknown; report_attempts: number };

  if (body.action === "regenerate") {
    if (!process.env.ANTHROPIC_API_KEY) return NextResponse.json({ error: "API non configurata" }, { status: 503 });
    const narrative =
      tipo === "diagnostico"
        ? await generateAssessmentReport(db, row as never)
        : await generateModuleReportFor(db, row as never);
    if (!narrative) return NextResponse.json({ error: "Generazione non riuscita, riprova" }, { status: 502 });
    return NextResponse.json({ narrative, status: "review" });
  }

  if (body.action !== "save" && body.action !== "approve") return NextResponse.json({ error: "Azione non valida" }, { status: 400 });
  if (!r.report_narrative) return NextResponse.json({ error: "Il report non è ancora stato generato" }, { status: 409 });
  const narrative = cleanNarrative(spec, body.narrative, r.report_narrative);
  const now = new Date().toISOString();
  const approve = body.action === "approve" && r.report_status !== "ready";
  const { error } = await db
    .from(table)
    .update({
      report_narrative: narrative,
      ...(approve ? { report_status: "ready", report_ready_at: now, report_reviewed_at: now } : {}),
      ...(approve && tipo === "diagnostico" ? { report_reviewed_by: user.id } : {}),
    })
    .eq("id", id);
  if (error) return NextResponse.json({ error: "Salvataggio non riuscito" }, { status: 500 });
  if (approve)
    await notifyReportReady(db, table, id, new URL(request.url).origin).catch((e) =>
      console.error("Email al cliente non inviata:", e instanceof Error ? e.message : e),
    );
  return NextResponse.json({ narrative, status: approve ? "ready" : r.report_status });
}
