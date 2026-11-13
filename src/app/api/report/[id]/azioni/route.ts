// Segna come fatta (o non fatta) un'azione del report. Solo chi può vedere la compilazione.
import { NextResponse } from "next/server";
import { isActionKey } from "@/lib/action-key";
import { supabaseServer, supabaseService } from "@/lib/supabase/server";

export async function POST(request: Request, ctx: RouteContext<"/api/report/[id]/azioni">) {
  const { id } = await ctx.params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) return NextResponse.json({ error: "Richiesta non valida" }, { status: 400 });
  const sb = await supabaseServer();
  const { data: auth } = await sb.auth.getUser();
  if (!auth.user) return NextResponse.json({ error: "Accesso richiesto" }, { status: 401 });
  const { data } = await sb.from("assessments").select("id, report_status").eq("id", id).maybeSingle();
  if (!data || data.report_status !== "ready") return NextResponse.json({ error: "Report non disponibile" }, { status: 404 });
  const body = (await request.json().catch(() => ({}))) as { key?: unknown; done?: unknown };
  if (!isActionKey(body.key)) return NextResponse.json({ error: "Richiesta non valida" }, { status: 400 });
  const db = supabaseService();
  if (body.done === true) {
    const { count } = await db.from("report_actions").select("action_key", { count: "exact", head: true }).eq("assessment_id", id);
    if ((count ?? 0) >= 60) return NextResponse.json({ error: "Troppe azioni segnate" }, { status: 429 });
    const { error } = await db
      .from("report_actions")
      .upsert({ assessment_id: id, action_key: body.key, updated_by: auth.user.id, updated_at: new Date().toISOString() });
    if (error) return NextResponse.json({ error: "Salvataggio non riuscito" }, { status: 503 });
  } else {
    const { error } = await db.from("report_actions").delete().eq("assessment_id", id).eq("action_key", body.key);
    if (error) return NextResponse.json({ error: "Salvataggio non riuscito" }, { status: 503 });
  }
  return NextResponse.json({ ok: true });
}
