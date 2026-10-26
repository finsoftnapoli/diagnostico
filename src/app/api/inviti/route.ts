// L'amministratore dello spazio aziendale invita un collega: crea l'invito e invia l'email.
import { NextResponse } from "next/server";
import { invitationEmail, isEmailConfigured, sendEmail } from "@/lib/email";
import { supabaseServer, supabaseService } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const sb = await supabaseServer();
  const { data: auth } = await sb.auth.getUser();
  const user = auth.user;
  if (!user?.email) return NextResponse.json({ error: "Accesso richiesto" }, { status: 401 });
  if (!isEmailConfigured()) return NextResponse.json({ error: "Invio delle email non ancora attivo" }, { status: 503 });

  const body = (await request.json().catch(() => ({}))) as { email?: string; name?: string; role?: string; companyId?: string };
  const email = (body.email ?? "").trim().toLowerCase().slice(0, 200);
  if (!/^\S+@\S+\.\S+$/.test(email)) return NextResponse.json({ error: "Email non valida" }, { status: 422 });
  if (email === user.email.toLowerCase()) return NextResponse.json({ error: "Non puoi invitare te stesso" }, { status: 422 });
  const name = (body.name ?? "").trim().slice(0, 120) || null;
  const role = (body.role ?? "").trim().slice(0, 80) || null;

  // azienda di cui l'utente è amministratore (quella indicata, altrimenti la più recente)
  let q = sb.from("company_members").select("company_id, companies(name)").eq("user_id", user.id).eq("role", "admin");
  if (body.companyId) q = q.eq("company_id", body.companyId);
  const { data: m } = await q.order("created_at", { ascending: false }).limit(1).maybeSingle();
  if (!m) return NextResponse.json({ error: "Solo l'amministratore dello spazio aziendale può invitare colleghi" }, { status: 403 });
  const companyName = (m.companies as unknown as { name: string } | null)?.name ?? "la tua azienda";

  // limite giornaliero di inviti per amministratore (protegge la reputazione del dominio di invio)
  const since = new Date(Date.now() - 24 * 3600 * 1000).toISOString();
  const { count: sentToday } = await supabaseService()
    .from("invitations")
    .select("id", { count: "exact", head: true })
    .eq("invited_by", user.id)
    .gte("sent_at", since);
  if ((sentToday ?? 0) >= 30) return NextResponse.json({ error: "Hai raggiunto il limite di inviti per oggi: riprova domani" }, { status: 429 });

  // un invito in sospeso per la stessa persona viene riutilizzato
  const { data: existing } = await sb
    .from("invitations")
    .select("id, token, expires_at")
    .eq("company_id", m.company_id)
    .eq("email", email)
    .eq("status", "pending")
    .gt("expires_at", new Date().toISOString())
    .maybeSingle();
  let inv = existing;
  if (!inv) {
    const { data, error } = await sb
      .from("invitations")
      .insert({ company_id: m.company_id, email, invited_by: user.id, invitee_name: name, invitee_role: role })
      .select("id, token, expires_at")
      .single();
    if (error) {
      console.error("Invito non creato:", error.message);
      return NextResponse.json({ error: "Invito non riuscito, riprova" }, { status: 500 });
    }
    inv = data;
  }

  const origin = new URL(request.url).origin;
  const mail = invitationEmail({
    inviter: user.email,
    company: companyName,
    name,
    link: `${origin}/invito?t=${inv.token}`,
    expires: new Date(inv.expires_at),
  });
  try {
    await sendEmail({ to: email, ...mail, replyTo: user.email });
  } catch (e) {
    console.error("Email di invito non inviata:", e instanceof Error ? e.message : e);
    return NextResponse.json({ error: "Email non inviata, riprova tra poco" }, { status: 502 });
  }
  await supabaseService().from("invitations").update({ sent_at: new Date().toISOString() }).eq("id", inv.id);
  return NextResponse.json({ ok: true });
}
