// Avvia un modulo di approfondimento acquistato (uno per ogni modulo attivato).
import { NextResponse } from "next/server";
import { MODULE_VERSION } from "@/lib/modules";
import { companyOfMember } from "@/lib/supabase/membership";
import { supabaseServer, supabaseService } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const { data: auth } = await (await supabaseServer()).auth.getUser();
  if (!auth.user) return NextResponse.json({ error: "Accesso richiesto" }, { status: 401 });
  const { entitlementId } = (await request.json().catch(() => ({}))) as { entitlementId?: string };
  if (!entitlementId || !/^[0-9a-f-]{36}$/i.test(entitlementId)) return NextResponse.json({ error: "Modulo non trovato" }, { status: 404 });
  const db = supabaseService();
  const { data: e } = await db.from("entitlements").select("id, company_id, user_id, kind, area").eq("id", entitlementId).maybeSingle();
  if (!e || e.kind !== "area_module") return NextResponse.json({ error: "Modulo non trovato" }, { status: 404 });
  // può compilarlo chi l'ha acquistato o un amministratore dell'azienda
  const member = await companyOfMember(auth.user.id, e.company_id as string);
  if (e.user_id !== auth.user.id && member?.role !== "admin") return NextResponse.json({ error: "Modulo non trovato" }, { status: 404 });
  const { data: existing } = await db.from("module_assessments").select("id").eq("entitlement_id", e.id).maybeSingle();
  if (existing) return NextResponse.json({ id: existing.id });
  const { data, error } = await db
    .from("module_assessments")
    .insert({ user_id: auth.user.id, company_id: e.company_id, entitlement_id: e.id, area: e.area, module_version: MODULE_VERSION })
    .select("id")
    .single();
  if (error) {
    console.error("Modulo non avviato:", error.message);
    return NextResponse.json({ error: "Non riuscito, riprova" }, { status: 500 });
  }
  return NextResponse.json({ id: data.id });
}
