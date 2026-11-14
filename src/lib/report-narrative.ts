import { recommendationFor } from "@/config/recommendations";
import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { narrativeProblem } from "./narrative-checks";
import { normativeBenchmark, type Benchmark } from "@/config/benchmark";
import type { ReportInputs } from "./company-docs";
import { financialKpis, type PlanSummary } from "./documents";
import { buildInsights, levelLabel } from "./insights";
import { AREAS } from "./questionnaire";
import { computeResult } from "./scoring";
import { areaReading, overallReading } from "./score-meaning";
import { NARRATIVE_SCHEMA, type ReportNarrative } from "./report";
import { DIAGNOSTIC_SPEC } from "./narrative-spec";
import { assessRelease, REPORT_MODEL as MODEL } from "./release";
import { releaseChecks, type ReleaseVerdict } from "./release-checks";
import type { Responses } from "./types";

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
    letturaPunteggioComplessivo: overallReading(
      ins.overall,
      ins.benchmarkAvg,
      ins.themes.map((t) => t.level),
    ).join(" "),
    ambiti: res.areas.map((a) => {
      const levels = ins.themes.filter((t) => t.area === a.code).map((t) => t.level);
      return {
        codice: a.code,
        nome: a.name,
        punteggio: a.score,
        livello: levelLabel(a.score),
        riferimento: bench.values[a.code],
        lettura: areaReading(a.score, bench.values[a.code], levels),
        priorita: a.isPriority ? a.rank : null,
      };
    }),
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
        schedaDiMetodo: methodCard(t.id, t.level),
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

/** La scheda della libreria delle raccomandazioni per il passaggio al livello successivo, nei termini usati nel prompt. */
function methodCard(theme: string, level: number) {
  const c = recommendationFor(theme, level);
  return c
    ? {
        obiettivo: c.title,
        passi: c.actions,
        strumento: c.tool,
        comeCapireSeFunziona: c.indicator,
        tempoTipico: c.time,
        erroreDaEvitare: c.pitfall,
      }
    : null;
}

const SYSTEM = `Sei un consulente di direzione italiano che scrive il report di approfondimento di un diagnostico gestionale per una PMI. Scrivi in italiano, con tono executive, concreto e rispettoso, come un senior advisor. Dai del "voi" all'azienda (gruppo di persone); se devi rivolgerti alla persona che legge, dalle del "Lei" (mai del "tu"), senza mescolare i due registri nella stessa frase.

REGOLE FERME:
- Usa SOLO i dati forniti nell'input. Non inventare numeri, percentuali, nomi di concorrenti o medie di settore. I punteggi e il riferimento di fascia sono quelli forniti.
- Se un dato manca (per esempio il bilancio), non farne cenno come se ci fosse.
- Scrivi il testo definitivo, mai un ragionamento a voce alta: niente domande retoriche, niente autocorrezioni ("… ? No: …"), niente numeri provvisori. Ogni numero compare una sola volta ed è quello esatto dell'input, riferito all'ambito o al tema giusto.
- Il riferimento di fascia è un valore indicativo di aziende ben gestite della stessa dimensione, non una media reale: trattalo come tale.
- Non è una consulenza formale né un rating: è un'analisi orientativa. Non promettere risultati.
- Collega gli ambiti deboli alle ambizioni e alle sfide dichiarate dall'azienda, usando i testi liberi quando ci sono.
- Se c'è un piano aziendale (pianoAziendale), confronta i suoi obiettivi e le sue iniziative con la prontezza emersa dal diagnostico: dove il piano chiede capacità che oggi risultano deboli, dillo con chiarezza. Riporta i valori del piano solo come scritti nell'input.
- Gli altri documenti (altriDocumenti) sono contesto: usali solo se pertinenti.

COME PARLARE DEI PUNTEGGI (importante: il lettore non sa cosa significhi "22"):
- Non scrivere mai un punteggio da solo o un confronto tra numeri ("22 contro 45"). Traducilo sempre in pratiche concrete: a quale livello di maturità sono i temi, cosa fa oggi l'azienda, cosa cambierebbe al livello successivo.
- Usa le letture già pronte (letturaPunteggioComplessivo e, per ogni ambito, lettura) e le descrizioni dei temi (oggi, prossimoLivello) come base: riformulale con parole tue, non copiarle.
- Puoi citare un punteggio al massimo una volta per ambito, e solo accanto al suo significato (per esempio: "Finanza e controllo è a 11 su 100: tutti e tre i temi sono ancora informali, a partire dal budget").
- La distanza dal riferimento si esprime in passi concreti ("servirebbe portare budget e previsione di cassa al livello successivo"), non in punti.
- I quattro livelli sono, in ordine: Informale, Base, Strutturato, Gestito e migliorato.

STRUTTURA (rispetta lo schema):
- executiveSummary: 2-3 paragrafi che inquadrano lo stato complessivo, l'equilibrio del profilo e il legame con ambizioni e sfide.
- crossCutting: osservazioni trasversali (squilibri tra ambiti, effetti a catena, prontezza rispetto agli obiettivi).
- priorities: per ciascuna priorità, una diagnosi del perché conta per QUESTA azienda e 2-4 azioni concrete, specifiche, realizzabili nella sua dimensione. Dove i primi passi hanno una schedaDiMetodo, parti da lì: è il metodo dei nostri esperti per salire di un livello su quel tema. Adattala all'azienda (dimensione, settore, ambizioni, parole dei testi liberi), scegli i passi che servono davvero e non copiarla alla lettera; non nominarla e non citare norme o incentivi.
- quickWins: 2-4 interventi rapidi e a basso costo da avviare subito.
- closing: un paragrafo che indica il prossimo passo e, con misura, il valore di un confronto con un esperto.`;

/** Genera il report approfondito. Lancia un'eccezione se non riesce (il chiamante segna 'failed'). */
/** Scrive il report e ne valuta il contenuto: l'esito dice se può partire senza revisione dello staff. */
export async function generateNarrative(
  r: Responses,
  docs: ReportInputs | null = null,
): Promise<{ narrative: ReportNarrative; verdict: ReleaseVerdict }> {
  const bench = normativeBenchmark(r.profile["PR-02"]);
  const input = buildInput(r, bench, docs);
  const expected = computeResult(r).priorities.map((p) => p.code);
  const labels = Object.fromEntries(AREAS.map((a) => [a.code, a.name]));
  const checks = { spec: DIAGNOSTIC_SPEC, input, expected: { priorities: expected }, labels, company: r.profile["PR-11"] ?? null };
  const client = new Anthropic();
  let problem = "";
  let feedback = "";
  // una risposta incompleta, o che non supera i controlli sul contenuto, si riscrive una volta con le correzioni richieste
  for (let attempt = 1; attempt <= 2; attempt++) {
    const msg = await client.messages.create({
      model: MODEL,
      max_tokens: 16000,
      system: SYSTEM,
      output_config: { effort: "medium", format: { type: "json_schema", schema: NARRATIVE_SCHEMA } },
      messages: [
        { role: "user", content: `Ecco i dati del diagnostico. Scrivi il report.\n\n${JSON.stringify(input, null, 2)}${feedback}` },
      ],
    } as Anthropic.MessageCreateParamsNonStreaming);
    if (msg.stop_reason === "refusal" || msg.stop_reason === "max_tokens") throw new Error(`stop_reason ${msg.stop_reason}`);
    const text = msg.content.find((b) => b.type === "text");
    if (!text || text.type !== "text") throw new Error("risposta senza testo");
    const narrative = JSON.parse(text.text) as ReportNarrative;
    // tiene solo priorità su ambiti validi
    const codes = new Set(AREAS.map((a) => a.code));
    narrative.priorities = (narrative.priorities ?? []).filter((p) => codes.has(p.area));
    problem = narrativeProblem(narrative, expected);
    if (problem) {
      console.warn(`Report incompleto (tentativo ${attempt}): ${problem}`);
      feedback = `\n\nUna versione precedente era incompleta (${problem}): scrivi tutte le sezioni per intero.`;
      continue;
    }
    const blocking = releaseChecks({ ...checks, narrative }).blocking;
    if (blocking.length && attempt === 1) {
      console.warn(`Report da correggere: ${blocking.join(" | ")}`);
      feedback = `\n\nUna versione precedente aveva questi problemi, da evitare nella nuova:\n- ${blocking.join("\n- ")}`;
      continue;
    }
    return { narrative, verdict: await assessRelease({ ...checks, narrative }) };
  }
  throw new Error(`report incompleto: ${problem}`);
}
