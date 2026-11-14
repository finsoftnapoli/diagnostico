// Calendario delle prenotazioni da sottoscrivere (Google, Outlook, Apple): chi ha il link vede le consulenze confermate.
// Il link è segreto e si rinnova dall'agenda dello staff; non contiene dati dei clienti oltre al nome dell'azienda.
import { timingSafeEqual } from "node:crypto";
import { BRAND } from "@/config/brand";
import { siteUrl } from "@/config/site";
import { bookingsFeed } from "@/lib/ics";
import { supabaseService } from "@/lib/supabase/server";

const same = (a: string, b: string) => a.length === b.length && timingSafeEqual(Buffer.from(a), Buffer.from(b));

export async function GET(_request: Request, ctx: RouteContext<"/api/calendario/[token]">) {
  const { token: raw } = await ctx.params;
  const token = raw.replace(/\.ics$/i, "");
  const db = supabaseService();
  const { data: setting } = await db.from("agenda_settings").select("value").eq("key", "feed_token").maybeSingle();
  if (!setting || !token || !same(token, setting.value as string)) return new Response("Non trovato", { status: 404 });

  const since = new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString();
  const { data: rows } = await db
    .from("bookings")
    .select("id, topic, companies(name), expert_slots!inner(starts_at, duration_min, meeting_url, status)")
    .eq("status", "confirmed")
    .gte("expert_slots.starts_at", since);
  const events = (rows ?? []).map((b) => {
    const s = b.expert_slots as unknown as { starts_at: string; duration_min: number; meeting_url: string | null };
    const company = (b.companies as unknown as { name: string } | null)?.name ?? "";
    return {
      uid: `${b.id}@${new URL(siteUrl()).hostname}`,
      start: new Date(s.starts_at),
      minutes: s.duration_min,
      title: `Consulenza: ${company}`.trim(),
      description: b.topic ? `Temi: ${b.topic}` : "Consulenza prenotata dall'area personale",
      url: s.meeting_url ?? process.env.DEFAULT_MEETING_URL ?? null,
    };
  });
  return new Response(bookingsFeed(`${BRAND.name}: consulenze`, events), {
    headers: { "content-type": "text/calendar; charset=utf-8", "cache-control": "private, max-age=0, no-store" },
  });
}
