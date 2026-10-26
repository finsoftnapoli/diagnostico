import { AlertTriangle, ArrowRight, Clock3, Gauge } from "lucide-react";
import Link from "next/link";
import { AreaIcon } from "@/lib/areaIcons";
import { levelLabel } from "@/lib/insights";
import type { ModuleNarrative } from "@/lib/module-report";
import type { ThemeResult } from "@/lib/module-scoring";
import { AREAS } from "@/lib/questionnaire";
import type { AreaCode } from "@/lib/types";
import PrintButton from "./PrintButton";

/** Risultato di un modulo: punteggi per tema subito, analisi scritta quando approvata dallo staff. */
export default function ModuleReport({
  area,
  company,
  score,
  diagnosticScore,
  themes,
  narrative,
  failed,
}: {
  area: AreaCode;
  company: string;
  score: number | null;
  diagnosticScore: number | null;
  themes: ThemeResult[];
  narrative: ModuleNarrative | null;
  failed?: boolean;
}) {
  const a = AREAS.find((x) => x.code === area)!;
  const flags = themes.filter((t) => t.flag);
  return (
    <div>
      <div className="flex items-start gap-4">
        <span className="shrink-0 size-12 rounded-xl bg-navy text-white flex items-center justify-center">
          <AreaIcon code={area} className="size-6" />
        </span>
        <div className="flex-1">
          <p className="text-sm text-muted">Approfondimento · {company}</p>
          <h1 className="text-3xl font-semibold text-navy leading-tight">{a.name}</h1>
        </div>
        {narrative && <PrintButton />}
      </div>

      <div className="mt-8 grid gap-3 sm:grid-cols-2">
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
        {diagnosticScore !== null && (
          <div className="rounded-xl border border-line p-4">
            <p className="text-xs uppercase tracking-wide text-muted">Nel diagnostico iniziale</p>
            <p className="mt-2">
              <span className="text-3xl font-semibold text-navy tabular-nums">{diagnosticScore}</span>
              <span className="text-muted">/100</span>
            </p>
            <p className="text-sm text-muted">
              {score === null ? "" : Math.abs(score - diagnosticScore) <= 8 ? "L'approfondimento conferma il quadro iniziale" : score > diagnosticScore ? "Il dettaglio mostra un quadro migliore" : "Il dettaglio mostra più lacune del previsto"}
            </p>
          </div>
        )}
      </div>

      <section className="mt-10">
        <h2 className="text-xl font-semibold text-navy">Tema per tema</h2>
        <ul className="mt-4 space-y-2.5">
          {themes.map((t) => (
            <li key={t.id} className="grid grid-cols-[minmax(0,1fr)_auto] sm:grid-cols-[16rem_minmax(0,1fr)_3rem] items-center gap-x-4 gap-y-1 text-sm">
              <span className="font-medium">{t.theme}</span>
              <span className="order-3 sm:order-none col-span-2 sm:col-span-1 h-2.5 rounded-full bg-line overflow-hidden">
                {t.score !== null && <span className="block h-full bg-navy" style={{ width: `${Math.max(t.score, 3)}%` }} />}
              </span>
              <span className="text-right tabular-nums text-muted">{t.score === null ? "n.a." : t.score}</span>
            </li>
          ))}
        </ul>
        {flags.length > 0 && (
          <div className="mt-5 rounded-lg bg-paper p-4 text-sm">
            <p className="font-semibold flex items-center gap-1.5">
              <AlertTriangle className="size-4 text-accent" aria-hidden /> Da verificare
            </p>
            <ul className="mt-2 space-y-1">
              {flags.map((t) => (
                <li key={t.id}>{t.flag}</li>
              ))}
            </ul>
          </div>
        )}
      </section>

      {narrative ? (
        <section className="mt-10 rounded-xl border border-navy/30 bg-navy/[0.03] p-5 sm:p-7">
          <p className="text-xs uppercase tracking-wide text-muted">Analisi dei nostri esperti</p>
          <h2 className="mt-1 text-2xl font-semibold text-navy">Sintesi</h2>
          <div className="mt-3 space-y-3 leading-relaxed">
            {narrative.summary.split(/\n\n+/).map((p) => (
              <p key={p.slice(0, 40)}>{p}</p>
            ))}
          </div>
          <h3 className="mt-8 font-semibold text-navy">Lettura per tema</h3>
          <div className="mt-3 space-y-3">
            {narrative.themes.map((t) => (
              <div key={t.theme} className="rounded-lg bg-white border border-line p-4">
                <p className="font-semibold">{t.theme}</p>
                <p className="mt-1.5 text-sm leading-relaxed">{t.diagnosis}</p>
                {t.actions.length > 0 && (
                  <ul className="mt-2 space-y-1 text-sm">
                    {t.actions.map((x) => (
                      <li key={x} className="flex gap-2">
                        <ArrowRight className="size-4 mt-0.5 shrink-0 text-navy" aria-hidden /> {x}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
          <h3 className="mt-8 font-semibold text-navy">Piano di lavoro</h3>
          <div className="mt-3 grid gap-3 md:grid-cols-3">
            {narrative.roadmap.map((h) => (
              <div key={h.horizon} className="rounded-lg bg-white border border-line p-4">
                <p className="text-xs uppercase tracking-wide text-muted">{h.horizon}</p>
                <ul className="mt-2 space-y-1.5 text-sm list-disc pl-4">
                  {h.actions.map((x) => (
                    <li key={x}>{x}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          {narrative.kpis.length > 0 && (
            <>
              <h3 className="mt-8 font-semibold text-navy">Indicatori da seguire</h3>
              <ul className="mt-2 space-y-1 text-sm list-disc pl-5">
                {narrative.kpis.map((k) => (
                  <li key={k}>{k}</li>
                ))}
              </ul>
            </>
          )}
          {narrative.closing && <p className="mt-8 leading-relaxed">{narrative.closing}</p>}
          <Link href="/area/servizi#consulenza" className="no-print mt-5 inline-flex items-center gap-1.5 bg-navy text-white text-sm font-semibold px-4 py-2 rounded-lg">
            Prenota una consulenza <ArrowRight className="size-4" aria-hidden />
          </Link>
        </section>
      ) : (
        <div className="mt-10 rounded-xl border border-line bg-paper p-4 flex items-start gap-3">
          <Clock3 className="size-5 text-navy shrink-0" aria-hidden strokeWidth={1.75} />
          <p className="text-sm">
            {failed ? (
              <>
                <strong className="text-navy">L&apos;analisi è in ritardo.</strong> Ci stiamo lavorando e ti avviseremo via email appena è pronta.
              </>
            ) : (
              <>
                <strong className="text-navy">L&apos;analisi è in preparazione.</strong> I nostri esperti stanno preparando la lettura tema per tema, il
                piano di lavoro e gli indicatori: la riceverai via email entro 48 ore.
              </>
            )}
          </p>
        </div>
      )}
    </div>
  );
}
