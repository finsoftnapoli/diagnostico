"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { clearDraft, loadDraft, saveDraft } from "@/lib/draft";
import { AREAS, ISSUES, OBJECTIVES, PROFILE_FIELDS, QUESTIONS } from "@/lib/questionnaire";
import { emptyResponses } from "@/lib/scoring";
import type { AreaCode, Choice, Responses } from "@/lib/types";

type Step =
  | { kind: "intro" }
  | { kind: "profile" }
  | { kind: "objectives" }
  | { kind: "area"; area: AreaCode }
  | { kind: "issues" }
  | { kind: "importance" };

const STEPS: Step[] = [
  { kind: "intro" },
  { kind: "profile" },
  { kind: "objectives" },
  ...AREAS.map((a) => ({ kind: "area" as const, area: a.code })),
  { kind: "issues" },
  { kind: "importance" },
];

const SECTION_LABEL: Record<Step["kind"], string> = {
  intro: "Prima di iniziare",
  profile: "1 · La tua azienda",
  objectives: "2 · Obiettivi",
  area: "3 · Come lavorate oggi",
  issues: "4 · Criticità",
  importance: "5 · Importanza degli ambiti",
};

const IMPORTANCE_OPTIONS = [
  { v: 1, label: "Poco rilevante" },
  { v: 2, label: "Rilevante" },
  { v: 3, label: "Decisivo" },
];

export default function Wizard() {
  const router = useRouter();
  // Il componente gira solo nel browser (vedi ClientOnly), quindi la bozza si legge all'avvio.
  const [initial] = useState(() => {
    const d = loadDraft();
    return d && !d.completedAt ? d : null;
  });
  const [r, setR] = useState<Responses>(() => initial?.responses ?? emptyResponses());
  const [step, setStep] = useState(() => initial?.step ?? 0);
  const [resumed, setResumed] = useState(() => (initial?.step ?? 0) > 0);
  const [error, setError] = useState<string | null>(null);
  const topRef = useRef<HTMLDivElement>(null);
  // salvataggio automatico a ogni modifica
  useEffect(() => {
    saveDraft({ step, responses: r });
  }, [r, step]);

  const update = (patch: Partial<Responses>) => setR((prev) => ({ ...prev, ...patch }));
  const cur = STEPS[step];
  const progress = Math.round((step / (STEPS.length - 1)) * 100);

  const missing = useMemo(() => validate(cur, r), [cur, r]);

  function go(delta: number) {
    if (delta > 0 && missing) {
      setError(missing);
      return;
    }
    setError(null);
    const next = step + delta;
    if (next >= STEPS.length) {
      const textAreas = Array.from(new Set([...r.objectivesTextAreas, ...r.issuesTextAreas]));
      saveDraft({ step, responses: { ...r, textAreas }, completedAt: new Date().toISOString() });
      router.push("/risultati");
      return;
    }
    setStep(Math.max(0, next));
    topRef.current?.scrollIntoView({ behavior: "smooth" });
  }

  function restart() {
    clearDraft();
    setR(emptyResponses());
    setStep(0);
    setResumed(false);
  }

  return (
    <div ref={topRef} className="mx-auto max-w-3xl px-4 py-10">
      <div className="flex items-center justify-between text-sm text-muted">
        <span>{SECTION_LABEL[cur.kind]}</span>
        <span>{progress}%</span>
      </div>
      <div className="mt-2 h-1.5 bg-paper rounded">
        <div className="h-1.5 bg-navy rounded transition-all" style={{ width: `${progress}%` }} />
      </div>

      {resumed && step > 0 && (
        <p className="mt-4 text-sm bg-paper border border-line rounded px-3 py-2">
          Abbiamo ripreso da dove eri rimasto.{" "}
          <button className="underline" onClick={restart}>
            Ricomincia da capo
          </button>
        </p>
      )}

      <div className="mt-8">
        {cur.kind === "intro" && <Intro r={r} update={update} />}
        {cur.kind === "profile" && <Profile r={r} update={update} />}
        {cur.kind === "objectives" && (
          <Ranked
            title="Quali sono gli obiettivi dell'azienda per i prossimi 2-3 anni?"
            hint="Scegli fino a tre obiettivi, nell'ordine di importanza: il primo che selezioni è il più importante."
            catalogue={OBJECTIVES}
            selected={r.objectives}
            onChange={(objectives) => update({ objectives })}
            text={r.objectivesText}
            onText={(objectivesText) => update({ objectivesText })}
            textLabel="Descrivi in due righe cosa volete ottenere (facoltativo)"
            textPlaceholder="Per esempio: entro due anni mio figlio entra in azienda e voglio delegare la parte commerciale."
            textAreas={r.objectivesTextAreas}
            onTextAreas={(objectivesTextAreas) => update({ objectivesTextAreas })}
          />
        )}
        {cur.kind === "area" && <AreaQuestions area={cur.area} r={r} update={update} />}
        {cur.kind === "issues" && (
          <Ranked
            title="Quali sono oggi le criticità principali?"
            hint="Scegli fino a tre criticità, nell'ordine di gravità: la prima che selezioni è la più pressante."
            catalogue={ISSUES}
            selected={r.issues}
            onChange={(issues) => update({ issues })}
            text={r.issuesText}
            onText={(issuesText) => update({ issuesText })}
            textLabel="Descrivi in due righe la situazione (facoltativo)"
            textPlaceholder="Per esempio: scopriamo solo a fine anno se abbiamo guadagnato e la banca ci chiede previsioni di cassa."
            textAreas={r.issuesTextAreas}
            onTextAreas={(issuesTextAreas) => update({ issuesTextAreas })}
          />
        )}
        {cur.kind === "importance" && <Importance r={r} update={update} />}
      </div>

      {error && (
        <p role="alert" className="mt-6 text-sm text-accent">
          {error}
        </p>
      )}

      <div className="mt-8 flex justify-between gap-4">
        {step > 0 ? (
          <button onClick={() => go(-1)} className="px-5 py-2.5 rounded border border-line hover:bg-paper">
            Indietro
          </button>
        ) : (
          <Link href="/" className="px-5 py-2.5 rounded border border-line hover:bg-paper">
            Annulla
          </Link>
        )}
        <button onClick={() => go(1)} className="px-6 py-2.5 rounded bg-navy text-white font-semibold hover:bg-navy-soft">
          {step === STEPS.length - 1 ? "Vedi i risultati" : step === 0 ? "Inizia" : "Avanti"}
        </button>
      </div>
      <p className="mt-4 text-xs text-muted text-right">Le risposte si salvano automaticamente.</p>
    </div>
  );
}

function validate(s: Step, r: Responses): string | null {
  switch (s.kind) {
    case "intro":
      return r.consents.service ? null : "Per proseguire conferma di aver letto l'informativa.";
    case "profile": {
      const miss = PROFILE_FIELDS.filter((f) => f.required && !r.profile[f.id]);
      return miss.length ? `Completa: ${miss.map((f) => f.label.toLowerCase()).join(", ")}.` : null;
    }
    case "objectives":
      return r.objectives.length ? null : "Scegli almeno un obiettivo.";
    case "area": {
      const qs = QUESTIONS.filter((q) => q.area === s.area);
      if (qs.some((q) => !r.levels[q.id])) return "Scegli una situazione per ogni domanda.";
      if (qs.some((q) => !r.checks[q.id])) return "Rispondi anche alle domande di verifica.";
      return null;
    }
    case "issues":
      return r.issues.length ? null : "Scegli almeno una criticità.";
    case "importance":
      return AREAS.every((a) => r.importance[a.code]) ? null : "Indica l'importanza di ogni ambito.";
  }
}

interface SectionProps {
  r: Responses;
  update: (p: Partial<Responses>) => void;
}

function Intro({ r, update }: SectionProps) {
  const set = (k: keyof Responses["consents"], v: boolean) => update({ consents: { ...r.consents, [k]: v } });
  return (
    <div>
      <h1 className="text-2xl font-semibold text-navy">Come funziona</h1>
      <ul className="mt-4 space-y-2 text-muted list-disc pl-5">
        <li>Cinque sezioni, circa 15 minuti. Puoi interrompere e riprendere.</li>
        <li>Per ogni tema scegli la descrizione più vicina alla situazione di oggi, non a quella desiderata.</li>
        <li>Alla fine vedi subito il profilo dell&apos;azienda e le tre priorità.</li>
      </ul>
      <div className="mt-8 space-y-3">
        <Check checked={r.consents.service} onChange={(v) => set("service", v)}>
          Ho letto l&apos;
          <Link href="/privacy" className="underline" target="_blank">
            informativa privacy
          </Link>{" "}
          e accetto il trattamento dei dati per ricevere il profilo e il report. <span className="text-accent">*</span>
        </Check>
        <Check checked={r.consents.benchmark} onChange={(v) => set("benchmark", v)}>
          Acconsento all&apos;uso delle mie risposte, in forma aggregata e anonima, per i confronti tra aziende
          (facoltativo).
        </Check>
        <Check checked={r.consents.marketing} onChange={(v) => set("marketing", v)}>
          Desidero ricevere comunicazioni su servizi e iniziative (facoltativo).
        </Check>
      </div>
    </div>
  );
}

function Check({ checked, onChange, children }: { checked: boolean; onChange: (v: boolean) => void; children: React.ReactNode }) {
  return (
    <label className="flex gap-3 items-start text-sm leading-relaxed cursor-pointer">
      <input type="checkbox" className="mt-1 size-4 accent-[var(--navy)]" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span>{children}</span>
    </label>
  );
}

function Profile({ r, update }: SectionProps) {
  const set = (id: string, v: string) => update({ profile: { ...r.profile, [id]: v } });
  return (
    <div>
      <h1 className="text-2xl font-semibold text-navy">La tua azienda</h1>
      <p className="mt-2 text-muted">Servono per confrontarti con aziende simili e leggere le risposte nel contesto giusto.</p>
      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        {PROFILE_FIELDS.map((f) => (
          <label key={f.id} className="block text-sm">
            <span className="font-medium">
              {f.label}
              {f.required ? <span className="text-accent"> *</span> : <span className="text-muted"> (facoltativo)</span>}
            </span>
            {f.type === "select" ? (
              <select
                className="mt-1 w-full border border-line rounded px-3 py-2 bg-white"
                value={r.profile[f.id] ?? ""}
                onChange={(e) => set(f.id, e.target.value)}
              >
                <option value="">Seleziona…</option>
                {f.options?.map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </select>
            ) : (
              <input
                className="mt-1 w-full border border-line rounded px-3 py-2"
                inputMode={f.type === "number" ? "numeric" : "text"}
                value={r.profile[f.id] ?? ""}
                onChange={(e) => set(f.id, e.target.value)}
              />
            )}
          </label>
        ))}
      </div>
    </div>
  );
}

const RANK_LABEL = ["1°", "2°", "3°"];

function Ranked(props: {
  title: string;
  hint: string;
  catalogue: Choice[];
  selected: string[];
  onChange: (v: string[]) => void;
  text: string;
  onText: (v: string) => void;
  textLabel: string;
  textPlaceholder: string;
  textAreas: AreaCode[];
  onTextAreas: (v: AreaCode[]) => void;
}) {
  const { selected, onChange } = props;
  const toggle = (code: string) => {
    if (selected.includes(code)) onChange(selected.filter((c) => c !== code));
    else if (selected.length < 3) onChange([...selected, code]);
  };
  const toggleArea = (a: AreaCode) =>
    props.onTextAreas(props.textAreas.includes(a) ? props.textAreas.filter((x) => x !== a) : [...props.textAreas, a]);
  return (
    <div>
      <h1 className="text-2xl font-semibold text-navy">{props.title}</h1>
      <p className="mt-2 text-muted">{props.hint}</p>
      <div className="mt-6 grid gap-2 sm:grid-cols-2">
        {props.catalogue.map((c) => {
          const i = selected.indexOf(c.code);
          const on = i >= 0;
          const full = !on && selected.length >= 3;
          return (
            <button
              key={c.code}
              onClick={() => toggle(c.code)}
              disabled={full}
              aria-pressed={on}
              className={`text-left border rounded px-3 py-3 flex items-start gap-3 transition ${
                on ? "border-navy bg-navy/5" : "border-line hover:border-navy-soft"
              } ${full ? "opacity-40 cursor-not-allowed" : ""}`}
            >
              <span
                className={`shrink-0 size-7 rounded-full text-xs font-semibold flex items-center justify-center ${
                  on ? "bg-navy text-white" : "border border-line text-muted"
                }`}
              >
                {on ? RANK_LABEL[i] : ""}
              </span>
              <span className="text-sm leading-snug pt-1">{c.label}</span>
            </button>
          );
        })}
      </div>
      <label className="block mt-8 text-sm font-medium">
        {props.textLabel}
        <textarea
          className="mt-1 w-full border border-line rounded px-3 py-2 font-normal"
          rows={3}
          maxLength={600}
          placeholder={props.textPlaceholder}
          value={props.text}
          onChange={(e) => props.onText(e.target.value)}
        />
      </label>
      {props.text.trim().length > 0 && (
        <div className="mt-3">
          <p className="text-sm text-muted">A quali ambiti si riferisce soprattutto quello che hai scritto?</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {AREAS.map((a) => {
              const on = props.textAreas.includes(a.code);
              return (
                <button
                  key={a.code}
                  onClick={() => toggleArea(a.code)}
                  aria-pressed={on}
                  className={`text-xs px-3 py-1.5 rounded-full border ${on ? "bg-navy text-white border-navy" : "border-line"}`}
                >
                  {a.name}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function AreaQuestions({ area, r, update }: SectionProps & { area: AreaCode }) {
  const a = AREAS.find((x) => x.code === area)!;
  const qs = QUESTIONS.filter((q) => q.area === area);
  const idx = AREAS.findIndex((x) => x.code === area);
  return (
    <div>
      <p className="text-sm text-muted">
        Ambito {idx + 1} di {AREAS.length}
      </p>
      <h1 className="text-2xl font-semibold text-navy">{a.name}</h1>
      <p className="mt-1 text-muted">{a.description}</p>
      <div className="mt-8 space-y-10">
        {qs.map((q) => (
          <fieldset key={q.id}>
            <legend className="font-semibold">{q.text}</legend>
            <div className="mt-3 space-y-2">
              {q.levels.map((txt, i) => {
                const lvl = i + 1;
                const on = r.levels[q.id] === lvl;
                return (
                  <label
                    key={lvl}
                    className={`flex gap-3 items-start border rounded px-3 py-3 cursor-pointer text-sm leading-snug ${
                      on ? "border-navy bg-navy/5" : "border-line hover:border-navy-soft"
                    }`}
                  >
                    <input
                      type="radio"
                      name={q.id}
                      className="mt-0.5 accent-[var(--navy)]"
                      checked={on}
                      onChange={() => update({ levels: { ...r.levels, [q.id]: lvl } })}
                    />
                    <span>{txt}</span>
                  </label>
                );
              })}
            </div>
            <div className="mt-4 pl-1">
              <p className="text-sm font-medium">{q.check.text}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {q.check.options.map((o) => {
                  const on = r.checks[q.id] === o;
                  return (
                    <button
                      key={o}
                      onClick={() => update({ checks: { ...r.checks, [q.id]: o } })}
                      aria-pressed={on}
                      className={`text-sm px-3 py-1.5 rounded border ${on ? "bg-navy text-white border-navy" : "border-line hover:border-navy-soft"}`}
                    >
                      {o}
                    </button>
                  );
                })}
              </div>
            </div>
          </fieldset>
        ))}
      </div>
    </div>
  );
}

function Importance({ r, update }: SectionProps) {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-navy">Quanto conta ogni ambito per i vostri obiettivi?</h1>
      <p className="mt-2 text-muted">
        Non tutti gli ambiti pesano allo stesso modo per ogni azienda. La tua risposta orienta le priorità.
      </p>
      <div className="mt-6 divide-y divide-line border-y border-line">
        {AREAS.map((a) => (
          <div key={a.code} className="py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <span className="font-medium">{a.name}</span>
            <div className="flex gap-2">
              {IMPORTANCE_OPTIONS.map((o) => {
                const on = r.importance[a.code] === o.v;
                return (
                  <button
                    key={o.v}
                    onClick={() => update({ importance: { ...r.importance, [a.code]: o.v } })}
                    aria-pressed={on}
                    className={`text-sm px-3 py-1.5 rounded border ${on ? "bg-navy text-white border-navy" : "border-line hover:border-navy-soft"}`}
                  >
                    {o.label}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
