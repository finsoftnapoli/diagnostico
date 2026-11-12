"use client";
// Dettaglio dell'Ottogramma di un ambito: una scheda per sotto-ambito con punteggio, livello di maturità,
// confronto con il riferimento e, per ogni tema, la situazione di oggi e il passo successivo.
import { AlertTriangle, ArrowUpRight, ListOrdered, TrendingDown } from "lucide-react";
import { useState } from "react";
import { LEVEL_NAMES } from "@/lib/insights";
import type { ModuleResult } from "@/lib/module-scoring";
import { MODULE_QUESTIONS } from "@/lib/modules";
import type { AreaCode } from "@/lib/types";

const band = (s: number | null) => {
  if (s === null) return { name: "Non applicabile", chip: "bg-paper text-muted", bar: "bg-line" };
  if (s < 25) return { name: LEVEL_NAMES[0], chip: "bg-accent/10 text-accent", bar: "bg-accent" };
  if (s < 50) return { name: LEVEL_NAMES[1], chip: "bg-[#f9eeda] text-[#8a5a00]", bar: "bg-[#d99a2b]" };
  if (s < 75) return { name: LEVEL_NAMES[2], chip: "bg-navy/10 text-navy-soft", bar: "bg-navy-soft" };
  return { name: LEVEL_NAMES[3], chip: "bg-navy text-white", bar: "bg-navy" };
};

function Segments({ level }: { level: number | null }) {
  return (
    <span className="inline-flex gap-0.5" aria-label={level ? `livello ${level} di 4` : "non applicabile"}>
      {[1, 2, 3, 4].map((k) => (
        <span key={k} className={`w-2 h-3.5 rounded-sm ${level && k <= level ? "bg-navy" : "bg-line"}`} />
      ))}
    </span>
  );
}

export default function SubareaDetail({ area, result, reference }: { area: AreaCode; result: ModuleResult; reference: number | null }) {
  const [order, setOrder] = useState<"percorso" | "fragili">("percorso");
  const qs = MODULE_QUESTIONS[area];
  const scored = result.subs.filter((s) => s.score !== null);
  const weakest = new Set(
    [...scored]
      .sort((a, b) => (a.score as number) - (b.score as number))
      .slice(0, 2)
      .map((s) => s.code),
  );
  const subs = result.subs.map((s, i) => ({ ...s, n: i + 1 }));
  const shown = order === "percorso" ? subs : [...subs].sort((a, b) => (a.score ?? 101) - (b.score ?? 101));

  return (
    <section className="mt-10">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-navy">Sotto-ambito per sotto-ambito</h2>
          <p className="mt-1 text-sm text-muted">Per ogni tema: dove siete oggi e il passo che porta al livello successivo.</p>
        </div>
        <div className="no-print inline-flex rounded-lg border border-line p-0.5 text-sm" role="group" aria-label="Ordine">
          {(
            [
              ["percorso", "Ordine del modulo", ListOrdered],
              ["fragili", "Dal più fragile", TrendingDown],
            ] as const
          ).map(([k, label, Icon]) => (
            <button
              key={k}
              type="button"
              onClick={() => setOrder(k)}
              aria-pressed={order === k}
              className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 ${order === k ? "bg-navy text-white" : "text-muted hover:text-ink"}`}
            >
              <Icon className="size-4" aria-hidden /> {label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
        {[10, 30, 60, 90].map((v) => {
          const b = band(v);
          return (
            <span key={v} className="inline-flex items-center gap-1.5">
              <span className={`size-2.5 rounded-full ${b.bar}`} /> {b.name}
            </span>
          );
        })}
        {reference !== null && (
          <span className="inline-flex items-center gap-1.5">
            <span className="h-3 w-0.5 bg-ink/60" /> Riferimento di fascia
          </span>
        )}
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        {shown.map((s) => {
          const b = band(s.score);
          const themes = result.themes.filter((t) => t.sub === s.code);
          return (
            <article
              key={s.code}
              className={`print-keep rounded-xl border p-4 sm:p-5 ${weakest.has(s.code) ? "border-accent/40" : "border-line"}`}
            >
              <div className="flex items-start gap-3">
                <span className="shrink-0 size-7 rounded-full bg-paper text-navy text-xs font-semibold flex items-center justify-center">
                  {s.n}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-navy">{s.name}</h3>
                    {weakest.has(s.code) && <span className="text-[11px] font-semibold uppercase tracking-wide text-accent">Priorità</span>}
                  </div>
                  <p className="text-xs text-muted">{s.description}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-semibold text-navy tabular-nums leading-none">{s.score ?? "—"}</p>
                  <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold ${b.chip}`}>{b.name}</span>
                </div>
              </div>

              <div className="relative mt-3 h-2 rounded-full bg-paper">
                {s.score !== null && (
                  <span className={`absolute inset-y-0 left-0 rounded-full ${b.bar}`} style={{ width: `${Math.max(s.score, 3)}%` }} />
                )}
                {reference !== null && (
                  <span
                    className="absolute -top-1 -bottom-1 w-0.5 bg-ink/60"
                    style={{ left: `${reference}%` }}
                    title={`Riferimento di fascia: ${reference}`}
                  />
                )}
              </div>

              <ul className="mt-4 divide-y divide-line">
                {themes.map((t) => {
                  const q = qs.find((x) => x.id === t.id);
                  const now = q && t.level ? q.levels[t.level - 1] : null;
                  const next = q && t.level && t.level < 4 ? q.levels[t.level] : null;
                  return (
                    <li key={t.id} className="py-3 first:pt-0 last:pb-0">
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-sm font-medium text-ink">{t.theme}</span>
                        <span className="flex items-center gap-2 text-xs text-muted tabular-nums">
                          {t.level ? `${t.level}/4` : "n.a."} <Segments level={t.level} />
                        </span>
                      </div>
                      {now && <p className="mt-1 text-xs text-muted leading-relaxed">Oggi: {now}</p>}
                      {next && (
                        <p className="mt-1 text-xs leading-relaxed text-navy-soft flex gap-1">
                          <ArrowUpRight className="size-3.5 shrink-0 mt-px" aria-hidden />
                          <span>
                            <span className="font-medium">Passo successivo:</span> {next}
                          </span>
                        </p>
                      )}
                      {t.level === 4 && <p className="mt-1 text-xs text-navy-soft">Livello più avanzato: da mantenere.</p>}
                      {t.flag && (
                        <p className="mt-1.5 flex gap-1.5 rounded-md bg-accent/5 px-2 py-1.5 text-xs text-ink">
                          <AlertTriangle className="size-3.5 shrink-0 mt-px text-accent" aria-hidden /> {t.flag}
                        </p>
                      )}
                    </li>
                  );
                })}
              </ul>
            </article>
          );
        })}
      </div>
    </section>
  );
}
