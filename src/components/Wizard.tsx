"use client";

import { track } from "@/lib/track";
import { ArrowLeft, ArrowRight, Check as CheckIcon, Clock, FileText, Info, PauseCircle, Upload, Users } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import FileDrop from "@/components/FileDrop";
import { AREA_SHORT, AreaIcon } from "@/lib/areaIcons";
import { acceptFor, docFormat, withType } from "@/lib/doc-format";
import { clearDraft, loadDraft, saveDraft } from "@/lib/draft";
import {
  firstIncomplete,
  liveAreas,
  minutesLeft,
  missingProfileFields,
  ORDERED_QUESTIONS,
  stepProblem,
  STEPS,
  type LiveArea,
  type Step,
} from "@/lib/flow";
import { LEVEL_NAMES } from "@/lib/levels";
import { AREAS, ISSUES, OBJECTIVES, PROFILE_FIELDS } from "@/lib/questionnaire";
import { MIN_TEXT } from "@/lib/sanitize";
import { areaReading } from "@/lib/score-meaning";
import { computeResult, emptyResponses } from "@/lib/scoring";
import { supabaseBrowser } from "@/lib/supabase/browser";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import type { AreaCode, Choice, Financials, Governance, Responses } from "@/lib/types";
import { isValidItalianVat, normalizeVat } from "@/lib/vat";
import HumanCheck, { isHumanCheckEnabled } from "./HumanCheck";
import LiveOttogramma from "./LiveOttogramma";

const STEP_LABEL: Record<Exclude<Step["kind"], "question">, string> = {
  start: "",
  objectives: "Ambizioni",
  issues: "Sfide",
  profile: "La vostra azienda",
};

/** Nome del livello più vicino a un livello medio (1-4). */
const nearestLevel = (level: number) => LEVEL_NAMES[Math.min(3, Math.max(0, Math.round(level) - 1))];

export default function Wizard() {
  const router = useRouter();
  // Il componente gira solo nel browser (vedi ClientOnly), quindi la bozza si legge all'avvio.
  const [initial] = useState(() => {
    const d = loadDraft();
    return d && !d.completedAt ? d : null;
  });
  const [r, setR] = useState<Responses>(() => initial?.responses ?? emptyResponses());
  // si riprende dal primo passo incompleto, qualunque versione del percorso abbia salvato la bozza
  const [step, setStep] = useState(() => (initial ? firstIncomplete(initial.responses) : 0));
  const [notice, setNotice] = useState<string | null>(() => (initial && step > 0 ? "Abbiamo ripreso da dove eravate rimasti." : null));
  const [error, setError] = useState<string | null>(null);
  const [human, setHuman] = useState(() => !isHumanCheckEnabled());
  /** Ambito appena completato, di cui si mostra il riscontro prima di proseguire. */
  const [areaDone, setAreaDone] = useState<AreaCode | null>(null);
  const [showMissing, setShowMissing] = useState(false);
  const topRef = useRef<HTMLDivElement>(null);
  /** Passo che avanza da solo appena la risposta è completa. */
  const auto = useRef<number | null>(null);

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
        setNotice("Per riprendere aprite il link dell'email da questo stesso browser.");
        return;
      }
      const res = await fetch(`/api/bozze/${encodeURIComponent(id)}`);
      if (!res.ok) {
        setNotice("Non abbiamo trovato la bozza salvata: il link potrebbe essere scaduto.");
        return;
      }
      const d = (await res.json()) as { step: number; responses: Responses };
      const merged = { ...emptyResponses(), ...d.responses };
      setR(merged);
      setStep(firstIncomplete(merged));
      setNotice("Bozza recuperata: riprendete da dove eravate rimasti.");
      window.history.replaceState(null, "", "/diagnostico");
    })();
  }, []);

  const update = useCallback((patch: Partial<Responses>) => setR((prev) => ({ ...prev, ...patch })), []);
  const cur = STEPS[step];
  // misura del percorso: un evento per passo raggiunto, senza identificativi
  useEffect(() => {
    const c = STEPS[step];
    if (c.kind === "start") return track("avvio");
    if (c.kind === "question") {
      if (c.index === 0) track("inizio");
      else track("risposta", ORDERED_QUESTIONS[c.index - 1].id);
      return;
    }
    track("risposta", ORDERED_QUESTIONS[ORDERED_QUESTIONS.length - 1].id);
    track(c.kind === "objectives" ? "ambizioni" : c.kind === "issues" ? "sfide" : "azienda");
  }, [step]);
  const areas = useMemo(() => liveAreas(r), [r]);
  const onHuman = useCallback(() => setHuman(true), []);
  const activeArea = cur.kind === "question" ? ORDERED_QUESTIONS[cur.index].area : null;

  function scrollTop() {
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function forward() {
    const problem = cur.kind === "start" && !human ? "Attendete la verifica di sicurezza." : stepProblem(cur, r);
    if (problem) {
      setError(problem);
      if (cur.kind === "profile") setShowMissing(true);
      return;
    }
    setError(null);
    auto.current = null;
    if (step === STEPS.length - 1) {
      const textAreas = Array.from(new Set([...r.objectivesTextAreas, ...r.issuesTextAreas]));
      saveDraft({ step, responses: { ...r, textAreas }, completedAt: new Date().toISOString() });
      router.push("/risultati");
      return;
    }
    // all'ultima domanda di un ambito si mostra il riscontro, la prima volta che lo si completa
    const next = STEPS[step + 1];
    if (cur.kind === "question") {
      const area = ORDERED_QUESTIONS[cur.index].area;
      const lastOfArea = next.kind !== "question" || ORDERED_QUESTIONS[next.index].area !== area;
      if (lastOfArea) setAreaDone(area);
    }
    setStep(step + 1);
    scrollTop();
  }

  function back() {
    setError(null);
    auto.current = null;
    if (areaDone) setAreaDone(null);
    setStep(Math.max(0, step - 1));
    scrollTop();
  }

  /** Risposta a una domanda: se la completa, si passa da soli alla successiva. */
  function answer(patch: Partial<Responses>) {
    if (cur.kind === "question" && stepProblem(cur, r)) auto.current = step;
    setError(null);
    update(patch);
  }

  useEffect(() => {
    if (auto.current !== step || stepProblem(STEPS[step], r)) return;
    const t = window.setTimeout(forward, 450);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- avanza solo quando cambia la risposta del passo corrente
  }, [r, step]);

  function restart() {
    clearDraft();
    setR(emptyResponses());
    setStep(0);
    setAreaDone(null);
    setNotice(null);
  }

  const side = cur.kind !== "start";
  return (
    <div ref={topRef} className={`mx-auto px-4 py-6 sm:py-10 ${side ? "max-w-5xl" : "max-w-2xl"}`}>
      {side && <Header step={step} cur={cur} areas={areas} active={areaDone ?? activeArea} done={areaDone} />}

      {notice && step > 0 && (
        <p className="mt-4 text-sm bg-paper border border-line rounded-lg px-3 py-2 flex flex-wrap gap-x-2">
          <span>{notice}</span>
          <button className="underline" onClick={restart}>
            Ricomincia da capo
          </button>
        </p>
      )}

      <div className={side ? "mt-6 lg:grid lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-10 items-start" : "mt-2"}>
        <div className="min-w-0">
          {areaDone ? (
            <AreaDone area={areaDone} r={r} areas={areas} onContinue={() => (setAreaDone(null), scrollTop())} next={cur} />
          ) : (
            <>
              {cur.kind === "start" && (
                <>
                  <Start r={r} update={update} />
                  <HumanCheck onVerified={onHuman} />
                </>
              )}
              {cur.kind === "question" && <QuestionScreen index={cur.index} r={r} answer={answer} />}
              {cur.kind === "objectives" && (
                <Ranked
                  eyebrow="Ambizioni"
                  title="Dove volete portare l'azienda nei prossimi 2-3 anni?"
                  hint="Scegliete fino a tre obiettivi, in ordine di importanza: il primo che toccate è il più importante."
                  catalogue={OBJECTIVES}
                  selected={r.objectives}
                  onChange={(objectives) => update({ objectives })}
                  text={r.objectivesText}
                  onText={(objectivesText) => update({ objectivesText })}
                  textPrompt="Pensate a dove volete essere tra due o tre anni: che cosa volete ottenere, e perché proprio adesso? Scrivetelo con parole vostre, come lo direste a un socio."
                  textPlaceholder="Per esempio: vogliamo crescere all'estero del 30% e, entro due anni, mio figlio entrerà in azienda; per questo devo delegare la parte commerciale, che oggi seguo da solo."
                  textAreas={r.objectivesTextAreas}
                  onTextAreas={(objectivesTextAreas) => update({ objectivesTextAreas })}
                />
              )}
              {cur.kind === "issues" && (
                <Ranked
                  eyebrow="Sfide"
                  title="Quali sono oggi le sfide principali?"
                  hint="Scegliete fino a tre criticità, in ordine di gravità: la prima che toccate è la più pressante."
                  catalogue={ISSUES}
                  selected={r.issues}
                  onChange={(issues) => update({ issues })}
                  text={r.issuesText}
                  onText={(issuesText) => update({ issuesText })}
                  textPrompt="Pensate a che cosa vi frena di più oggi, e a che cosa succede se tra un anno non è cambiato nulla. Bastano poche righe concrete."
                  textPlaceholder="Per esempio: scopriamo solo a fine anno se abbiamo guadagnato, la banca ci chiede previsioni di cassa che non sappiamo fare e i margini sulle commesse più grandi sono in calo."
                  textAreas={r.issuesTextAreas}
                  onTextAreas={(issuesTextAreas) => update({ issuesTextAreas })}
                />
              )}
              {cur.kind === "profile" && <Profile r={r} update={update} showMissing={showMissing} />}

              {error && (
                <p role="alert" className="mt-6 text-sm text-accent">
                  {error}
                </p>
              )}

              <div className="mt-8 flex justify-between gap-4">
                {step > 0 ? (
                  <button
                    onClick={back}
                    className="px-5 py-2.5 rounded-lg border border-line hover:bg-paper inline-flex items-center gap-2"
                  >
                    <ArrowLeft className="size-4" aria-hidden /> Indietro
                  </button>
                ) : (
                  <Link href="/" className="px-5 py-2.5 rounded-lg border border-line hover:bg-paper">
                    Annulla
                  </Link>
                )}
                <button
                  onClick={forward}
                  className="px-6 py-2.5 rounded-lg bg-navy text-white font-semibold hover:bg-navy-soft inline-flex items-center gap-2"
                >
                  {step === STEPS.length - 1 ? "Concludi" : step === 0 ? "Inizia" : "Avanti"}
                  <ArrowRight className="size-4" aria-hidden />
                </button>
              </div>
              {step > 0 && <p className="mt-4 text-xs text-muted text-right">Le risposte si salvano da sole.</p>}
            </>
          )}
        </div>

        {side && (
          <aside className="hidden lg:block sticky top-6">
            <OttogrammaPanel areas={areas} active={areaDone ?? activeArea} />
          </aside>
        )}
      </div>
    </div>
  );
}

/** Avanzamento: dove si è, quanto manca, gli otto ambiti. Su telefono porta anche l'Ottogramma in piccolo. */
function Header({
  step,
  cur,
  areas,
  active,
  done,
}: {
  step: number;
  cur: Step;
  areas: LiveArea[];
  active: AreaCode | null;
  done: AreaCode | null;
}) {
  const progress = Math.round((step / (STEPS.length - 1)) * 100);
  const label = done
    ? `${areas.filter((a) => a.done).length} ambiti su ${areas.length}`
    : cur.kind === "question"
      ? `Domanda ${cur.index + 1} di ${ORDERED_QUESTIONS.length}`
      : STEP_LABEL[cur.kind];
  return (
    <div className="flex items-center gap-4">
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-3 text-sm">
          <span className="font-semibold text-navy">{label}</span>
          <span className="text-muted inline-flex items-center gap-1">
            <Clock className="size-3.5" aria-hidden /> circa {minutesLeft(step)} min
          </span>
        </div>
        <div className="mt-2 h-1.5 bg-paper rounded-full" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
          <div className="h-1.5 bg-navy rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
        <div className="mt-3 grid grid-cols-8 gap-1.5" aria-label="Ambiti">
          {areas.map((a) => {
            const on = a.code === active;
            return (
              <div
                key={a.code}
                title={AREAS.find((x) => x.code === a.code)?.name}
                className={`h-8 rounded-lg flex items-center justify-center border transition-colors ${
                  on ? "bg-navy text-white border-navy" : a.done ? "bg-navy/10 text-navy border-transparent" : "border-line text-muted"
                }`}
              >
                {a.done && !on ? <CheckIcon className="size-4" aria-hidden /> : <AreaIcon code={a.code} className="size-4" />}
              </div>
            );
          })}
        </div>
      </div>
      <div className="lg:hidden w-20 shrink-0" aria-hidden>
        <LiveOttogramma areas={areas} active={active} size={80} labels={false} />
      </div>
    </div>
  );
}

function OttogrammaPanel({ areas, active }: { areas: LiveArea[]; active: AreaCode | null }) {
  const done = areas.filter((a) => a.done);
  return (
    <div className="rounded-2xl border border-line bg-paper/60 p-5">
      <p className="text-xs font-medium uppercase tracking-wide text-muted">Il vostro Ottogramma</p>
      <div className="mt-2 flex justify-center">
        <LiveOttogramma areas={areas} active={active} size={176} />
      </div>
      <p className="mt-2 text-sm text-muted">
        {done.length === 0
          ? "Si disegna mentre rispondete: un vertice per ogni ambito."
          : done.length < areas.length
            ? `${done.length} ${done.length === 1 ? "ambito" : "ambiti"} su ${areas.length}: più il vertice è lontano dal centro, più le pratiche sono mature.`
            : "L'Ottogramma è completo. Mancano ambizioni, sfide e i dati dell'azienda."}
      </p>
      {done.length > 0 && (
        <ul className="mt-3 space-y-1.5 text-sm">
          {done.map((a) => (
            <li key={a.code} className="flex items-center justify-between gap-3">
              <span className="inline-flex items-center gap-2">
                <AreaIcon code={a.code} className="size-4 text-navy" />
                {AREA_SHORT[a.code]}
              </span>
              <span className="text-xs text-muted">{a.level ? nearestLevel(a.level) : ""}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/** Riscontro a fine ambito: il livello raggiunto e l'Ottogramma con il nuovo vertice. */
function AreaDone({
  area,
  r,
  areas,
  onContinue,
  next,
}: {
  area: AreaCode;
  r: Responses;
  areas: LiveArea[];
  onContinue: () => void;
  next: Step;
}) {
  const a = AREAS.find((x) => x.code === area)!;
  const idx = AREAS.findIndex((x) => x.code === area);
  const live = areas.find((x) => x.code === area)!;
  const score = computeResult(r).areas.find((x) => x.code === area)?.score ?? null;
  const levels = ORDERED_QUESTIONS.filter((q) => q.area === area).map((q) => r.levels[q.id]);
  const nextArea = next.kind === "question" ? AREAS.find((x) => x.code === ORDERED_QUESTIONS[next.index].area) : null;
  return (
    <div className="rounded-2xl border border-navy/20 bg-navy/5 p-6 sm:p-8">
      <p className="text-sm text-muted">
        Ambito {idx + 1} di {AREAS.length} completato
      </p>
      <h1 className="mt-1 text-2xl sm:text-3xl font-semibold text-navy flex items-center gap-3">
        <span className="shrink-0 size-10 rounded-xl bg-navy text-white flex items-center justify-center">
          <AreaIcon code={area} className="size-5" />
        </span>
        {a.name}
      </h1>
      {live.level !== null && (
        <p className="mt-4 inline-block rounded-full bg-white border border-navy/20 px-3 py-1 text-sm font-medium text-navy">
          Livello più vicino: {nearestLevel(live.level)}
        </p>
      )}
      <p className="mt-3 text-ink">{areaReading(score, null, levels)}</p>
      <div className="mt-4 flex justify-center lg:hidden">
        <LiveOttogramma areas={areas} active={area} size={170} />
      </div>
      <p className="mt-4 text-sm text-muted">
        {nextArea
          ? "Il vertice è sull'Ottogramma. Evidenze, confronto con aziende simili e priorità arrivano alla fine."
          : "L'Ottogramma è completo. Ora due domande aperte su ambizioni e sfide: è da lì che nascono le priorità."}
      </p>
      <button
        autoFocus
        onClick={onContinue}
        className="mt-6 px-6 py-2.5 rounded-lg bg-navy text-white font-semibold hover:bg-navy-soft inline-flex items-center gap-2"
      >
        {nextArea ? `Continua con ${nextArea.name}` : "Continua"}
        <ArrowRight className="size-4" aria-hidden />
      </button>
    </div>
  );
}

interface SectionProps {
  r: Responses;
  update: (p: Partial<Responses>) => void;
}

/** Controllo della partita IVA sull'archivio pubblico: se la trova, compila ragione sociale e regione rimaste vuote. */
function useVatLookup(r: Responses, update: (p: Partial<Responses>) => void) {
  const [info, setInfo] = useState<string | null>(null);
  async function check() {
    const n = normalizeVat(r.profile["PR-10"] ?? "");
    if (!isValidItalianVat(n)) {
      setInfo(n ? "La partita IVA non sembra corretta." : null);
      return;
    }
    setInfo("Partita IVA corretta.");
    try {
      const res = await fetch(`/api/piva?n=${n}`);
      const j = (await res.json()) as { valid: boolean; checked?: boolean; name?: string | null; region?: string | null };
      if (j.checked && !j.valid) setInfo("La partita IVA non risulta attiva nell'archivio europeo VIES.");
      else if (j.name) {
        setInfo(`Trovata: ${j.name}`);
        update({
          profile: {
            ...r.profile,
            "PR-10": n,
            "PR-11": r.profile["PR-11"]?.trim() || j.name,
            "PR-04": r.profile["PR-04"] || j.region || "",
          },
        });
      }
    } catch {
      /* verifica online non disponibile: basta il controllo formale */
    }
  }
  return { info, check };
}

function Start({ r, update }: SectionProps) {
  const vat = useVatLookup(r, update);
  return (
    <div>
      <h1 className="text-3xl font-semibold text-navy">Circa 15 minuti, una domanda alla volta</h1>
      {r.context && (
        <p className="mt-4 rounded-lg border border-navy/30 bg-navy/5 px-4 py-3 text-sm">
          Compilate il diagnostico come colleghi di <strong>{r.context.companyName}</strong>
          {r.context.companyName.endsWith(".") ? "" : "."} Il profilo dell&apos;azienda è già compilato; le risposte individuali saranno
          visibili all&apos;amministratore dello spazio aziendale, che potrà confrontarle con quelle degli altri colleghi.
        </p>
      )}
      <ul className="mt-6 space-y-3">
        {[
          {
            icon: CheckIcon,
            t: "Per ogni tema scegliete la descrizione più vicina alla situazione di oggi, non a quella desiderata: un quadro onesto produce priorità più utili.",
          },
          { icon: Users, t: "L'Ottogramma, il profilo della vostra azienda sugli 8 ambiti, si disegna mentre rispondete." },
          { icon: PauseCircle, t: "Potete interrompere quando volete: le risposte si salvano da sole e riprendete da dove eravate." },
        ].map(({ icon: Icon, t }, i) => (
          <li key={i} className="flex gap-3">
            <Icon className="size-5 shrink-0 text-navy mt-0.5" aria-hidden strokeWidth={1.75} />
            <span>{t}</span>
          </li>
        ))}
      </ul>

      {!r.context && (
        <label className="mt-8 block text-sm">
          <span className="font-medium">
            Partita IVA <span className="text-muted font-normal">(facoltativa ora)</span>
          </span>
          <input
            className="mt-1 block w-full sm:w-64 border border-line rounded-lg px-3 py-2"
            inputMode="numeric"
            placeholder="11 cifre"
            value={r.profile["PR-10"] ?? ""}
            onChange={(e) => update({ profile: { ...r.profile, "PR-10": e.target.value } })}
            onBlur={vat.check}
          />
          <span className="mt-1 block text-xs text-muted">
            {vat.info ?? "Se la indicate adesso compiliamo noi alcuni dati dell'azienda; altrimenti ve la chiediamo alla fine."}
          </span>
        </label>
      )}

      <div className="mt-8 space-y-4">
        <Check checked={r.consents.service} onChange={(v) => update({ consents: { ...r.consents, service: v, benchmark: v } })}>
          Ho letto l&apos;
          <Link href="/privacy" className="underline" target="_blank">
            informativa privacy
          </Link>{" "}
          e accetto le condizioni del servizio, compreso l&apos;uso delle risposte in forma anonima e aggregata per statistiche, confronti
          tra aziende e finalità di ricerca. <span className="text-accent">*</span>
        </Check>
        <Check checked={r.consents.marketing} onChange={(v) => update({ consents: { ...r.consents, marketing: v } })}>
          Desidero ricevere comunicazioni su servizi, ricerche e iniziative (facoltativo).
        </Check>
      </div>
      <p className="mt-6 text-xs text-muted flex gap-2">
        <Info className="size-4 shrink-0" aria-hidden />
        Il diagnostico fa parte di un programma di ricerca sulla gestione delle imprese italiane. Il risultato è un&apos;autovalutazione
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

/** Una domanda per schermata: la situazione più vicina, poi una verifica rapida. */
function QuestionScreen({ index, r, answer }: { index: number; r: Responses; answer: (p: Partial<Responses>) => void }) {
  const q = ORDERED_QUESTIONS[index];
  const a = AREAS.find((x) => x.code === q.area)!;
  const inArea = ORDERED_QUESTIONS.filter((x) => x.area === q.area);
  const level = r.levels[q.id];
  const checkRef = useRef<HTMLDivElement>(null);

  // scelta la situazione, la verifica entra in vista
  useEffect(() => {
    if (level && !r.checks[q.id]) checkRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- solo quando cambia la situazione scelta
  }, [level, q.id]);

  return (
    <fieldset key={q.id} className="question-in">
      <legend className="sr-only">{q.text}</legend>
      <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-navy/10 text-navy font-medium px-2.5 py-1">
          <AreaIcon code={q.area} className="size-4" />
          {a.name}
        </span>
        <span>
          {inArea.indexOf(q) + 1} di {inArea.length} · {q.theme}
        </span>
      </p>
      <h1 className="mt-4 text-xl sm:text-2xl font-semibold text-ink leading-snug">{q.text}</h1>
      <div className="mt-5 space-y-2.5">
        {q.levels.map((txt, i) => {
          const lvl = i + 1;
          const on = level === lvl;
          return (
            <label
              key={lvl}
              className={`flex gap-3 items-start border rounded-xl px-4 py-3.5 cursor-pointer leading-snug transition ${
                on ? "border-navy bg-navy/5 shadow-sm" : "border-line hover:border-navy-soft hover:bg-paper/60"
              }`}
            >
              <input
                type="radio"
                name={q.id}
                className="sr-only"
                checked={on}
                onChange={() => answer({ levels: { ...r.levels, [q.id]: lvl } })}
              />
              <span
                className={`mt-0.5 shrink-0 size-5 rounded-full border-2 flex items-center justify-center ${
                  on ? "border-navy bg-navy text-white" : "border-line"
                }`}
                aria-hidden
              >
                {on && <CheckIcon className="size-3" strokeWidth={3} />}
              </span>
              <span>{txt}</span>
            </label>
          );
        })}
      </div>
      <div
        ref={checkRef}
        className={`mt-5 rounded-xl bg-paper px-4 py-4 transition-opacity ${level ? "opacity-100" : "opacity-50"}`}
        aria-disabled={!level}
      >
        <p className="text-sm">
          <span className="font-medium">Una verifica rapida · </span>
          {q.check.text}
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {q.check.options.map((o) => {
            const on = r.checks[q.id] === o;
            return (
              <button
                key={o}
                onClick={() => answer({ checks: { ...r.checks, [q.id]: o } })}
                aria-pressed={on}
                className={`text-sm px-4 py-2 rounded-full border ${
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
  );
}

function Profile({ r, update, showMissing }: SectionProps & { showMissing: boolean }) {
  const set = (id: string, v: string) => update({ profile: { ...r.profile, [id]: v } });
  const vat = useVatLookup(r, update);
  const missing = showMissing ? missingProfileFields(r) : [];
  return (
    <div>
      <p className="text-sm text-muted">Ultimo passo</p>
      <h1 className="text-3xl font-semibold text-navy">La vostra azienda</h1>
      <p className="mt-2 text-muted">
        Questi dati servono a confrontarvi con aziende simili per settore e dimensione e a intestare il report.
        {r.profile["PR-11"]?.trim() ? " Alcuni campi sono già compilati: controllateli." : ""}
      </p>
      {isSupabaseConfigured() && <DocUpload r={r} update={update} />}
      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        {PROFILE_FIELDS.map((f) => {
          const bad = missing.includes(f.id);
          const border = bad ? "border-accent" : "border-line";
          return (
            <label key={f.id} className="block text-sm">
              <span className="font-medium">
                {f.label}
                {f.required ? <span className="text-accent"> *</span> : <span className="text-muted"> (facoltativo)</span>}
              </span>
              {f.type === "select" ? (
                <select
                  className={`mt-1 w-full border ${border} rounded-lg px-3 py-2 bg-white`}
                  value={r.profile[f.id] ?? ""}
                  onChange={(e) => set(f.id, e.target.value)}
                  aria-invalid={bad}
                >
                  <option value="">Seleziona…</option>
                  {f.options?.map((o) => (
                    <option key={o}>{o}</option>
                  ))}
                </select>
              ) : (
                <input
                  className={`mt-1 w-full border ${border} rounded-lg px-3 py-2`}
                  inputMode={f.type === "number" || f.id === "PR-10" ? "numeric" : "text"}
                  autoComplete={f.id === "PR-11" ? "organization" : undefined}
                  placeholder={f.id === "PR-10" ? "11 cifre" : undefined}
                  value={r.profile[f.id] ?? ""}
                  onChange={(e) => set(f.id, e.target.value)}
                  onBlur={f.id === "PR-10" ? vat.check : undefined}
                  aria-invalid={bad}
                />
              )}
              {bad && (
                <span className="mt-1 block text-xs text-accent">
                  {f.id === "PR-10" && r.profile["PR-10"]?.trim() ? "Non sembra corretta" : "Da compilare"}
                </span>
              )}
              {f.id === "PR-10" && vat.info && !bad && <span className="mt-1 block text-xs text-muted">{vat.info}</span>}
              {f.id === "PR-02" && (
                <span className="mt-1 block text-xs text-muted">
                  Sui valori di confine vale la fascia superiore (con €5M esatti, €5-10M).
                </span>
              )}
            </label>
          );
        })}
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
  textPrompt: string;
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
      <h1 className="text-2xl sm:text-3xl font-semibold text-navy">{props.title}</h1>
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
              aria-disabled={full}
              aria-pressed={on}
              className={`text-left border rounded-xl px-3 py-3 flex items-center gap-3 transition ${
                on ? "border-navy bg-navy/5 shadow-sm" : "border-line hover:border-navy-soft"
              } ${full ? "text-muted" : ""}`}
            >
              <span
                className={`shrink-0 size-9 rounded-lg flex items-center justify-center ${on ? "bg-navy text-white" : "bg-paper text-navy"}`}
              >
                {on ? <span className="text-xs font-semibold">{RANK_LABEL[i]}</span> : <AreaIcon code={c.primary} className="size-4" />}
              </span>
              <span className="text-sm leading-snug">{c.label}</span>
            </button>
          );
        })}
      </div>
      {selected.length >= 3 && (
        <p className="mt-2 text-xs text-muted">Ne avete scelti tre: per cambiarne uno, toccate prima quello da togliere.</p>
      )}

      <div className="mt-8 rounded-2xl border border-navy/20 bg-navy/5 p-4 sm:p-5">
        <label className="block">
          <span className="font-semibold text-navy">Prendetevi due minuti</span>
          <span className="mt-1 block text-sm text-ink">
            {props.textPrompt} <span className="text-accent">*</span>
          </span>
          <textarea
            className="mt-3 w-full border border-line rounded-lg px-3 py-2 bg-white"
            rows={5}
            maxLength={1200}
            placeholder={props.textPlaceholder}
            value={props.text}
            onChange={(e) => props.onText(e.target.value)}
          />
        </label>
        <p className="mt-1 text-xs text-muted">
          {len >= MIN_TEXT
            ? "Grazie: più dettagli ci date, più il report sarà su misura."
            : `Ancora ${MIN_TEXT - len} caratteri per proseguire.`}
        </p>
        {len > 0 && (
          <div className="mt-4">
            <p className="text-sm text-muted">A quali ambiti si riferisce soprattutto quello che avete scritto?</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {AREAS.map((a) => {
                const on = props.textAreas.includes(a.code);
                return (
                  <button
                    key={a.code}
                    onClick={() => toggleArea(a.code)}
                    aria-pressed={on}
                    className={`text-xs px-3 py-1.5 rounded-full border inline-flex items-center gap-1.5 ${
                      on ? "bg-navy text-white border-navy" : "bg-white border-line"
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
    </div>
  );
}

const DOCS = [
  { kind: "visura" as const, label: "Visura camerale", hint: "Precompila i dati dell'azienda" },
  { kind: "bilancio" as const, label: "Ultimo bilancio", hint: "PDF o XBRL: aggiunge al report i numeri chiave" },
];

/** Caricamento facoltativo di visura (PDF) e bilancio (PDF o XBRL) per precompilare il profilo. */
function DocUpload({ r, update }: SectionProps) {
  const [busy, setBusy] = useState<string | null>(null);
  const [msg, setMsg] = useState<Record<string, string>>({});

  async function upload(kind: "visura" | "bilancio", file: File | undefined) {
    if (!file) return;
    const fmt = docFormat(file, kind);
    if ("error" in fmt) {
      setMsg((m) => ({ ...m, [kind]: fmt.error }));
      return;
    }
    setBusy(kind);
    setMsg((m) => ({ ...m, [kind]: "Caricamento…" }));
    try {
      // 1. caricamento diretto nell'archivio privato
      const prep = await fetch("/api/documenti/caricamento", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ tipo: kind, size: file.size, formato: fmt.formato }),
      });
      const p = (await prep.json().catch(() => ({}))) as { error?: string; path?: string; token?: string };
      if (!prep.ok || !p.path || !p.token) throw new Error(p.error ?? "Caricamento non riuscito");
      const { error: upErr } = await supabaseBrowser()
        .storage.from("documenti")
        .uploadToSignedUrl(p.path, p.token, withType(file, fmt.contentType), { contentType: fmt.contentType });
      if (upErr)
        throw new Error(
          /mime/i.test(upErr.message)
            ? "Formato del file non accettato dall'archivio: scriveteci e lo abilitiamo."
            : "Caricamento non riuscito, riprovatete",
        );
      // 2. lettura
      setMsg((m) => ({
        ...m,
        [kind]: fmt.formato === "xbrl" ? "Lettura in corso…" : "Lettura in corso, può richiedere fino a un minuto…",
      }));
      const res = await fetch("/api/documenti", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ tipo: kind, path: p.path }),
      });
      const j = (await res.json().catch(() => ({ error: "Lettura non riuscita, riprovate tra poco" }))) as {
        error?: string;
        documentId?: string;
        profile?: Record<string, string>;
        financials?: Financials;
        governance?: Governance;
        people?: { name: string; role: string }[];
      };
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
        ...(j.governance ? { governance: j.governance } : {}),
        ...(j.people?.length ? { people: j.people } : {}),
        documents: { ...r.documents, [kind]: j.documentId },
      });
      const parts: string[] = [];
      if (filled.length) parts.push(`compilati: ${filled.join(", ")}`);
      if (j.financials) parts.push(`letti i dati del bilancio${j.financials.year ? ` ${j.financials.year}` : ""}`);
      if (j.governance?.organo) parts.push(`governance: ${j.governance.organo}`);
      setMsg((m) => ({
        ...m,
        [kind]: parts.length ? `Fatto: ${parts.join("; ")}. Controllate i campi qui sotto.` : "Letto: i campi erano già compilati.",
      }));
    } catch (e) {
      setMsg((m) => ({ ...m, [kind]: e instanceof Error ? e.message : "Lettura non riuscita" }));
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="mt-6 rounded-xl border border-dashed border-navy/40 bg-paper p-4 sm:p-5">
      <p className="font-semibold flex items-center gap-2">
        <FileText className="size-5 text-navy" aria-hidden strokeWidth={1.75} /> Avete a portata di mano visura e bilancio?
      </p>
      <p className="mt-1 text-sm text-muted">
        Caricateli con un clic o trascinandoli nei riquadri (facoltativo): la visura in PDF, il bilancio in PDF o nel formato XBRL del
        Registro Imprese. Compiliamo noi i campi e il report includerà numeri chiave e governance. I file restano in un archivio privato e
        potete cancellarli in qualsiasi momento dall&apos;area personale.
      </p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {DOCS.map((d) => {
          const done = !!r.documents?.[d.kind];
          return (
            <div key={d.kind}>
              <FileDrop
                accept={acceptFor(d.kind)}
                onFile={(f) => void upload(d.kind, f)}
                disabled={busy !== null}
                activeClassName="border-navy ring-2 ring-navy/30 bg-paper"
                className={`flex min-h-28 items-center gap-3 rounded-xl border-2 border-dashed bg-white px-4 py-5 cursor-pointer transition ${
                  busy === d.kind ? "opacity-60 pointer-events-none" : "hover:border-navy-soft"
                } ${done ? "border-navy" : "border-line"}`}
              >
                <span
                  className={`size-9 rounded-lg flex items-center justify-center ${done ? "bg-navy text-white" : "bg-paper text-navy"}`}
                >
                  {done ? <CheckIcon className="size-4" aria-hidden /> : <Upload className="size-4" aria-hidden />}
                </span>
                <span className="text-sm">
                  <span className="font-medium block">{d.label}</span>
                  <span className="text-muted">{busy === d.kind ? "Lettura in corso…" : done ? "Caricato · sostituisci" : d.hint}</span>
                </span>
              </FileDrop>
              {msg[d.kind] && <p className="mt-1.5 text-xs text-muted">{msg[d.kind]}</p>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
