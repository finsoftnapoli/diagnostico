// Lo staff segna una richiesta come gestita (o la riapre).
import { NextResponse } from "next/server";
import { currentUser, supabaseService } from "@/lib/supabase/server";

export async function PATCH(request: Request, ctx: RouteContext<"/api/interessi/[id]">) {
  const { id } = await ctx.params;
  const { isStaff } = await currentUser();
  if (!isStaff) return NextResponse.json({ error: "Riservato allo staff" }, { status: 403 });
  if (!/^[0-9a-f-]{36}$/i.test(id)) return NextResponse.json({ error: "Richiesta non trovata" }, { status: 404 });
  const { handled } = (await request.json().catch(() => ({}))) as { handled?: boolean };
  const { error } = await supabaseService()
    .from("interests")
    .update({ handled_at: handled ? new Date().toISOString() : null })
    .eq("id", id);
  if (error) return NextResponse.json({ error: "Aggiornamento non riuscito" }, { status: 500 });
  return NextResponse.json({ ok: true });
}
