// Cancellazione di un documento da parte di chi lo ha caricato (area personale).
import { NextResponse } from "next/server";
import { supabaseServer, supabaseService } from "@/lib/supabase/server";

export async function DELETE(_request: Request, ctx: RouteContext<"/api/documenti/[id]">) {
  const { id } = await ctx.params;
  const sb = await supabaseServer();
  const { data: auth } = await sb.auth.getUser();
  if (!auth.user) return NextResponse.json({ error: "Accesso richiesto" }, { status: 401 });
  // la regola di accesso restituisce il documento solo se è dell'utente
  const { data: doc } = await sb.from("documents").select("id, storage_path, user_id").eq("id", id).maybeSingle();
  if (!doc || doc.user_id !== auth.user.id) return NextResponse.json({ error: "Documento non trovato" }, { status: 404 });
  const db = supabaseService();
  await db.storage.from("documenti").remove([doc.storage_path]);
  await db.from("documents").delete().eq("id", id);
  return NextResponse.json({ ok: true });
}
