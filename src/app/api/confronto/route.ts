// Mediana reale per ambito nella fascia di fatturato, solo se il campione è sufficiente.
// Sotto la soglia restituisce solo la numerosità: il report usa il riferimento indicativo.
import { NextResponse, type NextRequest } from "next/server";
import { MIN_SAMPLE, REVENUE_BANDS } from "@/config/benchmark";
import { AREAS } from "@/lib/questionnaire";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { supabaseService } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const band = request.nextUrl.searchParams.get("fascia") ?? "";
  if (!REVENUE_BANDS.includes(band as (typeof REVENUE_BANDS)[number]) || !isSupabaseConfigured() || !process.env.SUPABASE_SERVICE_ROLE_KEY)
    return NextResponse.json({ sample: 0, values: null });
  const { data: rows, error } = await supabaseService()
    .from("assessments")
    .select("id, company_id, completed_at, area_scores(area, score)")
    .eq("status", "completed")
    .eq("profile->>PR-02", band)
    .order("completed_at", { ascending: false })
    .limit(5000);
  if (error || !rows) return NextResponse.json({ sample: 0, values: null });
  // un'azienda conta una volta sola: la compilazione più recente (i colleghi non pesano doppio)
  const seen = new Set<string>();
  const data = rows.filter((r) => (seen.has(r.company_id as string) ? false : (seen.add(r.company_id as string), true)));
  const sample = data.length;
  if (sample < MIN_SAMPLE) return NextResponse.json({ sample, values: null });
  const values: Record<string, number> = {};
  for (const a of AREAS) {
    const xs = data
      .flatMap((d) => (d.area_scores as { area: string; score: number | null }[]).filter((s) => s.area === a.code && s.score !== null))
      .map((s) => s.score as number)
      .sort((x, y) => x - y);
    values[a.code] = xs.length ? (xs.length % 2 ? xs[(xs.length - 1) / 2] : Math.round((xs[xs.length / 2 - 1] + xs[xs.length / 2]) / 2)) : 0;
  }
  return NextResponse.json({ sample, values }, { headers: { "cache-control": "public, max-age=3600" } });
}
