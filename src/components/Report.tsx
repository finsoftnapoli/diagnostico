"use client";

import { ArrowRight, Banknote, CircleCheck, Landmark, Footprints, Gauge, Info, Scale, Target, TriangleAlert, TrendingDown, TrendingUp } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { BRAND } from "@/config/brand";
import { bandText, MIN_SAMPLE, normativeBenchmark, type Benchmark } from "@/config/benchmark";
import { AREA_SHORT, AreaIcon } from "@/lib/areaIcons";
import type { Draft } from "@/lib/draft";
import { financialKpis } from "@/lib/documents";
import { buildInsights, LEVEL_NAMES, levelLabel, type ThemeView } from "@/lib/insights";
import { AREAS } from "@/lib/questionnaire";
import { computeResult, relevanceLabel } from "@/lib/scoring";
import type { AreaCode } from "@/lib/types";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import type { Governance } from "@/lib/types";
import InviteColleagues from "./InviteColleagues";
import RadarProfile from "./RadarProfile";

const nameOf = (c: AreaCode) => AREAS.find((a) => a.code === c)?.name ?? c;

export default function Report({ draft }: { draft: Draft }) {
  const r = draft.responses;
  const band = r.profile["PR-02"];
  const [bench, setBench] = useState<Benchmark>(() => normativeBenchmark(band));

  // se il segmento ha abbastanza compilazioni reali, si usa la mediana
  useEffect(() => {
    if (!band) return;
    fetch(`/api/confronto?fascia=${encodeURIComponent(band)}`)
      .then((x) => (x.ok ? x.json() : null))
      .then((j: { sample: number; values: Record<AreaCode, number> | null } | null) => {
        if (j?.values && j.sample >= MIN_SAMPLE)
          setBench({
            kind: "mediana",
            label: `Mediana aziende ${bandText(band)}`,
            note: `Mediana di ${j.sample} aziende con fatturato ${bandText(band)} che hanno compilato il diagnostico.`,
            sample: j.sample,
            values: j.values,
          });
      })
      .catch(() => {});
  }, [band]);

  const res = useMemo(() => computeResult(r), [r]);
  const ins = useMemo(() => buildInsights(r, res, bench), [r, res, bench]);
  const company = r.profile["PR-11"];
  const date = draft.completedAt
    ? new Date(draft.completedAt).toLocaleDateString("it-IT", { day: "numeric", month: "long", year: "numeric" })
    : "";

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      {/* Intestazione */}
      <p className="text-sm text-muted">
        {BRAND.reportName}
        {date ? ` · ${date}` : ""}
        {band ? ` · fatturato ${bandText(band)}` : ""}
        {r.profile["PR-01"] ? ` · ${r.profile["PR-01"]}` : ""}
      </p>
      <h1 className="mt-1 text-3xl sm:text-4xl font-semibold text-navy">{company ?? "La tua azienda"}</h1>

      {/* Indicatori */}
      <div className="mt-8 grid gap-3 sm:grid-cols-3">
        <Kpi icon={Gauge} label="Punteggio complessivo" value={`${ins.overall ?? "—"}`} unit="/100" sub={ins.overallLabel} />
        <Kpi
          icon={Scale}
          label={bench.label}
          value={`${ins.benchmarkAvg}`}
          unit="/100"
          sub={
            ins.deltaVsBenchmark === null
              ? ""
              : ins.deltaVsBenchmark >= 0
                ? `Sei ${ins.deltaVsBenchmark} punti sopra`
                : `Sei ${-ins.deltaVsBenchmark} punti sotto`
          }
        />
        <Kpi
          icon={ins.balanced ? CircleCheck : TriangleAlert}
          label="Equilibrio del profilo"
          value={`${ins.spread}`}
          unit=" punti"
          sub={ins.balanced ? "Profilo abbastanza equilibrato" : "Divario elevato tra gli ambiti"}
        />
      </div>

      {/* Radar e sintesi */}
      <section className="mt-10 grid gap-10 lg:grid-cols-[1.15fr_1fr] items-start">
        <div>
          <RadarProfile areas={res.areas} reference={bench.values} referenceLabel={bench.label} />
          <p className="mt-1 text-xs text-muted text-center">
            Scala da 0 ({LEVEL_NAMES[0].toLowerCase()}) a 100 ({LEVEL_NAMES[3].toLowerCase()}). {bench.note}
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

      {/* Numeri del bilancio */}
      {r.financials && <Numbers f={r.financials} finScore={res.areas.find((a) => a.code === "FIN")?.score ?? null} />}

      {/* Governance dalla visura */}
      {r.governance && <GovernanceBlock g={r.governance} strLevel={r.levels["STR-3"]} />}

      {/* Priorità e prossimi passi */}
      <section className="mt-14">
        <h2 className="text-2xl font-semibold text-navy">Le tre priorità e i primi passi</h2>
        <p className="mt-1 text-sm text-muted max-w-3xl">
          Gli ambiti in cui il divario dal livello più alto e il legame con le tue ambizioni e le tue sfide sono maggiori.
          Per ciascuno indichiamo da dove partire: il passaggio al livello successivo sui temi più deboli.
        </p>
        <div className="mt-6 space-y-5">
          {res.priorities.map((p, i) => {
            const steps = ins.nextSteps.find((n) => n.area === p.code)?.steps ?? [];
            const ref = bench.values[p.code];
            return (
              <article key={p.code} className="rounded-xl border border-line overflow-hidden">
                <header className="flex flex-wrap items-center gap-3 bg-paper px-5 py-4">
                  <span className="size-10 rounded-lg bg-navy text-white flex items-center justify-center">
                    <AreaIcon code={p.code} />
                  </span>
                  <div className="flex-1 min-w-48">
                    <p className="text-xs uppercase tracking-wide text-muted">Priorità {i + 1}</p>
                    <h3 className="text-lg font-semibold text-navy">{p.name}</h3>
                  </div>
                  <div className="text-right text-sm">
                    <p>
                      <strong className="text-lg text-ink">{p.score}</strong>
                      <span className="text-muted">/100 · {levelLabel(p.score)}</span>
                    </p>
                    <p className="text-muted">
                      {bench.kind === "mediana" ? "mediana" : "riferimento"} {ref} · rilevanza {relevanceLabel(p.relevance)}
                    </p>
                  </div>
                </header>
                <div className="px-5 py-4 grid gap-5 md:grid-cols-[1fr_1.4fr]">
                  <div>
                    <p className="text-sm font-semibold">Perché è prioritario</p>
                    <ul className="mt-2 text-sm text-muted list-disc pl-5 space-y-1">
                      {p.reasons.slice(1).map((x) => (
                        <li key={x}>{x}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="text-sm font-semibold flex items-center gap-1.5">
                      <Footprints className="size-4" aria-hidden /> Da dove partire
                    </p>
                    <ol className="mt-2 space-y-3">
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

      {/* Ambizioni */}
      {ins.readiness.length > 0 && (
        <section className="mt-14">
          <h2 className="text-2xl font-semibold text-navy">Quanto l&apos;azienda è pronta per le sue ambizioni</h2>
          <p className="mt-1 text-sm text-muted max-w-3xl">
            Per ogni obiettivo scelto, il punteggio medio degli ambiti che servono a raggiungerlo (l&apos;ambito principale
            pesa il doppio).
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
                      Il punto più debole è <strong className="text-ink">{x.weakest.theme.toLowerCase()}</strong> (
                      {AREA_SHORT[x.weakest.area]}, livello {x.weakest.level} di 4).
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
      {ins.issueCauses.length > 0 && (
        <section className="mt-14">
          <h2 className="text-2xl font-semibold text-navy">Le sfide: dove possono nascere</h2>
          <p className="mt-1 text-sm text-muted max-w-3xl">
            Per ogni sfida indicata, i temi collegati in cui le pratiche sono oggi informali o di base: sono le cause più
            probabili su cui verificare.
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
                          <span className="text-muted"> · livello {t.level}: {t.current}</span>
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-3 text-sm text-muted">
                    Le pratiche collegate risultano strutturate: la causa potrebbe essere esterna o di esecuzione. Da
                    approfondire con un esperto.
                  </p>
                )}
              </div>
            ))}
          </div>
          {r.issuesText && <blockquote className="mt-4 border-l-2 border-navy pl-4 text-sm italic text-muted">“{r.issuesText}”</blockquote>}
        </section>
      )}

      {/* Verifiche */}
      {res.flags.length > 0 && (
        <section className="mt-14 rounded-xl bg-paper border border-line p-5">
          <h2 className="font-semibold text-navy flex items-center gap-2">
            <TriangleAlert className="size-5" aria-hidden /> Da verificare
          </h2>
          <p className="mt-1 text-sm text-muted">
            In questi punti la risposta di verifica non è coerente con il livello scelto: il punteggio potrebbe essere
            ottimista.
          </p>
          <ul className="mt-3 text-sm space-y-2 list-disc pl-5">
            {res.flags.map((f) => (
              <li key={f.questionId}>{f.message}</li>
            ))}
          </ul>
        </section>
      )}

      {/* Dettaglio */}
      <section className="mt-14">
        <h2 className="text-2xl font-semibold text-navy">Dettaglio per ambito e tema</h2>
        <p className="mt-1 text-sm text-muted">
          La barra mostra il punteggio dell&apos;ambito; la tacca grigia il {bench.kind === "mediana" ? "valore mediano" : "riferimento"} della tua fascia.
        </p>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {res.areas.map((a) => {
            const ref = bench.values[a.code];
            const themes = ins.themes.filter((t) => t.area === a.code);
            return (
              <div key={a.code} className="rounded-xl border border-line p-4">
                <div className="flex items-center gap-3">
                  <span className={`size-9 rounded-lg flex items-center justify-center ${a.isPriority ? "bg-navy text-white" : "bg-paper text-navy"}`}>
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

      {/* Colleghi */}
      {isSupabaseConfigured() && draft.savedId && !r.context && <InviteColleagues people={r.people ?? []} />}

      {/* Invito */}
      <section className="mt-14 bg-navy text-white rounded-xl p-6 sm:p-8">
        <h2 className="text-xl font-semibold">Vuoi trasformare le priorità in un piano?</h2>
        <p className="mt-2 text-white/85 max-w-2xl">
          In una sessione con un nostro esperto validiamo il {BRAND.reportName}, definiamo il livello da raggiungere su
          ogni tema e i primi interventi, con tempi e responsabili. Stiamo selezionando le prime aziende per il programma
          pilota.
        </p>
        <a
          href={`mailto:${BRAND.contactEmail}?subject=${encodeURIComponent(`Programma pilota ${BRAND.reportName}`)}`}
          className="mt-5 inline-flex items-center gap-2 bg-white text-navy font-semibold px-5 py-2.5 rounded-lg"
        >
          Partecipa al pilota <ArrowRight className="size-4" aria-hidden />
        </a>
      </section>

      <div className="mt-8 flex gap-4 text-sm">
        <Link href="/diagnostico" className="underline text-navy-soft">
          Nuovo diagnostico
        </Link>
      </div>
      <p className="mt-6 text-xs text-muted flex gap-2 max-w-3xl">
        <Info className="size-4 shrink-0" aria-hidden />
        Autovalutazione orientativa basata sulle risposte fornite: non è una consulenza né un rating. I punteggi derivano
        da regole dichiarate; le risposte sono usate anche, in forma anonima e aggregata, per confronti tra aziende e
        finalità di ricerca.
      </p>
    </div>
  );
}

function Kpi({ icon: Icon, label, value, unit, sub }: { icon: typeof Gauge; label: string; value: string; unit: string; sub: string }) {
  return (
    <div className="rounded-xl border border-line p-4">
      <p className="text-xs uppercase tracking-wide text-muted flex items-center gap-1.5">
        <Icon className="size-4" aria-hidden /> {label}
      </p>
      <p className="mt-2">
        <span className="text-3xl font-semibold text-navy tabular-nums">{value}</span>
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
    v === "base solida" ? "bg-navy/10 text-navy" : v === "da rafforzare" ? "bg-paper text-ink border border-line" : "bg-accent/10 text-accent";
  return <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${cls}`}>{v}</span>;
}

function Step({ t }: { t: ThemeView }) {
  return (
    <li className="text-sm">
      <p className="font-medium">{t.theme}</p>
      <p className="mt-1 text-muted">
        <span className="text-xs uppercase tracking-wide">Oggi · livello {t.level}</span> — {t.current}
      </p>
      {t.next && (
        <p className="mt-1">
          <span className="text-xs uppercase tracking-wide text-navy font-semibold">Prossimo passo · livello {t.level + 1}</span> — {t.next}
        </p>
      )}
      {t.sizeNote && <p className="mt-1 text-xs text-muted">Per la tua dimensione: {t.sizeNote}</p>}
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
    ["Posizione finanziaria netta", eur(k.pfn), k.pfnOnEbitda !== null ? `${k.pfnOnEbitda.toLocaleString("it-IT")} volte l'EBITDA` : k.pfn !== null && k.pfn < 0 ? "cassa netta" : ""],
    ["Patrimonio netto", eur(f.patrimonio_netto), k.equityRatio !== null ? `${k.equityRatio.toLocaleString("it-IT")}% dell'attivo` : ""],
    ["Giorni di incasso", k.dso !== null ? `${k.dso}` : "—", k.dio !== null ? `magazzino ${k.dio} giorni di ricavi` : ""],
  ];
  return (
    <section className="mt-14">
      <h2 className="text-2xl font-semibold text-navy flex items-center gap-2">
        <Banknote className="size-6" aria-hidden strokeWidth={1.75} /> I numeri dell&apos;ultimo bilancio{f.year ? ` (${f.year})` : ""}
      </h2>
      <p className="mt-1 text-sm text-muted">Dati letti dal bilancio che hai caricato. Le soglie di lettura sono generali e vanno adattate al settore.</p>
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
                Il punteggio di Finanza e controllo è {finScore} su 100:{" "}
                {finScore < 50
                  ? "con strumenti di pianificazione e controllo più strutturati questi numeri si potrebbero governare in anticipo, non solo leggere a consuntivo."
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
  if (g.organo) facts.push(["Organo amministrativo", g.organo + (g.amministratori && g.amministratori > 1 ? ` (${g.amministratori} membri)` : "")]);
  if (g.organoControllo !== null) facts.push(["Collegio sindacale o revisore", g.organoControllo ? "presente" : "assente"]);
  if (g.soci) facts.push(["Soci", String(g.soci)]);
  if (g.quotaSocioPrincipale !== null) facts.push(["Quota del socio principale", `${g.quotaSocioPrincipale.toLocaleString("it-IT")}%`]);
  const notes: string[] = [];
  if (g.organo === "amministratore unico")
    notes.push("Amministratore unico: le decisioni sono concentrate in una persona. È efficiente, ma rende cruciali deleghe, continuità e un confronto esterno sulle scelte rilevanti.");
  if (g.organoControllo === false) notes.push("Non risulta un organo di controllo: per le aziende in crescita un revisore o un advisory board rafforza credibilità con banche e investitori.");
  if (g.quotaSocioPrincipale !== null && g.quotaSocioPrincipale >= 75) notes.push("Controllo molto concentrato: la pianificazione della successione e le regole tra soci pesano sulla continuità.");
  if (strLevel !== undefined && strLevel >= 3 && g.organo === "amministratore unico" && g.organoControllo === false)
    notes.push("Hai indicato una governance strutturata: con amministratore unico e senza organo di controllo, verifica che ci sia davvero una voce esterna indipendente.");
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
