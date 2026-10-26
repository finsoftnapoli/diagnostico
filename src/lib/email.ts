import "server-only";
import { BRAND } from "@/config/brand";

// Invio di email del servizio tramite Resend (stesso account usato da Supabase per i codici di accesso).
export const isEmailConfigured = () => !!process.env.RESEND_API_KEY;

export async function sendEmail(opts: { to: string; subject: string; html: string; text: string; replyTo?: string }) {
  const from = process.env.RESEND_FROM ?? `${BRAND.name} <diagnostico@finsoft.biz>`;
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { authorization: `Bearer ${process.env.RESEND_API_KEY}`, "content-type": "application/json" },
    body: JSON.stringify({ from, to: [opts.to], subject: opts.subject, html: opts.html, text: opts.text, reply_to: opts.replyTo }),
    signal: AbortSignal.timeout(10000),
  });
  if (!res.ok) throw new Error(`Resend ${res.status}: ${(await res.text()).slice(0, 200)}`);
}

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

/** Testo dell'invito: comunicazione di servizio richiesta da chi invita, senza contenuti promozionali. */
export function invitationEmail(p: { inviter: string; company: string; name?: string | null; link: string; expires: Date }) {
  const greeting = p.name ? `Buongiorno ${p.name},` : "Buongiorno,";
  const date = p.expires.toLocaleDateString("it-IT", { day: "numeric", month: "long" });
  const subject = `${p.inviter} ti invita a compilare il diagnostico di ${p.company}`;
  const text = `${greeting}

${p.inviter} ti ha invitato a compilare il diagnostico gestionale di ${p.company} su ${BRAND.name}.
Le risposte dei diversi responsabili permettono di confrontare le visioni e di vedere dove il management è allineato.
Le tue risposte individuali saranno visibili a chi ti ha invitato, in qualità di amministratore dello spazio aziendale.

Compila il diagnostico: ${p.link}

L'invito scade il ${date}. Se non conosci il mittente, puoi ignorare questa email.
${BRAND.name} è un servizio di ${BRAND.owner}.`;
  const html = `<p>${esc(greeting)}</p>
<p><strong>${esc(p.inviter)}</strong> ti ha invitato a compilare il diagnostico gestionale di <strong>${esc(p.company)}</strong> su ${esc(BRAND.name)}.</p>
<p>Le risposte dei diversi responsabili permettono di confrontare le visioni e di vedere dove il management è allineato. Le tue risposte individuali saranno visibili a chi ti ha invitato, in qualità di amministratore dello spazio aziendale.</p>
<p><a href="${esc(p.link)}" style="display:inline-block;background:#0a2a4a;color:#fff;padding:10px 18px;border-radius:6px;text-decoration:none;font-weight:600">Compila il diagnostico</a></p>
<p style="color:#5b6573;font-size:13px">L'invito scade il ${esc(date)}. Se non conosci il mittente, puoi ignorare questa email.<br>${esc(BRAND.name)} è un servizio di ${esc(BRAND.owner)}.</p>`;
  return { subject, text, html };
}

/** Email: il report approfondito è pronto. */
export function reportReadyEmail(p: { company: string; link: string }) {
  const subject = `Il report approfondito di ${p.company} è pronto`;
  const text = `Buongiorno,

il report approfondito del diagnostico di ${p.company} è pronto. Oltre all'Ottogramma che hai già visto, trovi l'analisi delle aree di priorità, gli interventi suggeriti e le osservazioni dei nostri analisti.

Apri il report: ${p.link}

${BRAND.name} è un servizio di ${BRAND.owner}.`;
  const html = `<p>Buongiorno,</p>
<p>il report approfondito del diagnostico di <strong>${esc(p.company)}</strong> è pronto. Oltre all'Ottogramma che hai già visto, trovi l'analisi delle aree di priorità, gli interventi suggeriti e le osservazioni dei nostri analisti.</p>
<p><a href="${esc(p.link)}" style="display:inline-block;background:#0a2a4a;color:#fff;padding:10px 18px;border-radius:6px;text-decoration:none;font-weight:600">Apri il report</a></p>
<p style="color:#5b6573;font-size:13px">${esc(BRAND.name)} è un servizio di ${esc(BRAND.owner)}.</p>`;
  return { subject, text, html };
}
