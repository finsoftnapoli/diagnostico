// Annullamento di una prenotazione: dal cliente fino a 24 ore prima, dallo staff sempre.
import { NextResponse } from "next/server";
import { cancelBooking } from "@/lib/commerce";
import { currentUser, supabaseService } from "@/lib/supabase/server";

const CANCEL_HOURS = 24;

export async function DELETE(request: Request, ctx: RouteContext<"/api/prenotazioni/[id]">) {
  const { id } = await ctx.params;
  const { user, isStaff } = await currentUser();
  if (!user) return NextResponse.json({ error: "Accesso richiesto" }, { status: 401 });
  if (!/^[0-9a-f-]{36}$/i.test(id)) return NextResponse.json({ error: "Prenotazione non trovata" }, { status: 404 });
  const db = supabaseService();
  const { data: b } = await db.from("bookings").select("id, user_id, status, expert_slots(starts_at)").eq("id", id).maybeSingle();
  if (!b || (!isStaff && b.user_id !== user.id)) return NextResponse.json({ error: "Prenotazione non trovata" }, { status: 404 });
  const starts = new Date((b.expert_slots as unknown as { starts_at: string }).starts_at);
  if (!isStaff && starts.getTime() - Date.now() < CANCEL_HOURS * 3600 * 1000)
    return NextResponse.json({ error: `Si può annullare fino a ${CANCEL_HOURS} ore prima: scrivici per spostarla` }, { status: 409 });
  if (!(await cancelBooking(db, id, new URL(request.url).origin))) return NextResponse.json({ error: "Prenotazione già annullata" }, { status: 409 });
  return NextResponse.json({ ok: true });
}
