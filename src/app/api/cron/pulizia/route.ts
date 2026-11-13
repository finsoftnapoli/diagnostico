// Pulizia giornaliera (Vercel Cron): bozze scadute, documenti mai collegati dopo 30 giorni,
// documenti di utenti che non accedono da 24 mesi, misure più vecchie di 90 giorni; poi la copia di sicurezza dei dati.
import { NextResponse } from "next/server";
import { runBackup } from "@/lib/backup";
import { logError } from "@/lib/observe";
import { supabaseService } from "@/lib/supabase/server";

export const maxDuration = 120;

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`)
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  const db = supabaseService();
  const { count: drafts } = await db.from("drafts").delete({ count: "exact" }).lt("expires_at", new Date().toISOString());
  const { data: docs, error } = await db.rpc("documents_to_purge");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const list = (docs ?? []) as { id: string; storage_path: string }[];
  for (let i = 0; i < list.length; i += 100) {
    const chunk = list.slice(i, i + 100);
    await db.storage.from("documenti").remove(chunk.map((d) => d.storage_path));
    await db
      .from("documents")
      .delete()
      .in(
        "id",
        chunk.map((d) => d.id),
      );
  }
  // misure del percorso e registro degli errori: si tengono 90 giorni
  const old = new Date(Date.now() - 90 * 86_400_000).toISOString();
  await db.from("funnel_events").delete().lt("created_at", old);
  await db.from("error_log").delete().lt("created_at", old);
  // copia di sicurezza giornaliera dei dati
  const backup = await runBackup(db).catch((e) => ({ failed: [e instanceof Error ? e.message : String(e)] }));
  if (backup.failed.length)
    await logError("server", `Copia di sicurezza incompleta: ${backup.failed[0]}`, "/api/cron/pulizia", backup.failed.join("\n"));
  return NextResponse.json({ draftsDeleted: drafts ?? 0, documentsDeleted: list.length, backup });
}
