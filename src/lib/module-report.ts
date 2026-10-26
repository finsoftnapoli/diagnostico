import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { computeModule, type ModuleResponses } from "./module-scoring";
import { MODULE_QUESTIONS, ROADMAP_HORIZONS } from "./modules";
import { AREAS, ISSUES, OBJECTIVES } from "./questionnaire";
import type { supabaseService } from "./supabase/server";
import type { AreaCode, Responses } from "./types";

const MODEL = "claude-sonnet-5-5";
type Db = ReturnType<typeof supabaseService>;

export interface ModuleNarrative {
  summary: string;
  themes: { theme: string; diagnosis: string; actions: string[] }[];
  roadmap: { horizon: string; actions: string[] }[];
  kpis: string[];
  closing: string;
}

export const MODULE_NARRATIVE_SCHEMA = {
  type: "object",
  properties: {
    summary: { type: "string" },
    themes: {
      type: "array",
      items: {
        type: "object",
        properties: { theme: { type: "string" }, diagnosis: { type: "string" }, actions: { type: "array", items: { type: "string" } } },
        required: ["theme", "diagnosis", "actions"],
        additionalProperties: false,
      },
    },
    roadmap: {
      type: "array",
      items: {
        type: "object",
        properties: { horizon: { type: "string", enum: ROADMAP_HORIZONS }, actions: { type: "array", items: { type: "string" } } },
        required: ["horizon", "actions"],
        additionalProperties: false,
      },
    },
    kpis: { type: "array", items: { type: "string" } },
    closing: { type: "string" },
  },
  required: ["summary", "themes", "roadmap", "kpis", "closing"],
  additionalProperties: false,
} as const;

const SYSTEM = `Sei un consulente di direzione italiano che scrive il report di un modulo di approfondimento su un singolo ambito di gestione di una PMI. Scrivi in italiano, tono executive, concreto, dando del "voi" all'azienda.

REGOLE FERME:
- Usa SOLO i dati forniti: livelli di maturità per tema (1-4, con la descrizione del livello attuale e di quello successivo), verifiche, note dell'azienda e contesto del diagnostico. Non inventare numeri, benchmark o fatti.
- I punteggi sono quelli forniti; non ricalcolarli.
- Se una verifica segnala una possibile sovrastima, dillo con tatto nella diagnosi del tema.
- I temi "non applicabili" vanno omessi.
- Le azioni devono essere specifiche, realizzabili da un'azienda di quella dimensione, e portare al livello successivo descritto.

STRUTTURA (rispetta lo schema):
- summary: 2 paragrafi sullo stato dell'ambito, i punti di forza e le debolezze che contano di più rispetto alle ambizioni e alle sfide dichiarate.
- themes: un elemento per ciascun tema applicabile, NELLO STESSO ORDINE dell'input e con lo stesso nome del tema; diagnosis di 2-4 frasi; 1-3 azioni.
- roadmap: esattamente tre elementi, uno per orizzonte ("Primi 3 mesi", "Da 3 a 6 mesi", "Da 6 a 12 mesi"), con 2-4 interventi ciascuno, in sequenza logica: prima le basi, poi il resto.
- kpis: 4-6 indicatori da seguire, ciascuno con una breve indicazione di come misurarlo.
- closing: un paragrafo sul prossimo passo e, con misura, sul valore di un confronto con un esperto.`;

/** Genera il report di un modulo completato. Lancia un'eccezione se non riesce. */
export async function generateModuleReport(db: Db, moduleId: string): Promise<ModuleNarrative> {
  const { data: m } = await db
    .from("module_assessments")
    .select("id, user_id, company_id, area, responses, companies(name)")
    .eq("id", moduleId)
    .single();
  if (!m) throw new Error("modulo non trovato");
  const area = m.area as AreaCode;
  const r = m.responses as ModuleResponses;
  const res = computeModule(area, r);
  const qs = MODULE_QUESTIONS[area];

  // contesto dal diagnostico più recente della stessa azienda
  const { data: diag } = await db
    .from("assessments")
    .select("responses, area_scores(area, score)")
    .eq("company_id", m.company_id)
    .eq("status", "completed")
    .order("completed_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  const d = diag?.responses as Responses | undefined;
  const label = (list: { code: string; label: string }[], c: string) => list.find((x) => x.code === c)?.label ?? c;

  const input = {
    azienda: {
      nome: (m.companies as unknown as { name: string } | null)?.name ?? null,
      settore: d?.profile["PR-01"] ?? null,
      fatturato: d?.profile["PR-02"] ?? null,
      addetti: d?.profile["PR-03"] ?? null,
    },
    ambito: AREAS.find((a) => a.code === area)?.name,
    punteggioModulo: res.score,
    punteggioAmbitoNelDiagnostico: (diag?.area_scores as { area: string; score: number | null }[] | undefined)?.find((s) => s.area === area)?.score ?? null,
    temi: res.themes.map((t, i) => ({
      tema: t.theme,
      domanda: qs[i].text,
      applicabile: t.level !== null,
      livello: t.level,
      descrizioneLivelloAttuale: t.level ? qs[i].levels[t.level - 1] : null,
      descrizioneLivelloSuccessivo: t.level && t.level < 4 ? qs[i].levels[t.level] : null,
      verifica: qs[i].check && t.level ? { domanda: qs[i].check!.text, risposta: r.checks[qs[i].id] ?? null } : null,
      possibileSovrastima: t.flag,
    })),
    noteAzienda: r.notes || null,
    ambizioni: d ? { obiettivi: d.objectives.map((c) => label(OBJECTIVES, c)), testo: d.objectivesText || null } : null,
    sfide: d ? { criticita: d.issues.map((c) => label(ISSUES, c)), testo: d.issuesText || null } : null,
  };

  const client = new Anthropic();
  const msg = await client.messages.create({
    model: MODEL,
    max_tokens: 5000,
    system: SYSTEM,
    output_config: { effort: "medium", format: { type: "json_schema", schema: MODULE_NARRATIVE_SCHEMA } },
    messages: [{ role: "user", content: `Ecco i dati del modulo di approfondimento. Scrivi il report.\n\n${JSON.stringify(input, null, 2)}` }],
  } as Anthropic.MessageCreateParamsNonStreaming);
  if (msg.stop_reason === "refusal" || msg.stop_reason === "max_tokens") throw new Error(`stop_reason ${msg.stop_reason}`);
  const text = msg.content.find((b) => b.type === "text");
  if (!text || text.type !== "text") throw new Error("risposta senza testo");
  const n = JSON.parse(text.text) as ModuleNarrative;

  // i nomi dei temi e gli orizzonti restano quelli del modulo, nell'ordine previsto
  const applicable = res.themes.filter((t) => t.level !== null);
  n.themes = applicable.map((t, i) => {
    const found = n.themes.find((x) => x.theme === t.theme) ?? n.themes[i];
    return { theme: t.theme, diagnosis: found?.diagnosis ?? "", actions: found?.actions ?? [] };
  });
  n.roadmap = ROADMAP_HORIZONS.map((h, i) => ({ horizon: h, actions: (n.roadmap.find((x) => x.horizon === h) ?? n.roadmap[i])?.actions ?? [] }));
  return n;
}
