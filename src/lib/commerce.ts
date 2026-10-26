import "server-only";
import { BRAND } from "@/config/brand";
import { BUNDLE_HOURS, euro, priceCart, PRODUCTS, SESSION_MIN, VAT_RATE, type CartLine, type PricedLine, type Sku } from "@/config/offers";
import { isArubaConfigured, uploadInvoice } from "./aruba";
import type { Billing } from "./billing";
import { isEmailConfigured, sendEmail } from "./email";
import { calendarInvite } from "./ics";
import { buildFatturaPA, invoiceNumber, progressivoInvio, sellerFromEnv } from "./invoice";
import { AREAS } from "./questionnaire";
import type { supabaseService } from "./supabase/server";

type Db = ReturnType<typeof supabaseService>;
const AREA_CODES = AREAS.map((a) => a.code as string);
export const areaName = (c: string) => AREAS.find((a) => a.code === c)?.name ?? c;
const staffEmail = () => process.env.STAFF_NOTIFY_EMAIL ?? BRAND.contactEmail;
const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
const when = (d: Date) =>
  d.toLocaleString("it-IT", { timeZone: "Europe/Rome", weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" });

/** Tempo per completare il pagamento: lo slot scelto resta bloccato un po' più a lungo. */
export const CHECKOUT_MINUTES = 31;
const HOLD_MINUTES = 35;

// ---------- Situazione dell'azienda ----------

export async function ownedAreas(db: Db, companyId: string): Promise<Set<string>> {
  const { data } = await db.from("entitlements").select("area").eq("company_id", companyId).eq("kind", "area_module");
  return new Set((data ?? []).map((e) => e.area as string));
}

export async function consultCredit(db: Db, companyId: string) {
  const { data } = await db
    .from("entitlements")
    .select("id, quantity, used, created_at")
    .eq("company_id", companyId)
    .eq("kind", "consult_hours")
    .order("created_at");
  const rows = (data ?? []).map((e) => ({ id: e.id as string, left: Number(e.quantity) - Number(e.used) }));
  return { total: rows.reduce((s, r) => s + r.left, 0), next: rows.find((r) => r.left >= 1)?.id ?? null };
}

export async function billingOf(db: Db, companyId: string): Promise<Billing | null> {
  const { data } = await db
    .from("billing_profiles")
    .select("denominazione, vat_number, tax_code, address, cap, city, province, sdi_code, pec")
    .eq("company_id", companyId)
    .maybeSingle();
  return (data as Billing | null) ?? null;
}

// ---------- Ordini ----------

/** Controlla il carrello: solo prodotti e ambiti validi, niente moduli già attivi. */
export function checkCart(raw: unknown, owned: Set<string>): { lines: CartLine[] } | { error: string } {
  if (!Array.isArray(raw) || !raw.length || raw.length > 10) return { error: "Carrello non valido" };
  const lines: CartLine[] = [];
  for (const r of raw as { sku?: unknown; area?: unknown }[]) {
    const sku = r?.sku as Sku;
    if (!(sku in PRODUCTS)) return { error: "Prodotto non valido" };
    if (sku === "modulo") {
      const area = String(r.area ?? "");
      if (!AREA_CODES.includes(area)) return { error: "Ambito non valido" };
      if (owned.has(area)) return { error: `L'approfondimento ${areaName(area)} è già attivo` };
      if (lines.some((l) => l.sku === "modulo" && l.area === area)) continue;
      lines.push({ sku, area });
    } else lines.push({ sku });
  }
  if (lines.some((l) => l.sku === "bundle") && lines.length > 1) return { error: "Il percorso completo si acquista da solo" };
  if (lines.filter((l) => l.sku === "consulenza").length > 1) return { error: "Una consulenza per volta" };
  return { lines };
}

export async function createOrder(
  db: Db,
  p: { userId: string; companyId: string; lines: CartLine[]; billing: Billing; slotId?: string | null; topic?: string | null },
) {
  const cart = priceCart(p.lines, areaName);
  // temi da trattare in consulenza, indicati dal cliente al momento della prenotazione
  const topic = p.topic?.replace(/\s+/g, " ").trim().slice(0, 1000) || null;
  if (topic) cart.lines = cart.lines.map((l) => (l.sku === "consulenza" ? { ...l, topic } : l));
  const { data, error } = await db
    .from("orders")
    .insert({
      user_id: p.userId,
      company_id: p.companyId,
      items: cart.lines,
      net_cents: cart.netCents,
      vat_cents: cart.vatCents,
      total_cents: cart.totalCents,
      billing: p.billing,
      slot_id: p.slotId ?? null,
    })
    .select("id")
    .single();
  if (error) throw new Error(error.message);
  return { id: data.id as string, ...cart };
}

/** Blocca lo slot scelto per il tempo del pagamento. */
export async function holdSlot(db: Db, slotId: string, orderId: string) {
  const { data } = await db.rpc("claim_slot", { p_slot: slotId, p_status: "held", p_minutes: HOLD_MINUTES, p_order: orderId });
  return data === true;
}

/** Ordine non pagato (pagamento abbandonato o scaduto): si annulla e lo slot torna libero. */
export async function cancelOrder(db: Db, orderId: string) {
  const { data } = await db.from("orders").update({ status: "cancelled" }).eq("id", orderId).eq("status", "pending").select("slot_id").maybeSingle();
  if (data?.slot_id)
    await db.from("expert_slots").update({ status: "open", held_until: null, held_by_order: null }).eq("id", data.slot_id).eq("held_by_order", orderId);
}

type OrderRow = {
  id: string;
  user_id: string;
  company_id: string;
  items: PricedLine[];
  net_cents: number;
  vat_cents: number;
  total_cents: number;
  billing: Billing;
  slot_id: string | null;
  payment_method: "stripe" | "bonifico";
  paid_at: string;
};

/**
 * Ordine pagato: attiva moduli e ore, conferma la prenotazione, emette la fattura, avvisa cliente e staff.
 * Idempotente: se l'ordine è già stato evaso non fa nulla.
 */
export async function fulfillOrder(db: Db, orderId: string, method: "stripe" | "bonifico", origin: string, paymentIntent?: string | null) {
  const { data } = await db
    .from("orders")
    .update({ status: "paid", paid_at: new Date().toISOString(), payment_method: method, stripe_payment_intent: paymentIntent ?? null })
    .eq("id", orderId)
    .eq("status", "pending")
    .select("id, user_id, company_id, items, net_cents, vat_cents, total_cents, billing, slot_id, payment_method, paid_at")
    .maybeSingle();
  if (!data) return { alreadyDone: true };
  const o = data as unknown as OrderRow;

  // moduli e ore di consulenza
  const ents: Record<string, unknown>[] = [];
  for (const l of o.items) {
    if (l.sku === "modulo") ents.push({ kind: "area_module", area: l.area });
    if (l.sku === "consulenza") ents.push({ kind: "consult_hours", quantity: 1 });
    if (l.sku === "bundle") {
      const owned = await ownedAreas(db, o.company_id);
      for (const a of AREA_CODES) if (!owned.has(a)) ents.push({ kind: "area_module", area: a });
      ents.push({ kind: "consult_hours", quantity: BUNDLE_HOURS });
    }
  }
  const { data: created, error: entError } = await db
    .from("entitlements")
    .insert(ents.map((e) => ({ ...e, company_id: o.company_id, user_id: o.user_id, order_id: o.id })))
    .select("id, kind");
  if (entError) {
    // attivazione non riuscita: l'ordine torna in attesa, così la notifica di Stripe viene ripetuta
    await db.from("orders").update({ status: "pending", paid_at: null }).eq("id", o.id);
    throw new Error(`Attivazione non riuscita: ${entError.message}`);
  }

  // prenotazione scelta prima del pagamento
  let booking: string | null = null;
  if (o.slot_id) {
    const hours = (created ?? []).find((e) => e.kind === "consult_hours")?.id as string | undefined;
    const { data: ok } = await db.rpc("claim_slot", { p_slot: o.slot_id, p_status: "booked", p_minutes: 0, p_order: o.id });
    if (ok && hours && (await db.rpc("use_credit", { p_entitlement: hours, p_delta: 1 })).data) {
      const { data: b } = await db
        .from("bookings")
        .insert({
          slot_id: o.slot_id,
          user_id: o.user_id,
          company_id: o.company_id,
          order_id: o.id,
          entitlement_id: hours,
          status: "confirmed",
          topic: o.items.find((l) => l.topic)?.topic ?? null,
          confirmed_at: new Date().toISOString(),
        })
        .select("id")
        .single();
      booking = (b?.id as string) ?? null;
    }
  }

  const invoice = await issueInvoice(db, o.id).catch((e) => {
    console.error("Fattura non emessa:", e instanceof Error ? e.message : e);
    return null;
  });
  await sendOrderEmails(db, o, invoice?.number ?? null, origin, !!o.slot_id && !booking).catch((e) =>
    console.error("Email ordine non inviate:", e instanceof Error ? e.message : e),
  );
  if (booking) await sendBookingEmails(db, booking, origin).catch((e) => console.error("Email prenotazione non inviate:", e instanceof Error ? e.message : e));
  return { alreadyDone: false, booking, invoice: invoice?.number ?? null };
}

// ---------- Fatture ----------

/** Crea la fattura dell'ordine (se non esiste), completa l'XML se mancava e prova a inviarla ad Aruba. */
export async function issueInvoice(db: Db, orderId: string) {
  const { data: order } = await db.from("orders").select("id, items, billing, payment_method, paid_at, status").eq("id", orderId).single();
  if (!order || order.status !== "paid") throw new Error("Ordine non pagato");
  const { data: existing } = await db.from("invoices").select("id, number, status, xml, year, seq, issued_on").eq("order_id", orderId).maybeSingle();
  type Inv = { id: string; number: string; status: string; xml: string | null; year: number; seq: number; issued_on: string };
  let inv = existing as Inv | null;
  const seller = sellerFromEnv();
  const build = (number: string, date: string, year: number, seq: number) =>
    seller
      ? buildFatturaPA({
          seller,
          buyer: order.billing as Billing,
          number,
          date,
          progressivo: progressivoInvio(year, seq),
          lines: (order.items as PricedLine[]).map((l) => ({ description: l.description, netCents: l.netCents })),
          vatRate: VAT_RATE,
          payment: order.payment_method as "stripe" | "bonifico",
        })
      : null;

  if (!inv) {
    // la data della fattura è quella del pagamento, in ora italiana
    const date = new Date(order.paid_at as string).toLocaleDateString("sv-SE", { timeZone: "Europe/Rome" });
    const year = Number(date.slice(0, 4));
    const { data: seq, error } = await db.rpc("next_invoice_seq", { p_year: year });
    if (error || typeof seq !== "number") throw new Error(error?.message ?? "numerazione non disponibile");
    const number = invoiceNumber(seq, process.env.INVOICE_SERIES ?? "DIA");
    const xml = build(number, date, year, seq);
    const { data: row, error: e2 } = await db
      .from("invoices")
      .insert({
        order_id: orderId,
        year,
        seq,
        number,
        issued_on: date,
        xml,
        status: xml ? "draft" : "manual",
        error: xml ? null : "Dati di Finsoft per la fattura non configurati (variabili SELLER_*)",
      })
      .select("id, number, status, xml, year, seq, issued_on")
      .single();
    if (e2) throw new Error(e2.message);
    inv = row as Inv;
  } else if (!inv.xml && inv.status !== "sent") {
    // numero già assegnato ma dati del cedente mancanti al momento dell'emissione
    const xml = build(inv.number, inv.issued_on, inv.year, inv.seq);
    if (xml) {
      await db.from("invoices").update({ xml, status: "draft", error: null }).eq("id", inv.id);
      inv = { ...inv, xml, status: "draft" };
    }
  }

  if (inv.xml && inv.status !== "sent") {
    if (!isArubaConfigured()) {
      await db.from("invoices").update({ status: "manual", error: "Invio automatico ad Aruba non configurato: caricare l'XML a mano" }).eq("id", inv.id);
      inv.status = "manual";
    } else {
      try {
        const name = await uploadInvoice(inv.xml);
        await db.from("invoices").update({ status: "sent", aruba_filename: name, error: null, sent_at: new Date().toISOString() }).eq("id", inv.id);
        inv.status = "sent";
      } catch (e) {
        await db.from("invoices").update({ status: "error", error: e instanceof Error ? e.message.slice(0, 500) : "errore" }).eq("id", inv.id);
        inv.status = "error";
      }
    }
  }
  return inv;
}

export const xmlFileName = (number: string) => `fattura_${number.replace(/\W+/g, "-")}.xml`;

// ---------- Prenotazioni ----------

/** Prenota uno slot usando un'ora di consulenza già acquistata. */
export async function bookWithCredit(db: Db, p: { userId: string; companyId: string; slotId: string; topic?: string | null }) {
  const credit = await consultCredit(db, p.companyId);
  if (!credit.next) return { error: "Non hai ore di consulenza disponibili" };
  const { data: claimed } = await db.rpc("claim_slot", { p_slot: p.slotId, p_status: "booked", p_minutes: 0, p_order: null });
  if (!claimed) return { error: "L'orario scelto non è più disponibile" };
  const { data: used } = await db.rpc("use_credit", { p_entitlement: credit.next, p_delta: 1 });
  if (!used) {
    await db.from("expert_slots").update({ status: "open" }).eq("id", p.slotId);
    return { error: "Non hai ore di consulenza disponibili" };
  }
  const { data: b, error } = await db
    .from("bookings")
    .insert({
      slot_id: p.slotId,
      user_id: p.userId,
      company_id: p.companyId,
      entitlement_id: credit.next,
      status: "confirmed",
      topic: p.topic?.slice(0, 1000) || null,
      confirmed_at: new Date().toISOString(),
    })
    .select("id")
    .single();
  if (error) {
    await db.rpc("use_credit", { p_entitlement: credit.next, p_delta: -1 });
    await db.from("expert_slots").update({ status: "open" }).eq("id", p.slotId);
    return { error: "Prenotazione non riuscita, riprova" };
  }
  return { id: b.id as string };
}

/** Annulla una prenotazione: l'ora torna disponibile, lo slot si libera. */
export async function cancelBooking(db: Db, bookingId: string, origin: string) {
  const { data: b } = await db
    .from("bookings")
    .update({ status: "cancelled" })
    .eq("id", bookingId)
    .eq("status", "confirmed")
    .select("id, slot_id, entitlement_id")
    .maybeSingle();
  if (!b) return false;
  if (b.entitlement_id) await db.rpc("use_credit", { p_entitlement: b.entitlement_id, p_delta: -1 });
  await db.from("expert_slots").update({ status: "open", held_until: null, held_by_order: null }).eq("id", b.slot_id).eq("status", "booked");
  await sendBookingEmails(db, bookingId, origin, true).catch(() => {});
  return true;
}

// ---------- Email ----------

async function emailOf(db: Db, userId: string) {
  const { data } = await db.auth.admin.getUserById(userId);
  return data.user?.email ?? null;
}

async function sendOrderEmails(db: Db, o: OrderRow, invoiceNo: string | null, origin: string, slotLost: boolean) {
  if (!isEmailConfigured()) return;
  const to = await emailOf(db, o.user_id);
  const rows = o.items.map((l) => `${l.description}: ${euro(l.netCents / 100)}`);
  const totals = `Imponibile ${euro(o.net_cents / 100)} · IVA ${VAT_RATE}% ${euro(o.vat_cents / 100)} · Totale ${euro(o.total_cents / 100)}`;
  const link = `${origin}/area/servizi`;
  const lost = slotLost
    ? "L'orario che avevi scelto nel frattempo non era più disponibile: l'ora di consulenza è comunque attiva, scegli un nuovo orario dalla tua area personale."
    : "";
  if (to) {
    const text = `Buongiorno,

grazie per l'acquisto. Abbiamo attivato:
${rows.map((r) => `- ${r}`).join("\n")}

${totals}
${invoiceNo ? `La fattura n. ${invoiceNo} ti arriverà tramite il Sistema di Interscambio.` : "La fattura ti arriverà tramite il Sistema di Interscambio."}
${lost}

Trovi i servizi acquistati nella tua area personale: ${link}

${BRAND.name} è un servizio di ${BRAND.ownerLegal}.`;
    const html = `<p>Buongiorno,</p><p>grazie per l'acquisto. Abbiamo attivato:</p><ul>${rows.map((r) => `<li>${esc(r)}</li>`).join("")}</ul>
<p>${esc(totals)}<br>${invoiceNo ? `La fattura n. ${esc(invoiceNo)} ti arriverà tramite il Sistema di Interscambio.` : "La fattura ti arriverà tramite il Sistema di Interscambio."}</p>
${lost ? `<p><strong>${esc(lost)}</strong></p>` : ""}
<p><a href="${esc(link)}" style="display:inline-block;background:#0a2a4a;color:#fff;padding:10px 18px;border-radius:6px;text-decoration:none;font-weight:600">Vai ai tuoi servizi</a></p>
<p style="color:#5b6573;font-size:13px">${esc(BRAND.name)} è un servizio di ${esc(BRAND.ownerLegal)}.</p>`;
    await sendEmail({ to, subject: "Conferma di acquisto", text, html });
  }
  await sendEmail({
    to: staffEmail(),
    replyTo: to ?? undefined,
    subject: `Nuovo ordine ${euro(o.total_cents / 100)} · ${o.billing.denominazione}`,
    text: `${o.billing.denominazione} (${to ?? "—"}) ha acquistato:\n${rows.join("\n")}\n${totals}\nFattura: ${invoiceNo ?? "non emessa"}\n${origin}/admin/ordini`,
    html: `<p><strong>${esc(o.billing.denominazione)}</strong> (${esc(to ?? "—")}) ha acquistato:</p><ul>${rows.map((r) => `<li>${esc(r)}</li>`).join("")}</ul><p>${esc(totals)}<br>Fattura: ${esc(invoiceNo ?? "non emessa")}</p><p><a href="${esc(origin)}/admin/ordini">Ordini e fatture</a></p>`,
  });
}

export async function sendBookingEmails(db: Db, bookingId: string, origin: string, cancelled = false) {
  if (!isEmailConfigured()) return;
  const { data: b } = await db
    .from("bookings")
    .select("id, user_id, topic, companies(name), expert_slots(starts_at, duration_min, meeting_url)")
    .eq("id", bookingId)
    .single();
  if (!b) return;
  const slot = b.expert_slots as unknown as { starts_at: string; duration_min: number; meeting_url: string | null };
  const company = (b.companies as unknown as { name: string } | null)?.name ?? "";
  const to = await emailOf(db, b.user_id as string);
  const start = new Date(slot.starts_at);
  const url = slot.meeting_url ?? process.env.DEFAULT_MEETING_URL ?? null;
  const ics = calendarInvite({
    uid: `${b.id}@diagnostico`,
    start,
    minutes: slot.duration_min ?? SESSION_MIN,
    title: `Consulenza ${BRAND.name}${company ? ` · ${company}` : ""}`,
    description: `Sessione di consulenza da remoto.${b.topic ? `\nTemi: ${b.topic}` : ""}`,
    url,
    organizer: BRAND.contactEmail,
    attendee: to ?? undefined,
    cancel: cancelled,
  });
  const attachments = [{ filename: "consulenza.ics", content: Buffer.from(ics).toString("base64"), contentType: "text/calendar; method=" + (cancelled ? "CANCEL" : "REQUEST") }];
  const date = when(start);
  const subject = cancelled ? `Consulenza annullata: ${date}` : `Consulenza confermata: ${date}`;
  const link = url
    ? `Collegamento alla videochiamata: ${url}`
    : "Ti invieremo il collegamento alla videochiamata prima della sessione.";
  const body = cancelled
    ? `la consulenza di ${date} è stata annullata. L'ora resta disponibile: puoi scegliere un nuovo orario dalla tua area personale (${origin}/area/servizi).`
    : `la consulenza da remoto è confermata per ${date} (${slot.duration_min} minuti). ${link}\nIn allegato l'invito da aggiungere al calendario.`;
  if (to)
    await sendEmail({
      to,
      subject,
      text: `Buongiorno,\n\n${body}\n\n${BRAND.name} è un servizio di ${BRAND.ownerLegal}.`,
      html: `<p>Buongiorno,</p><p>${esc(body).replace(/\n/g, "<br>")}</p><p style="color:#5b6573;font-size:13px">${esc(BRAND.name)} è un servizio di ${esc(BRAND.ownerLegal)}.</p>`,
      attachments,
    });
  await sendEmail({
    to: staffEmail(),
    replyTo: to ?? undefined,
    subject: `${cancelled ? "Annullata" : "Prenotata"} consulenza ${date} · ${company}`,
    text: `${company} (${to ?? "—"})\n${date}\n${b.topic ? `Temi: ${b.topic}\n` : ""}${origin}/admin/agenda`,
    html: `<p><strong>${esc(company)}</strong> (${esc(to ?? "—")})<br>${esc(date)}</p>${b.topic ? `<p>Temi: ${esc(b.topic)}</p>` : ""}<p><a href="${esc(origin)}/admin/agenda">Agenda</a></p>`,
    attachments,
  });
}
