// Riscontri e domande degli utenti su Ottogramma, report e approfondimenti. Le domande arrivano anche allo staff per email.
import { NextResponse } from "next/server";
import { BRAND } from "@/config/brand";
import { siteUrl } from "@/config/site";
import { isEmailConfigured, sendEmail } from "@/lib/email";
import { currentUser, supabaseService } from "@/lib/supabase/server";

const KINDS = ["ottogramma", "report", "modulo", "domanda"];
const DAILY_MAX = 20;

export async function POST(request: Request) {
  const { user } = await currentUser();
  if (!user) return NextResponse.json({ error: "Accesso richiesto" }, { status: 401 });
  const body = (await request.json().catch(() => ({}))) as { kind?: string; refId?: string; rating?: number; message?: string };
  if (!body.kind || !KINDS.includes(body.kind)) return NextResponse.json({ error: "Richiesta non valida" }, { status: 400 });
  const rating = Number.isInteger(body.rating) && (body.rating as number) >= 1 && (body.rating as number) <= 5 ? body.rating : null;
  const message = typeof body.message === "string" ? body.message.trim().slice(0, 2000) : "";
  if (!rating && !message) return NextResponse.json({ error: "Indichi un voto o scriva un messaggio" }, { status: 400 });
  const refId = body.refId && /^[0-9a-f-]{36}$/i.test(body.refId) ? body.refId : null;
  const db = supabaseService();
  const since = new Date(Date.now() - 86_400_000).toISOString();
  const { count } = await db.from("feedback").select("id", { count: "exact", head: true }).eq("user_id", user.id).gte("created_at", since);
  if ((count ?? 0) >= DAILY_MAX) return NextResponse.json({ error: "Ha già inviato molti messaggi oggi: riprovi domani" }, { status: 429 });
  const { error } = await db
    .from("feedback")
    .insert({ kind: body.kind, ref_id: refId, user_id: user.id, rating, message: message || null });
  if (error) return NextResponse.json({ error: "Invio non riuscito, riprovi" }, { status: 500 });
  // una domanda o un commento scritto arrivano subito allo staff, che può rispondere all'utente
  if (message && isEmailConfigured()) {
    const what = body.kind === "domanda" ? "Domanda" : "Riscontro";
    const to = process.env.STAFF_NOTIFY_EMAIL ?? BRAND.contactEmail;
    await sendEmail({
      to,
      replyTo: user.email ?? undefined,
      subject: `${what} da ${user.email ?? "un utente"}${rating ? ` (voto ${rating}/5)` : ""}`,
      text: `${message}\n\nPagina: ${body.kind}${refId ? ` ${refId}` : ""}\nArea staff: ${siteUrl()}/admin/controlli`,
      html: `<p>${message.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[c] as string).replace(/\n/g, "<br>")}</p><p>Pagina: ${body.kind}</p><p><a href="${siteUrl()}/admin/controlli">Apri l'area staff</a></p>`,
    }).catch((e) => console.error("Riscontro non inoltrato:", e instanceof Error ? e.message : e));
  }
  return NextResponse.json({ ok: true });
}
