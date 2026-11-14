"use client";

import {
  ArrowRight,
  Banknote,
  CircleCheck,
  Eye,
  Landmark,
  Footprints,
  Gauge,
  Info,
  Scale,
  Target,
  TriangleAlert,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { BRAND } from "@/config/brand";
import { recommendationFor, SOURCES } from "@/config/recommendations";
import { bandText, type Benchmark, medianBenchmark, normativeBenchmark, type RealBenchmark } from "@/config/benchmark";
import { AREA_SHORT, AreaIcon } from "@/lib/areaIcons";
import type { Draft } from "@/lib/draft";
import { financialKpis } from "@/lib/documents";
import { buildInsights, LEVEL_NAMES, levelLabel, type ThemeView } from "@/lib/insights";
import { AREAS } from "@/lib/questionnaire";
import { computeResult, relevanceLabel } from "@/lib/scoring";
import { areaReading, levelShort } from "@/lib/score-meaning";
import type { AreaCode } from "@/lib/types";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import type { Governance } from "@/lib/types";
import type { ReportNarrative } from "@/lib/report";
import { actionKey } from "@/lib/action-key";
import type { ShareScope } from "@/lib/share";
import AreaExplorer from "./AreaExplorer";
import Feedback from "./Feedback";
import InviteColleagues from "./InviteColleagues";
import Offers from "./Offers";
import PdfDownload from "./PdfDownload";
import PrintButton from "./PrintButton";
import Progress, { type PreviousResult } from "./Progress";
import RadarProfile from "./RadarProfile";
import ReportIndex, { type IndexItem } from "./ReportIndex";
import ScoreReading from "./ScoreReading";
import ShareReport from "./ShareReport";

const nameOf = (c: AreaCode) => AREAS.find((a) => a.code === c)?.name ?? c;

export default function Report({
  draft,
  narrative,
  sources = [],
  previous,
  reviewed = false,
  shared,
  doneActions = [],
}: {
  draft: Draft;
  /** Pagina condivisa in sola lettura: solo la sintesi oppure tutto il report. */
  shared?: ShareScope | "esempio";
  /** Chiavi delle azioni già segnate come fatte. */
  doneActions?: string[];
  narrative?: ReportNarrative | null;
  /** Vero se un esperto ha rivisto e approvato il report prima dell'invio. */
  reviewed?: boolean;
  /** Documenti archiviati di cui il report approfondito ha tenuto conto. */
  sources?: string[];
  /** Diagnostico precedente della stessa azienda, per mostrare i progressi. */
  previous?: PreviousResult;
}) {
  const r = draft.responses;
  const band = r.profile["PR-02"];
  const bench: Benchmark = useMemo(() => normativeBenchmark(band), [band]);
  const [market, setMarket] = useState<Benchmark | null>(null);

  // se il segmento ha abbastanza compilazioni reali, si usa la mediana
  useEffect(() => {
    if (!band) return;
    fetch(`/api/confronto?fascia=${encodeURIComponent(band)}`)
      .then((x) => (x.ok ? x.json() : null))
      .then((j: RealBenchmark | null) => {
        const real = medianBenchmark(j);
        if (real) setMarket(real);
      })
      .catch(() => {});
  }, [band]);

  const res = useMemo(() => computeResult(r), [r]);
  const ins = useMemo(() => buildInsights(r, res, bench), [r, res, bench]);
  const company = r.profile["PR-11"];
  const full = shared !== "sintesi";
  const [openArea, setOpenArea] = useState<AreaCode | null>(null);
  const [done, setDone] = useState<Set<string>>(() => new Set(doneActions));
  const canTick = !!narrative && (shared === "esempio" || (!!draft.savedId && !shared));
  function toggle(text: string) {
    if (!canTick) return;
    const key = actionKey(text);
    const on = !done.has(key);
    setDone((d) => {
      const n = new Set(d);
      if (on) n.add(key);
      else n.delete(key);
      return n;
    });
    if (!draft.savedId || shared) return;
    fetch(`/api/report/${draft.savedId}/azioni`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ key, done: on }),
    }).catch(() => {});
  }
  const allActions = narrative ? [...narrative.priorities.flatMap((p) => p.actions), ...narrative.quickWins] : [];
  const doneCount = allActions.filter((a) => done.has(actionKey(a))).length;
  const index: IndexItem[] = [
    { id: "quadro", label: "Il quadro" },
    ...(narrative ? [{ id: "sintesi", label: "Sintesi" }] : []),
    { id: "priorita", label: "Priorità" },
    ...(narrative?.quickWins.length ? [{ id: "rapidi", label: "Interventi rapidi" }] : []),
    ...(full && ins.readiness.length ? [{ id: "ambizioni", label: "Ambizioni" }] : []),
    ...(full && ins.issueCauses.length ? [{ id: "sfide", label: "Sfide" }] : []),
    ...(full && r.financials ? [{ id: "numeri", label: "Numeri" }] : []),
    ...(full ? [{ id: "dettaglio", label: "Dettaglio" }] : []),
  ];
  const date = draft.completedAt
    ? new Date(draft.completedAt).toLocaleDateString("it-IT", { day: "numeric", month: "long", year: "numeric", timeZone: "Europe/Rome" })
    : "";

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      {shared && (
        <p className="mb-6 flex items-start gap-2 rounded-xl bg-paper px-4 py-3 text-sm">
          <Eye className="size-4 mt-0.5 shrink-0 text-navy" aria-hidden />
          {shared === "esempio" ? (
            <span>
              <strong className="text-navy">Report di esempio.</strong> L&apos;azienda è di fantasia: serve a mostrare che cosa riceve dopo
              il diagnostico. Provi a scegliere un ambito sull&apos;{BRAND.reportName} e a spuntare le azioni.
            </span>
          ) : (
            <span>
              <strong className="text-navy">{shared === "sintesi" ? "Sintesi del report" : "Report"} in sola lettura.</strong> Le è stato
              condiviso da {company ?? "un'azienda"}: è un documento riservato, non inoltri il link.
            </span>
          )}
        </p>
      )}
      {/* Intestazione */}
      <p className="text-sm text-muted">
        {BRAND.reportName}
        {date ? ` · ${date}` : ""}
        {band ? ` · fatturato ${bandText(band)}` : ""}
        {r.profile["PR-01"] ? ` · ${r.profile["PR-01"]}` : ""}
      </p>
      <div className="mt-1 flex flex-wrap items-start justify-between gap-3">
        <h1 className="text-3xl sm:text-4xl font-semibold text-navy">{company ?? "La vostra azienda"}</h1>
        {narrative && !shared && (
          <div className="flex flex-wrap gap-2">
            {draft.savedId && <ShareReport assessmentId={draft.savedId} />}
            {draft.savedId ? <PdfDownload href={`/api/report/${draft.savedId}/pdf`} /> : <PrintButton />}
          </div>
        )}
      </div>

      {narrative && <ReportIndex items={index} />}

      {/* Indicatori */}
      <div id="quadro" className="scroll-mt-16 mt-8 grid gap-3 sm:grid-cols-3">
        <Kpi
          icon={Gauge}
          label="Livello di maturità"
          value={levelShort(ins.overall)}
          unit=""
          sub={ins.overall === null ? "" : `${ins.overall} punti su 100`}
          words
        />
        <Kpi
          icon={Scale}
          label={bench.label}
          value={levelShort(ins.benchmarkAvg)}
          unit=""
          words
          sub={
            ins.deltaVsBenchmark === null
              ? ""
              : ins.deltaVsBenchmark >= 0
                ? Math.abs(ins.deltaVsBenchmark) < 5
                  ? "In linea con il riferimento"
                  : `${ins.deltaVsBenchmark} punti sopra il riferimento`
                : Math.abs(ins.deltaVsBenchmark) < 5
                  ? "In linea con il riferimento"
                  : `${-ins.deltaVsBenchmark} punti sotto il riferimento`
          }
        />
        <Kpi
          icon={ins.balanced ? CircleCheck : TriangleAlert}
          label="Equilibrio del profilo"
          value={`${ins.spread}`}
          unit=" punti"
          sub={ins.balanced ? "Profilo abbastanza omogeneo" : "Divario elevato tra gli ambiti"}
        />
      </div>

      <ScoreReading overall={ins.overall} reference={ins.benchmarkAvg} levels={ins.themes.map((t) => t.level)} />

      {/* Radar e sintesi */}
      <section className="mt-10 grid gap-10 lg:grid-cols-[1.15fr_1fr] items-start">
        <div>
          <RadarProfile
            areas={res.areas}
            reference={bench.values}
            referenceLabel={bench.label}
            market={market?.values}
            marketLabel={market?.label}
            selected={narrative ? res.areas.findIndex((a) => a.code === openArea) : undefined}
            onSelect={narrative ? (i) => setOpenArea(res.areas[i]?.code === openArea ? null : (res.areas[i]?.code ?? null)) : undefined}
          />
          <p className="mt-1 text-xs text-muted text-center">
            Dal centro verso l&apos;esterno: da «{LEVEL_NAMES[0]}» a «{LEVEL_NAMES[3]}». {bench.note}
            {market ? ` La linea tratteggiata in verde è la ${market.note.charAt(0).toLowerCase()}${market.note.slice(1)}` : ""}
          </p>
        </div>
        <div>
          <h2 className="text-xl font-semibold text-navy">In sintesi</h2>
          <ul className="mt-4 space-y-3">
            {ins.summary.map((s) => (
              <li key={s} className="flex gap-3 text-sm leading-relaxed">
                <ArrowRight className="size-4 mt-0.5 shrink-0 text-navy" aria-hidden />
                <span>{s}</span>
              </li>
            ))}
          </ul>
          <div className="mt-6 grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-xl bg-paper p-4">
              <p className="flex items-center gap-1.5 font-semibold text-navy">
                <TrendingUp className="size-4" aria-hidden /> Più solidi
              </p>
              <ul className="mt-2 space-y-1">
                {ins.strongest.map((a) => (
                  <li key={a.code}>
                    {nameOf(a.code)} <span className="text-muted">({a.score})</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-xl bg-paper p-4">
              <p className="flex items-center gap-1.5 font-semibold text-navy">
                <TrendingDown className="size-4" aria-hidden /> Più fragili
              </p>
              <ul className="mt-2 space-y-1">
                {ins.weakest.map((a) => (
                  <li key={a.code}>
                    {nameOf(a.code)} <span className="text-muted">({a.score})</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {narrative && (
        <AreaExplorer
          areas={res.areas}
          themes={ins.themes}
          reference={bench.values}
          referenceKind={bench.kind === "mediana" ? "mediana" : "riferimento"}
          selected={openArea}
          onSelect={setOpenArea}
          detailHref={full ? "#dettaglio" : undefined}
        />
      )}

      {narrative && <Narrative n={narrative} sources={sources} reviewed={reviewed} />}

      {previous && (
        <Progress previous={previous} overall={ins.overall} scores={Object.fromEntries(res.areas.map((a) => [a.code, a.score]))} />
      )}

      {/* Priorità e prossimi passi: l'ordine e i testi sono quelli validati dagli esperti, se presenti */}
      <section id="priorita" className="scroll-mt-16 mt-14">
        <h2 className="text-2xl font-semibold text-navy">Le priorità e da dove partire</h2>
        <p className="mt-1 text-sm text-muted max-w-3xl">
          Gli ambiti su cui concentrarsi per primi, perché pesano di più sulle vostre ambizioni e sulle sfide che ha indicato. Per ciascuno,
          le azioni suggerite e il passo che porta i temi più deboli al livello successivo.
          {canTick && " Spunti le azioni man mano che le avvia: il report tiene il conto."}
        </p>
        {allActions.length > 0 && (canTick || doneCount > 0) && (
          <div className="no-print mt-4 flex items-center gap-3 text-sm">
            <span className="h-2 w-40 rounded-full bg-paper">
              <span className="block h-2 rounded-full bg-navy" style={{ width: `${(doneCount / allActions.length) * 100}%` }} />
            </span>
            <span className="text-muted">
              <strong className="text-ink">{doneCount}</strong> di {allActions.length} azioni avviate
            </span>
          </div>
        )}
        <div className="mt-6 space-y-6">
          {priorityCards(res, narrative).map((p, i) => {
            const a = res.areas.find((x) => x.code === p.code)!;
            const steps = ins.themes
              .filter((t) => t.area === p.code && t.next)
              .sort((x, y) => x.level - y.level)
              .slice(0, 2);
            return (
              <article key={p.code} className="print-keep rounded-xl border border-line overflow-hidden">
                <header className="flex flex-wrap items-center gap-3 bg-navy px-5 py-4 text-white">
                  <span className="size-10 rounded-lg bg-white/10 flex items-center justify-center">
                    <AreaIcon code={p.code} />
                  </span>
                  <div className="flex-1 min-w-48">
                    <p className="text-xs uppercase tracking-wide text-white/70">
                      Priorità {i + 1} · {a.name}
                    </p>
                    <h3 className="text-lg font-semibold leading-snug">{p.title ?? a.name}</h3>
                  </div>
                  <div className="text-right text-sm">
                    <p>
                      <strong className="text-lg">{a.score}</strong>
                      <span className="text-white/70">/100 · {levelLabel(a.score)}</span>
                    </p>
                    <p className="text-white/70">
                      {bench.kind === "mediana" ? "mediana" : "riferimento"} {bench.values[p.code]}
                      {a.isPriority ? ` · rilevanza ${relevanceLabel(a.relevance)}` : ""}
                    </p>
                  </div>
                </header>
                <div className="px-5 py-5 grid gap-6 md:grid-cols-[1.4fr_1fr]">
                  <div>
                    {p.diagnosis && (
                      <div className="space-y-2 leading-relaxed">
                        {p.diagnosis.split(/\n\n+/).map((x) => (
                          <p key={x.slice(0, 40)}>{x}</p>
                        ))}
                      </div>
                    )}
                    {p.actions.length > 0 && (
                      <>
                        <p className="mt-4 text-sm font-semibold text-navy">Le azioni suggerite</p>
                        <ol className="mt-2 space-y-2 text-sm">
                          {p.actions.map((x, k) => (
                            <li key={x}>
                              <Tick text={x} n={k + 1} on={done.has(actionKey(x))} onToggle={canTick ? toggle : undefined} />
                            </li>
                          ))}
                        </ol>
                      </>
                    )}
                    {!p.diagnosis && a.reasons.length > 1 && (
                      <ul className="text-sm text-muted list-disc pl-5 space-y-1">
                        {a.reasons.slice(1).map((x) => (
                          <li key={x}>{x}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <div className="rounded-lg bg-paper p-4">
                    <p className="text-sm font-semibold flex items-center gap-1.5 text-navy">
                      <Footprints className="size-4" aria-hidden /> Da dove partire
                    </p>
                    <ol className="mt-3 space-y-4">
                      {steps.map((t) => (
                        <Step key={t.id} t={t} />
                      ))}
                    </ol>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {narrative && narrative.quickWins.length > 0 && (
        <section id="rapidi" className="scroll-mt-16 mt-14">
          <h2 className="text-2xl font-semibold text-navy">Interventi rapidi</h2>
          <p className="mt-1 text-sm text-muted">Azioni a basso costo da avviare nelle prossime settimane.</p>
          <ul className="mt-5 grid gap-3 md:grid-cols-2">
            {narrative.quickWins.map((q) => (
              <li key={q} className="rounded-xl border border-line p-4 text-sm">
                <Tick text={q} on={done.has(actionKey(q))} onToggle={canTick ? toggle : undefined} />
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Ambizioni */}
      {full && ins.readiness.length > 0 && (
        <section id="ambizioni" className="scroll-mt-16 mt-14">
          <h2 className="text-2xl font-semibold text-navy">Quanto l&apos;azienda è pronta per le sue ambizioni</h2>
          <p className="mt-1 text-sm text-muted max-w-3xl">
            Per ogni obiettivo che ha indicato, quanto sono solidi oggi gli ambiti da cui dipende e qual è il punto più debole da cui
            partire.
          </p>
          <div className="mt-6 space-y-4">
            {ins.readiness.map((x, i) => (
              <div key={x.code} className="rounded-xl border border-line p-4 sm:p-5">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="font-semibold">
                    <Target className="inline size-4 mr-1.5 text-navy align-[-2px]" aria-hidden />
                    {i + 1}. {x.label}
                  </p>
                  <Verdict v={x.verdict} />
                </div>
                <Bar value={x.score} />
                <p className="mt-2 text-sm text-muted">
                  Ambiti coinvolti: {x.areas.map((a) => AREA_SHORT[a]).join(", ")}.
                  {x.weakest && x.verdict !== "base solida" && (
                    <>
                      {" "}
                      Il punto più debole: <strong className="text-ink">{x.weakest.theme.toLowerCase()}</strong> (
                      {AREA_SHORT[x.weakest.area]}), ancora al livello «{LEVEL_NAMES[x.weakest.level - 1]}».
                    </>
                  )}
                </p>
              </div>
            ))}
          </div>
          {r.objectivesText && (
            <blockquote className="mt-4 border-l-2 border-navy pl-4 text-sm italic text-muted">“{r.objectivesText}”</blockquote>
          )}
        </section>
      )}

      {/* Sfide */}
      {full && ins.issueCauses.length > 0 && (
        <section id="sfide" className="scroll-mt-16 mt-14">
          <h2 className="text-2xl font-semibold text-navy">Le sfide: dove possono nascere</h2>
          <p className="mt-1 text-sm text-muted max-w-3xl">
            Per ogni sfida che ha indicato, i temi collegati in cui le pratiche sono oggi ai livelli «Informale» o «Base»: sono le cause più
            probabili, da verificare per prime.
          </p>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {ins.issueCauses.map((c) => (
              <div key={c.code} className="rounded-xl border border-line p-4">
                <p className="font-semibold">{c.label}</p>
                {c.causes.length ? (
                  <ul className="mt-3 space-y-2 text-sm">
                    {c.causes.map((t) => (
                      <li key={t.id} className="flex gap-2">
                        <AreaIcon code={t.area} className="size-4 mt-0.5 shrink-0 text-navy" />
                        <span>
                          <strong>{t.theme}</strong>
                          <span className="text-muted">
                            {" "}
                            · {LEVEL_NAMES[t.level - 1]}: {t.current}
                          </span>
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-3 text-sm text-muted">
                    Le pratiche collegate risultano strutturate: la causa potrebbe essere esterna o di esecuzione. Da approfondire con un
                    esperto.
                  </p>
                )}
              </div>
            ))}
          </div>
          {r.issuesText && <blockquote className="mt-4 border-l-2 border-navy pl-4 text-sm italic text-muted">“{r.issuesText}”</blockquote>}
        </section>
      )}

      {/* Verifiche */}
      {full && res.flags.length > 0 && (
        <section className="mt-14 rounded-xl bg-paper border border-line p-5">
          <h2 className="font-semibold text-navy flex items-center gap-2">
            <TriangleAlert className="size-5" aria-hidden /> Da verificare
          </h2>
          <p className="mt-1 text-sm text-muted">
            In questi punti la risposta di verifica non è coerente con il livello scelto: il punteggio potrebbe essere ottimista.
          </p>
          <ul className="mt-3 text-sm space-y-2 list-disc pl-5">
            {res.flags.map((f) => (
              <li key={f.questionId}>{f.message}</li>
            ))}
          </ul>
        </section>
      )}

      {/* Numeri del bilancio */}
      {full && r.financials && (
        <div id="numeri" className="scroll-mt-16">
          <Numbers f={r.financials} finScore={res.areas.find((a) => a.code === "FIN")?.score ?? null} />
        </div>
      )}

      {/* Governance dalla visura */}
      {full && r.governance && <GovernanceBlock g={r.governance} strLevel={r.levels["STR-3"]} />}

      {/* Dettaglio */}
      {full && (
        <section id="dettaglio" className="scroll-mt-16 mt-14">
          <h2 className="text-2xl font-semibold text-navy">Dettaglio per ambito e tema</h2>
          <p className="mt-1 text-sm text-muted">
            La barra mostra il punteggio dell&apos;ambito; la tacca grigia il {bench.kind === "mediana" ? "valore mediano" : "riferimento"}{" "}
            della vostra fascia.
          </p>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {res.areas.map((a) => {
              const ref = bench.values[a.code];
              const themes = ins.themes.filter((t) => t.area === a.code);
              return (
                <div key={a.code} className="rounded-xl border border-line p-4">
                  <div className="flex items-center gap-3">
                    <span
                      className={`size-9 rounded-lg flex items-center justify-center ${a.isPriority ? "bg-navy text-white" : "bg-paper text-navy"}`}
                    >
                      <AreaIcon code={a.code} className="size-4" />
                    </span>
                    <div className="flex-1">
                      <p className="font-semibold leading-tight">{a.name}</p>
                      <p className="text-xs text-muted">
                        {levelLabel(a.score)}
                        {a.isPriority ? ` · priorità ${a.rank}` : ""}
                      </p>
                    </div>
                    <p className="text-lg font-semibold tabular-nums">{a.score}</p>
                  </div>
                  <Bar value={a.score ?? 0} marker={ref} />
                  <p className="mt-2 text-xs leading-relaxed text-muted">
                    {areaReading(
                      a.score,
                      ref,
                      themes.map((t) => t.level),
                    )}
                  </p>
                  <ul className="mt-3 space-y-1.5">
                    {themes.map((t) => (
                      <li key={t.id} className="flex items-center justify-between gap-3 text-sm">
                        <span>{t.theme}</span>
                        <Dots level={t.level} />
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Colleghi */}
      {isSupabaseConfigured() && draft.savedId && !r.context && !shared && (
        <div className="no-print">
          <InviteColleagues people={r.people ?? []} />
        </div>
      )}

      {/* Riscontro e domande */}
      {narrative && draft.savedId && !shared && (
        <div className="grid gap-4 lg:grid-cols-2">
          <Feedback kind="report" refId={draft.savedId} />
          <Feedback kind="report" refId={draft.savedId} ask />
        </div>
      )}

      {/* Servizi di approfondimento: solo dopo il report */}
      {narrative && !shared && (
        <div className="no-print">
          <Offers assessmentId={draft.savedId} priorities={res.priorities.map((p) => ({ code: p.code, name: p.name }))} />
        </div>
      )}

      {/* Invito */}
      {shared ? (
        <section className="no-print mt-14 bg-navy text-white rounded-xl p-6 sm:p-8">
          <h2 className="text-xl font-semibold">Vuole lo stesso quadro per la vostra azienda?</h2>
          <p className="mt-2 text-white/75 max-w-2xl">
            Il diagnostico è gratuito e richiede circa 15 minuti: otto ambiti di gestione, l&apos;{BRAND.reportName} subito e il report
            approfondito {BRAND.reportPromise}.
          </p>
          <Link href="/diagnostico" className="mt-5 inline-flex items-center gap-2 bg-white text-navy font-semibold px-5 py-2.5 rounded-lg">
            Inizia il diagnostico <ArrowRight className="size-4" aria-hidden />
          </Link>
        </section>
      ) : (
        <>
          <section className="no-print mt-14 bg-navy text-white rounded-xl p-6 sm:p-8">
            <h2 className="text-xl font-semibold">{narrative ? "Il prossimo passo" : "Vuole trasformare le priorità in un piano?"}</h2>
            {narrative?.closing && <p className="mt-2 text-white/90 max-w-3xl leading-relaxed">{narrative.closing}</p>}
            <p className="mt-2 text-white/75 max-w-2xl">
              In un&apos;ora con un nostro consulente senior validiamo l&apos;{BRAND.reportName}, definiamo il livello da raggiungere su
              ogni tema e i primi interventi, con tempi e responsabili.
            </p>
            <a
              href={
                draft.savedId
                  ? "/area/servizi#consulenza"
                  : `mailto:${BRAND.contactEmail}?subject=${encodeURIComponent(`Consulenza sul ${BRAND.reportName}`)}`
              }
              className="mt-5 inline-flex items-center gap-2 bg-white text-navy font-semibold px-5 py-2.5 rounded-lg"
            >
              Prenota una consulenza <ArrowRight className="size-4" aria-hidden />
            </a>
          </section>

          <div className="no-print mt-8 flex gap-4 text-sm">
            <Link href="/diagnostico" className="underline text-navy-soft">
              Nuovo diagnostico
            </Link>
          </div>
        </>
      )}
      <p className="mt-6 text-xs text-muted flex gap-2 max-w-3xl">
        <Info className="size-4 shrink-0" aria-hidden />
        Autovalutazione orientativa basata sulle risposte fornite ed elaborata con la metodologia proprietaria di {BRAND.owner}: non è una
        consulenza né un rating. Le risposte sono usate anche, in forma anonima e aggregata, per confronti tra aziende e finalità di
        ricerca.
      </p>
    </div>
  );
}

/** Un'azione del report: si può segnare come avviata; nelle pagine in sola lettura mostra soltanto lo stato. */
function Tick({ text, n, on, onToggle }: { text: string; n?: number; on: boolean; onToggle?: (text: string) => void }) {
  const box = (
    <span
      className={`mt-0.5 shrink-0 size-5 rounded flex items-center justify-center text-xs font-semibold ${
        on ? "bg-navy text-white" : onToggle || n === undefined ? "border-2 border-navy text-navy" : "bg-navy/10 text-navy rounded-full"
      }`}
      aria-hidden
    >
      {on ? "✓" : onToggle ? "" : (n ?? "")}
    </span>
  );
  const body = <span className={on ? "text-muted line-through decoration-line" : ""}>{text}</span>;
  if (!onToggle)
    return (
      <span className="flex gap-3">
        {box}
        {body}
      </span>
    );
  return (
    <label className="flex gap-3 cursor-pointer">
      <input type="checkbox" className="sr-only" checked={on} onChange={() => onToggle(text)} />
      {box}
      {body}
    </label>
  );
}

function Kpi({
  icon: Icon,
  label,
  value,
  unit,
  sub,
  words,
}: {
  icon: typeof Gauge;
  label: string;
  value: string;
  unit: string;
  sub: string;
  /** Valore a parole (un livello) invece che in cifre. */
  words?: boolean;
}) {
  return (
    <div className="rounded-xl border border-line p-4">
      <p className="text-xs uppercase tracking-wide text-muted flex items-center gap-1.5">
        <Icon className="size-4" aria-hidden /> {label}
      </p>
      <p className="mt-2">
        <span className={`font-semibold text-navy tabular-nums ${words ? "text-xl leading-tight" : "text-3xl"}`}>{value}</span>
        <span className="text-muted">{unit}</span>
      </p>
      <p className="text-sm text-muted">{sub}</p>
    </div>
  );
}

function Bar({ value, marker }: { value: number; marker?: number }) {
  return (
    <div className="relative mt-3 h-2 rounded-full bg-paper">
      <div className="h-2 rounded-full bg-navy" style={{ width: `${Math.max(2, value)}%` }} />
      {marker !== undefined && (
        <span className="absolute -top-1 h-4 w-0.5 bg-muted" style={{ left: `${marker}%` }} aria-label={`riferimento ${marker}`} />
      )}
    </div>
  );
}

function Dots({ level }: { level: number }) {
  return (
    <span className="flex gap-1 shrink-0" aria-label={`livello ${level} di 4`}>
      {[1, 2, 3, 4].map((i) => (
        <span key={i} className={`size-2.5 rounded-full ${i <= level ? "bg-navy" : "bg-line"}`} />
      ))}
    </span>
  );
}

function Verdict({ v }: { v: "base solida" | "da rafforzare" | "ostacolo" }) {
  const cls =
    v === "base solida"
      ? "bg-navy/10 text-navy"
      : v === "da rafforzare"
        ? "bg-paper text-ink border border-line"
        : "bg-accent/10 text-accent";
  return <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${cls}`}>{v.charAt(0).toUpperCase() + v.slice(1)}</span>;
}

/** «Come fare»: la scheda di metodo che porta il tema al livello successivo. */
function HowTo({ theme, level }: { theme: string; level: number }) {
  const c = recommendationFor(theme, level);
  if (!c) return null;
  return (
    <details className="no-print group mt-2 rounded-lg border border-line bg-white">
      <summary className="cursor-pointer list-none px-3 py-2 text-sm font-medium text-navy flex items-center justify-between gap-2">
        Come fare: {c.title.charAt(0).toLowerCase() + c.title.slice(1)}
        <ArrowRight className="size-4 shrink-0 transition-transform group-open:rotate-90" aria-hidden />
      </summary>
      <div className="px-3 pb-3 text-sm">
        <ol className="space-y-1.5 list-decimal pl-5">
          {c.actions.map((x) => (
            <li key={x}>{x}</li>
          ))}
        </ol>
        <dl className="mt-3 space-y-1.5">
          {(
            [
              ["Che cosa resta in azienda", c.tool],
              ["Come capire se funziona", c.indicator],
              ["Tempo tipico", c.time],
              ["L'errore da evitare", c.pitfall],
            ] as const
          ).map(([k, v]) => (
            <div key={k}>
              <dt className="text-xs uppercase tracking-wide text-muted">{k}</dt>
              <dd>{v}</dd>
            </div>
          ))}
        </dl>
        {c.sources?.length ? (
          <p className="mt-3 text-xs text-muted">
            Da sapere: {c.sources.map((k) => `${SOURCES[k].label}. ${SOURCES[k].note}`).join(" ")} Verifichi con i Suoi consulenti come si
            applica al vostro caso.
          </p>
        ) : null}
      </div>
    </details>
  );
}

function Step({ t }: { t: ThemeView }) {
  return (
    <li className="text-sm">
      <p className="font-medium">{t.theme}</p>
      <p className="mt-1 text-muted">
        <span className="text-xs uppercase tracking-wide">Oggi · {LEVEL_NAMES[t.level - 1]}</span> — {t.current}
      </p>
      {t.next && (
        <p className="mt-1">
          <span className="text-xs uppercase tracking-wide text-navy font-semibold">Passo successivo · {LEVEL_NAMES[t.level]}</span> —{" "}
          {t.next}
        </p>
      )}
      {t.sizeNote && <p className="mt-1 text-xs text-muted">Per un&apos;azienda della vostra dimensione: {t.sizeNote}</p>}
      <HowTo theme={t.id} level={t.level} />
    </li>
  );
}

const eur = (v: number | null) =>
  v === null
    ? "—"
    : Math.abs(v) >= 1_000_000
      ? `${(v / 1_000_000).toLocaleString("it-IT", { maximumFractionDigits: 1 })} mln €`
      : `${Math.round(v / 1000).toLocaleString("it-IT")} mila €`;

function Numbers({ f, finScore }: { f: NonNullable<Draft["responses"]["financials"]>; finScore: number | null }) {
  const k = financialKpis(f);
  const tiles: [string, string, string][] = [
    ["Ricavi", eur(f.ricavi ?? f.valore_produzione), k.revenuePerEmployee ? `${eur(k.revenuePerEmployee)} per addetto` : ""],
    ["EBITDA", eur(f.ebitda), k.ebitdaMargin !== null ? `${k.ebitdaMargin.toLocaleString("it-IT")}% dei ricavi` : ""],
    ["Utile netto", eur(f.utile_netto), k.netMargin !== null ? `${k.netMargin.toLocaleString("it-IT")}% dei ricavi` : ""],
    [
      "Posizione finanziaria netta",
      eur(k.pfn),
      k.pfnOnEbitda !== null ? `${k.pfnOnEbitda.toLocaleString("it-IT")} volte l'EBITDA` : k.pfn !== null && k.pfn < 0 ? "cassa netta" : "",
    ],
    ["Patrimonio netto", eur(f.patrimonio_netto), k.equityRatio !== null ? `${k.equityRatio.toLocaleString("it-IT")}% dell'attivo` : ""],
    [
      "Giorni di incasso",
      k.dso !== null ? `${k.dso}` : "—",
      k.dio !== null && k.dio <= 365 ? `magazzino pari a ${k.dio} giorni di ricavi` : "",
    ],
  ].filter(([, v]) => v !== "—") as [string, string, string][];
  return (
    <section className="mt-14">
      <h2 className="text-2xl font-semibold text-navy flex items-center gap-2">
        <Banknote className="size-6" aria-hidden strokeWidth={1.75} /> I numeri dell&apos;ultimo bilancio{f.year ? ` (${f.year})` : ""}
      </h2>
      <p className="mt-1 text-sm text-muted">
        Dati letti dal bilancio che ha caricato. Le soglie di lettura sono generali e vanno adattate al settore.
      </p>
      <div className="mt-6 grid gap-3 grid-cols-2 lg:grid-cols-3">
        {tiles.map(([label, value, sub]) => (
          <div key={label} className="rounded-xl border border-line p-4">
            <p className="text-xs uppercase tracking-wide text-muted">{label}</p>
            <p className="mt-1 text-xl font-semibold text-navy tabular-nums">{value}</p>
            {sub && <p className="text-sm text-muted">{sub}</p>}
          </div>
        ))}
      </div>
      {(k.notes.length > 0 || finScore !== null) && (
        <ul className="mt-5 space-y-2 text-sm">
          {k.notes.map((n) => (
            <li key={n} className="flex gap-3">
              <ArrowRight className="size-4 mt-0.5 shrink-0 text-navy" aria-hidden />
              <span>{n}</span>
            </li>
          ))}
          {finScore !== null && (
            <li className="flex gap-3">
              <ArrowRight className="size-4 mt-0.5 shrink-0 text-navy" aria-hidden />
              <span>
                In Finanza e controllo le pratiche sono oggi al livello «{levelLabel(finScore)}»:{" "}
                {finScore < 50
                  ? "con budget, previsioni e controllo più strutturati questi numeri si governerebbero in anticipo, non solo a consuntivo."
                  : "gli strumenti di controllo ci sono: il passo successivo è usarli per guidare le scelte su prezzi, investimenti e finanziamenti."}
              </span>
            </li>
          )}
        </ul>
      )}
    </section>
  );
}

function GovernanceBlock({ g, strLevel }: { g: Governance; strLevel: number | undefined }) {
  const facts: [string, string][] = [];
  if (g.organo)
    facts.push(["Organo amministrativo", g.organo + (g.amministratori && g.amministratori > 1 ? ` (${g.amministratori} membri)` : "")]);
  if (g.organoControllo !== null) facts.push(["Collegio sindacale o revisore", g.organoControllo ? "presente" : "assente"]);
  if (g.soci) facts.push(["Soci", String(g.soci)]);
  if (g.quotaSocioPrincipale !== null) facts.push(["Quota del socio principale", `${g.quotaSocioPrincipale.toLocaleString("it-IT")}%`]);
  const notes: string[] = [];
  if (g.organo === "amministratore unico")
    notes.push(
      "Amministratore unico: le decisioni sono concentrate in una persona. È efficiente, ma rende cruciali deleghe, continuità e un confronto esterno sulle scelte rilevanti.",
    );
  if (g.organoControllo === false)
    notes.push(
      "Non risulta un organo di controllo: per le aziende in crescita un revisore o un advisory board rafforza credibilità con banche e investitori.",
    );
  if (g.quotaSocioPrincipale !== null && g.quotaSocioPrincipale >= 75)
    notes.push("Controllo molto concentrato: la pianificazione della successione e le regole tra soci pesano sulla continuità.");
  if (strLevel !== undefined && strLevel >= 3 && g.organo === "amministratore unico" && g.organoControllo === false)
    notes.push(
      "Ha indicato una governance strutturata: con amministratore unico e senza organo di controllo, verifichi che ci sia davvero una voce esterna indipendente.",
    );
  if (!facts.length) return null;
  return (
    <section className="mt-14">
      <h2 className="text-2xl font-semibold text-navy flex items-center gap-2">
        <Landmark className="size-6" aria-hidden strokeWidth={1.75} /> Governance secondo la visura
      </h2>
      <dl className="mt-5 grid gap-3 grid-cols-2 lg:grid-cols-4">
        {facts.map(([k, v]) => (
          <div key={k} className="rounded-xl border border-line p-4">
            <dt className="text-xs uppercase tracking-wide text-muted">{k}</dt>
            <dd className="mt-1 font-semibold text-navy">{v}</dd>
          </div>
        ))}
      </dl>
      {notes.length > 0 && (
        <ul className="mt-4 space-y-2 text-sm">
          {notes.map((n) => (
            <li key={n} className="flex gap-3">
              <ArrowRight className="size-4 mt-0.5 shrink-0 text-navy" aria-hidden />
              <span>{n}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

/** Priorità da mostrare: quelle validate dagli esperti, nel loro ordine; altrimenti quelle calcolate. */
function priorityCards(res: ReturnType<typeof computeResult>, n: ReportNarrative | null | undefined) {
  if (n?.priorities.length)
    return n.priorities.map((p) => ({ code: p.area as AreaCode, title: p.title, diagnosis: p.diagnosis, actions: p.actions }));
  return res.priorities.map((p) => ({ code: p.code, title: null as string | null, diagnosis: "", actions: [] as string[] }));
}

/** Analisi scritta a partire dai dati del diagnostico. */
function Narrative({ n, sources, reviewed }: { n: ReportNarrative; sources: string[]; reviewed: boolean }) {
  return (
    <section className="mt-8 rounded-xl border border-navy/30 bg-navy/[0.03] p-5 sm:p-7">
      <p className="text-xs uppercase tracking-wide text-muted">{reviewed ? "Analisi rivista da un nostro esperto" : "Analisi"}</p>
      <h2 className="mt-1 text-2xl font-semibold text-navy">Sintesi per la direzione</h2>
      {sources.length > 0 && <p className="mt-1 text-sm text-muted">Tiene conto anche di: {sources.join(", ")}.</p>}
      <div className="mt-4 space-y-3 leading-relaxed">
        {n.executiveSummary.split(/\n\n+/).map((p) => (
          <p key={p.slice(0, 40)}>{p}</p>
        ))}
      </div>
      {n.crossCutting && (
        <>
          <h3 className="mt-6 font-semibold text-navy">Lettura d&apos;insieme</h3>
          <div className="mt-2 space-y-3 leading-relaxed">
            {n.crossCutting.split(/\n\n+/).map((p) => (
              <p key={p.slice(0, 40)}>{p}</p>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
