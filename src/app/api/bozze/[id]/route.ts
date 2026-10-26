// Restituisce una bozza solo a chi ha confermato la stessa email con cui è stata salvata.
import { NextResponse } from "next/server";
import { supabaseServer, supabaseService } from "@/lib/supabase/server";

export async function GET(_request: Request, ctx: RouteContext<"/api/bozze/[id]">) {
  const { id } = await ctx.params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) return NextResponse.json({ error: "Bozza non trovata" }, { status: 404 });
  const { data: auth } = await (await supabaseServer()).auth.getUser();
  if (!auth.user?.email) return NextResponse.json({ error: "Accesso richiesto" }, { status: 401 });
  const { data } = await supabaseService()
    .from("drafts")
    .select("email, step, responses, expires_at")
    .eq("id", id)
    .maybeSingle();
  if (!data || data.email !== auth.user.email.toLowerCase() || new Date(data.expires_at) < new Date())
    return NextResponse.json({ error: "Bozza non trovata" }, { status: 404 });
  return NextResponse.json({ step: data.step, responses: data.responses });
}
