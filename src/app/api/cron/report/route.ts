// Genera i report approfonditi in differita e avvisa via email (Vercel Cron).
import { NextResponse } from "next/server";
import { generatePendingReports } from "@/lib/report-jobs";

export const maxDuration = 300;

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`)
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  if (!process.env.ANTHROPIC_API_KEY) return NextResponse.json({ error: "API non configurata" }, { status: 503 });
  const res = await generatePendingReports(new URL(request.url).origin);
  return NextResponse.json(res);
}
