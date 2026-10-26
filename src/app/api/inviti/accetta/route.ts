// Il collega, dopo aver confermato l'email, accetta l'invito: diventa membro dello spazio aziendale
// e riceve il profilo dell'azienda già compilato dall'amministratore.
import { NextResponse } from "next/server";
import { supabaseServer, supabaseService } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const sb = await supabaseServer();
  const { data: auth } = await sb.auth.getUser();
  if (!auth.user) return NextResponse.json({ error: "Accesso richiesto" }, { status: 401 });
  const { t } = (await request.json().catch(() => ({}))) as { t?: string };
  if (!t || !/^[0-9a-f-]{36}$/i.test(t)) return NextResponse.json({ error: "Invito non valido" }, { status: 404 });

  const { data: companyId, error } = await sb.rpc("accept_invitation", { p_token: t });
  if (error || !companyId) {
    const msg = /scaduto/.test(error?.message ?? "")
      ? "L'invito è scaduto: chiedi a chi ti ha invitato di inviarne uno nuovo."
      : /altro indirizzo/.test(error?.message ?? "")
        ? "L'invito è stato inviato a un altro indirizzo email."
        : "Invito non valido o già utilizzato.";
    return NextResponse.json({ error: msg }, { status: 409 });
  }

  const db = supabaseService();
  const { data: company } = await db.from("companies").select("name").eq("id", companyId).single();
  // profilo dell'azienda dall'ultima compilazione completata dagli amministratori
  const { data: admins } = await db.from("company_members").select("user_id").eq("company_id", companyId).eq("role", "admin");
  const { data: last } = await db
    .from("assessments")
    .select("profile")
    .eq("company_id", companyId)
    .eq("status", "completed")
    .in("user_id", (admins ?? []).map((a) => a.user_id))
    .order("completed_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  const profile = { ...((last?.profile as Record<string, string> | null) ?? {}) };
  delete profile["PR-08"]; // il ruolo di chi compila lo indica il collega
  return NextResponse.json({ companyId, companyName: company?.name ?? "", profile });
}
