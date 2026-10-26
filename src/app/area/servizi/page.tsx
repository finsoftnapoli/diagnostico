import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import Services, { type ServicesData } from "@/components/Services";
import { consultCredit } from "@/lib/commerce";
import { isStripeConfigured } from "@/lib/stripe";
import { supabaseServer, supabaseService } from "@/lib/supabase/server";
import type { AreaCode } from "@/lib/types";

export const metadata: Metadata = { title: "I tuoi servizi" };

export default function ServicesPage({ searchParams }: PageProps<"/area/servizi">) {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <Link href="/area" className="text-sm underline text-navy-soft">
        ← Area personale
      </Link>
      <Suspense fallback={<p className="mt-6 text-muted">Caricamento…</p>}>
        <Content searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function Content({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const data = await load(await searchParams);
  if (!data)
    return (
      <div className="mt-6">
        <h1 className="text-3xl font-semibold text-navy">I tuoi servizi</h1>
        <p className="mt-3 text-muted">
          Gli approfondimenti e le consulenze si attivano dopo il primo diagnostico.{" "}
          <Link href="/diagnostico" className="underline">
            Inizia il diagnostico
          </Link>
          .
        </p>
      </div>
    );
  return <Services data={data} />;
}

/** Dati dell'azienda per l'area acquisti (null se l'utente non ha ancora un'azienda). */
async function load(sp: Record<string, string | string[] | undefined>): Promise<ServicesData | null> {
  const sb = await supabaseServer();
  const { data: auth } = await sb.auth.getUser();
  if (!auth.user) redirect("/accedi?next=/area/servizi");
  const { data: memberships } = await sb.from("company_members").select("company_id, role, companies(name)").eq("user_id", auth.user.id);
  const companies = (memberships ?? []).map((m) => ({
    id: m.company_id as string,
    name: (m.companies as unknown as { name: string } | null)?.name ?? "",
  }));
  if (!companies.length) return null;
  const wanted = typeof sp.azienda === "string" ? sp.azienda : null;
  const company = companies.find((c) => c.id === wanted) ?? companies[0];

  const db = supabaseService();
  const limit = new Date(Date.now() + 45 * 24 * 3600 * 1000).toISOString();
  const minStart = new Date(Date.now() + 12 * 3600 * 1000).toISOString();
  const nowIso = new Date().toISOString();
  const [billing, ents, modules, bookings, slots, orders, diag, credit] = await Promise.all([
    db.from("billing_profiles").select("denominazione, vat_number, tax_code, address, cap, city, province, sdi_code, pec").eq("company_id", company.id).maybeSingle(),
    db.from("entitlements").select("id, kind, area, quantity, used, created_at").eq("company_id", company.id).order("created_at"),
    db.from("module_assessments").select("id, entitlement_id, status, report_status, score").eq("company_id", company.id),
    db
      .from("bookings")
      .select("id, status, topic, user_id, expert_slots(starts_at, duration_min, meeting_url)")
      .eq("company_id", company.id)
      .eq("status", "confirmed"),
    db
      .from("expert_slots")
      .select("id, starts_at, duration_min, status, held_until")
      .gte("starts_at", minStart)
      .lte("starts_at", limit)
      .or(`status.eq.open,and(status.eq.held,held_until.lt.${nowIso})`)
      .order("starts_at")
      .limit(80),
    db
      .from("orders")
      .select("id, created_at, status, items, total_cents, invoices(number, status)")
      .eq("company_id", company.id)
      .in("status", ["paid", "refunded"])
      .order("created_at", { ascending: false }),
    db
      .from("assessments")
      .select("id, area_scores(area, is_priority, rank)")
      .eq("company_id", company.id)
      .eq("status", "completed")
      .order("completed_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    consultCredit(db, company.id),
  ]);

  const priorities = ((diag.data?.area_scores as { area: AreaCode; is_priority: boolean; rank: number | null }[] | undefined) ?? [])
    .filter((s) => s.is_priority)
    .sort((a, b) => (a.rank ?? 9) - (b.rank ?? 9))
    .map((s) => s.area);

  const data: ServicesData = {
    company,
    companies,
    paymentsActive: isStripeConfigured(),
    result: sp.esito === "ok" ? "ok" : sp.esito === "annullato" ? "annullato" : null,
    cancelledOrder: typeof sp.ordine === "string" ? sp.ordine : null,
    billing: billing.data ?? null,
    priorities,
    modules: (ents.data ?? [])
      .filter((e) => e.kind === "area_module")
      .map((e) => {
        const m = (modules.data ?? []).find((x) => x.entitlement_id === e.id);
        return {
          entitlementId: e.id as string,
          area: e.area as AreaCode,
          moduleId: (m?.id as string) ?? null,
          status: !m ? "da iniziare" : m.status !== "completed" ? "in corso" : m.report_status === "ready" ? "pronto" : "in analisi",
          score: (m?.score as number | null) ?? null,
        };
      }),
    hours: credit.total,
    bookings: (bookings.data ?? [])
      .map((b) => {
        const s = b.expert_slots as unknown as { starts_at: string; duration_min: number; meeting_url: string | null };
        return { id: b.id as string, startsAt: s.starts_at, duration: s.duration_min, url: s.meeting_url ?? process.env.DEFAULT_MEETING_URL ?? null, topic: b.topic as string | null, mine: b.user_id === auth.user!.id, cancellable: b.user_id === auth.user!.id && new Date(s.starts_at).getTime() - Date.now() > 24 * 3600 * 1000 };
      })
      .filter((b) => new Date(b.startsAt).getTime() > Date.now() - 2 * 3600 * 1000)
      .sort((a, b) => a.startsAt.localeCompare(b.startsAt)),
    slots: (slots.data ?? []).map((s) => ({ id: s.id as string, startsAt: s.starts_at as string, duration: s.duration_min as number })),
    orders: (orders.data ?? []).map((o) => {
      const inv = Array.isArray(o.invoices) ? o.invoices[0] : (o.invoices as { number: string; status: string } | null);
      return {
        id: o.id as string,
        date: o.created_at as string,
        items: (o.items as { description: string }[]).map((l) => l.description),
        totalCents: o.total_cents as number,
        invoice: inv?.number ?? null,
        status: o.status as string,
      };
    }),
  };
  return data;
}
