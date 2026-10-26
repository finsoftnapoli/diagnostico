// Salva una bozza del questionario e restituisce l'id da inserire nel link di ripresa.
import { NextResponse } from "next/server";
import { QUESTIONNAIRE_VERSION } from "@/lib/questionnaire";
import { sanitizeResponses } from "@/lib/sanitize";
import { supabaseService } from "@/lib/supabase/server";

export async function POST(request: Request) {
  let body: { email?: unknown; step?: unknown; responses?: unknown };
  try {
    const raw = await request.text();
    if (raw.length > 200_000) return NextResponse.json({ error: "Bozza troppo grande" }, { status: 413 });
    body = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "Richiesta non valida" }, { status: 400 });
  }
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase().slice(0, 200) : "";
  if (!/^\S+@\S+\.\S+$/.test(email)) return NextResponse.json({ error: "Email non valida" }, { status: 422 });
  const step = typeof body.step === "number" && Number.isInteger(body.step) ? Math.min(Math.max(body.step, 0), 50) : 0;
  const { data, error } = await supabaseService()
    .from("drafts")
    .insert({ email, step, responses: sanitizeResponses(body.responses), questionnaire_version: QUESTIONNAIRE_VERSION })
    .select("id")
    .single();
  if (error) {
    console.error("Salvataggio bozza non riuscito:", error.message);
    return NextResponse.json({ error: "Salvataggio non riuscito, riprova tra poco" }, { status: 500 });
  }
  return NextResponse.json({ id: data.id });
}
