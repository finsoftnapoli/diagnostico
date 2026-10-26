import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { normativeBenchmark, type Benchmark } from "@/config/benchmark";
import type { ReportInputs } from "./company-docs";
import { financialKpis, type PlanSummary } from "./documents";
import { buildInsights, levelLabel } from "./insights";
import { AREAS } from "./questionnaire";
import { computeResult } from "./scoring";
import { NARRATIVE_SCHEMA, type ReportNarrative } from "./report";
import type { Responses } from "./types";

const MODEL = "claude-sonnet-5-5";

/** Dati, già calcolati, da passare al modello: niente di nuovo viene inventato. */
const planInput = (p: PlanSummary) => ({
  titolo: p.titolo,
  periodo: p.periodo,
  sintesi: p.sintesi,
  obiettivi: p.obiettivi,
  iniziative: p.iniziative,
  investimenti: p.investimenti,
  rischi: p.rischi,
  ambitiToccati: p.ambiti,
});

function buildInput(r0: Responses, bench: Benchmark, docs: ReportInputs | null) {
  // un bilancio più recente o la governance dell'ultima visura sostituiscono quelli della compilazione
  const r: Responses = {
    ...r0,
    ...(docs?.financials ? { financials: docs.financials } : {}),
    ...(docs?.governance ? { governance: docs.governance } : {}),
  };
  const res = computeResult(r);
  const ins = buildInsights(r, res, bench);
  const kpis = r.financials ? financialKpis(r.financials) : null;
  return {
    azienda: {
      ragioneSociale: r.profile["PR-11"] ?? null,
      settore: r.profile["PR-01"] ?? null,
      fatturato: r.profile["PR-02"] ?? null,
      addetti: r.profile["PR-03"] ?? null,
      assettoControllo: r.profile["PR-07"] ?? null,
    },
    punteggioComplessivo: ins.overall,
    riferimentoFascia: ins.benchmarkAvg,
    ambiti: res.areas.map((a) => ({
      codice: a.code,
      nome: a.name,
      punteggio: a.score,
      livello: levelLabel(a.score),
      riferimento: bench.values[a.code],
      priorita: a.isPriority ? a.rank : null,
    })),
    priorita: res.priorities.map((p) => ({
      codice: p.code,
      nome: p.name,
      punteggio: p.score,
      motivi: p.reasons,
      primiPassi: (ins.nextSteps.find((n) => n.area === p.code)?.steps ?? []).map((t) => ({
        tema: t.theme,
        oggi: t.current,
        prossimoLivello: t.next,
        notaDimensione: t.sizeNote,
      })),
    })),
    prontezzaObiettivi: ins.readiness.map((x) => ({ obiettivo: x.label, punteggio: x.score, giudizio: x.verdict })),
    causeSfide: ins.issueCauses.map((c) => ({ sfida: c.label, cause: c.causes.map((t) => `${t.theme} (livello ${t.level})`) })),
    puntiForti: ins.strengths.slice(0, 5).map((t) => `${t.theme} (livello ${t.level})`),
    possibiliSovrastime: res.flags.map((f) => f.message),
    ambizioniTesto: r.objectivesText || null,
    sfideTesto: r.issuesText || null,
    bilancio: kpis
      ? {
          esercizio: r.financials?.year ?? null,
          margineEbitdaPct: kpis.ebitdaMargin,
          margineNettoPct: kpis.netMargin,
          pfnSuEbitda: kpis.pfnOnEbitda,
          patrimonioSuAttivoPct: kpis.equityRatio,
          giorniIncasso: kpis.dso,
          note: kpis.notes,
        }
      : null,
    governance: r.governance ?? null,
    pianoAziendale: docs?.plan ? planInput(docs.plan) : null,
    altriDocumenti: docs?.others?.length ? docs.others.map(planInput) : null,
  };
}

const SYSTEM = `Sei un consulente di direzione italiano che scrive il report di approfondimento di un diagnostico gestionale per una PMI. Scrivi in italiano, con tono executive, concreto e rispettoso, come un senior advisor. Dai del "voi" all'azienda.

REGOLE FERME:
- Usa SOLO i dati forniti nell'input. Non inventare numeri, percentuali, nomi di concorrenti o medie di settore. I punteggi e il riferimento di fascia sono quelli forniti.
- Se un dato manca (per esempio il bilancio), non farne cenno come se ci fosse.
- Il riferimento di fascia è un valore indicativo di aziende ben gestite della stessa dimensione, non una media reale: trattalo come tale.
- Non è una consulenza formale né un rating: è un'analisi orientativa. Non promettere risultati.
- Collega gli ambiti deboli alle ambizioni e alle sfide dichiarate dall'azienda, usando i testi liberi quando ci sono.
- Se c'è un piano aziendale (pianoAziendale), confronta i suoi obiettivi e le sue iniziative con la prontezza emersa dal diagnostico: dove il piano chiede capacità che oggi risultano deboli, dillo con chiarezza. Riporta i valori del piano solo come scritti nell'input.
- Gli altri documenti (altriDocumenti) sono contesto: usali solo se pertinenti.

STRUTTURA (rispetta lo schema):
- executiveSummary: 2-3 paragrafi che inquadrano lo stato complessivo, l'equilibrio del profilo e il legame con ambizioni e sfide.
- crossCutting: osservazioni trasversali (squilibri tra ambiti, effetti a catena, prontezza rispetto agli obiettivi).
- priorities: per ciascuna priorità, una diagnosi del perché conta per QUESTA azienda e 2-4 azioni concrete, specifiche, realizzabili nella sua dimensione.
- quickWins: 2-4 interventi rapidi e a basso costo da avviare subito.
- closing: un paragrafo che indica il prossimo passo e, con misura, il valore di un confronto con un esperto.`;

/** Genera il report approfondito. Lancia un'eccezione se non riesce (il chiamante segna 'failed'). */
export async function generateNarrative(r: Responses, docs: ReportInputs | null = null): Promise<ReportNarrative> {
  const bench = normativeBenchmark(r.profile["PR-02"]);
  const input = buildInput(r, bench, docs);
  const client = new Anthropic();
  const msg = await client.messages.create({
    model: MODEL,
    max_tokens: 4000,
    system: SYSTEM,
    output_config: { effort: "medium", format: { type: "json_schema", schema: NARRATIVE_SCHEMA } },
    messages: [{ role: "user", content: `Ecco i dati del diagnostico. Scrivi il report.\n\n${JSON.stringify(input, null, 2)}` }],
  } as Anthropic.MessageCreateParamsNonStreaming);
  if (msg.stop_reason === "refusal" || msg.stop_reason === "max_tokens") throw new Error(`stop_reason ${msg.stop_reason}`);
  const text = msg.content.find((b) => b.type === "text");
  if (!text || text.type !== "text") throw new Error("risposta senza testo");
  const narrative = JSON.parse(text.text) as ReportNarrative;
  // tiene solo priorità su ambiti validi
  const codes = new Set(AREAS.map((a) => a.code));
  narrative.priorities = (narrative.priorities ?? []).filter((p) => codes.has(p.area));
  return narrative;
}
