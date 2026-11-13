"use client";

import { ArrowLeft, ArrowRight, Check, Loader2, Send } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AreaIcon } from "@/lib/areaIcons";
import { SubareaIcon } from "@/lib/subareaIcons";
import type { ModuleResponses } from "@/lib/module-scoring";
import { MODULE_QUESTIONS, MODULE_SUBAREAS, type ModuleQuestion } from "@/lib/modules";
import { AREAS } from "@/lib/questionnaire";
import type { AreaCode } from "@/lib/types";
import LiveOttogramma, { type LiveVertex } from "./LiveOttogramma";

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

  const isDone = (q: ModuleQuestion) => r.levels[q.id] !== undefined && (!q.check || r.levels[q.id] === 0 || !!r.checks[q.id]);
  const answered = qs.filter(isDone).length;
  const subs = MODULE_SUBAREAS[area];
  const subDone = (code: string) => qs.filter((q) => q.sub === code).every(isDone);
  const subStarted = (code: string) => qs.some((q) => q.sub === code && r.levels[q.id] !== undefined);
  // l'Ottogramma dell'ambito si disegna mentre si risponde: un vertice per sotto-ambito
  const live: LiveVertex[] = subs.map((sa) => {
    const lv = qs
      .filter((q) => q.sub === sa.code)
      .map((q) => r.levels[q.id])
      .filter((l): l is number => typeof l === "number" && l >= 1);
    return { code: sa.code, label: sa.short, level: lv.length ? lv.reduce((x, y) => x + y, 0) / lv.length : null, done: subDone(sa.code) };
  });
  const doneSubs = live.filter((v) => v.done).length;
  // pagina corrente: un sotto-ambito per volta, l'ultima per note e invio; si riparte dal primo incompleto
  const [page, setPage] = useState(() => {
    const first = subs.findIndex((sa) => !qs.filter((q) => q.sub === sa.code).every((q) => initial.levels[q.id] !== undefined));
    return first === -1 ? subs.length : first;
  });
  const top = useRef<HTMLDivElement>(null);
  // su schermi stretti la scheda attiva resta visibile nella barra scorrevole
  useEffect(() => {
    document.querySelector(`[data-tab="${page}"]`)?.scrollIntoView({ inline: "center", block: "nearest" });
  }, [page]);
  const go = (n: number) => {
    setPage(n);
    top.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

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
            8 sotto-ambiti, {qs.length} domande. Per ciascuna scegliete la situazione più vicina alla realtà di oggi, non a quella
            desiderata. Le risposte si salvano da sole: potete interrompere e riprendere quando volete.
          </p>
        </div>
      </div>

      <div ref={top} className="scroll-mt-4" />
      <div className="sticky top-0 z-10 mt-6 -mx-4 px-4 pt-3 pb-2 bg-white/95 backdrop-blur border-b border-line">
        <div className="flex items-center gap-3 text-sm">
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
        <nav aria-label="Sotto-ambiti" className="relative mt-3 -mx-4 px-4 overflow-x-auto">
          <ol className="flex gap-1.5 min-w-max sm:min-w-0 sm:grid sm:grid-cols-9">
            {subs.map((sa, i) => {
              const active = page === i;
              const done = subDone(sa.code);
              return (
                <li key={sa.code}>
                  <button
                    type="button"
                    onClick={() => go(i)}
                    data-tab={i}
                    aria-current={active ? "step" : undefined}
                    title={sa.name}
                    className={`w-full h-full min-w-24 sm:min-w-0 rounded-lg border px-2 py-1.5 text-left text-xs leading-tight hyphens-auto break-words transition ${
                      active
                        ? "bg-navy text-white border-navy"
                        : done
                          ? "bg-navy/10 text-navy border-transparent hover:border-navy-soft"
                          : subStarted(sa.code)
                            ? "border-navy/40 text-ink hover:border-navy-soft"
                            : "border-line text-muted hover:border-navy-soft"
                    }`}
                  >
                    <span className="flex items-center gap-1 font-semibold">
                      <SubareaIcon code={sa.code} className="size-3.5" />
                      <span className="tabular-nums">{i + 1}</span>
                      {done && !active && <Check className="size-3 ml-auto" aria-hidden />}
                      <span className="sr-only">{done ? "completato" : ""}</span>
                    </span>
                    <span className="block mt-0.5">{sa.short}</span>
                  </button>
                </li>
              );
            })}
            <li>
              <button
                type="button"
                onClick={() => go(subs.length)}
                data-tab={subs.length}
                aria-current={page === subs.length ? "step" : undefined}
                className={`w-full h-full min-w-24 sm:min-w-0 rounded-lg border px-2 py-1.5 text-left text-xs leading-tight transition ${
                  page === subs.length ? "bg-navy text-white border-navy" : "border-dashed border-line text-muted hover:border-navy-soft"
                }`}
              >
                <Send className="size-3" aria-hidden />
                <span className="block mt-0.5">Note e invio</span>
              </button>
            </li>
          </ol>
        </nav>
      </div>

      <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-8 lg:items-start">
        <div>
          {page < subs.length ? (
            <section className="mt-6" aria-labelledby={`sa-${subs[page].code}`}>
              <div className="flex items-start gap-3">
                <span className="shrink-0 size-10 rounded-xl bg-navy/10 text-navy flex items-center justify-center">
                  <SubareaIcon code={subs[page].code} className="size-5" />
                </span>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted">Sotto-ambito {page + 1} di 8</p>
                  <h2 id={`sa-${subs[page].code}`} className="text-xl font-semibold text-navy">
                    {subs[page].name}
                  </h2>
                  <p className="text-sm text-muted">{subs[page].description}</p>
                </div>
              </div>
              <div className="mt-4 space-y-5">
                {qs
                  .filter((q) => q.sub === subs[page].code)
                  .map((q) => (
                    <Question key={q.id} q={q} qi={qs.indexOf(q)} total={qs.length} r={r} update={update} />
                  ))}
              </div>
            </section>
          ) : (
            <section className="mt-6 space-y-6" aria-label="Note e invio">
              <label className="block rounded-xl border border-line p-4 sm:p-5">
                <span className="font-semibold text-ink">Qualcosa da aggiungere per il nostro esperto? (facoltativo)</span>
                <span className="block text-sm text-muted">Progetti in corso, vincoli, domande specifiche sull&apos;ambito.</span>
                <textarea
                  value={r.notes ?? ""}
                  onChange={(e) => update({ notes: e.target.value })}
                  maxLength={3000}
                  rows={4}
                  className="mt-3 w-full rounded-lg border border-line px-3 py-2 text-sm"
                />
              </label>
              {answered < qs.length && (
                <div className="rounded-xl bg-paper px-4 py-3 text-sm">
                  <p className="font-medium">Mancano {qs.length - answered} risposte in questi sotto-ambiti:</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {subs.map((sa, i) =>
                      subDone(sa.code) ? null : (
                        <button
                          key={sa.code}
                          type="button"
                          onClick={() => go(i)}
                          className="px-3 py-1 rounded-full border border-line bg-white hover:border-navy-soft"
                        >
                          {i + 1}. {sa.short}
                        </button>
                      ),
                    )}
                  </div>
                </div>
              )}
              <div className="flex flex-wrap items-center gap-4">
                <button
                  onClick={submit}
                  disabled={sending || answered < qs.length}
                  className="inline-flex items-center gap-2 bg-navy text-white font-semibold px-5 py-2.5 rounded-lg disabled:opacity-50"
                >
                  {sending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <Check className="size-4" aria-hidden />} Invia per
                  l&apos;analisi
                </button>
                {answered === qs.length && <p className="text-sm text-muted">Dopo l&apos;invio non potrete più modificare le risposte.</p>}
              </div>
            </section>
          )}

          <div className="mt-8 flex items-center justify-between gap-3 border-t border-line pt-5">
            <button
              type="button"
              onClick={() => go(page - 1)}
              disabled={page === 0}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-navy-soft disabled:invisible"
            >
              <ArrowLeft className="size-4" aria-hidden /> Indietro
            </button>
            {page < subs.length && (
              <button
                type="button"
                onClick={() => go(page + 1)}
                className="inline-flex items-center gap-2 border border-navy text-navy font-semibold px-4 py-2 rounded-lg hover:bg-navy hover:text-white"
              >
                {page === subs.length - 1 ? "Note e invio" : `Avanti: ${subs[page + 1].short}`}{" "}
                <ArrowRight className="size-4" aria-hidden />
              </button>
            )}
          </div>
          {error && <p className="mt-3 text-sm text-accent">{error}</p>}
        </div>
        <aside className="hidden lg:block sticky top-40 mt-6 rounded-2xl border border-line bg-paper/60 p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-muted">L&apos;Ottogramma di {a.name}</p>
          <div className="mt-2 flex justify-center">
            <LiveOttogramma areas={live} active={subs[page]?.code ?? null} size={132} />
          </div>
          <p className="mt-2 text-sm text-muted">
            {doneSubs === 0
              ? "Si disegna mentre rispondete: un vertice per ogni sotto-ambito."
              : doneSubs < subs.length
                ? `${doneSubs} ${doneSubs === 1 ? "sotto-ambito" : "sotto-ambiti"} su ${subs.length}: più il vertice è lontano dal centro, più le pratiche sono mature.`
                : "L'Ottogramma è completo: aggiungete le note e inviate per l'analisi."}
          </p>
        </aside>
      </div>
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
