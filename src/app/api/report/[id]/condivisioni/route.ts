// Condivisione di un report in sola lettura: crea un link con scadenza (e, se indicato, lo invia per email), elenca i link, li revoca.
import { NextResponse } from "next/server";
import { siteUrl } from "@/config/site";
import { isEmailConfigured, sendEmail, sharedReportEmail } from "@/lib/email";
import { hashShareToken, MAX_ACTIVE_SHARES, MAX_SHARES_PER_DAY, newShareToken, shareExpiry, type ShareScope } from "@/lib/share";
import { supabaseServer, supabaseService } from "@/lib/supabase/server";

const UUID = /^[0-9a-f-]{36}$/i;
const COLS = "id, recipient_email, recipient_name, scope, expires_at, revoked_at, views, last_viewed_at, created_at";

/** La compilazione, se l'utente può vederla (autore o amministratore dello spazio aziendale) e il report è stato rilasciato. */
async function owned(id: string) {
  if (!UUID.test(id)) return null;
  const sb = await supabaseServer();
  const { data: auth } = await sb.auth.getUser();
  if (!auth.user?.email) return null;
  const { data } = await sb.from("assessments").select("id, report_status, companies(name)").eq("id", id).maybeSingle();
  if (!data || data.report_status !== "ready") return null;
  return { user: auth.user, company: (data.companies as unknown as { name: string } | null)?.name ?? "la vostra azienda" };
}

export async function GET(_: Request, ctx: RouteContext<"/api/report/[id]/condivisioni">) {
  const { id } = await ctx.params;
  if (!(await owned(id))) return NextResponse.json({ error: "Report non disponibile" }, { status: 404 });
  const { data, error } = await supabaseService()
    .from("report_shares")
    .select(COLS)
    .eq("assessment_id", id)
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) return NextResponse.json({ error: "Condivisione non ancora attiva" }, { status: 503 });
  return NextResponse.json({ shares: data });
}

export async function POST(request: Request, ctx: RouteContext<"/api/report/[id]/condivisioni">) {
  const { id } = await ctx.params;
  const own = await owned(id);
  if (!own) return NextResponse.json({ error: "Report non disponibile" }, { status: 404 });
  const body = (await request.json().catch(() => ({}))) as { email?: string; name?: string; note?: string; scope?: string; days?: number };
  const email = (body.email ?? "").trim().toLowerCase().slice(0, 200);
  if (email && !/^\S+@\S+\.\S+$/.test(email)) return NextResponse.json({ error: "Email non valida" }, { status: 422 });
  if (email && !isEmailConfigured())
    return NextResponse.json({ error: "Invio delle email non ancora attivo: create il link e inviatelo voi" }, { status: 503 });
  const name = (body.name ?? "").trim().slice(0, 120) || null;
  const note = (body.note ?? "").replace(/\s+/g, " ").trim().slice(0, 400) || null;
  const scope: ShareScope = body.scope === "sintesi" ? "sintesi" : "completo";
  const expires = shareExpiry(Number(body.days));

  const db = supabaseService();
  const now = new Date();
  const [{ count: today, error }, { count: active }] = await Promise.all([
    db
      .from("report_shares")
      .select("id", { count: "exact", head: true })
      .eq("created_by", own.user.id)
      .gte("created_at", new Date(now.getTime() - 86_400_000).toISOString()),
    db
      .from("report_shares")
      .select("id", { count: "exact", head: true })
      .eq("assessment_id", id)
      .is("revoked_at", null)
      .gt("expires_at", now.toISOString()),
  ]);
  if (error) return NextResponse.json({ error: "Condivisione non ancora attiva" }, { status: 503 });
  if ((today ?? 0) >= MAX_SHARES_PER_DAY)
    return NextResponse.json({ error: "Avete raggiunto il limite di condivisioni per oggi: riprovate domani" }, { status: 429 });
  if ((active ?? 0) >= MAX_ACTIVE_SHARES)
    return NextResponse.json(
      { error: "Ci sono già molti link attivi per questo report: revocatene qualcuno prima di crearne altri" },
      { status: 429 },
    );

  const token = newShareToken();
  const { data: row, error: insertError } = await db
    .from("report_shares")
    .insert({
      assessment_id: id,
      created_by: own.user.id,
      token_hash: hashShareToken(token),
      recipient_email: email || null,
      recipient_name: name,
      scope,
      expires_at: expires.toISOString(),
    })
    .select(COLS)
    .single();
  if (insertError) {
    console.error("Condivisione non creata:", insertError.message);
    return NextResponse.json({ error: "Condivisione non riuscita, riprovate" }, { status: 500 });
  }
  const link = `${siteUrl()}/condiviso/${token}`;
  let sent = false;
  if (email) {
    try {
      const mail = sharedReportEmail({
        sender: own.user.email!,
        company: own.company,
        name,
        note,
        link,
        expires,
        summary: scope === "sintesi",
      });
      await sendEmail({ to: email, ...mail, replyTo: own.user.email! });
      sent = true;
    } catch (e) {
      console.error("Email di condivisione non inviata:", e instanceof Error ? e.message : e);
    }
  }
  return NextResponse.json({ link, share: row, sent, emailFailed: !!email && !sent });
}

export async function DELETE(request: Request, ctx: RouteContext<"/api/report/[id]/condivisioni">) {
  const { id } = await ctx.params;
  if (!(await owned(id))) return NextResponse.json({ error: "Report non disponibile" }, { status: 404 });
  const share = new URL(request.url).searchParams.get("link") ?? "";
  if (!UUID.test(share)) return NextResponse.json({ error: "Richiesta non valida" }, { status: 400 });
  const { error } = await supabaseService()
    .from("report_shares")
    .update({ revoked_at: new Date().toISOString() })
    .eq("id", share)
    .eq("assessment_id", id)
    .is("revoked_at", null);
  if (error) return NextResponse.json({ error: "Revoca non riuscita, riprovate" }, { status: 500 });
  return NextResponse.json({ ok: true });
}
