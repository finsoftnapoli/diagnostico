// Email di conferma dell'acquisto: riepilogo dell'ordine, prossimi passi per ciò che è stato attivato, fattura.
import { BUNDLE_HOURS, euro, PRODUCTS, VAT_RATE, type PricedLine } from "@/config/offers";
import { C, emailButton, emailLayout, esc, ownerSentence, para, stop } from "./email-layout";
import { AREAS } from "./questionnaire";

const areaName = (c: string) => AREAS.find((a) => a.code === c)?.name ?? c;

export interface PurchaseEmailInput {
  company: string;
  items: PricedLine[];
  netCents: number;
  vatCents: number;
  totalCents: number;
  paidAt: Date;
  invoiceNo: string | null;
  /** Prenotazione della consulenza confermata con questo ordine. */
  booked: boolean;
  /** L'orario scelto non era più libero: l'ora resta da prenotare. */
  slotLost: boolean;
  link: string;
}

function itemView(l: PricedLine) {
  if (l.sku === "modulo")
    return {
      title: `Approfondimento ${l.area ? areaName(l.area) : ""}`.trim(),
      sub: "Ottogramma dell'ambito su 8 sotto-ambiti e report con piano di lavoro",
    };
  if (l.sku === "bundle")
    return { title: PRODUCTS.bundle.name, sub: `Tutti gli 8 approfondimenti e ${BUNDLE_HOURS} ore di consulenza senior` };
  return { title: PRODUCTS.consulenza.name, sub: "Un'ora in videochiamata con un nostro consulente senior" };
}

function steps(p: PurchaseEmailInput): { title: string; text: string }[] {
  const modules = p.items.filter((l) => l.sku === "modulo").length;
  const bundle = p.items.some((l) => l.sku === "bundle");
  const consult = p.items.some((l) => l.sku === "consulenza");
  const out: { title: string; text: string }[] = [];
  if (modules || bundle) {
    out.push({
      title: bundle || modules > 1 ? "Avvia gli approfondimenti" : "Avvia l'approfondimento",
      text:
        bundle || modules > 1
          ? "Dalla tua area personale: per ogni ambito 8 sotto-ambiti e 16-18 domande, una ventina di minuti."
          : "Dalla tua area personale: 8 sotto-ambiti e 16-18 domande, una ventina di minuti.",
    });
    out.push({ title: "Vedi subito l'Ottogramma dell'ambito", text: "I punteggi per sotto-ambito compaiono appena confermi le risposte." });
    out.push({
      title: "Ricevi il report entro 2 giorni lavorativi",
      text: "Piano di lavoro a 3, 6 e 12 mesi e indicatori da seguire, validato da un nostro esperto.",
    });
  }
  if (bundle)
    out.push({
      title: `Prenota le ${BUNDLE_HOURS} ore di consulenza`,
      text: "Quando vuoi, anche in due sessioni, tra gli orari disponibili nella tua area personale.",
    });
  if (consult)
    out.push(
      p.booked
        ? {
            title: "La consulenza è in calendario",
            text: "Ti abbiamo inviato a parte la conferma con data, ora e invito da aggiungere al calendario.",
          }
        : {
            title: "Scegli data e ora della consulenza",
            text: "Dalla tua area personale, tra gli orari disponibili dei nostri consulenti.",
          },
    );
  return out;
}

function title(p: PurchaseEmailInput) {
  const modules = p.items.filter((l) => l.sku === "modulo").length;
  if (p.items.some((l) => l.sku === "bundle")) return "Il tuo percorso completo è attivo";
  if (modules > 1) return "I tuoi approfondimenti sono attivi";
  if (modules === 1) return "Il tuo approfondimento è attivo";
  return p.booked ? "La tua consulenza è prenotata" : "La tua ora di consulenza è attiva";
}

export function purchaseEmail(p: PurchaseEmailInput) {
  const heading = title(p);
  const date = p.paidAt.toLocaleDateString("it-IT", { day: "numeric", month: "long", year: "numeric", timeZone: "Europe/Rome" });
  const startsModule = p.items.some((l) => l.sku === "modulo" || l.sku === "bundle");
  const cta = startsModule ? "Inizia l'approfondimento" : "Vai ai tuoi servizi";
  const invoice = p.invoiceNo
    ? `La fattura elettronica n. ${p.invoiceNo} ti arriverà tramite il Sistema di Interscambio e sarà disponibile anche nel cassetto fiscale dell'azienda.`
    : "La fattura elettronica ti arriverà tramite il Sistema di Interscambio e sarà disponibile anche nel cassetto fiscale dell'azienda.";
  const lost =
    "L'orario che avevi scelto nel frattempo non era più disponibile: l'ora di consulenza è comunque attiva, scegli un nuovo orario dalla tua area personale.";
  const list = steps(p);
  const views = p.items.map((l) => ({ ...itemView(l), amount: euro(l.netCents / 100) }));

  const row = (label: string, value: string, strong = false) =>
    `<tr><td style="padding:3px 0;font-size:14px;color:${strong ? C.navy : C.muted};${strong ? "font-weight:700;font-size:16px;padding-top:8px" : ""}">${esc(label)}</td>
<td align="right" style="padding:3px 0;font-size:14px;color:${strong ? C.navy : C.ink};${strong ? "font-weight:700;font-size:16px;padding-top:8px" : ""}">${esc(value)}</td></tr>`;

  const summary = `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${C.paper};border:1px solid ${C.line};border-radius:10px;margin:22px 0 6px">
<tr><td style="padding:18px 20px 6px;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:${C.muted}">Riepilogo dell'ordine</td></tr>
${views
  .map(
    (v) => `<tr><td style="padding:10px 20px;border-top:1px solid ${C.line}">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
<td style="font-size:15px;font-weight:700;color:${C.ink}">${esc(v.title)}<br><span style="font-size:13px;font-weight:400;color:${C.muted}">${esc(v.sub)}</span></td>
<td align="right" valign="top" style="font-size:15px;font-weight:700;color:${C.ink};white-space:nowrap;padding-left:12px">${esc(v.amount)}</td>
</tr></table></td></tr>`,
  )
  .join("")}
<tr><td style="padding:10px 20px 16px;border-top:1px solid ${C.line}">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
${row("Imponibile", euro(p.netCents / 100))}
${row(`IVA ${VAT_RATE}%`, euro(p.vatCents / 100))}
${row("Totale pagato", euro(p.totalCents / 100), true)}
</table></td></tr>
</table>
<p style="margin:0 0 4px;font-size:12px;color:${C.muted}">Ordine del ${esc(date)}${p.invoiceNo ? ` · Fattura n. ${esc(p.invoiceNo)}` : ""}</p>`;

  const stepsHtml = list.length
    ? `<h2 style="margin:28px 0 12px;font-size:17px;color:${C.navy}">Cosa succede ora</h2>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
${list
  .map(
    (s, i) => `<tr><td valign="top" width="40" style="padding:0 0 14px">
<div style="width:28px;height:28px;border-radius:14px;background:${C.navy};color:#ffffff;font-size:13px;font-weight:700;line-height:28px;text-align:center">${i + 1}</div></td>
<td valign="top" style="padding:3px 0 14px;font-size:15px;line-height:1.5;color:${C.ink}"><strong>${esc(s.title)}</strong><br><span style="font-size:14px;color:${C.muted}">${esc(s.text)}</span></td></tr>`,
  )
  .join("")}
</table>`
    : "";

  const body = `${p.slotLost ? `<div style="margin:0 0 18px;padding:12px 16px;border-radius:8px;background:#f9eeda;font-size:14px;line-height:1.5;color:${C.ink}"><strong>${esc(lost)}</strong></div>` : ""}
${para(`Grazie, <strong>${esc(p.company)}</strong>${stop(p.company)} Il pagamento è andato a buon fine e quanto hai acquistato è già disponibile nella tua area personale.`)}
${summary}
${stepsHtml}
${emailButton(p.link, cta)}
${para(esc(invoice), `font-size:13px;color:${C.muted};margin-top:18px`)}`;

  const html = emailLayout({
    preheader: `${heading}. Totale pagato ${euro(p.totalCents / 100)}.`,
    eyebrow: "Acquisto confermato",
    title: heading,
    body,
  });

  const text = `${heading}

Grazie, ${p.company}${stop(p.company)} Il pagamento è andato a buon fine e quanto hai acquistato è già disponibile nella tua area personale.
${p.slotLost ? `\n${lost}\n` : ""}
RIEPILOGO DELL'ORDINE (${date})
${views.map((v) => `- ${v.title}: ${v.amount}`).join("\n")}
Imponibile ${euro(p.netCents / 100)} · IVA ${VAT_RATE}% ${euro(p.vatCents / 100)} · Totale pagato ${euro(p.totalCents / 100)}

${list.length ? `COSA SUCCEDE ORA\n${list.map((s, i) => `${i + 1}. ${s.title}: ${s.text}`).join("\n")}\n\n` : ""}${cta}: ${p.link}

${invoice}

${ownerSentence()}`;

  return { subject: `Acquisto confermato: ${heading.charAt(0).toLowerCase()}${heading.slice(1)}`, html, text };
}
