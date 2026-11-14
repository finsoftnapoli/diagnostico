// Email di accesso e conferma (codice e link), inviate dal sito al posto del mittente di Supabase.
import { C, emailButton, emailLayout, esc, ownerSentence, para } from "./email-layout";

export type AuthAction = "magiclink" | "signup" | "invite" | "recovery" | "email_change" | "reauthentication" | string;

export function authEmail(p: { action: AuthAction; token: string; link: string | null }) {
  const confirm = p.action === "signup" || p.action === "invite";
  const change = p.action === "email_change";
  const title = confirm ? "Confermi la Sua email" : change ? "Confermi il nuovo indirizzo email" : "Il Suo codice di accesso";
  const intro = confirm
    ? "Per salvare il Suo profilo e accedere all'area personale confermi il Suo indirizzo email."
    : change
      ? "Per completare il cambio dell'indirizzo email inserisca il codice o apra il link."
      : "Ecco il codice per accedere alla Sua area personale.";
  const cta = confirm ? "Conferma l'email" : change ? "Conferma il nuovo indirizzo" : "Accedi con un clic";
  const subject = p.token ? `${title}: ${p.token}` : title;

  const codeBox = p.token
    ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:20px 0 6px"><tr>
<td align="center" style="background:${C.paper};border:1px solid ${C.line};border-radius:10px;padding:18px 12px">
<div style="font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:${C.muted};margin-bottom:6px">Codice</div>
<div style="font-family:'SFMono-Regular',Menlo,Consolas,monospace;font-size:32px;font-weight:700;letter-spacing:8px;color:${C.navy}">${esc(p.token)}</div>
</td></tr></table>
${para("Lo inserisca nella pagina in cui l'ha richiesto.", `font-size:13px;color:${C.muted};text-align:center`)}`
    : "";
  const linkPart = p.link
    ? `${para(p.token ? "Oppure apra il link, dallo stesso browser in cui ha fatto la richiesta:" : "Apra il link dallo stesso browser in cui ha fatto la richiesta:", "margin-top:18px")}
${emailButton(p.link, cta)}`
    : "";
  const body = `${para(esc(intro))}
${codeBox}
${linkPart}
${para("Il codice e il link funzionano una sola volta e scadono dopo un'ora. Se non è stato Lei a fare la richiesta, ignori questa email: senza il codice nessuno può accedere.", `font-size:13px;color:${C.muted};margin-top:18px`)}`;

  const html = emailLayout({ preheader: p.token ? `Codice: ${p.token}` : title, title, body });
  const text = `${title}

${intro}
${p.token ? `\nCodice: ${p.token}\n` : ""}${p.link ? `\n${cta}: ${p.link}\n` : ""}
Il codice e il link funzionano una sola volta e scadono dopo un'ora. Se non è stato Lei a fare la richiesta, ignori questa email.

${ownerSentence()}`;
  return { subject, html, text };
}
