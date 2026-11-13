// Misura del percorso: registra il passo raggiunto e il tipo di dispositivo, senza cookie né identificativi della persona.
import { NextResponse } from "next/server";
import { deviceOf, FUNNEL, type FunnelName, sameOrigin } from "@/lib/observe";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { supabaseService } from "@/lib/supabase/server";

export async function POST(request: Request) {
  if (!sameOrigin(request) || !isSupabaseConfigured()) return new NextResponse(null, { status: 204 });
  const body = (await request.json().catch(() => ({}))) as { name?: string; step?: string };
  if (!body.name || !FUNNEL.includes(body.name as FunnelName)) return new NextResponse(null, { status: 204 });
  const step = typeof body.step === "string" && /^[A-Z]{3}-\d$/.test(body.step) ? body.step : null;
  await supabaseService()
    .from("funnel_events")
    .insert({ name: body.name, step, device: deviceOf(request) });
  return new NextResponse(null, { status: 204 });
}
