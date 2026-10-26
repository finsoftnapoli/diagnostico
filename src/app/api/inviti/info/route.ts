// Dati pubblici di un invito, letti con il token del link.
import { NextResponse, type NextRequest } from "next/server";
import { supabaseService } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const t = request.nextUrl.searchParams.get("t") ?? "";
  if (!/^[0-9a-f-]{36}$/i.test(t)) return NextResponse.json({ error: "Invito non valido" }, { status: 404 });
  const { data } = await supabaseService().rpc("invitation_info", { p_token: t });
  const row = (data as { company_name: string; invitee_name: string | null; email: string; status: string; expired: boolean }[] | null)?.[0];
  if (!row) return NextResponse.json({ error: "Invito non valido" }, { status: 404 });
  return NextResponse.json({ company: row.company_name, name: row.invitee_name, email: row.email, status: row.status, expired: row.expired });
}
