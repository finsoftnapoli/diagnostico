// Impaginazione delle email ai clienti: struttura a tabelle e stili in linea, come richiedono i programmi di posta.
// Un'intestazione con il nome del servizio, il contenuto su fondo bianco e un piede con contatti e titolare.
import { BRAND } from "@/config/brand";

export const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

export const C = { navy: "#0a2a4a", navySoft: "#1e4470", ink: "#1a2433", muted: "#5b6573", line: "#d9dee5", paper: "#f5f7fa" };
const FONT = "'Helvetica Neue',Helvetica,Arial,sans-serif";

/** "Finsoft S.r.l." senza punto doppio a fine frase. */
/** Punto finale dopo un nome, senza raddoppiarlo dopo "S.r.l.". */
export const stop = (s: string) => (s.endsWith(".") ? "" : ".");

export const ownerSentence = () => `${BRAND.name} è un servizio di ${BRAND.ownerLegal.replace(/\.$/, "")}.`;

export function emailButton(href: string, label: string) {
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:24px 0 8px"><tr><td style="border-radius:8px;background:${C.navy}">
<a href="${esc(href)}" style="display:inline-block;padding:14px 26px;font-family:${FONT};font-size:15px;font-weight:700;color:#ffffff;text-decoration:none;border-radius:8px">${esc(label)}</a>
</td></tr></table>`;
}

export function emailLayout(p: { preheader: string; title: string; eyebrow?: string; body: string }) {
  return `<!DOCTYPE html>
<html lang="it"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light"><title>${esc(p.title)}</title></head>
<body style="margin:0;padding:0;background:${C.paper}">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:${C.paper}">${esc(p.preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${C.paper}"><tr><td align="center" style="padding:24px 12px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;font-family:${FONT};color:${C.ink}">
<tr><td style="background:${C.navy};border-radius:12px 12px 0 0;padding:22px 32px">
<span style="font-size:17px;font-weight:700;color:#ffffff;letter-spacing:0.2px">${esc(BRAND.name)}</span>
<span style="float:right;font-size:12px;color:#c9d4e3;line-height:24px">${esc(BRAND.owner)}</span>
</td></tr>
<tr><td style="background:#ffffff;padding:32px 32px 28px;border-left:1px solid ${C.line};border-right:1px solid ${C.line}">
${p.eyebrow ? `<p style="margin:0 0 6px;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:${C.navySoft}">${esc(p.eyebrow)}</p>` : ""}
<h1 style="margin:0 0 16px;font-size:24px;line-height:1.25;color:${C.navy}">${esc(p.title)}</h1>
${p.body}
</td></tr>
<tr><td style="background:#ffffff;border:1px solid ${C.line};border-top:0;border-radius:0 0 12px 12px;padding:18px 32px;font-size:12px;line-height:1.6;color:${C.muted}">
Domande? Risponda a questa email o scriva a <a href="mailto:${esc(BRAND.contactEmail)}" style="color:${C.navySoft}">${esc(BRAND.contactEmail)}</a>.<br>${esc(ownerSentence())}
</td></tr>
</table>
</td></tr></table>
</body></html>`;
}

export const para = (html: string, style = "") =>
  `<p style="margin:0 0 14px;font-size:15px;line-height:1.6;color:${C.ink};${style}">${html}</p>`;
