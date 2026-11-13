// Send Email Hook di Supabase Auth: Supabase genera codice e link, il sito invia l'email con Resend
// (stessa impaginazione delle altre email). Attivo solo se configurato in Supabase e con SEND_EMAIL_HOOK_SECRET.
import { NextResponse } from "next/server";
import { authEmail } from "@/lib/auth-email";
import { isEmailConfigured, sendEmail } from "@/lib/email";
import { verifyStandardWebhook } from "@/lib/standard-webhook";
import { SUPABASE_URL } from "@/lib/supabase/env";

type Payload = {
  user: { email: string; email_new?: string; new_email?: string };
  email_data: {
    token: string;
    token_hash: string;
    redirect_to: string;
    email_action_type: string;
    token_new?: string;
    token_hash_new?: string;
  };
};

const fail = (status: number, message: string) => NextResponse.json({ error: { http_code: status, message } }, { status });

function verifyLink(tokenHash: string, type: string, redirectTo: string) {
  if (!tokenHash) return null;
  const q = new URLSearchParams({ token: tokenHash, type, redirect_to: redirectTo });
  return `${SUPABASE_URL}/auth/v1/verify?${q}`;
}

export async function POST(request: Request) {
  const secret = process.env.SEND_EMAIL_HOOK_SECRET;
  if (!secret) return fail(500, "Invio delle email di accesso non configurato");
  const body = await request.text();
  const ok = verifyStandardWebhook(
    body,
    {
      id: request.headers.get("webhook-id"),
      timestamp: request.headers.get("webhook-timestamp"),
      signature: request.headers.get("webhook-signature"),
    },
    secret,
  );
  if (!ok) return fail(401, "Firma non valida");
  if (!isEmailConfigured()) return fail(500, "Servizio email non configurato");

  let p: Payload;
  try {
    p = JSON.parse(body) as Payload;
  } catch {
    return fail(400, "Richiesta non valida");
  }
  const d = p.email_data;
  const type = d.email_action_type;
  // cambio email con conferma su entrambi gli indirizzi: i nomi dei campi sono storicamente invertiti
  const messages: { to: string; token: string; hash: string }[] = [];
  const newEmail = p.user.email_new ?? p.user.new_email;
  if (type === "email_change" && d.token_hash && d.token_hash_new && newEmail) {
    messages.push({ to: p.user.email, token: d.token, hash: d.token_hash_new });
    messages.push({ to: newEmail, token: d.token_new ?? "", hash: d.token_hash });
  } else if (type === "email_change" && newEmail) {
    messages.push({ to: newEmail, token: d.token || d.token_new || "", hash: d.token_hash || d.token_hash_new || "" });
  } else {
    messages.push({ to: p.user.email, token: d.token, hash: d.token_hash });
  }

  try {
    for (const m of messages) {
      await sendEmail({ to: m.to, ...authEmail({ action: type, token: m.token, link: verifyLink(m.hash, type, d.redirect_to) }) });
    }
  } catch (e) {
    console.error("Email di accesso non inviata:", e instanceof Error ? e.message : e);
    return fail(500, "Invio dell'email non riuscito, riprovate tra poco");
  }
  return NextResponse.json({});
}
