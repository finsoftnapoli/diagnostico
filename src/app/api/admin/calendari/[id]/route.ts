// Scollega un calendario esterno: i suoi orari occupati spariscono con lui.
import { NextResponse } from "next/server";
import { currentUser, supabaseService } from "@/lib/supabase/server";

export async function DELETE(_request: Request, ctx: RouteContext<"/api/admin/calendari/[id]">) {
  const { id } = await ctx.params;
  const { user, isStaff } = await currentUser();
  if (!user || !isStaff) return NextResponse.json({ error: "Riservato allo staff" }, { status: 403 });
  await supabaseService().from("calendar_feeds").delete().eq("id", id);
  return NextResponse.json({ ok: true });
}
