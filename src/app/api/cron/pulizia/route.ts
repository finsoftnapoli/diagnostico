// Pulizia giornaliera (Vercel Cron): bozze scadute, documenti mai collegati dopo 30 giorni,
// documenti di utenti che non accedono da 24 mesi.
import { NextResponse } from "next/server";
import { supabaseService } from "@/lib/supabase/server";

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
    await db.from("documents").delete().in("id", chunk.map((d) => d.id));
  }
  return NextResponse.json({ draftsDeleted: drafts ?? 0, documentsDeleted: list.length });
}
