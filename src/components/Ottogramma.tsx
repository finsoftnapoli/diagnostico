"use client";

import { ArrowRight, Clock3, Gauge, Info, Scale, TrendingDown, TrendingUp } from "lucide-react";
import Link from "next/link";
import { levelShort } from "@/lib/score-meaning";
import { useEffect, useMemo, useState } from "react";
import { BRAND } from "@/config/brand";
import { bandText, type Benchmark, medianBenchmark, normativeBenchmark, type RealBenchmark } from "@/config/benchmark";
import type { Draft } from "@/lib/draft";
import { LEVEL_NAMES, buildInsights } from "@/lib/insights";
import { AREAS } from "@/lib/questionnaire";
import { computeResult } from "@/lib/scoring";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import type { AreaCode } from "@/lib/types";
import Progress, { type PreviousResult } from "./Progress";
import Feedback from "./Feedback";
import InviteColleagues from "./InviteColleagues";
import RadarProfile from "./RadarProfile";
import ScoreReading from "./ScoreReading";

const nameOf = (c: AreaCode) => AREAS.find((a) => a.code === c)?.name ?? c;

/** Vista immediata di fine questionario: Ottogramma, benchmark, evidenze chiave e offerte. */
export default function Ottogramma({
  draft,
  reportStatus = "none",
  reportHref,
  previous,
}: {
  draft: Draft;
  reportStatus?: "none" | "pending" | "ready" | "failed";
  reportHref?: string;
  /** Diagnostico precedente della stessa azienda, per mostrare i progressi. */
  previous?: PreviousResult;
}) {
  const r = draft.responses;
  const band = r.profile["PR-02"];
  const [bench, setBench] = useState<Benchmark>(() => normativeBenchmark(band));

  useEffect(() => {
    if (!band) return;
    fetch(`/api/confronto?fascia=${encodeURIComponent(band)}`)
      .then((x) => (x.ok ? x.json() : null))
      .then((j: RealBenchmark | null) => {
        const real = medianBenchmark(j);
        if (real) setBench(real);
      })
      .catch(() => {});
  }, [band]);

  const res = useMemo(() => computeResult(r), [r]);
  const ins = useMemo(() => buildInsights(r, res, bench), [r, res, bench]);
  const company = r.profile["PR-11"];

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <p className="text-sm text-muted">
        {BRAND.reportName}
        {band ? ` · fatturato ${bandText(band)}` : ""}
        {r.profile["PR-01"] ? ` · ${r.profile["PR-01"]}` : ""}
      </p>
      <h1 className="mt-1 text-3xl sm:text-4xl font-semibold text-navy">{company ?? "La vostra azienda"}</h1>

      {reportStatus !== "none" && <ReportBanner status={reportStatus} href={reportHref} />}

      <div className="mt-8 grid gap-3 sm:grid-cols-3">
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
              : Math.abs(ins.deltaVsBenchmark) < 5
                ? "In linea con il riferimento"
                : ins.deltaVsBenchmark > 0
                  ? `${ins.deltaVsBenchmark} punti sopra il riferimento`
                  : `${-ins.deltaVsBenchmark} punti sotto il riferimento`
          }
        />
        <Kpi
          icon={TrendingDown}
          label="Equilibrio del profilo"
          value={`${ins.spread}`}
          unit=" punti"
          sub={ins.balanced ? "Profilo abbastanza omogeneo" : "Divario elevato tra gli ambiti"}
        />
      </div>

      <ScoreReading overall={ins.overall} reference={ins.benchmarkAvg} levels={ins.themes.map((t) => t.level)} />

      <section className="mt-10 grid gap-10 lg:grid-cols-[1.15fr_1fr] items-start">
        <div>
          <RadarProfile areas={res.areas} reference={bench.values} referenceLabel={bench.label} />
          <p className="mt-1 text-xs text-muted text-center">
            Dal centro verso l&apos;esterno: da «{LEVEL_NAMES[0]}» a «{LEVEL_NAMES[3]}». {bench.note}
          </p>
        </div>
        <div>
          <h2 className="text-xl font-semibold text-navy">Evidenze chiave</h2>
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

      {previous && (
        <Progress previous={previous} overall={ins.overall} scores={Object.fromEntries(res.areas.map((a) => [a.code, a.score]))} />
      )}

      {isSupabaseConfigured() && draft.savedId && !r.context && <InviteColleagues people={r.people ?? []} />}

      {isSupabaseConfigured() && draft.savedId && <Feedback kind="ottogramma" refId={draft.savedId} />}

      <p className="mt-10 text-xs text-muted flex gap-2 max-w-3xl">
        <Info className="size-4 shrink-0" aria-hidden />
        Autovalutazione orientativa basata sulle risposte fornite ed elaborata con la metodologia proprietaria di {BRAND.owner}: non è una
        consulenza né un rating; le risposte sono usate anche, in forma anonima e aggregata, per confronti tra aziende e ricerca.
      </p>
    </div>
  );
}

function ReportBanner({ status, href }: { status: "pending" | "ready" | "failed"; href?: string }) {
  if (status === "ready" && href)
    return (
      <div className="mt-6 rounded-xl border border-navy bg-navy/5 p-4 flex flex-wrap items-center gap-3">
        <p className="flex-1 text-sm">
          <strong className="text-navy">Il report approfondito è pronto.</strong> Analisi delle priorità, interventi suggeriti e primi passi
          per ciascun tema.
        </p>
        <Link href={href} className="inline-flex items-center gap-1.5 bg-navy text-white text-sm font-semibold px-4 py-2 rounded-lg">
          Apri il report <ArrowRight className="size-4" aria-hidden />
        </Link>
      </div>
    );
  if (status === "failed")
    return (
      <div className="mt-6 rounded-xl border border-line bg-paper p-4 text-sm text-muted">
        Il report approfondito non è stato generato: ci stiamo lavorando e ti avviseremo via email appena è pronto.
      </div>
    );
  return (
    <div className="mt-6 rounded-xl border border-line bg-paper p-4 flex items-start gap-3">
      <Clock3 className="size-5 text-navy shrink-0" aria-hidden strokeWidth={1.75} />
      <p className="text-sm">
        <strong className="text-navy">Il report approfondito è in elaborazione.</strong> Stiamo preparando l&apos;analisi delle priorità con
        gli interventi suggeriti: lo riceverete via email {BRAND.reportPromise} e lo ritroverete nell&apos;area personale.
      </p>
    </div>
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
