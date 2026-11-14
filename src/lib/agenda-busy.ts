import "server-only";
import { parseBusy, safeFeedUrl } from "./agenda-ics";
import { overlapsBusy, type Interval } from "./agenda-time";
import type { supabaseService } from "./supabase/server";

type Db = ReturnType<typeof supabaseService>;

/** Un calendario collegato si rilegge al massimo ogni 10 minuti (salvo richiesta dello staff). */
const STALE_MS = 10 * 60 * 1000;
const WINDOW_BACK_MS = 24 * 3600 * 1000;
const WINDOW_AHEAD_MS = 120 * 24 * 3600 * 1000;
const MAX_BYTES = 5 * 1024 * 1024;

/** Scarica un calendario ICS e restituisce gli orari occupati; solleva un errore leggibile se non riesce. */
export async function fetchBusy(url: string, timeoutMs = 8000): Promise<Interval[]> {
  const safe = safeFeedUrl(url);
  if (!safe) throw new Error("Indirizzo non valido: serve un link https del calendario");
  let res: Response;
  try {
    res = await fetch(safe, {
      signal: AbortSignal.timeout(timeoutMs),
      redirect: "follow",
      headers: { accept: "text/calendar, text/plain, */*" },
    });
  } catch {
    throw new Error("Il calendario non risponde");
  }
  if (!res.ok)
    throw new Error(
      res.status === 404 || res.status === 403
        ? "Link non valido o non più condiviso"
        : `Il calendario ha risposto con errore ${res.status}`,
    );
  // un redirect verso un altro indirizzo deve restare pubblico e su https
  if (res.url && !safeFeedUrl(res.url)) throw new Error("Il calendario rimanda a un indirizzo non consentito");
  const text = await res.text();
  if (text.length > MAX_BYTES) throw new Error("Il calendario è troppo grande");
  if (!/BEGIN:VCALENDAR/i.test(text)) throw new Error("Il link non contiene un calendario ICS");
  const now = Date.now();
  try {
    return await parseBusy(text, new Date(now - WINDOW_BACK_MS), new Date(now + WINDOW_AHEAD_MS));
  } catch {
    throw new Error("Non riesco a leggere il calendario");
  }
}

async function replaceBusy(db: Db, feedId: string, busy: Interval[]) {
  await db.from("calendar_busy").delete().eq("feed_id", feedId);
  for (let i = 0; i < busy.length; i += 500) {
    const rows = busy
      .slice(i, i + 500)
      .map((b) => ({ feed_id: feedId, starts_at: new Date(b.start).toISOString(), ends_at: new Date(b.end).toISOString() }));
    const { error } = await db.from("calendar_busy").insert(rows);
    if (error) throw new Error("Salvataggio non riuscito");
  }
}

/** Rilegge i calendari collegati scaduti (o tutti con `force`). Un calendario in errore non blocca gli altri e conserva gli ultimi orari noti. */
export async function syncFeeds(db: Db, opts: { force?: boolean; timeoutMs?: number } = {}) {
  const { data: feeds } = await db.from("calendar_feeds").select("id, url, last_synced_at");
  const cutoff = Date.now() - STALE_MS;
  const due = (feeds ?? []).filter((f) => opts.force || !f.last_synced_at || new Date(f.last_synced_at as string).getTime() < cutoff);
  await Promise.all(
    due.map(async (f) => {
      try {
        const busy = await fetchBusy(f.url as string, opts.timeoutMs);
        await replaceBusy(db, f.id as string, busy);
        await db.from("calendar_feeds").update({ last_synced_at: new Date().toISOString(), last_error: null }).eq("id", f.id);
      } catch (e) {
        await db
          .from("calendar_feeds")
          .update({ last_synced_at: new Date().toISOString(), last_error: (e instanceof Error ? e.message : "Errore").slice(0, 300) })
          .eq("id", f.id);
      }
    }),
  );
}

/** Orari occupati nei calendari collegati tra due istanti. */
export async function loadBusy(db: Db, from: Date, to: Date): Promise<Interval[]> {
  const { data } = await db
    .from("calendar_busy")
    .select("starts_at, ends_at")
    .lt("starts_at", to.toISOString())
    .gt("ends_at", from.toISOString())
    .limit(20000);
  return (data ?? []).map((b) => ({ start: new Date(b.starts_at as string).getTime(), end: new Date(b.ends_at as string).getTime() }));
}

/** Vero se l'orario dello slot cade su un impegno dei calendari collegati (rilegge se i dati sono scaduti). */
export async function slotCollides(db: Db, slotId: string): Promise<boolean> {
  const { data: s } = await db.from("expert_slots").select("starts_at, duration_min").eq("id", slotId).maybeSingle();
  if (!s) return false;
  await syncFeeds(db, { timeoutMs: 4000 });
  const start = new Date(s.starts_at as string);
  const busy = await loadBusy(db, start, new Date(start.getTime() + (s.duration_min as number) * 60000));
  return overlapsBusy(busy, start.getTime(), s.duration_min as number);
}
