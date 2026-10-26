import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import OrdersAdmin, { type OrderRow } from "@/components/OrdersAdmin";
import { isArubaConfigured } from "@/lib/aruba";
import { sellerFromEnv } from "@/lib/invoice";
import { isStripeConfigured } from "@/lib/stripe";
import { currentUser, supabaseService } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Ordini e fatture" };

export default function OrdersPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <Suspense fallback={<p className="text-muted">Caricamento…</p>}>
        <Orders />
      </Suspense>
    </div>
  );
}

async function Orders() {
  const { user, isStaff } = await currentUser();
  if (!user) redirect("/accedi?next=/admin/ordini");
  if (!isStaff) return <p>Questa area è riservata allo staff.</p>;
  const { data } = await supabaseService()
    .from("orders")
    .select("id, created_at, paid_at, status, payment_method, items, total_cents, billing, invoices(id, number, status, error, issued_on)")
    .order("created_at", { ascending: false })
    .limit(300);
  const rows = (data ?? []) as unknown as OrderRow[];
  const checks = [
    { ok: isStripeConfigured(), label: "Pagamenti Stripe", hint: "variabili STRIPE_SECRET_KEY e STRIPE_WEBHOOK_SECRET" },
    { ok: !!sellerFromEnv(), label: "Dati di Finsoft per le fatture", hint: "variabili SELLER_*" },
    {
      ok: isArubaConfigured(),
      label: `Invio automatico ad Aruba${process.env.ARUBA_ENV === "prod" ? "" : " (ambiente di prova)"}`,
      hint: "variabili ARUBA_USERNAME, ARUBA_PASSWORD, ARUBA_ENV",
    },
  ];
  return (
    <>
      <Link href="/admin" className="text-sm underline text-navy-soft">
        ← Area staff
      </Link>
      <h1 className="mt-3 text-2xl font-semibold text-navy">Ordini e fatture</h1>
      <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-1 text-sm">
        {checks.map((c) => (
          <li key={c.label} className={c.ok ? "text-navy" : "text-accent"} title={c.ok ? undefined : c.hint}>
            {c.ok ? "✓" : "✗"} {c.label}
            {!c.ok && <span className="text-muted"> · {c.hint}</span>}
          </li>
        ))}
      </ul>
      <OrdersAdmin rows={rows} />
    </>
  );
}
