// Avvia un acquisto: controlla carrello e dati di fatturazione, crea l'ordine e la sessione di pagamento Stripe.
import { NextResponse } from "next/server";
import { BRAND } from "@/config/brand";
import { PRODUCTS, VAT_RATE } from "@/config/offers";
import { billingOf, cancelOrder, CHECKOUT_MINUTES, checkCart, createOrder, holdSlot, ownedAreas } from "@/lib/commerce";
import { isStripeConfigured, stripe } from "@/lib/stripe";
import { companyOfMember } from "@/lib/supabase/membership";
import { supabaseServer, supabaseService } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const { data: auth } = await (await supabaseServer()).auth.getUser();
  const user = auth.user;
  if (!user) return NextResponse.json({ error: "Accesso richiesto" }, { status: 401 });
  if (!isStripeConfigured())
    return NextResponse.json({ error: `I pagamenti online non sono ancora attivi: scrivici a ${BRAND.contactEmail}` }, { status: 503 });

  const body = (await request.json().catch(() => ({}))) as { companyId?: string; lines?: unknown; slotId?: string; topic?: string; acceptTerms?: boolean };
  if (body.acceptTerms !== true)
    return NextResponse.json({ error: "Per procedere accetta le condizioni di vendita" }, { status: 422 });
  const company = body.companyId ? await companyOfMember(user.id, body.companyId) : null;
  if (!company) return NextResponse.json({ error: "Azienda non trovata" }, { status: 404 });
  const db = supabaseService();
  const billing = await billingOf(db, company.id);
  if (!billing) return NextResponse.json({ error: "Inserisci prima i dati di fatturazione", needBilling: true }, { status: 422 });
  const cart = checkCart(body.lines, await ownedAreas(db, company.id));
  if ("error" in cart) return NextResponse.json({ error: cart.error }, { status: 422 });
  const slotId = body.slotId && /^[0-9a-f-]{36}$/i.test(body.slotId) ? body.slotId : null;
  if (slotId && !cart.lines.some((l) => l.sku === "consulenza")) return NextResponse.json({ error: "Richiesta non valida" }, { status: 400 });

  const order = await createOrder(db, {
    userId: user.id,
    companyId: company.id,
    lines: cart.lines,
    billing,
    slotId,
    topic: typeof body.topic === "string" ? body.topic : null,
  });
  if (slotId && !(await holdSlot(db, slotId, order.id))) {
    await cancelOrder(db, order.id);
    return NextResponse.json({ error: "L'orario scelto non è più disponibile: scegline un altro" }, { status: 409 });
  }

  const origin = new URL(request.url).origin;
  try {
    const session = await stripe().checkout.sessions.create({
      mode: "payment",
      locale: "it",
      customer_email: user.email,
      client_reference_id: order.id,
      metadata: { order_id: order.id, company_id: company.id },
      payment_intent_data: { metadata: { order_id: order.id }, description: `${BRAND.name} · ordine ${order.id.slice(0, 8)}` },
      expires_at: Math.floor(Date.now() / 1000) + CHECKOUT_MINUTES * 60,
      line_items: order.lines.map((l) => ({
        quantity: 1,
        price_data: {
          currency: "eur",
          // importo IVA inclusa: la fattura elettronica riporta imponibile e imposta
          unit_amount: Math.round((l.netCents * (100 + VAT_RATE)) / 100),
          product_data: { name: l.description, description: `${PRODUCTS[l.sku].name} · IVA ${VAT_RATE}% inclusa` },
        },
      })),
      success_url: `${origin}/area/servizi?esito=ok`,
      cancel_url: `${origin}/area/servizi?esito=annullato&ordine=${order.id}`,
    });
    await db
      .from("orders")
      .update({ stripe_session_id: session.id, terms_version: BRAND.termsVersion, terms_accepted_at: new Date().toISOString() })
      .eq("id", order.id);
    return NextResponse.json({ url: session.url });
  } catch (e) {
    console.error("Sessione di pagamento non creata:", e instanceof Error ? e.message : e);
    await cancelOrder(db, order.id);
    return NextResponse.json({ error: "Pagamento non disponibile, riprova tra poco" }, { status: 502 });
  }
}

/** Pagamento abbandonato dal cliente: annulla l'ordine e libera subito l'orario scelto. */
export async function DELETE(request: Request) {
  const { data: auth } = await (await supabaseServer()).auth.getUser();
  if (!auth.user) return NextResponse.json({ error: "Accesso richiesto" }, { status: 401 });
  const id = new URL(request.url).searchParams.get("ordine") ?? "";
  if (!/^[0-9a-f-]{36}$/i.test(id)) return NextResponse.json({ ok: true });
  const db = supabaseService();
  const { data: o } = await db.from("orders").select("id, user_id, status, stripe_session_id").eq("id", id).maybeSingle();
  if (!o || o.user_id !== auth.user.id || o.status !== "pending") return NextResponse.json({ ok: true });
  if (o.stripe_session_id && isStripeConfigured()) await stripe().checkout.sessions.expire(o.stripe_session_id as string).catch(() => {});
  await cancelOrder(db, id);
  return NextResponse.json({ ok: true });
}
