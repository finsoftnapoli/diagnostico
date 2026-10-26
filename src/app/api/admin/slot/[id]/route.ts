// Lo staff toglie una disponibilità; se era prenotata, la prenotazione viene annullata e l'ora restituita.
import { NextResponse } from "next/server";
import { cancelBooking } from "@/lib/commerce";
import { currentUser, supabaseService } from "@/lib/supabase/server";

export async function DELETE(request: Request, ctx: RouteContext<"/api/admin/slot/[id]">) {
  const { id } = await ctx.params;
  const { user, isStaff } = await currentUser();
  if (!user || !isStaff) return NextResponse.json({ error: "Riservato allo staff" }, { status: 403 });
  const db = supabaseService();
  const { data: booking } = await db.from("bookings").select("id").eq("slot_id", id).eq("status", "confirmed").maybeSingle();
  if (booking) await cancelBooking(db, booking.id as string, new URL(request.url).origin);
  await db.from("expert_slots").update({ status: "cancelled", held_until: null, held_by_order: null }).eq("id", id);
  return NextResponse.json({ ok: true });
}
