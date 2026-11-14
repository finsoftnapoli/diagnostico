import "server-only";
import { BRAND } from "@/config/brand";
import { C, emailButton, emailLayout, esc, ownerSentence, para, stop } from "./email-layout";
import { AREAS } from "./questionnaire";

// Invio di email del servizio tramite Resend (stesso account usato da Supabase per i codici di accesso).
export const isEmailConfigured = () => !!process.env.RESEND_API_KEY;

export interface Attachment {
  filename: string;
  content: string; // base64
  contentType?: string;
}

export async function sendEmail(opts: {
  to: string;
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
  attachments?: Attachment[];
}) {
  const from = process.env.RESEND_FROM ?? `${BRAND.name} <diagnostico@finsoft.biz>`;
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { authorization: `Bearer ${process.env.RESEND_API_KEY}`, "content-type": "application/json" },
    body: JSON.stringify({
      from,
      to: [opts.to],
      subject: opts.subject,
      html: opts.html,
      text: opts.text,
      reply_to: opts.replyTo,
      attachments: opts.attachments?.map((a) => ({ filename: a.filename, content: a.content, content_type: a.contentType })),
    }),
    signal: AbortSignal.timeout(10000),
  });
  if (!res.ok) throw new Error(`Resend ${res.status}: ${(await res.text()).slice(0, 200)}`);
}

/** Testo dell'invito: comunicazione di servizio richiesta da chi invita, senza contenuti promozionali. */
export function invitationEmail(p: { inviter: string; company: string; name?: string | null; link: string; expires: Date }) {
  const greeting = p.name ? `Buongiorno ${p.name},` : "Buongiorno,";
  const date = p.expires.toLocaleDateString("it-IT", { day: "numeric", month: "long" });
  const subject = `${p.inviter} La invita a compilare il diagnostico di ${p.company}`;
  const text = `${greeting}

${p.inviter} Le ha mandato l'invito a compilare il diagnostico gestionale di ${p.company} su ${BRAND.name}.
Le risposte dei diversi responsabili permettono di confrontare le visioni e di vedere dove il management è allineato.
Le Sue risposte individuali saranno visibili a chi Le ha mandato l'invito, in qualità di amministratore dello spazio aziendale.

Compili il diagnostico: ${p.link}

L'invito scade il ${date}. Se non conosce il mittente, può ignorare questa email.
${ownerSentence()}`;
  const html = emailLayout({
    preheader: `${p.inviter} La invita a compilare il diagnostico di ${p.company}${stop(p.company)}`,
    eyebrow: "Invito",
    title: `Il diagnostico di ${p.company}`,
    body: `${para(esc(greeting))}
${para(`<strong>${esc(p.inviter)}</strong> Le ha mandato l'invito a compilare il diagnostico gestionale di <strong>${esc(p.company)}</strong> su ${esc(BRAND.name)}.`)}
${para("Le risposte dei diversi responsabili permettono di confrontare le visioni e di vedere dove il management è allineato. Le Sue risposte individuali saranno visibili a chi Le ha mandato l'invito, in qualità di amministratore dello spazio aziendale.")}
${emailButton(p.link, "Compila il diagnostico")}
${para(`L'invito scade il ${esc(date)}. Se non conosce il mittente, può ignorare questa email.`, "font-size:13px;color:#5b6573;margin-top:18px")}`,
  });
  return { subject, text, html };
}

const areaName = (c: string) => AREAS.find((a) => a.code === c)?.name ?? c;

/** Email: il report approfondito (del diagnostico o di un modulo) è pronto. */
export function reportReadyEmail(p: {
  company: string;
  link: string;
  module?: string;
  /** Ambiti prioritari del diagnostico, per proporre l'approfondimento dopo la lettura del report. */
  priorities?: string[];
  servicesLink?: string;
}) {
  const what = p.module ? `l'approfondimento ${areaName(p.module)}` : "il report approfondito del diagnostico";
  const subject = p.module
    ? `Approfondimento ${areaName(p.module)} di ${p.company}: il report è pronto`
    : `Il report approfondito di ${p.company} è pronto`;
  const body = p.module
    ? `Trova la lettura di ciascun tema, il piano di lavoro con le priorità nel tempo e gli indicatori da seguire.`
    : `Oltre all'Ottogramma che ha già visto, trova l'analisi delle priorità, gli interventi da cui partire e i primi passi per ciascun tema.`;
  // l'approfondimento si propone solo dopo il report, come passo successivo sulle priorità emerse
  const first = !p.module && p.priorities?.length && p.servicesLink ? areaName(p.priorities[0]) : null;
  const next = first
    ? `Per andare più a fondo: l'approfondimento su ${first}, la vostra prima priorità, scompone l'ambito in 8 sotto-ambiti e porta a un piano di lavoro a 3, 6 e 12 mesi. Lo trova, insieme alla consulenza con un nostro esperto, tra i servizi dell'area personale.`
    : "";
  const text = `Buongiorno,

${what} di ${p.company} è pronto. ${body}

Apra il report: ${p.link}
${next ? `\n${next}\n${p.servicesLink}\n` : ""}
${ownerSentence()}`;
  const html = emailLayout({
    preheader: body,
    eyebrow: p.module ? `Approfondimento ${areaName(p.module)}` : "Report approfondito",
    title: `Il report di ${p.company} è pronto`,
    body: `${para("Buongiorno,")}
${para(`${esc(what.charAt(0).toUpperCase() + what.slice(1))} di <strong>${esc(p.company)}</strong> è pronto. ${esc(body)}`)}
${emailButton(p.link, "Apri il report")}
${
  next
    ? `<div style="margin-top:28px;padding:16px 18px;background:${C.paper};border-radius:10px">${para(`<strong style="color:${C.navy}">Per andare più a fondo</strong>`, "margin:0 0 6px")}${para(esc(next.replace("Per andare più a fondo: l'", "L'")), "margin:0 0 10px;font-size:14px")}<a href="${esc(p.servicesLink!)}" style="color:${C.navy};font-weight:600;font-size:14px">Vedi approfondimenti e consulenza</a></div>`
    : ""
}`,
  });
  return { subject, text, html };
}

/** Conferma al cliente subito dopo la compilazione: cosa ha già e quando arriva il report. */
export function completionEmail(p: { company: string; level: string; strongest: string[]; weakest: string[]; link: string }) {
  const subject = `Diagnostico di ${p.company}: ricevuto, il report arriva ${BRAND.reportPromise}`;
  const lines = [
    `Livello di maturità complessivo: ${p.level}.`,
    p.strongest.length ? `Ambiti più solidi: ${p.strongest.join(" e ")}.` : "",
    p.weakest.length ? `Ambiti più fragili: ${p.weakest.join(" e ")}.` : "",
  ].filter(Boolean);
  const text = `Buongiorno,

abbiamo ricevuto il diagnostico di ${p.company}${stop(p.company)} L'${BRAND.reportName} è già nell'area personale:

${lines.map((l) => `- ${l}`).join("\n")}

Il report approfondito, con le priorità e gli interventi da cui partire, arriva ${BRAND.reportPromise} a questo indirizzo.

Nel frattempo può invitare i colleghi a compilare il diagnostico, per confrontare i punti di vista, e caricare visura o bilancio se non l'ha già fatto: il report ne terrà conto.

Area personale: ${p.link}

${ownerSentence()}`;
  const html = emailLayout({
    preheader: `L'${BRAND.reportName} è nell'area personale; il report approfondito arriva ${BRAND.reportPromise}.`,
    eyebrow: "Diagnostico ricevuto",
    title: `Il report arriva ${BRAND.reportPromise}`,
    body: `${para("Buongiorno,")}
${para(`abbiamo ricevuto il diagnostico di <strong>${esc(p.company)}</strong>${stop(p.company)} L'${esc(BRAND.reportName)} è già nell'area personale:`)}
<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin:4px 0 18px;background:${C.paper};border-radius:10px"><tr><td style="padding:14px 18px;font-size:14px;line-height:1.7;color:${C.ink}">${lines.map((l) => esc(l)).join("<br>")}</td></tr></table>
${para(`Il report approfondito, con le priorità e gli interventi da cui partire, arriva <strong>${esc(BRAND.reportPromise)}</strong> a questo indirizzo.`)}
${para("Nel frattempo può invitare i colleghi a compilare il diagnostico, per confrontare i punti di vista, e caricare visura o bilancio se non l'ha già fatto: il report ne terrà conto.")}
${emailButton(p.link, "Apri l'area personale")}`,
  });
  return { subject, text, html };
}

/** Avviso interno: un report non è partito da solo e aspetta lo staff. */
export function heldReportEmail(p: { company: string; what: string; reasons: string[]; link: string; failed?: boolean }) {
  const subject = p.failed ? `Report non generato: ${p.company}` : `Report trattenuto per revisione: ${p.company}`;
  const intro = p.failed
    ? `La generazione di ${p.what} di ${p.company} non è riuscita. Si può rigenerare dall'area staff.`
    : `${p.what.charAt(0).toUpperCase() + p.what.slice(1)} di ${p.company} non ha superato i controlli automatici e non è stato inviato al cliente. Va rivisto e approvato in tempo per l'invio promesso al cliente (${BRAND.reportPromise} alla compilazione).`;
  const text = `${intro}\n\n${p.reasons.map((r) => `- ${r}`).join("\n")}\n\nApri: ${p.link}`;
  const html = `<p>${esc(intro)}</p>${p.reasons.length ? `<ul>${p.reasons.map((r) => `<li>${esc(r)}</li>`).join("")}</ul>` : ""}<p><a href="${esc(p.link)}">Apri nell'area staff</a></p>`;
  return { subject, text, html };
}

/** Avviso interno: un report ha superato i controlli e partirà da solo all'ora indicata. */
export function scheduledReportEmail(p: { company: string; what: string; when: string; notes: string[]; link: string }) {
  const subject = `Report pronto, parte ${p.when}: ${p.company}`;
  const intro = `${p.what.charAt(0).toUpperCase() + p.what.slice(1)} di ${p.company} ha superato i controlli automatici e partirà da solo verso il cliente ${p.when}. Fino ad allora si può rileggere, correggere, inviare subito o trattenere dall'area staff.`;
  const text = `${intro}${p.notes.length ? `\n\nNote dei controlli:\n${p.notes.map((r) => `- ${r}`).join("\n")}` : ""}\n\nApri: ${p.link}`;
  const html = `<p>${esc(intro)}</p>${p.notes.length ? `<p>Note dei controlli:</p><ul>${p.notes.map((r) => `<li>${esc(r)}</li>`).join("")}</ul>` : ""}<p><a href="${esc(p.link)}">Apri nell'area staff</a></p>`;
  return { subject, text, html };
}

/** Avviso interno: report generati in attesa di revisione. */
export function reviewDigestEmail(p: { count: number; link: string }) {
  const subject = p.count === 1 ? "1 report da rivedere" : `${p.count} report da rivedere`;
  const text = `Ci sono ${p.count} report generati in attesa della tua revisione prima dell'invio ai clienti.\n\nArea staff: ${p.link}`;
  const html = `<p>Ci sono <strong>${p.count}</strong> report generati in attesa della tua revisione prima dell'invio ai clienti.</p><p><a href="${esc(p.link)}">Apri l'area staff</a></p>`;
  return { subject, text, html };
}

/** Email a chi riceve un report condiviso in sola lettura. */
export function sharedReportEmail(p: {
  sender: string;
  company: string;
  name?: string | null;
  note?: string | null;
  link: string;
  expires: Date;
  summary: boolean;
}) {
  const date = p.expires.toLocaleDateString("it-IT", { day: "numeric", month: "long", year: "numeric" });
  const what = p.summary ? "la sintesi del report" : "il report";
  const subject = `${p.company}: ${p.summary ? "la sintesi del diagnostico" : "il report del diagnostico"} da leggere`;
  const greeting = p.name ? `Buongiorno ${p.name},` : "Buongiorno,";
  const intro = `${p.sender} Le ha inviato ${what} del diagnostico gestionale di ${p.company}, elaborato con ${BRAND.name}: l'${BRAND.reportName} degli otto ambiti di gestione, le priorità e le azioni da cui partire.`;
  const foot = `Il link apre una pagina in sola lettura ed è valido fino al ${date}. Se non conosce il mittente, può ignorare questa email.`;
  const text = `${greeting}

${intro}
${p.note ? `\nMessaggio di ${p.sender}:\n«${p.note}»\n` : ""}
Apra il report: ${p.link}

${foot}

${ownerSentence()}`;
  const html = emailLayout({
    preheader: intro,
    eyebrow: p.summary ? "Sintesi del report" : "Report del diagnostico",
    title: `Il diagnostico di ${p.company}`,
    body: `${para(esc(greeting))}
${para(`<strong>${esc(p.sender)}</strong> Le ha inviato ${esc(what)} del diagnostico gestionale di <strong>${esc(p.company)}</strong>, elaborato con ${esc(BRAND.name)}: l'${esc(BRAND.reportName)} degli otto ambiti di gestione, le priorità e le azioni da cui partire.`)}
${p.note ? `<div style="margin:18px 0;padding:14px 18px;border-left:3px solid ${C.navy};background:${C.paper}">${para(`Messaggio di ${esc(p.sender)}`, `margin:0 0 4px;font-size:13px;color:${C.muted}`)}${para(esc(p.note), "margin:0;font-style:italic")}</div>` : ""}
${emailButton(p.link, "Apri il report")}
${para(esc(foot), "font-size:13px;color:#5b6573;margin-top:18px")}`,
  });
  return { subject, text, html };
}
