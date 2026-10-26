// Mediana reale per ambito nella fascia di fatturato, solo se il campione è sufficiente.
// Se la fascia ha poche aziende si prova la macro-fascia che la contiene; sotto la soglia
// restituisce solo la numerosità e il report usa il riferimento indicativo.
import { NextResponse, type NextRequest } from "next/server";
import { bandText, macroOf, MIN_SAMPLE, REVENUE_BANDS, type RealBenchmark } from "@/config/benchmark";
import { AREAS } from "@/lib/questionnaire";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { supabaseService } from "@/lib/supabase/server";

type Row = { company_id: string; area_scores: { area: string; score: number | null }[] };

/** Un'azienda conta una volta sola: la compilazione più recente (i colleghi non pesano doppio). */
async function latestPerCompany(bands: string[]): Promise<Row[] | null> {
  const { data, error } = await supabaseService()
    .from("assessments")
    .select("company_id, completed_at, area_scores(area, score)")
    .eq("status", "completed")
    .in("profile->>PR-02", bands)
    .order("completed_at", { ascending: false })
    .limit(5000);
  if (error || !data) return null;
  const seen = new Set<string>();
  return (data as unknown as Row[]).filter((r) => (seen.has(r.company_id) ? false : (seen.add(r.company_id), true)));
}

const median = (xs: number[]) => {
  const s = [...xs].sort((a, b) => a - b);
  if (!s.length) return 0;
  return s.length % 2 ? s[(s.length - 1) / 2] : Math.round((s[s.length / 2 - 1] + s[s.length / 2]) / 2);
};

function medians(rows: Row[]) {
  const values: Record<string, number> = {};
  for (const a of AREAS)
    values[a.code] = median(rows.flatMap((r) => r.area_scores.filter((s) => s.area === a.code && s.score !== null).map((s) => s.score as number)));
  return values as RealBenchmark["values"];
}

export async function GET(request: NextRequest) {
  const band = request.nextUrl.searchParams.get("fascia") ?? "";
  const none = (sample = 0) => NextResponse.json({ sample, values: null } satisfies RealBenchmark);
  if (!REVENUE_BANDS.includes(band as (typeof REVENUE_BANDS)[number]) || !isSupabaseConfigured() || !process.env.SUPABASE_SERVICE_ROLE_KEY)
    return none();
  const cache = { headers: { "cache-control": "public, max-age=3600" } };

  const own = await latestPerCompany([band]);
  if (!own) return none();
  if (own.length >= MIN_SAMPLE)
    return NextResponse.json({ sample: own.length, values: medians(own), scopeText: bandText(band) } satisfies RealBenchmark, cache);

  const macro = macroOf(band);
  const wide = macro ? await latestPerCompany(macro.bands) : null;
  if (macro && wide && wide.length >= MIN_SAMPLE)
    return NextResponse.json({ sample: wide.length, values: medians(wide), scopeText: macro.text } satisfies RealBenchmark, cache);
  return none(own.length);
}
