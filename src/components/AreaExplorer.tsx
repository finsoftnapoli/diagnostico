"use client";

import { ArrowRight } from "lucide-react";
import { AREA_SHORT, AreaIcon } from "@/lib/areaIcons";
import { LEVEL_NAMES, levelLabel, type ThemeView } from "@/lib/insights";
import type { AreaResult } from "@/lib/scoring";
import { areaReading } from "@/lib/score-meaning";
import type { AreaCode } from "@/lib/types";

/** Ottogramma esplorabile: si sceglie un ambito (anche toccandone il nome sul grafico) e se ne legge il dettaglio. */
export default function AreaExplorer({
  areas,
  themes,
  reference,
  referenceKind,
  selected,
  onSelect,
  detailHref,
}: {
  areas: AreaResult[];
  themes: ThemeView[];
  reference: Record<AreaCode, number>;
  referenceKind: string;
  selected: AreaCode | null;
  onSelect: (code: AreaCode | null) => void;
  /** Ancora della sezione di dettaglio, se presente nella pagina. */
  detailHref?: string;
}) {
  const a = areas.find((x) => x.code === selected);
  const mine = themes.filter((t) => t.area === selected);
  return (
    <div className="no-print mt-6">
      <p className="text-sm text-muted">Scelga un ambito per vedere da cosa dipende il punteggio e qual è il passo successivo.</p>
      <div className="mt-3 flex flex-wrap gap-2" role="tablist" aria-label="Ambiti">
        {areas.map((x) => (
          <button
            key={x.code}
            type="button"
            role="tab"
            aria-selected={selected === x.code}
            onClick={() => onSelect(selected === x.code ? null : x.code)}
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm ${
              selected === x.code ? "border-navy bg-navy text-white" : "border-line text-ink hover:border-navy"
            }`}
          >
            <AreaIcon code={x.code} className="size-4" />
            {AREA_SHORT[x.code]}
            <span className={`tabular-nums ${selected === x.code ? "text-white/70" : "text-muted"}`}>{x.score ?? "—"}</span>
          </button>
        ))}
      </div>
      {a && (
        <div role="tabpanel" className="mt-4 rounded-xl border border-navy/30 bg-navy/[0.03] p-5">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h3 className="text-lg font-semibold text-navy">{a.name}</h3>
            <p className="text-sm text-muted">
              <strong className="text-ink">{a.score ?? "—"}</strong> su 100 · {levelLabel(a.score)} · {referenceKind} {reference[a.code]}
              {a.isPriority ? ` · priorità ${a.rank}` : ""}
            </p>
          </div>
          <p className="mt-2 text-sm leading-relaxed">
            {areaReading(
              a.score,
              reference[a.code],
              mine.map((t) => t.level),
            )}
          </p>
          <ul className="mt-4 grid gap-4 md:grid-cols-3">
            {mine.map((t) => (
              <li key={t.id} className="rounded-lg bg-white border border-line p-3 text-sm">
                <p className="font-medium">{t.theme}</p>
                <p className="mt-1 text-xs uppercase tracking-wide text-muted">Oggi · {LEVEL_NAMES[t.level - 1]}</p>
                <p className="text-muted">{t.current}</p>
                {t.next && (
                  <>
                    <p className="mt-2 text-xs uppercase tracking-wide font-semibold text-navy">
                      Passo successivo · {LEVEL_NAMES[t.level]}
                    </p>
                    <p>{t.next}</p>
                  </>
                )}
              </li>
            ))}
          </ul>
          {detailHref && (
            <a href={detailHref} className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-navy underline">
              Tutti gli ambiti a confronto <ArrowRight className="size-4" aria-hidden />
            </a>
          )}
        </div>
      )}
    </div>
  );
}
