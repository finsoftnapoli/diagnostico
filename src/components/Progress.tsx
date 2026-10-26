import { ArrowDownRight, ArrowRight, ArrowUpRight, History } from "lucide-react";
import { AREA_SHORT } from "@/lib/areaIcons";
import { AREAS } from "@/lib/questionnaire";
import type { AreaCode } from "@/lib/types";

export interface PreviousResult {
  date: string;
  overall: number | null;
  scores: Partial<Record<AreaCode, number | null>>;
}

/** Variazione minima, in punti, considerata un cambiamento. */
const STEP = 5;

/** Confronto con il diagnostico precedente della stessa azienda. */
export default function Progress({
  previous,
  overall,
  scores,
}: {
  previous: PreviousResult;
  overall: number | null;
  scores: Partial<Record<AreaCode, number | null>>;
}) {
  const when = new Date(previous.date).toLocaleDateString("it-IT", { day: "numeric", month: "long", year: "numeric" });
  const delta = overall !== null && previous.overall !== null ? overall - previous.overall : null;
  const rows = AREAS.map((a) => {
    const now = scores[a.code];
    const before = previous.scores[a.code];
    return { code: a.code, now, before, d: now != null && before != null ? now - before : null };
  });
  const up = rows.filter((r) => r.d !== null && r.d >= STEP).length;
  const down = rows.filter((r) => r.d !== null && r.d <= -STEP).length;
  return (
    <section className="mt-10 rounded-xl border border-line p-5 print-keep">
      <h2 className="text-lg font-semibold text-navy flex items-center gap-2">
        <History className="size-5" aria-hidden strokeWidth={1.75} /> Rispetto al diagnostico del {when}
      </h2>
      <p className="mt-1 text-sm text-muted">
        {delta === null
          ? ""
          : delta >= STEP
            ? `Il punteggio complessivo sale di ${delta} punti. `
            : delta <= -STEP
              ? `Il punteggio complessivo scende di ${-delta} punti. `
              : "Il punteggio complessivo è sostanzialmente stabile. "}
        {up || down
          ? `${up ? `${up} ${up === 1 ? "ambito migliora" : "ambiti migliorano"}` : ""}${up && down ? ", " : ""}${
              down ? `${down} ${down === 1 ? "peggiora" : "peggiorano"}` : ""
            } di almeno ${STEP} punti.`
          : "Nessun ambito cambia di più di qualche punto."}
      </p>
      <ul className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4 text-sm">
        {rows.map((r) => {
          const Icon = r.d === null || Math.abs(r.d) < STEP ? ArrowRight : r.d > 0 ? ArrowUpRight : ArrowDownRight;
          return (
            <li key={r.code} className="rounded-lg bg-paper px-3 py-2 flex items-center justify-between gap-2">
              <span>{AREA_SHORT[r.code]}</span>
              <span className="flex items-center gap-1 tabular-nums">
                <span className="text-muted">{r.before ?? "—"}</span>
                <Icon className={`size-4 ${r.d !== null && r.d <= -STEP ? "text-accent" : "text-navy"}`} aria-hidden />
                <strong className="text-navy">{r.now ?? "—"}</strong>
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
