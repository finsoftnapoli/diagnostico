// Dati di fatturazione dell'azienda: li inserisce o aggiorna un membro dello spazio aziendale.
import { NextResponse } from "next/server";
import { validateBilling } from "@/lib/billing";
import { companyOfMember } from "@/lib/supabase/membership";
import { supabaseServer, supabaseService } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const { data: auth } = await (await supabaseServer()).auth.getUser();
  if (!auth.user) return NextResponse.json({ error: "Accesso richiesto" }, { status: 401 });
  const body = (await request.json().catch(() => ({}))) as { companyId?: string; billing?: unknown };
  const company = body.companyId ? await companyOfMember(auth.user.id, body.companyId) : null;
  if (!company) return NextResponse.json({ error: "Azienda non trovata" }, { status: 404 });
  const v = validateBilling(body.billing);
  if (!v.ok) return NextResponse.json({ error: "Controlla i dati evidenziati", fields: v.errors }, { status: 422 });
  const { error } = await supabaseService()
    .from("billing_profiles")
    .upsert({ company_id: company.id, ...v.billing, updated_by: auth.user.id, updated_at: new Date().toISOString() });
  if (error) {
    console.error("Dati di fatturazione non salvati:", error.message);
    return NextResponse.json({ error: "Salvataggio non riuscito, riprova" }, { status: 500 });
  }
  return NextResponse.json({ ok: true, billing: v.billing });
}
