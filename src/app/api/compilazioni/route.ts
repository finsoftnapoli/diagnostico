// Registra una compilazione completata: verifica l'utente, ricalcola i punteggi nel server e salva tutto.
import { NextResponse } from "next/server";
import { BRAND } from "@/config/brand";
import { QUESTIONNAIRE_VERSION, QUESTIONS } from "@/lib/questionnaire";
import { incompleteReason, sanitizeResponses } from "@/lib/sanitize";
import { computeResult } from "@/lib/scoring";
import { supabaseServer, supabaseService } from "@/lib/supabase/server";

const ENGINE_VERSION = `motore-${QUESTIONNAIRE_VERSION}`;
const POLICY_VERSION = BRAND.privacyVersion;

export async function POST(request: Request) {
  const { data: auth } = await (await supabaseServer()).auth.getUser();
  const user = auth.user;
  if (!user) return NextResponse.json({ error: "Accesso richiesto" }, { status: 401 });

  let body: { responses?: unknown; source?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Richiesta non valida" }, { status: 400 });
  }
  const responses = sanitizeResponses(body.responses);
  const missing = incompleteReason(responses);
  if (missing) return NextResponse.json({ error: `Questionario incompleto: ${missing}` }, { status: 422 });
  const companyName = responses.profile["PR-11"] ?? "";
  const vatNumber = responses.profile["PR-10"] ?? null;
  if (!companyName) return NextResponse.json({ error: "Indica il nome dell'azienda" }, { status: 422 });
  const source = typeof body.source === "string" && body.source ? body.source.slice(0, 60) : "diretto";

  const db = supabaseService();
  const result = computeResult(responses);

  // azienda: (1) quella dell'invito, se l'utente ne è membro; (2) quella con la stessa partita IVA
  // di cui è amministratore; (3) altrimenti una nuova, di cui diventa amministratore
  let companyId: string | undefined;
  if (responses.context?.companyId) {
    const { data: m } = await db
      .from("company_members")
      .select("company_id")
      .eq("user_id", user.id)
      .eq("company_id", responses.context.companyId)
      .maybeSingle();
    companyId = m?.company_id as string | undefined;
  }
  if (!companyId && vatNumber) {
    const { data: own } = await db
      .from("company_members")
      .select("company_id, companies!inner(vat_number)")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .eq("companies.vat_number", vatNumber)
      .limit(1)
      .maybeSingle();
    companyId = own?.company_id as string | undefined;
  }
  if (!companyId) {
    const { data: company, error } = await db
      .from("companies")
      .insert({ name: companyName, vat_number: vatNumber, source, created_by: user.id })
      .select("id")
      .single();
    if (error) return fail("azienda", error);
    companyId = company.id as string;
    const { error: e2 } = await db.from("company_members").insert({ company_id: companyId, user_id: user.id, role: "admin" });
    if (e2) return fail("membro", e2);
  }

  const now = new Date().toISOString();
  const { data: assessment, error: e3 } = await db
    .from("assessments")
    .insert({
      company_id: companyId,
      user_id: user.id,
      respondent_email: user.email,
      questionnaire_version: QUESTIONNAIRE_VERSION,
      status: "completed",
      responses,
      profile: responses.profile,
      objectives: responses.objectives,
      objectives_text: responses.objectivesText || null,
      issues: responses.issues,
      issues_text: responses.issuesText || null,
      text_areas: responses.textAreas,
      overall_score: result.overall,
      source,
      completed_at: now,
    })
    .select("id")
    .single();
  if (e3) return fail("compilazione", e3);
  const assessmentId = assessment.id as string;

  const flagged = new Set(result.flags.map((f) => f.questionId));
  const { error: e4 } = await db.from("answers").insert(
    QUESTIONS.map((q) => ({
      assessment_id: assessmentId,
      question_id: q.id,
      area: q.area,
      level: responses.levels[q.id],
      check_answer: responses.checks[q.id] ?? null,
      overestimate_flag: flagged.has(q.id),
    })),
  );
  if (e4) return fail("risposte", e4, assessmentId);

  const { error: e5 } = await db.from("area_scores").insert(
    result.areas.map((a) => ({
      assessment_id: assessmentId,
      area: a.code,
      score: a.score,
      relevance: a.relevance,
      objectives_index: a.objectivesIndex,
      issues_index: a.issuesIndex,
      from_text: a.fromText,
      priority_index: a.priorityIndex,
      rank: a.rank,
      is_priority: a.isPriority,
      engine_version: ENGINE_VERSION,
    })),
  );
  if (e5) return fail("punteggi", e5, assessmentId);

  const { error: e6 } = await db.from("consents").insert(
    (["service", "benchmark", "marketing"] as const).map((purpose) => ({
      user_id: user.id,
      purpose,
      granted: responses.consents[purpose],
      policy_version: POLICY_VERSION,
    })),
  );
  if (e6) return fail("consensi", e6, assessmentId);

  // documenti caricati durante la compilazione: collegati all'utente, all'azienda e alla compilazione
  const docIds = [responses.documents?.visura, responses.documents?.bilancio].filter((x): x is string => !!x);
  if (docIds.length)
    await db
      .from("documents")
      .update({ assessment_id: assessmentId, user_id: user.id, company_id: companyId, linked_at: now })
      .in("id", docIds)
      .is("assessment_id", null);

  return NextResponse.json({ id: assessmentId, companyId, service: BRAND.name });
}

async function fail(what: string, error: { message: string }, assessmentId?: string) {
  console.error(`Salvataggio ${what} non riuscito:`, error.message);
  // niente compilazioni a metà: si elimina quanto scritto (risposte e punteggi seguono a cascata)
  if (assessmentId) await supabaseService().from("assessments").delete().eq("id", assessmentId);
  return NextResponse.json({ error: "Salvataggio non riuscito, riprova tra poco" }, { status: 500 });
}
