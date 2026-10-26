import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import AgendaAdmin, { type SlotRow } from "@/components/AgendaAdmin";
import { currentUser, supabaseService } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Agenda consulenze" };

export default function AgendaPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <Suspense fallback={<p className="text-muted">Caricamento…</p>}>
        <Agenda />
      </Suspense>
    </div>
  );
}

async function Agenda() {
  const { user, isStaff } = await currentUser();
  if (!user) redirect("/accedi?next=/admin/agenda");
  if (!isStaff) return <p>Questa area è riservata allo staff.</p>;
  const rows = await loadSlots();
  return (
    <>
      <Link href="/admin" className="text-sm underline text-navy-soft">
        ← Area staff
      </Link>
      <h1 className="mt-3 text-2xl font-semibold text-navy">Agenda consulenze</h1>
      <p className="mt-1 text-sm text-muted">
        Aggiungi gli orari in cui sei disponibile: i clienti li vedono nella loro area personale fino a 12 ore prima e
        possono annullare fino a 24 ore prima.
      </p>
      <AgendaAdmin slots={rows} defaultUrl={process.env.DEFAULT_MEETING_URL ?? ""} />
    </>
  );
}

async function loadSlots(): Promise<SlotRow[]> {
  const db = supabaseService();
  const since = new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString();
  const { data: slots } = await db
    .from("expert_slots")
    .select("id, starts_at, duration_min, meeting_url, status, held_until, bookings(id, status, topic, user_id, companies(name))")
    .gte("starts_at", since)
    .neq("status", "cancelled")
    .order("starts_at");
  const emails = new Map<string, string>();
  for (const s of slots ?? [])
    for (const b of (s.bookings as unknown as { user_id: string; status: string }[]) ?? [])
      if (b.status === "confirmed" && !emails.has(b.user_id)) {
        const { data } = await db.auth.admin.getUserById(b.user_id);
        emails.set(b.user_id, data.user?.email ?? "");
      }
  const rows: SlotRow[] = (slots ?? []).map((s) => {
    const b = ((s.bookings as unknown as { id: string; status: string; topic: string | null; user_id: string; companies: { name: string } | null }[]) ?? []).find(
      (x) => x.status === "confirmed",
    );
    const held = s.status === "held" && s.held_until && new Date(s.held_until as string) > new Date();
    return {
      id: s.id as string,
      startsAt: s.starts_at as string,
      duration: s.duration_min as number,
      meetingUrl: s.meeting_url as string | null,
      state: b ? "booked" : held ? "held" : "open",
      booking: b ? { id: b.id, company: b.companies?.name ?? "", email: emails.get(b.user_id) ?? "", topic: b.topic } : null,
    };
  });
  return rows;
}
