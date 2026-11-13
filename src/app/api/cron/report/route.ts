// Ogni mattina (Vercel Cron): genera i report rimasti indietro, invia quelli in partenza e i promemoria.
import { siteUrl } from "@/config/site";
import { NextResponse } from "next/server";
import { sendReminders } from "@/lib/reminders";
import { generatePendingReports } from "@/lib/report-jobs";
import { supabaseService } from "@/lib/supabase/server";

export const maxDuration = 300;

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`)
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  if (!process.env.ANTHROPIC_API_KEY) return NextResponse.json({ error: "API non configurata" }, { status: 503 });
  const res = await generatePendingReports(siteUrl());
  // promemoria per bozze lasciate a metà e inviti senza risposta: uno solo ciascuno
  const reminders = await sendReminders(supabaseService(), siteUrl());
  return NextResponse.json({ ...res, reminders });
}
