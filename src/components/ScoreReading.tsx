// "Come leggere il punteggio": scala dei quattro livelli di maturità con la posizione dell'azienda e del riferimento,
// e la lettura del punteggio in parole.
import { LEVEL_NAMES } from "@/lib/insights";
import { LEVEL_DESCRIPTIONS, overallReading } from "@/lib/score-meaning";

const BANDS = [
  { from: 0, to: 25, cls: "bg-accent/15", dot: "bg-accent" },
  { from: 25, to: 50, cls: "bg-[#f9eeda]", dot: "bg-[#d99a2b]" },
  { from: 50, to: 75, cls: "bg-navy/10", dot: "bg-navy-soft" },
  { from: 75, to: 100, cls: "bg-navy/25", dot: "bg-navy" },
];

export default function ScoreReading({
  overall,
  reference,
  levels,
  lines: given,
}: {
  overall: number | null;
  reference: number | null;
  levels: number[];
  /** Lettura già pronta (per i moduli); altrimenti quella del diagnostico. */
  lines?: string[];
}) {
  if (overall === null) return null;
  const lines = given ?? (reference === null ? [] : overallReading(overall, reference, levels));
  return (
    <section className="mt-8 rounded-xl border border-line p-5 sm:p-6 print-keep">
      <h2 className="text-lg font-semibold text-navy">Come leggere il punteggio</h2>
      <div className="relative mt-8 mb-2">
        <div className="flex h-3 overflow-hidden rounded-full">
          {BANDS.map((b) => (
            <span key={b.from} className={`flex-1 ${b.cls}`} />
          ))}
        </div>
        {reference !== null && <Marker value={reference} label={`Riferimento ${reference}`} tone="muted" />}
        <Marker value={overall} label={`Voi ${overall}`} tone="navy" />
        <div className="mt-2 grid grid-cols-4 text-[11px] text-muted">
          {LEVEL_NAMES.map((n, i) => (
            <span key={n} className={i === 3 ? "text-right" : i === 0 ? "" : "text-center"}>
              {n}
            </span>
          ))}
        </div>
      </div>
      <div className="mt-4 space-y-2 text-sm leading-relaxed">
        {lines.map((l) => (
          <p key={l}>{l}</p>
        ))}
      </div>
      <details className="mt-4 text-sm group">
        <summary className="cursor-pointer font-medium text-navy-soft">Cosa significano i quattro livelli</summary>
        <dl className="mt-3 grid gap-3 sm:grid-cols-2">
          {LEVEL_NAMES.map((n, i) => (
            <div key={n} className="flex gap-2.5">
              <span className={`mt-1.5 size-2.5 shrink-0 rounded-full ${BANDS[i].dot}`} />
              <div>
                <dt className="font-semibold">{n}</dt>
                <dd className="text-muted">{LEVEL_DESCRIPTIONS[i]}</dd>
              </div>
            </div>
          ))}
        </dl>
      </details>
    </section>
  );
}

function Marker({ value, label, tone }: { value: number; label: string; tone: "navy" | "muted" }) {
  const left = Math.min(98, Math.max(2, value));
  return (
    <div className="absolute -top-6 flex -translate-x-1/2 flex-col items-center" style={{ left: `${left}%` }}>
      <span className={`whitespace-nowrap text-[11px] font-semibold ${tone === "navy" ? "text-navy" : "text-muted"}`}>{label}</span>
      <span className={`mt-0.5 h-5 w-0.5 ${tone === "navy" ? "bg-navy" : "bg-ink/50"}`} />
    </div>
  );
}
