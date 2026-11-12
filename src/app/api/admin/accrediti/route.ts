// Accredito di servizi senza pagamento, riservato allo staff (per esempio per le aziende che provano il servizio).
import { NextResponse } from "next/server";
import { siteUrl } from "@/config/site";
import type { CartLine } from "@/config/offers";
import { grantCredit } from "@/lib/commerce";
import { currentUser, supabaseService } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const { user, isStaff } = await currentUser();
  if (!user || !isStaff) return NextResponse.json({ error: "Riservato allo staff" }, { status: 403 });
  const body = (await request.json().catch(() => ({}))) as { assessmentId?: string; sku?: string; area?: string };
  if (!body.assessmentId || !/^[0-9a-f-]{36}$/i.test(body.assessmentId))
    return NextResponse.json({ error: "Compilazione non valida" }, { status: 400 });
  const lines: CartLine[] | null =
    body.sku === "bundle"
      ? [{ sku: "bundle" }]
      : body.sku === "consulenza"
        ? [{ sku: "consulenza" }]
        : body.sku === "modulo" && body.area
          ? [{ sku: "modulo", area: body.area }]
          : null;
  if (!lines) return NextResponse.json({ error: "Servizio non valido" }, { status: 400 });
  const db = supabaseService();
  const { data: a } = await db.from("assessments").select("user_id, company_id").eq("id", body.assessmentId).maybeSingle();
  if (!a?.user_id || !a.company_id) return NextResponse.json({ error: "Compilazione non trovata" }, { status: 404 });
  try {
    const r = await grantCredit(db, { userId: a.user_id as string, companyId: a.company_id as string, lines, origin: siteUrl() });
    return NextResponse.json({ ok: true, items: r.items });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Accredito non riuscito" }, { status: 409 });
  }
}
