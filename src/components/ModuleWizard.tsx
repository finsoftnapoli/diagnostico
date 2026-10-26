"use client";

import { Check, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AreaIcon } from "@/lib/areaIcons";
import type { ModuleResponses } from "@/lib/module-scoring";
import { MODULE_QUESTIONS, MODULE_SUBAREAS, type ModuleQuestion } from "@/lib/modules";
import { AREAS } from "@/lib/questionnaire";
import type { AreaCode } from "@/lib/types";

/** Compilazione di un modulo di approfondimento: tutte le domande dell'ambito, salvataggio automatico. */
export default function ModuleWizard({ id, area, initial }: { id: string; area: AreaCode; initial: ModuleResponses }) {
  const router = useRouter();
  const qs = MODULE_QUESTIONS[area];
  const a = AREAS.find((x) => x.code === area)!;
  const [r, setR] = useState<ModuleResponses>(initial);
  const [saved, setSaved] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const dirty = useRef(false);

  // salvataggio automatico qualche istante dopo l'ultima modifica
  useEffect(() => {
    if (!dirty.current) return;
    const t = setTimeout(async () => {
      setSaved("saving");
      const res = await fetch(`/api/moduli/${id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ responses: r }),
      }).catch(() => null);
      setSaved(res?.ok ? "saved" : "error");
    }, 800);
    return () => clearTimeout(t);
  }, [r, id]);

  const update = (p: Partial<ModuleResponses>) => {
    dirty.current = true;
    setR((x) => ({ ...x, ...p }));
  };

  const answered = qs.filter((q) => r.levels[q.id] !== undefined && (!q.check || r.levels[q.id] === 0 || r.checks[q.id])).length;

  async function submit() {
    setSending(true);
    setError(null);
    const res = await fetch(`/api/moduli/${id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ responses: r, complete: true }),
    });
    const j = (await res.json().catch(() => ({}))) as { error?: string };
    setSending(false);
    if (!res.ok) return setError(j.error ?? "Invio non riuscito");
    router.refresh();
  }

  return (
    <div>
      <div className="flex items-start gap-4">
        <span className="shrink-0 size-12 rounded-xl bg-navy text-white flex items-center justify-center">
          <AreaIcon code={area} className="size-6" />
        </span>
        <div>
          <p className="text-sm text-muted">Approfondimento</p>
          <h1 className="text-3xl font-semibold text-navy leading-tight">{a.name}</h1>
          <p className="mt-1 text-muted">
            8 sotto-ambiti, {qs.length} domande. Per ciascuna scegli la situazione più vicina alla realtà di oggi, non a quella desiderata.
            Le risposte si salvano da sole: puoi interrompere e riprendere quando vuoi.
          </p>
        </div>
      </div>

      <div className="sticky top-0 z-10 mt-6 -mx-4 px-4 py-3 bg-white/95 backdrop-blur border-b border-line flex items-center gap-3 text-sm">
        <div className="flex-1 h-2 rounded-full bg-line overflow-hidden">
          <div className="h-full bg-navy transition-all" style={{ width: `${(answered / qs.length) * 100}%` }} />
        </div>
        <span className="tabular-nums text-muted">
          {answered}/{qs.length}
        </span>
        <span className="text-xs text-muted w-24 text-right">
          {saved === "saving" ? "Salvataggio…" : saved === "saved" ? "Salvato" : saved === "error" ? "Non salvato" : ""}
        </span>
      </div>

      <div className="mt-6 space-y-10">
        {MODULE_SUBAREAS[area].map((sa, si) => (
          <section key={sa.code} aria-labelledby={`sa-${sa.code}`}>
            <p className="text-xs font-medium uppercase tracking-wide text-muted">Sotto-ambito {si + 1} di 8</p>
            <h2 id={`sa-${sa.code}`} className="text-xl font-semibold text-navy">
              {sa.name}
            </h2>
            <p className="text-sm text-muted">{sa.description}</p>
            <div className="mt-4 space-y-5">
              {qs
                .filter((q) => q.sub === sa.code)
                .map((q) => (
                  <Question key={q.id} q={q} qi={qs.indexOf(q)} total={qs.length} r={r} update={update} />
                ))}
            </div>
          </section>
        ))}

        <label className="block rounded-xl border border-line p-4 sm:p-5">
          <span className="font-semibold text-ink">Qualcosa da aggiungere per il nostro analista? (facoltativo)</span>
          <span className="block text-sm text-muted">Progetti in corso, vincoli, domande specifiche sull&apos;ambito.</span>
          <textarea
            value={r.notes ?? ""}
            onChange={(e) => update({ notes: e.target.value })}
            maxLength={3000}
            rows={4}
            className="mt-3 w-full rounded-lg border border-line px-3 py-2 text-sm"
          />
        </label>
      </div>

      <div className="mt-8 flex flex-wrap items-center gap-4">
        <button
          onClick={submit}
          disabled={sending || answered < qs.length}
          className="inline-flex items-center gap-2 bg-navy text-white font-semibold px-5 py-2.5 rounded-lg disabled:opacity-50"
        >
          {sending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <Check className="size-4" aria-hidden />} Invia per
          l&apos;analisi
        </button>
        <p className="text-sm text-muted">
          {answered < qs.length ? `Mancano ${qs.length - answered} risposte.` : "Dopo l'invio non potrai più modificare le risposte."}
        </p>
      </div>
      {error && <p className="mt-3 text-sm text-accent">{error}</p>}
    </div>
  );
}

function Question({
  q,
  qi,
  total,
  r,
  update,
}: {
  q: ModuleQuestion;
  qi: number;
  total: number;
  r: ModuleResponses;
  update: (p: Partial<ModuleResponses>) => void;
}) {
  return (
    <fieldset className="rounded-xl border border-line p-4 sm:p-5">
      <legend className="sr-only">{q.text}</legend>
      <p className="text-xs font-medium uppercase tracking-wide text-muted">
        {qi + 1}/{total} · {q.theme}
      </p>
      <p className="mt-1 font-semibold text-ink">{q.text}</p>
      <div className="mt-3 space-y-2">
        {q.levels.map((txt, i) => {
          const lvl = i + 1;
          const on = r.levels[q.id] === lvl;
          return (
            <label
              key={lvl}
              className={`flex gap-3 items-start border rounded-lg px-3 py-3 cursor-pointer text-sm leading-snug transition ${
                on ? "border-navy bg-navy/5" : "border-line hover:border-navy-soft"
              }`}
            >
              <input
                type="radio"
                name={q.id}
                className="sr-only"
                checked={on}
                onChange={() => update({ levels: { ...r.levels, [q.id]: lvl } })}
              />
              <span className="shrink-0 flex gap-0.5 mt-1" aria-hidden>
                {[1, 2, 3, 4].map((k) => (
                  <span key={k} className={`w-1.5 h-3.5 rounded-sm ${k <= lvl ? (on ? "bg-navy" : "bg-navy/35") : "bg-line"}`} />
                ))}
              </span>
              <span className={on ? "text-ink" : ""}>{txt}</span>
            </label>
          );
        })}
        {q.na && (
          <label
            className={`flex gap-3 items-center border rounded-lg px-3 py-2 cursor-pointer text-sm ${r.levels[q.id] === 0 ? "border-navy bg-navy/5" : "border-line border-dashed"}`}
          >
            <input
              type="radio"
              name={q.id}
              className="sr-only"
              checked={r.levels[q.id] === 0}
              onChange={() => update({ levels: { ...r.levels, [q.id]: 0 } })}
            />
            <span className="text-muted">Non riguarda la nostra azienda</span>
          </label>
        )}
      </div>
      {q.check && r.levels[q.id] !== 0 && (
        <div className="mt-4 rounded-lg bg-paper px-3 py-3">
          <p className="text-sm">
            <span className="font-medium">Verifica rapida · </span>
            {q.check.text}
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {q.check.options.map((o) => {
              const on = r.checks[q.id] === o;
              return (
                <button
                  key={o}
                  type="button"
                  onClick={() => update({ checks: { ...r.checks, [q.id]: o } })}
                  aria-pressed={on}
                  className={`text-sm px-3 py-1.5 rounded-full border ${on ? "bg-navy text-white border-navy" : "bg-white border-line hover:border-navy-soft"}`}
                >
                  {o}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </fieldset>
  );
}
