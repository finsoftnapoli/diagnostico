// Esporta tutte le compilazioni in CSV (separatore ";" per Excel in italiano).
import { listAssessments, priorities, scoreOf } from "@/lib/admin";
import { AREAS, PROFILE_FIELDS, QUESTIONS } from "@/lib/questionnaire";
import { currentUser } from "@/lib/supabase/server";

export async function GET() {
  const { user, isStaff } = await currentUser();
  if (!user || !isStaff) return new Response("Accesso riservato", { status: 403 });
  const rows = await listAssessments(true);
  const header = [
    "id", "data", "azienda", "email", "provenienza",
    ...PROFILE_FIELDS.map((f) => f.label),
    "obiettivi", "testo obiettivi", "criticità", "testo criticità", "media",
    ...AREAS.map((a) => `punteggio ${a.code}`),
    "priorità",
    ...QUESTIONS.map((q) => `livello ${q.id}`),
    ...QUESTIONS.map((q) => `verifica ${q.id}`),
    "segnali di sovrastima",
  ];
  const lines = rows.map((r) => {
    const ans = (id: string) => r.answers?.find((a) => a.question_id === id);
    return [
      r.id, r.completed_at, r.companies?.name, r.respondent_email, r.source,
      ...PROFILE_FIELDS.map((f) => r.profile?.[f.id]),
      (r.objectives ?? []).join(", "), r.objectives_text, (r.issues ?? []).join(", "), r.issues_text, r.overall_score,
      ...AREAS.map((a) => scoreOf(r, a.code)),
      priorities(r).join(", "),
      ...QUESTIONS.map((q) => ans(q.id)?.level),
      ...QUESTIONS.map((q) => ans(q.id)?.check_answer),
      (r.answers ?? []).filter((a) => a.overestimate_flag).map((a) => a.question_id).join(", "),
    ];
  });
  const csv = "﻿" + [header, ...lines].map((l) => l.map(cell).join(";")).join("\r\n");
  const day = new Date().toISOString().slice(0, 10);
  return new Response(csv, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="compilazioni-${day}.csv"`,
      "cache-control": "no-store",
    },
  });
}

function cell(v: unknown) {
  if (v === null || v === undefined) return "";
  const s = String(v);
  return /[";\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}
