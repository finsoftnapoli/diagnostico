// Lo staff aggiunge disponibilità per le consulenze: elenco di date e orari di inizio (ora italiana), anche molte insieme.
import { NextResponse } from "next/server";
import { SESSION_MIN } from "@/config/offers";
import { romeToUtc } from "@/lib/agenda-time";
import { currentUser, supabaseService } from "@/lib/supabase/server";

const MAX_SLOTS = 300;

export async function POST(request: Request) {
  const { user, isStaff } = await currentUser();
  if (!user || !isStaff) return NextResponse.json({ error: "Riservato allo staff" }, { status: 403 });
  const body = (await request.json().catch(() => ({}))) as {
    slots?: { date?: string; time?: string }[];
    date?: string;
    times?: string[];
    duration?: number;
    meetingUrl?: string;
  };
  const duration = [60, 90].includes(Number(body.duration)) ? Number(body.duration) : SESSION_MIN;
  const url = typeof body.meetingUrl === "string" && /^https:\/\/\S+$/.test(body.meetingUrl.trim()) ? body.meetingUrl.trim() : null;
  const wanted = Array.isArray(body.slots)
    ? body.slots.slice(0, MAX_SLOTS).map((s) => romeToUtc(String(s?.date ?? ""), String(s?.time ?? "")))
    : (Array.isArray(body.times) ? body.times.slice(0, 16) : []).map((t) => romeToUtc(body.date ?? "", t));
  const starts = [...new Map(wanted.filter((d): d is Date => !!d && d.getTime() > Date.now()).map((d) => [d.getTime(), d])).values()].sort(
    (a, b) => a.getTime() - b.getTime(),
  );
  if (!starts.length) return NextResponse.json({ error: "Indica un giorno futuro e un orario" }, { status: 422 });

  // niente doppioni: si salta ciò che si sovrappone a un orario già inserito
  const db = supabaseService();
  const from = new Date(starts[0].getTime() - 4 * 3600 * 1000).toISOString();
  const to = new Date(starts[starts.length - 1].getTime() + 4 * 3600 * 1000).toISOString();
  const { data: existing } = await db
    .from("expert_slots")
    .select("starts_at, duration_min")
    .gte("starts_at", from)
    .lte("starts_at", to)
    .neq("status", "cancelled");
  const taken = (existing ?? []).map((e) => ({
    s: new Date(e.starts_at as string).getTime(),
    e: new Date(e.starts_at as string).getTime() + (e.duration_min as number) * 60000,
  }));
  const fresh: Date[] = [];
  for (const d of starts) {
    const s = d.getTime();
    const e = s + duration * 60000;
    if (taken.some((t) => t.s < e && t.e > s)) continue;
    taken.push({ s, e });
    fresh.push(d);
  }
  if (!fresh.length) return NextResponse.json({ ok: true, created: 0, skipped: starts.length });
  const { error } = await db
    .from("expert_slots")
    .insert(fresh.map((s) => ({ starts_at: s.toISOString(), duration_min: duration, meeting_url: url, created_by: user.id })));
  if (error) return NextResponse.json({ error: "Salvataggio non riuscito" }, { status: 500 });
  return NextResponse.json({ ok: true, created: fresh.length, skipped: starts.length - fresh.length });
}
