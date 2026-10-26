// Azioni dello staff su un ordine: registrare un bonifico, annullare, emettere o reinviare la fattura.
import { NextResponse } from "next/server";
import { cancelOrder, fulfillOrder, issueInvoice } from "@/lib/commerce";
import { currentUser, supabaseService } from "@/lib/supabase/server";

export const maxDuration = 60;

export async function POST(request: Request, ctx: RouteContext<"/api/admin/ordini/[id]">) {
  const { id } = await ctx.params;
  const { user, isStaff } = await currentUser();
  if (!user || !isStaff) return NextResponse.json({ error: "Riservato allo staff" }, { status: 403 });
  const { action } = (await request.json().catch(() => ({}))) as { action?: string };
  const db = supabaseService();
  const origin = new URL(request.url).origin;
  if (action === "paid") {
    const r = await fulfillOrder(db, id, "bonifico", origin);
    if (r.alreadyDone) return NextResponse.json({ error: "Ordine non in attesa di pagamento" }, { status: 409 });
    return NextResponse.json({ ok: true, invoice: r.invoice });
  }
  if (action === "cancel") {
    await cancelOrder(db, id);
    return NextResponse.json({ ok: true });
  }
  if (action === "invoice") {
    try {
      const inv = await issueInvoice(db, id);
      return NextResponse.json({ ok: true, invoice: inv?.number, status: inv?.status });
    } catch (e) {
      return NextResponse.json({ error: e instanceof Error ? e.message : "Fattura non emessa" }, { status: 409 });
    }
  }
  return NextResponse.json({ error: "Azione non valida" }, { status: 400 });
}
