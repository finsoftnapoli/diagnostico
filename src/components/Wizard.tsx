"use client";

import { ArrowLeft, ArrowRight, Check as CheckIcon, Clock, FileText, Info, Radar, ShieldCheck, Upload } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AREA_SHORT, AreaIcon } from "@/lib/areaIcons";
import { clearDraft, loadDraft, saveDraft } from "@/lib/draft";
import { AREAS, ISSUES, OBJECTIVES, PROFILE_FIELDS, QUESTIONS } from "@/lib/questionnaire";
import { MIN_TEXT } from "@/lib/sanitize";
import HumanCheck, { isHumanCheckEnabled } from "./HumanCheck";
import { emptyResponses } from "@/lib/scoring";
import { supabaseBrowser } from "@/lib/supabase/browser";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import type { AreaCode, Choice, Financials, Responses } from "@/lib/types";
import { isValidItalianVat, normalizeVat } from "@/lib/vat";

type Step = { kind: "intro" } | { kind: "profile" } | { kind: "objectives" } | { kind: "area"; area: AreaCode } | { kind: "issues" };

const STEPS: Step[] = [
  { kind: "intro" },
  { kind: "profile" },
  { kind: "objectives" },
  ...AREAS.map((a) => ({ kind: "area" as const, area: a.code })),
  { kind: "issues" },
];

const SECTIONS: { kind: Step["kind"]; label: string }[] = [
  { kind: "profile", label: "Azienda" },
  { kind: "objectives", label: "Ambizioni" },
  { kind: "area", label: "Come lavorate oggi" },
  { kind: "issues", label: "Sfide" },
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
  const [notice, setNotice] = useState<string | null>(() =>
    (initial?.step ?? 0) > 0 ? "Abbiamo ripreso da dove eri rimasto." : null,
  );
  const [error, setError] = useState<string | null>(null);
  const [human, setHuman] = useState(() => !isHumanCheckEnabled());
  const topRef = useRef<HTMLDivElement>(null);

  // salvataggio automatico a ogni modifica
  useEffect(() => {
    saveDraft({ step, responses: r });
  }, [r, step]);

  // ripresa da un link "salva e continua più tardi" (?riprendi=<id>)
  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("riprendi");
    if (!id || !isSupabaseConfigured()) return;
    void (async () => {
      const sb = supabaseBrowser();
      const { data } = await sb.auth.getUser();
      if (!data.user) {
        setNotice("Per riprendere apri il link dell'email da questo stesso browser.");
        return;
      }
      const res = await fetch(`/api/bozze/${encodeURIComponent(id)}`);
      if (!res.ok) {
        setNotice("Non abbiamo trovato la bozza salvata: il link potrebbe essere scaduto.");
        return;
      }
      const d = (await res.json()) as { step: number; responses: Responses };
      setR({ ...emptyResponses(), ...d.responses });
      setStep(Math.min(Math.max(d.step, 0), STEPS.length - 1));
      setNotice("Bozza recuperata: riprendi da dove eri rimasto.");
      window.history.replaceState(null, "", "/diagnostico");
    })();
  }, []);

  const update = (patch: Partial<Responses>) => setR((prev) => ({ ...prev, ...patch }));
  const cur = STEPS[step];
  const progress = Math.round((step / (STEPS.length - 1)) * 100);
  const missing = useMemo(
    () => (cur.kind === "intro" && !human ? "Attendi la verifica di sicurezza." : validate(cur, r)),
    [cur, r, human],
  );
  const onHuman = useCallback(() => setHuman(true), []);

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
    setNotice(null);
  }

  return (
    <div ref={topRef} className="mx-auto max-w-3xl px-4 py-8 sm:py-10">
      {cur.kind !== "intro" && <Progress step={step} r={r} progress={progress} />}

      {notice && step > 0 && (
        <p className="mt-4 text-sm bg-paper border border-line rounded-lg px-3 py-2 flex flex-wrap gap-x-2">
          <span>{notice}</span>
          <button className="underline" onClick={restart}>
            Ricomincia da capo
          </button>
        </p>
      )}

      <div className="mt-8">
        {cur.kind === "intro" && (
          <>
            <Intro r={r} update={update} />
            <HumanCheck onVerified={onHuman} />
          </>
        )}
        {cur.kind === "profile" && <Profile r={r} update={update} />}
        {cur.kind === "objectives" && (
          <Ranked
            eyebrow="Ambizioni"
            title="Dove volete portare l'azienda nei prossimi 2-3 anni?"
            hint="Scegli fino a tre obiettivi, nell'ordine di importanza: il primo che selezioni è il più importante."
            catalogue={OBJECTIVES}
            selected={r.objectives}
            onChange={(objectives) => update({ objectives })}
            text={r.objectivesText}
            onText={(objectivesText) => update({ objectivesText })}
            textLabel="Racconta le vostre ambizioni: cosa volete ottenere e perché"
            textPlaceholder="Per esempio: vogliamo crescere all'estero del 30% e, entro due anni, mio figlio entrerà in azienda; per questo devo delegare la parte commerciale, che oggi seguo da solo."
            textAreas={r.objectivesTextAreas}
            onTextAreas={(objectivesTextAreas) => update({ objectivesTextAreas })}
          />
        )}
        {cur.kind === "area" && <AreaQuestions area={cur.area} r={r} update={update} />}
        {cur.kind === "issues" && (
          <Ranked
            eyebrow="Sfide"
            title="Quali sono oggi le sfide principali?"
            hint="Scegli fino a tre criticità, nell'ordine di gravità: la prima che selezioni è la più pressante."
            catalogue={ISSUES}
            selected={r.issues}
            onChange={(issues) => update({ issues })}
            text={r.issuesText}
            onText={(issuesText) => update({ issuesText })}
            textLabel="Descrivi le sfide: cosa sta frenando l'azienda e quali conseguenze vedete"
            textPlaceholder="Per esempio: scopriamo solo a fine anno se abbiamo guadagnato, la banca ci chiede previsioni di cassa che non sappiamo fare e i margini sulle commesse più grandi sono in calo."
            textAreas={r.issuesTextAreas}
            onTextAreas={(issuesTextAreas) => update({ issuesTextAreas })}
          />
        )}
      </div>

      {error && (
        <p role="alert" className="mt-6 text-sm text-accent">
          {error}
        </p>
      )}

      <div className="mt-10 flex justify-between gap-4">
        {step > 0 ? (
          <button onClick={() => go(-1)} className="px-5 py-2.5 rounded-lg border border-line hover:bg-paper inline-flex items-center gap-2">
            <ArrowLeft className="size-4" aria-hidden /> Indietro
          </button>
        ) : (
          <Link href="/" className="px-5 py-2.5 rounded-lg border border-line hover:bg-paper">
            Annulla
          </Link>
        )}
        <button
          onClick={() => go(1)}
          className="px-6 py-2.5 rounded-lg bg-navy text-white font-semibold hover:bg-navy-soft inline-flex items-center gap-2"
        >
          {step === STEPS.length - 1 ? "Vedi i risultati" : step === 0 ? "Inizia" : "Avanti"}
          <ArrowRight className="size-4" aria-hidden />
        </button>
      </div>
      {step > 0 && <p className="mt-4 text-xs text-muted text-right">Le risposte si salvano automaticamente.</p>}
    </div>
  );
}

function areaDone(area: AreaCode, r: Responses) {
  return QUESTIONS.filter((q) => q.area === area).every((q) => r.levels[q.id] && r.checks[q.id]);
}

function Progress({ step, r, progress }: { step: number; r: Responses; progress: number }) {
  const cur = STEPS[step];
  return (
    <div>
      <ol className="flex flex-wrap gap-x-5 gap-y-1 text-sm">
        {SECTIONS.map((s, i) => {
          const active = s.kind === cur.kind;
          const firstIdx = STEPS.findIndex((x) => x.kind === s.kind);
          const done = step > firstIdx && !active;
          return (
            <li key={s.kind} className={`flex items-center gap-1.5 ${active ? "text-navy font-semibold" : done ? "text-ink" : "text-muted"}`}>
              <span
                className={`size-5 rounded-full text-[11px] flex items-center justify-center ${
                  active ? "bg-navy text-white" : done ? "bg-navy/15 text-navy" : "border border-line"
                }`}
              >
                {done ? <CheckIcon className="size-3" aria-hidden /> : i + 1}
              </span>
              {s.label}
            </li>
          );
        })}
      </ol>
      <div className="mt-3 h-1.5 bg-paper rounded-full" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
        <div className="h-1.5 bg-navy rounded-full transition-all" style={{ width: `${progress}%` }} />
      </div>
      {cur.kind === "area" && (
        <div className="mt-4 grid grid-cols-8 gap-1.5" aria-label="Ambiti">
          {AREAS.map((a) => {
            const active = a.code === cur.area;
            const done = areaDone(a.code, r);
            return (
              <div
                key={a.code}
                title={a.name}
                className={`h-10 rounded-lg flex items-center justify-center border ${
                  active ? "bg-navy text-white border-navy" : done ? "bg-navy/10 text-navy border-transparent" : "border-line text-muted"
                }`}
              >
                <AreaIcon code={a.code} className="size-4" />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function validate(s: Step, r: Responses): string | null {
  switch (s.kind) {
    case "intro":
      return r.consents.service ? null : "Per proseguire accetta l'informativa e le condizioni del servizio.";
    case "profile": {
      const miss = PROFILE_FIELDS.filter((f) => f.required && !r.profile[f.id]?.trim());
      if (miss.length) return `Completa: ${miss.map((f) => f.label.toLowerCase()).join(", ")}.`;
      if (!isValidItalianVat(r.profile["PR-10"] ?? "")) return "Controlla la partita IVA: deve avere 11 cifre valide.";
      return null;
    }
    case "objectives":
      if (!r.objectives.length) return "Scegli almeno un obiettivo.";
      if (r.objectivesText.trim().length < MIN_TEXT) return `Racconta le vostre ambizioni in almeno ${MIN_TEXT} caratteri: più dettagli ci dai, più utile sarà il report.`;
      return null;
    case "area": {
      const qs = QUESTIONS.filter((q) => q.area === s.area);
      if (qs.some((q) => !r.levels[q.id])) return "Scegli una situazione per ogni domanda.";
      if (qs.some((q) => !r.checks[q.id])) return "Rispondi anche alle domande di verifica.";
      return null;
    }
    case "issues":
      if (!r.issues.length) return "Scegli almeno una sfida.";
      if (r.issuesText.trim().length < MIN_TEXT) return `Descrivi le sfide in almeno ${MIN_TEXT} caratteri: più dettagli ci dai, più utile sarà il report.`;
      return null;
  }
}

interface SectionProps {
  r: Responses;
  update: (p: Partial<Responses>) => void;
}

function Intro({ r, update }: SectionProps) {
  return (
    <div>
      <h1 className="text-3xl font-semibold text-navy">Prima di iniziare</h1>
      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        {[
          { icon: Clock, t: "15 minuti", d: "Quattro sezioni. Puoi salvare e riprendere quando vuoi." },
          { icon: Radar, t: "Risultato immediato", d: "Profilo sugli 8 ambiti, confronto e tre priorità." },
          { icon: ShieldCheck, t: "Dati protetti", d: "Server in Europa. Nessun dato della tua azienda è visibile ad altri." },
        ].map(({ icon: Icon, t, d }) => (
          <div key={t} className="rounded-xl border border-line p-4">
            <Icon className="size-5 text-navy" aria-hidden strokeWidth={1.75} />
            <p className="mt-2 font-semibold">{t}</p>
            <p className="mt-1 text-sm text-muted">{d}</p>
          </div>
        ))}
      </div>
      <p className="mt-6 text-muted">
        Per ogni tema scegli la descrizione più vicina alla situazione di <strong className="text-ink">oggi</strong>, non a
        quella desiderata: un quadro onesto produce priorità più utili.
      </p>
      <div className="mt-8 space-y-4">
        <Check
          checked={r.consents.service}
          onChange={(v) => update({ consents: { ...r.consents, service: v, benchmark: v } })}
        >
          Ho letto l&apos;
          <Link href="/privacy" className="underline" target="_blank">
            informativa privacy
          </Link>{" "}
          e accetto le condizioni del servizio, compreso l&apos;uso delle risposte in forma anonima e aggregata per
          statistiche, confronti tra aziende e finalità di ricerca. <span className="text-accent">*</span>
        </Check>
        <Check checked={r.consents.marketing} onChange={(v) => update({ consents: { ...r.consents, marketing: v } })}>
          Desidero ricevere comunicazioni su servizi, ricerche e iniziative (facoltativo).
        </Check>
      </div>
      <p className="mt-6 text-xs text-muted flex gap-2">
        <Info className="size-4 shrink-0" aria-hidden />
        Il diagnostico fa parte di un programma di ricerca sulla gestione delle imprese italiane: i dati raccolti
        servono anche a studi e confronti, sempre in forma anonima e aggregata. Il risultato è un&apos;autovalutazione
        orientativa, non una consulenza né un rating.
      </p>
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
  const [vatInfo, setVatInfo] = useState<string | null>(null);

  async function checkVat() {
    const n = normalizeVat(r.profile["PR-10"] ?? "");
    if (!isValidItalianVat(n)) {
      setVatInfo(n ? "La partita IVA non sembra corretta." : null);
      return;
    }
    setVatInfo("Partita IVA corretta.");
    try {
      const res = await fetch(`/api/piva?n=${n}`);
      const j = (await res.json()) as { valid: boolean; checked?: boolean; name?: string | null };
      if (j.checked && !j.valid) setVatInfo("La partita IVA non risulta attiva nell'archivio europeo VIES.");
      else if (j.name) {
        setVatInfo(`Trovata: ${j.name}`);
        if (!r.profile["PR-11"]?.trim()) update({ profile: { ...r.profile, "PR-10": n, "PR-11": j.name } });
      }
    } catch {
      /* verifica online non disponibile: basta il controllo formale */
    }
  }

  return (
    <div>
      <p className="text-sm text-muted">Sezione 1</p>
      <h1 className="text-3xl font-semibold text-navy">La tua azienda</h1>
      <p className="mt-2 text-muted">
        Con la partita IVA possiamo completare il profilo con i dati pubblici dell&apos;azienda e confrontarti con aziende
        simili per settore e dimensione.
      </p>
      <DocUpload r={r} update={update} />
      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        {PROFILE_FIELDS.map((f) => (
          <label key={f.id} className="block text-sm">
            <span className="font-medium">
              {f.label}
              {f.required ? <span className="text-accent"> *</span> : <span className="text-muted"> (facoltativo)</span>}
            </span>
            {f.type === "select" ? (
              <select
                className="mt-1 w-full border border-line rounded-lg px-3 py-2 bg-white"
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
                className="mt-1 w-full border border-line rounded-lg px-3 py-2"
                inputMode={f.type === "number" || f.id === "PR-10" ? "numeric" : "text"}
                autoComplete={f.id === "PR-11" ? "organization" : undefined}
                placeholder={f.id === "PR-10" ? "11 cifre" : undefined}
                value={r.profile[f.id] ?? ""}
                onChange={(e) => set(f.id, e.target.value)}
                onBlur={f.id === "PR-10" ? checkVat : undefined}
              />
            )}
            {f.id === "PR-10" && vatInfo && <span className="mt-1 block text-xs text-muted">{vatInfo}</span>}
            {f.id === "PR-02" && (
              <span className="mt-1 block text-xs text-muted">Sui valori di confine vale la fascia superiore (con €5M esatti, €5-10M).</span>
            )}
          </label>
        ))}
      </div>
    </div>
  );
}

const RANK_LABEL = ["1°", "2°", "3°"];

function Ranked(props: {
  eyebrow: string;
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
  const len = props.text.trim().length;
  return (
    <div>
      <p className="text-sm text-muted">{props.eyebrow}</p>
      <h1 className="text-3xl font-semibold text-navy">{props.title}</h1>
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
              className={`text-left border rounded-xl px-3 py-3 flex items-center gap-3 transition ${
                on ? "border-navy bg-navy/5 shadow-sm" : "border-line hover:border-navy-soft"
              } ${full ? "opacity-40 cursor-not-allowed" : ""}`}
            >
              <span
                className={`shrink-0 size-9 rounded-lg flex items-center justify-center ${
                  on ? "bg-navy text-white" : "bg-paper text-navy"
                }`}
              >
                {on ? <span className="text-xs font-semibold">{RANK_LABEL[i]}</span> : <AreaIcon code={c.primary} className="size-4" />}
              </span>
              <span className="text-sm leading-snug">{c.label}</span>
            </button>
          );
        })}
      </div>
      <label className="block mt-8 text-sm font-medium">
        {props.textLabel} <span className="text-accent">*</span>
        <textarea
          className="mt-1 w-full border border-line rounded-lg px-3 py-2 font-normal"
          rows={4}
          maxLength={1200}
          placeholder={props.textPlaceholder}
          value={props.text}
          onChange={(e) => props.onText(e.target.value)}
        />
      </label>
      <p className={`text-xs ${len >= MIN_TEXT ? "text-muted" : "text-accent/80"}`}>
        {len >= MIN_TEXT ? "Grazie: più dettagli ci dai, più il report sarà su misura." : `Ancora ${MIN_TEXT - len} caratteri`}
      </p>
      {len > 0 && (
        <div className="mt-4">
          <p className="text-sm text-muted">A quali ambiti si riferisce soprattutto quello che hai scritto?</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {AREAS.map((a) => {
              const on = props.textAreas.includes(a.code);
              return (
                <button
                  key={a.code}
                  onClick={() => toggleArea(a.code)}
                  aria-pressed={on}
                  className={`text-xs px-3 py-1.5 rounded-full border inline-flex items-center gap-1.5 ${
                    on ? "bg-navy text-white border-navy" : "border-line"
                  }`}
                >
                  <AreaIcon code={a.code} className="size-3.5" />
                  {AREA_SHORT[a.code]}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function LevelBar({ level, on }: { level: number; on: boolean }) {
  return (
    <span className="shrink-0 flex gap-0.5 mt-1" aria-hidden>
      {[1, 2, 3, 4].map((i) => (
        <span key={i} className={`w-1.5 h-3.5 rounded-sm ${i <= level ? (on ? "bg-navy" : "bg-navy/35") : "bg-line"}`} />
      ))}
    </span>
  );
}

function AreaQuestions({ area, r, update }: SectionProps & { area: AreaCode }) {
  const a = AREAS.find((x) => x.code === area)!;
  const qs = QUESTIONS.filter((q) => q.area === area);
  const idx = AREAS.findIndex((x) => x.code === area);
  return (
    <div>
      <div className="flex items-start gap-4">
        <span className="shrink-0 size-12 rounded-xl bg-navy text-white flex items-center justify-center">
          <AreaIcon code={area} className="size-6" />
        </span>
        <div>
          <p className="text-sm text-muted">
            Ambito {idx + 1} di {AREAS.length}
          </p>
          <h1 className="text-3xl font-semibold text-navy leading-tight">{a.name}</h1>
          <p className="mt-1 text-muted">{a.description}</p>
        </div>
      </div>
      <div className="mt-8 space-y-6">
        {qs.map((q, qi) => (
          <fieldset key={q.id} className="rounded-xl border border-line p-4 sm:p-5">
            <legend className="sr-only">{q.text}</legend>
            <p className="text-xs font-medium uppercase tracking-wide text-muted">
              {qi + 1}/{qs.length} · {q.theme}
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
                    <LevelBar level={lvl} on={on} />
                    <span className={on ? "text-ink" : ""}>{txt}</span>
                  </label>
                );
              })}
            </div>
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
                      onClick={() => update({ checks: { ...r.checks, [q.id]: o } })}
                      aria-pressed={on}
                      className={`text-sm px-3 py-1.5 rounded-full border ${
                        on ? "bg-navy text-white border-navy" : "bg-white border-line hover:border-navy-soft"
                      }`}
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

const DOCS = [
  { kind: "visura" as const, label: "Visura camerale", hint: "Precompila i dati dell'azienda" },
  { kind: "bilancio" as const, label: "Ultimo bilancio", hint: "Aggiunge al report i numeri chiave" },
];

/** Caricamento facoltativo di visura e bilancio (PDF) per precompilare il profilo. */
function DocUpload({ r, update }: SectionProps) {
  const [busy, setBusy] = useState<string | null>(null);
  const [msg, setMsg] = useState<Record<string, string>>({});

  async function upload(kind: "visura" | "bilancio", file: File | undefined) {
    if (!file) return;
    if (file.size > 4 * 1024 * 1024) {
      setMsg((m) => ({ ...m, [kind]: "Il file supera i 4 MB: prova con una versione più leggera." }));
      return;
    }
    setBusy(kind);
    setMsg((m) => ({ ...m, [kind]: "Lettura in corso, può richiedere fino a un minuto…" }));
    try {
      const fd = new FormData();
      fd.append("tipo", kind);
      fd.append("file", file);
      const res = await fetch("/api/documenti", { method: "POST", body: fd });
      const j = (await res.json()) as { error?: string; profile?: Record<string, string>; financials?: Financials };
      if (!res.ok) throw new Error(j.error ?? "Lettura non riuscita");
      const filled: string[] = [];
      const profile = { ...r.profile };
      for (const [k, v] of Object.entries(j.profile ?? {})) {
        if (!profile[k]?.trim()) {
          profile[k] = v;
          filled.push(PROFILE_FIELDS.find((f) => f.id === k)?.label.toLowerCase() ?? k);
        }
      }
      update({
        profile,
        ...(j.financials ? { financials: j.financials } : {}),
        documents: { ...r.documents, [kind]: true },
      });
      const parts: string[] = [];
      if (filled.length) parts.push(`compilati: ${filled.join(", ")}`);
      if (j.financials) parts.push(`letti i dati del bilancio${j.financials.year ? ` ${j.financials.year}` : ""}`);
      setMsg((m) => ({ ...m, [kind]: parts.length ? `Fatto: ${parts.join("; ")}. Controlla i campi qui sotto.` : "Letto: i campi erano già compilati." }));
    } catch (e) {
      setMsg((m) => ({ ...m, [kind]: e instanceof Error ? e.message : "Lettura non riuscita" }));
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="mt-6 rounded-xl border border-dashed border-navy/40 bg-paper p-4 sm:p-5">
      <p className="font-semibold flex items-center gap-2">
        <FileText className="size-5 text-navy" aria-hidden strokeWidth={1.75} /> Hai a portata di mano visura e bilancio?
      </p>
      <p className="mt-1 text-sm text-muted">
        Caricali in PDF (facoltativo): compiliamo noi i campi e il report includerà i numeri chiave. I file non vengono
        conservati: li leggiamo, estraiamo i dati dell&apos;azienda e li eliminiamo.
      </p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {DOCS.map((d) => {
          const done = r.documents?.[d.kind];
          return (
            <div key={d.kind}>
              <label
                className={`flex items-center gap-3 rounded-lg border bg-white px-3 py-3 cursor-pointer ${
                  busy === d.kind ? "opacity-60 pointer-events-none" : "hover:border-navy-soft"
                } ${done ? "border-navy" : "border-line"}`}
              >
                <span className={`size-9 rounded-lg flex items-center justify-center ${done ? "bg-navy text-white" : "bg-paper text-navy"}`}>
                  {done ? <CheckIcon className="size-4" aria-hidden /> : <Upload className="size-4" aria-hidden />}
                </span>
                <span className="text-sm">
                  <span className="font-medium block">{d.label}</span>
                  <span className="text-muted">{busy === d.kind ? "Lettura in corso…" : done ? "Caricato · sostituisci" : d.hint}</span>
                </span>
                <input
                  type="file"
                  accept="application/pdf"
                  className="sr-only"
                  onChange={(e) => {
                    void upload(d.kind, e.target.files?.[0]);
                    e.target.value = "";
                  }}
                />
              </label>
              {msg[d.kind] && <p className="mt-1.5 text-xs text-muted">{msg[d.kind]}</p>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
