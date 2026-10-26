// Notifiche di Stripe: pagamento completato (attiva l'ordine) o sessione scaduta (annulla e libera lo slot).
import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { cancelOrder, fulfillOrder } from "@/lib/commerce";
import { stripe } from "@/lib/stripe";
import { supabaseService } from "@/lib/supabase/server";

export const maxDuration = 60;

export async function POST(request: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret || !process.env.STRIPE_SECRET_KEY) return NextResponse.json({ error: "Non configurato" }, { status: 503 });
  const raw = await request.text();
  let event: Stripe.Event;
  try {
    event = stripe().webhooks.constructEvent(raw, request.headers.get("stripe-signature") ?? "", secret);
  } catch {
    return NextResponse.json({ error: "Firma non valida" }, { status: 400 });
  }
  const db = supabaseService();
  const origin = process.env.PUBLIC_SITE_URL ?? new URL(request.url).origin;
  if (event.type === "checkout.session.completed" || event.type === "checkout.session.async_payment_succeeded") {
    const s = event.data.object as Stripe.Checkout.Session;
    const orderId = s.metadata?.order_id;
    if (orderId && s.payment_status === "paid") {
      const pi = typeof s.payment_intent === "string" ? s.payment_intent : (s.payment_intent?.id ?? null);
      await fulfillOrder(db, orderId, "stripe", origin, pi);
    }
  } else if (event.type === "checkout.session.expired" || event.type === "checkout.session.async_payment_failed") {
    const orderId = (event.data.object as Stripe.Checkout.Session).metadata?.order_id;
    if (orderId) await cancelOrder(db, orderId);
  }
  return NextResponse.json({ received: true });
}
