// Calendari esterni collegati all'agenda: si aggiunge un link ICS, si rilegge, si toglie.
import { NextResponse } from "next/server";
import { fetchBusy, syncFeeds } from "@/lib/agenda-busy";
import { safeFeedUrl } from "@/lib/agenda-ics";
import { currentUser, supabaseService } from "@/lib/supabase/server";

const MAX_FEEDS = 8;

export async function POST(request: Request) {
  const { user, isStaff } = await currentUser();
  if (!user || !isStaff) return NextResponse.json({ error: "Riservato allo staff" }, { status: 403 });
  const body = (await request.json().catch(() => ({}))) as { label?: string; url?: string; refresh?: boolean };
  const db = supabaseService();

  if (body.refresh) {
    await syncFeeds(db, { force: true });
    return NextResponse.json({ ok: true });
  }

  const label = String(body.label ?? "")
    .trim()
    .slice(0, 80);
  const url = safeFeedUrl(String(body.url ?? ""));
  if (!label) return NextResponse.json({ error: "Dia un nome al calendario" }, { status: 422 });
  if (!url) return NextResponse.json({ error: "Serve il link ICS del calendario (https)" }, { status: 422 });
  const { count } = await db.from("calendar_feeds").select("id", { count: "exact", head: true });
  if ((count ?? 0) >= MAX_FEEDS) return NextResponse.json({ error: `Massimo ${MAX_FEEDS} calendari collegati` }, { status: 422 });

  // si prova subito: un link sbagliato si scopre qui, non il giorno in cui un cliente prenota
  let busy;
  try {
    busy = await fetchBusy(url);
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Calendario non leggibile" }, { status: 422 });
  }
  const { data: feed, error } = await db
    .from("calendar_feeds")
    .insert({ label, url, created_by: user.id, last_synced_at: new Date().toISOString() })
    .select("id")
    .single();
  if (error || !feed) return NextResponse.json({ error: "Salvataggio non riuscito" }, { status: 500 });
  for (let i = 0; i < busy.length; i += 500)
    await db
      .from("calendar_busy")
      .insert(
        busy
          .slice(i, i + 500)
          .map((b) => ({ feed_id: feed.id, starts_at: new Date(b.start).toISOString(), ends_at: new Date(b.end).toISOString() })),
      );
  return NextResponse.json({ ok: true, events: busy.length });
}
