// Registra l'interesse per un approfondimento per ambito, per le priorità o per la consulenza.
// La vendita vera (pagamento) arriva nella fase pagamenti; qui l'utente chiede di essere ricontattato.
import { NextResponse } from "next/server";
import { BRAND } from "@/config/brand";
import { interestNotificationEmail, isEmailConfigured, sendEmail } from "@/lib/email";
import { AREAS as AREA_LIST } from "@/lib/questionnaire";
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
  let companyName: string | null = null;
  if (body.assessmentId) {
    const { data: a } = await sb.from("assessments").select("company_id, companies(name)").eq("id", body.assessmentId).maybeSingle();
    if (!a) return NextResponse.json({ error: "Compilazione non trovata" }, { status: 404 });
    companyId = a.company_id as string;
    companyName = (a.companies as unknown as { name: string } | null)?.name ?? null;
  }
  const db = supabaseService();
  // la stessa richiesta ripetuta nello stesso giorno non si registra due volte
  const since = new Date(Date.now() - 24 * 3600 * 1000).toISOString();
  let dup = db.from("interests").select("id", { count: "exact", head: true }).eq("user_id", auth.user.id).eq("kind", body.kind).gte("created_at", since);
  dup = area ? dup.eq("area", area) : dup.is("area", null);
  const { count } = await dup;
  if (count) return NextResponse.json({ ok: true });

  const { error } = await db.from("interests").insert({
    user_id: auth.user.id,
    contact_email: auth.user.email ?? null,
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
  // avviso allo staff: le richieste vanno ricontattate subito
  const to = process.env.STAFF_NOTIFY_EMAIL ?? BRAND.contactEmail;
  if (isEmailConfigured())
    await sendEmail({
      to,
      replyTo: auth.user.email ?? undefined,
      ...interestNotificationEmail({
        kind: body.kind,
        area: area ? (AREA_LIST.find((a) => a.code === area)?.name ?? area) : null,
        company: companyName,
        email: auth.user.email ?? "",
        link: `${new URL(request.url).origin}/admin${body.assessmentId ? `/${body.assessmentId}` : ""}`,
      }),
    }).catch((e) => console.error("Avviso richiesta non inviato:", e instanceof Error ? e.message : e));
  return NextResponse.json({ ok: true });
}
