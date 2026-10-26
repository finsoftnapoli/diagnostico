// Lo staff aggiunge disponibilità per le consulenze: una data e uno o più orari di inizio (ora italiana).
import { NextResponse } from "next/server";
import { SESSION_MIN } from "@/config/offers";
import { currentUser, supabaseService } from "@/lib/supabase/server";

/** Converte data e ora italiane in istante UTC, tenendo conto dell'ora legale. */
function romeToUtc(date: string, time: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}$/.test(time)) return null;
  const guess = new Date(`${date}T${time}:00Z`);
  const offset = (d: Date) => {
    const rome = new Date(d.toLocaleString("en-US", { timeZone: "Europe/Rome" }));
    const utc = new Date(d.toLocaleString("en-US", { timeZone: "UTC" }));
    return rome.getTime() - utc.getTime();
  };
  return new Date(guess.getTime() - offset(guess));
}

export async function POST(request: Request) {
  const { user, isStaff } = await currentUser();
  if (!user || !isStaff) return NextResponse.json({ error: "Riservato allo staff" }, { status: 403 });
  const body = (await request.json().catch(() => ({}))) as { date?: string; times?: string[]; duration?: number; meetingUrl?: string };
  const times = Array.isArray(body.times) ? body.times.slice(0, 16) : [];
  const duration = Number(body.duration) || SESSION_MIN;
  const url = typeof body.meetingUrl === "string" && /^https:\/\/\S+$/.test(body.meetingUrl.trim()) ? body.meetingUrl.trim() : null;
  const starts = times.map((t) => romeToUtc(body.date ?? "", t)).filter((d): d is Date => !!d && d.getTime() > Date.now());
  if (!starts.length) return NextResponse.json({ error: "Indica una data futura e almeno un orario" }, { status: 422 });
  const { error } = await supabaseService()
    .from("expert_slots")
    .insert(starts.map((s) => ({ starts_at: s.toISOString(), duration_min: duration, meeting_url: url, created_by: user.id })));
  if (error) return NextResponse.json({ error: "Salvataggio non riuscito" }, { status: 500 });
  return NextResponse.json({ ok: true, created: starts.length });
}
