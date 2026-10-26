// Conferma l'email dal link nel messaggio (formato con token_hash): funziona da qualsiasi dispositivo.
// Modello email consigliato: {{ .SiteURL }}/auth/conferma?token_hash={{ .TokenHash }}&type=email&next={{ .RedirectTo }}
import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const url = request.nextUrl;
  const tokenHash = url.searchParams.get("token_hash");
  const type = (url.searchParams.get("type") ?? "email") as EmailOtpType;
  const next = safePath(url.searchParams.get("next"), url.origin);
  if (tokenHash) {
    const { error } = await (await supabaseServer()).auth.verifyOtp({ type, token_hash: tokenHash });
    if (!error) return NextResponse.redirect(new URL(next, url.origin));
  }
  return NextResponse.redirect(new URL("/accedi?errore=link", url.origin));
}

/** Accetta solo destinazioni dello stesso sito. */
function safePath(next: string | null, origin: string): string {
  if (!next) return "/";
  try {
    const u = new URL(next, origin);
    return u.origin === origin ? u.pathname + u.search : "/";
  } catch {
    return "/";
  }
}
