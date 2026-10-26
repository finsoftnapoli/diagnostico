// Prenotazione di una consulenza con un'ora già acquistata (per esempio dal percorso completo).
import { NextResponse } from "next/server";
import { bookWithCredit, sendBookingEmails } from "@/lib/commerce";
import { companyOfMember } from "@/lib/supabase/membership";
import { supabaseServer, supabaseService } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const { data: auth } = await (await supabaseServer()).auth.getUser();
  if (!auth.user) return NextResponse.json({ error: "Accesso richiesto" }, { status: 401 });
  const body = (await request.json().catch(() => ({}))) as { companyId?: string; slotId?: string; topic?: string };
  const company = body.companyId ? await companyOfMember(auth.user.id, body.companyId) : null;
  if (!company) return NextResponse.json({ error: "Azienda non trovata" }, { status: 404 });
  if (!body.slotId || !/^[0-9a-f-]{36}$/i.test(body.slotId)) return NextResponse.json({ error: "Orario non valido" }, { status: 400 });
  const db = supabaseService();
  const res = await bookWithCredit(db, { userId: auth.user.id, companyId: company.id, slotId: body.slotId, topic: body.topic ?? null });
  if ("error" in res) return NextResponse.json({ error: res.error }, { status: 409 });
  await sendBookingEmails(db, res.id, new URL(request.url).origin).catch((e) =>
    console.error("Email prenotazione non inviate:", e instanceof Error ? e.message : e),
  );
  return NextResponse.json({ id: res.id });
}
