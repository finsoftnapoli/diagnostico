// Salva le risposte di un modulo di approfondimento; con "complete" calcola i punteggi e lo chiude.
import { after, NextResponse } from "next/server";
import { computeModule, moduleIncomplete, sanitizeModuleResponses } from "@/lib/module-scoring";
import { generateNow } from "@/lib/report-jobs";
import { supabaseServer, supabaseService } from "@/lib/supabase/server";
import type { AreaCode } from "@/lib/types";

// la generazione del report parte in coda alla risposta
export const maxDuration = 300;

export async function PATCH(request: Request, ctx: RouteContext<"/api/moduli/[id]">) {
  const { id } = await ctx.params;
  const { data: auth } = await (await supabaseServer()).auth.getUser();
  if (!auth.user) return NextResponse.json({ error: "Accesso richiesto" }, { status: 401 });
  if (!/^[0-9a-f-]{36}$/i.test(id)) return NextResponse.json({ error: "Modulo non trovato" }, { status: 404 });
  const db = supabaseService();
  const { data: m } = await db.from("module_assessments").select("id, user_id, area, status").eq("id", id).maybeSingle();
  if (!m || m.user_id !== auth.user.id) return NextResponse.json({ error: "Modulo non trovato" }, { status: 404 });
  if (m.status === "completed") return NextResponse.json({ error: "Il modulo è già stato inviato" }, { status: 409 });
  const raw = await request.text();
  if (raw.length > 100_000) return NextResponse.json({ error: "Richiesta troppo grande" }, { status: 413 });
  let body: { responses?: unknown; complete?: boolean };
  try {
    body = (JSON.parse(raw || "{}") ?? {}) as typeof body;
  } catch {
    return NextResponse.json({ error: "Richiesta non valida" }, { status: 400 });
  }
  const area = m.area as AreaCode;
  const responses = sanitizeModuleResponses(area, body.responses);
  const now = new Date().toISOString();
  if (body.complete) {
    const missing = moduleIncomplete(area, responses);
    if (missing) return NextResponse.json({ error: `Modulo incompleto: ${missing}` }, { status: 422 });
    const res = computeModule(area, responses);
    const { error } = await db
      .from("module_assessments")
      .update({
        responses,
        status: "completed",
        score: res.score,
        theme_scores: res.themes,
        report_status: "pending",
        completed_at: now,
        updated_at: now,
      })
      .eq("id", id)
      .eq("status", "in_progress");
    if (error) return NextResponse.json({ error: "Invio non riuscito, riprovi" }, { status: 500 });
    // dopo la risposta: generazione del report, che parte da solo se supera i controlli
    if (process.env.ANTHROPIC_API_KEY) after(() => generateNow("module_assessments", id));
    return NextResponse.json({ ok: true, completed: true });
  }
  await db.from("module_assessments").update({ responses, updated_at: now }).eq("id", id);
  return NextResponse.json({ ok: true });
}
