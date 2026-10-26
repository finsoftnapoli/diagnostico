import "server-only";
import type { InterestRow } from "@/components/InterestList";
import { AREAS } from "./questionnaire";
import { supabaseService } from "./supabase/server";

export interface AdminRow {
  id: string;
  completed_at: string;
  respondent_email: string | null;
  overall_score: number | null;
  source: string;
  profile: Record<string, string> | null;
  objectives: string[] | null;
  objectives_text: string | null;
  issues: string[] | null;
  issues_text: string | null;
  report_status: string;
  report_narrative?: Record<string, unknown> | null;
  companies: { name: string } | null;
  area_scores: { area: string; score: number | null; rank: number | null; is_priority: boolean }[];
  answers?: { question_id: string; level: number; check_answer: string | null; overestimate_flag: boolean }[];
}

const BASE =
  "id, completed_at, respondent_email, overall_score, source, profile, objectives, objectives_text, issues, issues_text, report_status, companies(name), area_scores(area, score, rank, is_priority)";

export async function listAssessments(withAnswers = false): Promise<AdminRow[]> {
  const select = withAnswers ? `${BASE}, answers(question_id, level, check_answer, overestimate_flag)` : BASE;
  const { data, error } = await supabaseService()
    .from("assessments")
    .select(select)
    .eq("status", "completed")
    .order("completed_at", { ascending: false })
    .limit(2000);
  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as AdminRow[];
}

export async function getAssessment(id: string): Promise<AdminRow | null> {
  const { data } = await supabaseService()
    .from("assessments")
    .select(`${BASE}, report_narrative, answers(question_id, level, check_answer, overestimate_flag)`)
    .eq("id", id)
    .maybeSingle();
  return (data as unknown as AdminRow) ?? null;
}

export const priorities = (r: AdminRow) =>
  [...r.area_scores]
    .filter((s) => s.is_priority)
    .sort((a, b) => (a.rank ?? 9) - (b.rank ?? 9))
    .map((s) => AREAS.find((a) => a.code === s.area)?.name ?? s.area);

export const scoreOf = (r: AdminRow, area: string) => r.area_scores.find((s) => s.area === area)?.score ?? null;

export async function listInterests() {
  const { data } = await supabaseService()
    .from("interests")
    .select("id, created_at, kind, area, contact_email, assessment_id, handled_at, companies(name)")
    .order("created_at", { ascending: false })
    .limit(300);
  return (data ?? []).map((r) => ({
    ...r,
    company: (r.companies as unknown as { name: string } | null)?.name ?? null,
  })) as unknown as InterestRow[];
}

/** Report generati in attesa di revisione: diagnostici e moduli. */
export async function listToReview() {
  const db = supabaseService();
  const [{ data: d }, { data: m }] = await Promise.all([
    db.from("assessments").select("id, completed_at, respondent_email, companies(name)").eq("report_status", "review").order("completed_at"),
    db.from("module_assessments").select("id, completed_at, area, companies(name)").eq("report_status", "review").order("completed_at"),
  ]);
  const name = (c: unknown) => (c as { name: string } | null)?.name ?? "—";
  return [
    ...(d ?? []).map((r) => ({ href: `/admin/${r.id}`, what: "Diagnostico", company: name(r.companies), date: r.completed_at as string })),
    ...(m ?? []).map((r) => ({
      href: `/admin/modulo/${r.id}`,
      what: `Modulo ${AREAS.find((a) => a.code === r.area)?.name ?? r.area}`,
      company: name(r.companies),
      date: r.completed_at as string,
    })),
  ].sort((a, b) => a.date.localeCompare(b.date));
}
