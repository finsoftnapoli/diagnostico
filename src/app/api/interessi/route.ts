// Registra l'interesse per un approfondimento per ambito, per le priorità o per la consulenza.
// La vendita vera (pagamento) arriva nella fase pagamenti; qui l'utente chiede di essere ricontattato.
import { NextResponse } from "next/server";
import { supabaseServer, supabaseService } from "@/lib/supabase/server";

const KINDS = ["approfondimento_ambito", "approfondimento_priorita", "consulenza"] as const;
const AREAS = new Set(["STR", "FIN", "MKT", "PER", "OPS", "DIG", "INN", "SOS"]);

export async function POST(request: Request) {
  const sb = await supabaseServer();
  const { data: auth } = await sb.auth.getUser();
  if (!auth.user) return NextResponse.json({ error: "Accesso richiesto" }, { status: 401 });
  const body = (await request.json().catch(() => ({}))) as { assessmentId?: string; kind?: string; area?: string; note?: string };
  if (!body.kind || !KINDS.includes(body.kind as (typeof KINDS)[number]))
    return NextResponse.json({ error: "Richiesta non valida" }, { status: 400 });
  const area = body.area && AREAS.has(body.area) ? body.area : null;

  // la compilazione deve essere dell'utente (la regola di accesso lo garantisce)
  let companyId: string | null = null;
  if (body.assessmentId) {
    const { data: a } = await sb.from("assessments").select("company_id").eq("id", body.assessmentId).maybeSingle();
    if (!a) return NextResponse.json({ error: "Compilazione non trovata" }, { status: 404 });
    companyId = a.company_id as string;
  }
  const { error } = await supabaseService().from("interests").insert({
    user_id: auth.user.id,
    assessment_id: body.assessmentId ?? null,
    company_id: companyId,
    kind: body.kind,
    area,
    note: (body.note ?? "").slice(0, 500) || null,
  });
  if (error) {
    console.error("Interesse non registrato:", error.message);
    return NextResponse.json({ error: "Richiesta non riuscita, riprova" }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
