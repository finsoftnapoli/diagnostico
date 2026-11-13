import Feedback from "@/components/Feedback";
import { ArrowRight, Clock3, Gauge } from "lucide-react";
import Link from "next/link";
import { AreaIcon } from "@/lib/areaIcons";
import { levelLabel } from "@/lib/insights";
import { moduleReading } from "@/lib/score-meaning";
import type { ModuleNarrative } from "@/lib/module-report";
import type { ModuleResult } from "@/lib/module-scoring";
import { AREAS } from "@/lib/questionnaire";
import { SubareaIcon } from "@/lib/subareaIcons";
import type { AreaCode } from "@/lib/types";
import { BRAND } from "@/config/brand";
import PdfDownload from "./PdfDownload";
import RadarProfile from "./RadarProfile";
import ScoreReading from "./ScoreReading";
import SubareaDetail from "./SubareaDetail";

/** Risultato di un modulo: Ottogramma dell'ambito subito, analisi scritta quando è rilasciata. */
export default function ModuleReport({
  area,
  company,
  result,
  diagnosticScore,
  reference,
  narrative,
  failed,
  pdfHref,
  reviewed = false,
  id,
}: {
  area: AreaCode;
  company: string;
  result: ModuleResult;
  diagnosticScore: number | null;
  /** Riferimento indicativo dell'ambito per la fascia di fatturato (stesso valore su tutti i vertici). */
  reference: { value: number; label: string } | null;
  narrative: ModuleNarrative | null;
  failed?: boolean;
  /** Link al PDF impaginato, quando l'analisi è approvata. */
  pdfHref?: string;
  /** Vero se un esperto ha rivisto e approvato il report prima dell'invio. */
  reviewed?: boolean;
  /** Identificativo del modulo, per i riscontri del cliente. */
  id?: string;
}) {
  const a = AREAS.find((x) => x.code === area)!;
  const score = result.score;
  const scored = result.subs.filter((x) => x.score !== null);
  const strongest = [...scored].sort((x, y) => (y.score as number) - (x.score as number)).slice(0, 2);
  const weakest = [...scored].sort((x, y) => (x.score as number) - (y.score as number)).slice(0, 2);
  const spread = scored.length ? (strongest[0].score as number) - (weakest[0].score as number) : 0;
  return (
    <div>
      <div className="flex items-start gap-4">
        <span className="shrink-0 size-12 rounded-xl bg-navy text-white flex items-center justify-center">
          <AreaIcon code={area} className="size-6" />
        </span>
        <div className="flex-1">
          <p className="text-sm text-muted">Ottogramma dell&apos;ambito · {company}</p>
          <h1 className="text-3xl font-semibold text-navy leading-tight">{a.name}</h1>
        </div>
        {narrative && pdfHref && <PdfDownload href={pdfHref} />}
      </div>

      <div className="mt-8 grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-line p-4">
          <p className="text-xs uppercase tracking-wide text-muted flex items-center gap-1.5">
            <Gauge className="size-4" aria-hidden /> Punteggio dell&apos;ambito
          </p>
          <p className="mt-2">
            <span className="text-3xl font-semibold text-navy tabular-nums">{score ?? "—"}</span>
            <span className="text-muted">/100</span>
          </p>
          <p className="text-sm text-muted">{levelLabel(score)}</p>
        </div>
        <div className="rounded-xl border border-line p-4">
          <p className="text-xs uppercase tracking-wide text-muted">Nel diagnostico iniziale</p>
          <p className="mt-2">
            <span className="text-3xl font-semibold text-navy tabular-nums">{diagnosticScore ?? "—"}</span>
            <span className="text-muted">/100</span>
          </p>
          <p className="text-sm text-muted">
            {score === null || diagnosticScore === null
              ? ""
              : Math.abs(score - diagnosticScore) <= 8
                ? "L'approfondimento conferma il quadro iniziale"
                : score > diagnosticScore
                  ? "Il dettaglio mostra un quadro migliore"
                  : "Il dettaglio mostra più lacune del previsto"}
          </p>
        </div>
        <div className="rounded-xl border border-line p-4">
          <p className="text-xs uppercase tracking-wide text-muted">Equilibrio dei sotto-ambiti</p>
          <p className="mt-2">
            <span className="text-3xl font-semibold text-navy tabular-nums">{spread}</span>
            <span className="text-muted"> punti</span>
          </p>
          <p className="text-sm text-muted">{spread <= 33 ? "Profilo equilibrato" : "Divario elevato tra i sotto-ambiti"}</p>
        </div>
      </div>

      <ScoreReading
        overall={score}
        reference={reference?.value ?? null}
        levels={result.themes.filter((t) => t.level !== null).map((t) => t.level as number)}
        lines={moduleReading(
          score,
          reference?.value ?? null,
          result.themes.filter((t) => t.level !== null).map((t) => t.level as number),
        )}
      />

      <section className="mt-10 grid gap-8 lg:grid-cols-[1.15fr_1fr] items-start print-keep">
        <div>
          <RadarProfile
            fontSize={11}
            items={result.subs.map((x) => ({
              label: x.short,
              score: x.score,
              ref: reference?.value ?? null,
              highlight: weakest.some((w) => w.code === x.code),
            }))}
            referenceLabel={reference?.label}
          />
          <p className="mt-1 text-xs text-muted text-center">
            Dal centro verso l&apos;esterno: da «Informale» a «Gestito e migliorato». In evidenza i due sotto-ambiti più fragili.
            {reference
              ? ` La linea tratteggiata è il ${reference.label.charAt(0).toLowerCase()}${reference.label.slice(1)} per l'intero ambito.`
              : ""}
          </p>
        </div>
        <div className="grid gap-3 text-sm">
          <div className="rounded-xl bg-paper p-4">
            <p className="font-semibold text-navy">Più solidi</p>
            <ul className="mt-2 space-y-1">
              {strongest.map((x) => (
                <li key={x.code} className="flex items-center gap-2">
                  <SubareaIcon code={x.code} className="size-4 text-navy" /> {x.name} <span className="text-muted">({x.score})</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl bg-paper p-4">
            <p className="font-semibold text-navy">Più fragili</p>
            <ul className="mt-2 space-y-1">
              {weakest.map((x) => (
                <li key={x.code} className="flex items-center gap-2">
                  <SubareaIcon code={x.code} className="size-4 text-navy" /> {x.name} <span className="text-muted">({x.score})</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {narrative && (
        <section className="mt-10 rounded-xl border border-navy/30 bg-navy/[0.03] p-5 sm:p-7">
          <p className="text-xs uppercase tracking-wide text-muted">{reviewed ? "Analisi rivista da un nostro esperto" : "Analisi"}</p>
          <h2 className="mt-1 text-2xl font-semibold text-navy">Sintesi</h2>
          <div className="mt-3 space-y-3 leading-relaxed">
            {narrative.summary.split(/\n\n+/).map((p) => (
              <p key={p.slice(0, 40)}>{p}</p>
            ))}
          </div>
        </section>
      )}

      <SubareaDetail
        area={area}
        result={result}
        reference={reference?.value ?? null}
        reviewed={reviewed}
        expert={
          narrative ? Object.fromEntries(narrative.themes.map((t) => [t.theme, { diagnosis: t.diagnosis, actions: t.actions }])) : undefined
        }
      />

      {narrative ? (
        <>
          <section className="mt-14">
            <h2 className="text-2xl font-semibold text-navy">Piano di lavoro</h2>
            <p className="mt-1 text-sm text-muted">Gli interventi in sequenza: prima le basi, poi il resto.</p>
            <div className="mt-5 grid gap-4 md:grid-cols-3">
              {narrative.roadmap.map((h, i) => (
                <div key={h.horizon} className="print-keep rounded-xl border border-line p-5">
                  <div className="flex items-center gap-2">
                    <span className="size-7 rounded-full bg-navy text-white text-xs font-semibold flex items-center justify-center">
                      {i + 1}
                    </span>
                    <p className="font-semibold text-navy">{h.horizon}</p>
                  </div>
                  <ul className="mt-3 space-y-2 text-sm">
                    {h.actions.map((x) => (
                      <li key={x} className="flex gap-2">
                        <span className="mt-0.5 size-4 shrink-0 rounded border-2 border-navy/60" aria-hidden />
                        <span>{x}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>
          {narrative.kpis.length > 0 && (
            <section className="mt-12">
              <h2 className="text-2xl font-semibold text-navy">Indicatori da seguire</h2>
              <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                {narrative.kpis.map((k) => (
                  <li key={k} className="flex gap-3 rounded-xl bg-paper p-4 text-sm">
                    <Gauge className="size-4 mt-0.5 shrink-0 text-navy" aria-hidden /> {k}
                  </li>
                ))}
              </ul>
            </section>
          )}
          <section className="print-keep mt-12 rounded-xl bg-navy p-6 text-white sm:p-8">
            <h2 className="text-xl font-semibold">Il prossimo passo</h2>
            {narrative.closing && <p className="mt-2 max-w-3xl leading-relaxed text-white/90">{narrative.closing}</p>}
            <Link
              href="/area/servizi#consulenza"
              className="no-print mt-5 inline-flex items-center gap-1.5 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-navy"
            >
              Prenota una consulenza <ArrowRight className="size-4" aria-hidden />
            </Link>
          </section>
        </>
      ) : (
        <div className="mt-10 rounded-xl border border-line bg-paper p-4 flex items-start gap-3">
          <Clock3 className="size-5 text-navy shrink-0" aria-hidden strokeWidth={1.75} />
          <p className="text-sm">
            {failed ? (
              <>
                <strong className="text-navy">L&apos;analisi è in ritardo.</strong> Ci stiamo lavorando e vi avviseremo via email appena è
                pronta.
              </>
            ) : (
              <>
                <strong className="text-navy">L&apos;analisi è in preparazione.</strong> Stiamo preparando la lettura per sotto-ambito, il
                piano di lavoro e gli indicatori: la riceverete via email {BRAND.reportPromise}.
              </>
            )}
          </p>
        </div>
      )}
      {narrative && id && (
        <div className="mt-10 grid gap-4 sm:grid-cols-2 print:hidden">
          <Feedback kind="modulo" refId={id} />
          <Feedback kind="modulo" refId={id} ask />
        </div>
      )}
    </div>
  );
}
