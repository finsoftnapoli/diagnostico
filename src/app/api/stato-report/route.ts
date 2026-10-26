// Stato del report approfondito di una compilazione (per mostrare "in elaborazione" o "pronto").
import { NextResponse, type NextRequest } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id") ?? "";
  if (!/^[0-9a-f-]{36}$/i.test(id)) return NextResponse.json({ status: "none" });
  const sb = await supabaseServer();
  const { data: auth } = await sb.auth.getUser();
  if (!auth.user) return NextResponse.json({ status: "none" });
  // la regola di accesso restituisce la compilazione solo a chi ha diritto di vederla
  const { data } = await sb.from("assessments").select("report_status").eq("id", id).maybeSingle();
  return NextResponse.json({ status: (data?.report_status as string) ?? "none" });
}
