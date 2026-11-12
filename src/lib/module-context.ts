// Contesto di un modulo dal diagnostico più recente dell'azienda: punteggio iniziale dell'ambito e riferimento di fascia.
import { bandText, normativeBenchmark } from "@/config/benchmark";
import type { supabaseServer } from "./supabase/server";
import type { AreaCode } from "./types";

type Db = Awaited<ReturnType<typeof supabaseServer>>;

export async function moduleContext(
  sb: Db,
  companyId: string,
  area: AreaCode,
): Promise<{ diagnosticScore: number | null; reference: { value: number; label: string } | null }> {
  const { data: diag } = await sb
    .from("assessments")
    .select("profile, area_scores(area, score)")
    .eq("company_id", companyId)
    .eq("status", "completed")
    .order("completed_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  const diagnosticScore =
    (diag?.area_scores as { area: string; score: number | null }[] | undefined)?.find((s) => s.area === area)?.score ?? null;
  const band = (diag?.profile as Record<string, string> | null)?.["PR-02"];
  const reference = band ? { value: normativeBenchmark(band).values[area], label: `Riferimento aziende ${bandText(band)}` } : null;
  return { diagnosticScore, reference };
}
