import "server-only";
import Stripe from "stripe";

// Pagamenti con Stripe Checkout. Chiavi nelle variabili d'ambiente di Vercel:
// STRIPE_SECRET_KEY (sk_test_... in prova, sk_live_... in produzione) e STRIPE_WEBHOOK_SECRET (whsec_...).
export const isStripeConfigured = () => !!process.env.STRIPE_SECRET_KEY;

let client: Stripe | null = null;
export function stripe(): Stripe {
  if (!client) client = new Stripe(process.env.STRIPE_SECRET_KEY!);
  return client;
}
