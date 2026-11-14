import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { moduleNarrativeProblem } from "./narrative-checks";
import { computeModule, type ModuleResponses } from "./module-scoring";
import { MODULE_QUESTIONS, ROADMAP_HORIZONS } from "./modules";
import { AREAS, ISSUES, OBJECTIVES } from "./questionnaire";
import { areaReading, levelEquivalent, levelMix } from "./score-meaning";
import { MODULE_SPEC } from "./narrative-spec";
import { assessRelease, REPORT_MODEL as MODEL } from "./release";
import { releaseChecks, type ReleaseVerdict } from "./release-checks";
import type { supabaseService } from "./supabase/server";
import type { AreaCode, Responses } from "./types";

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

const SYSTEM = `Sei un consulente di direzione italiano che scrive il report di un modulo di approfondimento su un singolo ambito di gestione di una PMI. Scrivi in italiano, tono executive, concreto, dando del "voi" all'azienda (gruppo di persone); se devi rivolgerti alla persona che legge, dalle del "Lei" (mai del "tu"), senza mescolare i due registri nella stessa frase.

REGOLE FERME:
- Scrivi il testo definitivo, mai un ragionamento a voce alta: niente domande retoriche, niente autocorrezioni ("… ? No: …"), niente numeri provvisori. Ogni numero compare una sola volta ed è quello esatto dell'input, riferito all'ambito o al tema giusto.
- Il modulo è un "Ottogramma" dell'ambito: 8 sotto-ambiti, ciascuno con 2-3 domande. Usa SOLO i dati forniti: punteggi dei sotto-ambiti, livelli di maturità per domanda (1-4, con la descrizione del livello attuale e di quello successivo), verifiche, note dell'azienda e contesto del diagnostico. Non inventare numeri, benchmark o fatti.
- I punteggi sono quelli forniti; non ricalcolarli.
- Se una verifica segnala una possibile sovrastima, dillo con tatto nella diagnosi del tema.
- Le domande "non applicabili" vanno omesse; un sotto-ambito senza domande applicabili va omesso.
- Le azioni devono essere specifiche, realizzabili da un'azienda di quella dimensione, e portare al livello successivo descritto.

COME PARLARE DEI PUNTEGGI (il lettore non sa cosa significhi "17"):
- Non scrivere mai un punteggio da solo o un confronto tra numeri. Traducilo in pratiche concrete: a quale livello sono i temi, cosa fa oggi l'azienda, cosa cambierebbe al livello successivo. Usa come base le letture già pronte (letturaModulo e, per ogni sotto-ambito, lettura), riformulandole.
- Puoi citare un punteggio al massimo una volta per sotto-ambito, e solo accanto al suo significato.
- I quattro livelli sono, in ordine: Informale, Base, Strutturato, Gestito e migliorato.

STRUTTURA (rispetta lo schema):
- summary: 2 paragrafi sullo stato dell'ambito, l'equilibrio tra i sotto-ambiti, i punti di forza e le debolezze che contano di più rispetto alle ambizioni e alle sfide dichiarate.
- themes: un elemento per ciascun sotto-ambito applicabile, NELLO STESSO ORDINE dell'input e con "theme" uguale al nome del sotto-ambito; diagnosis di 2-4 frasi che leggono insieme le sue domande; 1-3 azioni.
- roadmap: esattamente tre elementi, uno per orizzonte ("Primi 3 mesi", "Da 3 a 6 mesi", "Da 6 a 12 mesi"), con 2-4 interventi ciascuno, in sequenza logica: prima le basi, poi il resto.
- kpis: 4-6 indicatori da seguire, ciascuno con una breve indicazione di come misurarlo.
- closing: un paragrafo sul prossimo passo e, con misura, sul valore di un confronto con un esperto.`;

/** Genera il report di un modulo completato. Lancia un'eccezione se non riesce. */
/** Scrive il report del modulo e ne valuta il contenuto: l'esito dice se può partire senza revisione dello staff. */
export async function generateModuleReport(db: Db, moduleId: string): Promise<{ narrative: ModuleNarrative; verdict: ReleaseVerdict }> {
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
    letturaModulo:
      res.score === null
        ? null
        : `${res.score} su 100 corrisponde a ${levelEquivalent(res.score)}. ${levelMix(res.themes.filter((t) => t.level !== null).map((t) => t.level as number))}.`,
    punteggioAmbitoNelDiagnostico:
      (diag?.area_scores as { area: string; score: number | null }[] | undefined)?.find((s) => s.area === area)?.score ?? null,
    sottoAmbiti: res.subs.map((sa) => ({
      nome: sa.name,
      descrizione: sa.description,
      punteggio: sa.score,
      lettura: areaReading(
        sa.score,
        null,
        res.themes.filter((t) => t.sub === sa.code && t.level !== null).map((t) => t.level as number),
      ),
      domande: res.themes
        .map((t, i) => ({ t, q: qs[i] }))
        .filter(({ q }) => q.sub === sa.code)
        .map(({ t, q }) => ({
          tema: t.theme,
          domanda: q.text,
          applicabile: t.level !== null,
          livello: t.level,
          descrizioneLivelloAttuale: t.level ? q.levels[t.level - 1] : null,
          descrizioneLivelloSuccessivo: t.level && t.level < 4 ? q.levels[t.level] : null,
          verifica: q.check && t.level ? { domanda: q.check.text, risposta: r.checks[q.id] ?? null } : null,
          possibileSovrastima: t.flag,
        })),
    })),
    noteAzienda: r.notes || null,
    ambizioni: d ? { obiettivi: d.objectives.map((c) => label(OBJECTIVES, c)), testo: d.objectivesText || null } : null,
    sfide: d ? { criticita: d.issues.map((c) => label(ISSUES, c)), testo: d.issuesText || null } : null,
  };

  const client = new Anthropic();
  const applicable = res.subs.filter((sa) => sa.score !== null);
  const checks = { spec: MODULE_SPEC, input, company: input.azienda.nome };
  let problem = "";
  let feedback = "";
  // una risposta incompleta, o che non supera i controlli sul contenuto, si riscrive una volta con le correzioni richieste
  for (let attempt = 1; attempt <= 2; attempt++) {
    const msg = await client.messages.create({
      model: MODEL,
      max_tokens: 16000,
      system: SYSTEM,
      output_config: { effort: "medium", format: { type: "json_schema", schema: MODULE_NARRATIVE_SCHEMA } },
      messages: [
        {
          role: "user",
          content: `Ecco i dati del modulo di approfondimento. Scrivi il report.\n\n${JSON.stringify(input, null, 2)}${feedback}`,
        },
      ],
    } as Anthropic.MessageCreateParamsNonStreaming);
    if (msg.stop_reason === "refusal" || msg.stop_reason === "max_tokens") throw new Error(`stop_reason ${msg.stop_reason}`);
    const text = msg.content.find((b) => b.type === "text");
    if (!text || text.type !== "text") throw new Error("risposta senza testo");
    const n = JSON.parse(text.text) as ModuleNarrative;

    // i nomi dei sotto-ambiti e gli orizzonti restano quelli del modulo, nell'ordine previsto
    n.themes = applicable.map((sa, i) => {
      const found = (n.themes ?? []).find((x) => x.theme === sa.name) ?? n.themes?.[i];
      return { theme: sa.name, diagnosis: found?.diagnosis ?? "", actions: found?.actions ?? [] };
    });
    n.roadmap = ROADMAP_HORIZONS.map((h, i) => ({
      horizon: h,
      actions: ((n.roadmap ?? []).find((x) => x.horizon === h) ?? n.roadmap?.[i])?.actions ?? [],
    }));
    problem = moduleNarrativeProblem(n);
    if (problem) {
      console.warn(`Report del modulo incompleto (tentativo ${attempt}): ${problem}`);
      feedback = `\n\nUna versione precedente era incompleta (${problem}): scrivi tutte le sezioni per intero.`;
      continue;
    }
    const blocking = releaseChecks({ ...checks, narrative: n }).blocking;
    if (blocking.length && attempt === 1) {
      console.warn(`Report del modulo da correggere: ${blocking.join(" | ")}`);
      feedback = `\n\nUna versione precedente aveva questi problemi, da evitare nella nuova:\n- ${blocking.join("\n- ")}`;
      continue;
    }
    return { narrative: n, verdict: await assessRelease({ ...checks, narrative: n }) };
  }
  throw new Error(`report incompleto: ${problem}`);
}
