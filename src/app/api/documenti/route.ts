// Legge un PDF già caricato nell'archivio privato con Claude.
// - Durante la compilazione (visura, bilancio): restituisce i dati per precompilare il profilo.
// - Dall'area personale (anche business plan e altri documenti): archivia il documento per l'azienda.
// Il file resta nell'archivio privato; nel database solo dati dell'azienda, mai nomi di persone.
import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import {
  BILANCIO_SCHEMA,
  financialsFrom,
  governanceFrom,
  isDocKind,
  peopleFrom,
  PLAN_SCHEMA,
  planSummaryFrom,
  profileFrom,
  PROMPTS,
  VISURA_SCHEMA,
  type AnyDocKind,
  type BilancioData,
  type PlanData,
  type VisuraData,
} from "@/lib/documents";
import { isHuman } from "@/lib/human";
import { companyOfMember } from "@/lib/supabase/membership";
import { supabaseServer, supabaseService } from "@/lib/supabase/server";
import { normalizeVat } from "@/lib/vat";

export const maxDuration = 60;
const MODEL = "claude-sonnet-5-5";
/** Documenti caricabili dall'area personale per utente nelle ultime 24 ore. */
const DAILY_LIMIT = 20;
const UUID = "[0-9a-f-]{36}";
/** Documenti letti in tutto il servizio, durante le compilazioni, in un'ora. */
const ANON_HOURLY_LIMIT = 150;

const SCHEMAS = { visura: VISURA_SCHEMA, bilancio: BILANCIO_SCHEMA, business_plan: PLAN_SCHEMA, altro: PLAN_SCHEMA };

async function extract(kind: AnyDocKind, pdf: Buffer): Promise<unknown> {
  const client = new Anthropic();
  const msg = await client.messages.create({
    model: MODEL,
    max_tokens: 3000,
    output_config: { effort: "low", format: { type: "json_schema", schema: SCHEMAS[kind] } },
    messages: [
      {
        role: "user",
        content: [
          { type: "document", source: { type: "base64", media_type: "application/pdf", data: pdf.toString("base64") } },
          { type: "text", text: PROMPTS[kind] },
        ],
      },
    ],
  } as Anthropic.MessageCreateParamsNonStreaming);
  if (msg.stop_reason === "refusal" || msg.stop_reason === "max_tokens") throw new Error(`stop_reason ${msg.stop_reason}`);
  const text = msg.content.find((b) => b.type === "text");
  if (!text || text.type !== "text") throw new Error("risposta senza testo");
  return JSON.parse(text.text);
}

const json = (body: object, status = 200) => NextResponse.json(body, { status });

export async function POST(request: Request) {
  if (!process.env.ANTHROPIC_API_KEY) return json({ error: "Lettura dei documenti non ancora attiva" }, 503);
  const body = (await request.json().catch(() => ({}))) as { tipo?: unknown; path?: unknown; companyId?: unknown; label?: unknown };
  const tipo = body.tipo;
  const path = typeof body.path === "string" ? body.path : "";
  if (!isDocKind(tipo)) return json({ error: "Tipo di documento non valido" }, 400);

  // modalità e controlli di accesso
  const area = typeof body.companyId === "string" ? body.companyId : null;
  let userId: string | null = null;
  let company: Awaited<ReturnType<typeof companyOfMember>> = null;
  const db = supabaseService();
  if (area) {
    const { data: auth } = await (await supabaseServer()).auth.getUser();
    if (!auth.user) return json({ error: "Accesso richiesto" }, 401);
    userId = auth.user.id;
    company = await companyOfMember(userId, area);
    if (!company) return json({ error: "Azienda non trovata" }, 404);
    if (!new RegExp(`^aziende/${company.id}/\\d{4}-\\d{2}-\\d{2}/${UUID}-${tipo}\\.pdf$`).test(path))
      return json({ error: "Documento non valido" }, 400);
    const since = new Date(Date.now() - 24 * 3600 * 1000).toISOString();
    const { count } = await db.from("documents").select("id", { count: "exact", head: true }).eq("user_id", userId).gte("created_at", since);
    if ((count ?? 0) >= DAILY_LIMIT) return json({ error: "Hai raggiunto il limite di documenti per oggi: riprova domani" }, 429);
  } else {
    if (!isHuman(request)) return json({ error: "Verifica di sicurezza scaduta: ricarica la pagina" }, 403);
    if (tipo !== "visura" && tipo !== "bilancio") return json({ error: "Tipo di documento non valido" }, 400);
    if (!new RegExp(`^in-attesa/\\d{4}-\\d{2}-\\d{2}/${UUID}-${tipo}\\.pdf$`).test(path)) return json({ error: "Documento non valido" }, 400);
    // freno di sicurezza sui costi: troppi documenti anonimi nell'ultima ora
    const hourAgo = new Date(Date.now() - 3600 * 1000).toISOString();
    const { count } = await db.from("documents").select("id", { count: "exact", head: true }).is("user_id", null).gte("created_at", hourAgo);
    if ((count ?? 0) >= ANON_HOURLY_LIMIT) return json({ error: "Servizio di lettura momentaneamente occupato: compila i campi a mano o riprova più tardi" }, 429);
  }

  const { data: blob, error: dlError } = await db.storage.from("documenti").download(path);
  if (dlError || !blob) return json({ error: "Documento non trovato, ricaricalo" }, 404);
  const bytes = Buffer.from(await blob.arrayBuffer());
  // un file non archiviato non deve restare nell'archivio
  const discard = () => db.storage.from("documenti").remove([path]);
  if (bytes.subarray(0, 5).toString() !== "%PDF-") {
    await discard();
    return json({ error: "Il file deve essere un PDF" }, 415);
  }

  let data: unknown;
  try {
    data = await extract(tipo, bytes);
  } catch (err) {
    console.error("Lettura documento non riuscita:", err instanceof Error ? err.message : err);
    // dall'area personale business plan e altri documenti si archiviano anche senza lettura
    if (!(area && (tipo === "business_plan" || tipo === "altro"))) {
      await discard();
      return json({ error: "Non siamo riusciti a leggere il documento. Riprova o compila i campi a mano." }, 502);
    }
    data = null;
  }

  // dati salvabili (mai nomi di persone)
  let extracted: Record<string, unknown> | null = null;
  let period: number | null = null;
  let profile: Record<string, string> = {};
  let financials, governance, people, plan;
  if (data && (tipo === "visura" || tipo === "bilancio")) {
    profile = profileFrom(tipo, data as VisuraData | BilancioData);
    if (tipo === "bilancio") {
      financials = financialsFrom(data as BilancioData);
      period = financials.year;
    } else {
      governance = governanceFrom(data as VisuraData);
      people = peopleFrom(data as VisuraData);
    }
    const found = Object.keys(profile).length + (financials ? Object.values(financials).filter((v) => v !== null).length : 0);
    if (!found) {
      await discard();
      return json({ error: "Non siamo riusciti a leggere dati utili: il documento è una scansione?" }, 422);
    }
    // dall'area personale, un documento di un'altra azienda non si archivia
    if (company?.vat && profile["PR-10"] && normalizeVat(company.vat) !== profile["PR-10"]) {
      await discard();
      return json({ error: `Il documento riguarda un'altra azienda (partita IVA ${profile["PR-10"]}): caricalo per l'azienda giusta.` }, 422);
    }
    extracted = { profile, financials, governance };
  } else if (data) {
    plan = planSummaryFrom(data as PlanData);
    period = plan.periodo ? Number(plan.periodo.slice(0, 4)) : null;
    extracted = { plan };
  }

  const label = typeof body.label === "string" ? body.label.replace(/\s+/g, " ").trim().slice(0, 120) || null : null;
  const now = new Date().toISOString();
  const { data: doc, error } = await db
    .from("documents")
    .insert({
      kind: tipo,
      storage_path: path,
      size_bytes: bytes.length,
      extracted,
      period,
      label,
      ...(company ? { user_id: userId, company_id: company.id, linked_at: now } : {}),
    })
    .select("id")
    .single();
  if (error) {
    console.error("Archiviazione documento non riuscita:", error.message);
    await discard();
    return json({ error: "Archiviazione non riuscita, riprova tra poco" }, 500);
  }

  // dall'area personale non servono i campi del profilo né le persone
  if (company) return json({ documentId: doc.id, kind: tipo, period, read: !!data, financials, governance, plan });
  return json({ documentId: doc.id, kind: tipo, profile, financials, governance, people });
}
