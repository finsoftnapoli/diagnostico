"use client";

import { ArrowDown, ArrowUp, Check, CircleAlert, FileDown, ListChecks, RefreshCw, RotateCcw, Save, TriangleAlert, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { FieldSpec } from "@/lib/narrative-spec";
import { reviewChecks, words, type ReviewIssue } from "@/lib/review-checks";

type Obj = Record<string, unknown>;

const BADGE: Record<string, { text: string; cls: string }> = {
  pending: { text: "In coda di generazione", cls: "bg-paper text-navy" },
  review: { text: "Da rivedere", cls: "bg-accent text-white" },
  ready: { text: "Approvato e inviato", cls: "bg-navy text-white" },
  failed: { text: "Generazione non riuscita", cls: "bg-accent/10 text-accent" },
};

/**
 * Revisione di un report scritto dal modello: lo staff corregge i testi con il contesto a fianco,
 * vede i controlli di qualità, salva, rigenera, scarica l'anteprima e approva.
 */
export default function NarrativeEditor({
  endpoint,
  spec,
  initial,
  status,
  labels = {},
  pdfHref,
  expected,
}: {
  endpoint: string;
  spec: FieldSpec[];
  initial: Obj | null;
  status: string;
  /** Nomi leggibili per i campi fissi (per esempio codice ambito → nome). */
  labels?: Record<string, string>;
  /** Anteprima del PDF (usa l'ultima versione salvata). */
  pdfHref?: string;
  /** Elementi attesi nei gruppi (per esempio le priorità calcolate dal diagnostico), nell'ordine previsto. */
  expected?: Record<string, string[]>;
}) {
  const [value, setValue] = useState<Obj | null>(initial);
  const [saved, setSaved] = useState(() => JSON.stringify(initial));
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [state, setState] = useState(status);
  const [busy, setBusy] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const [showChecks, setShowChecks] = useState(true);
  const dirty = value !== null && JSON.stringify(value) !== saved;

  const issues = useMemo(() => (value ? reviewChecks(spec, value, { expected, labels }) : []), [spec, value, expected, labels]);
  const errors = issues.filter((i) => i.level === "errore");

  const call = useCallback(
    async (action: "save" | "approve" | "regenerate") => {
      if (
        action === "regenerate" &&
        value &&
        !confirm("Rigenerando si sostituisce la versione attuale, comprese le correzioni fatte. Continuare?")
      )
        return;
      if (action === "approve") {
        if (errors.length) {
          setShowChecks(true);
          setMsg({ text: `Prima di approvare completa: ${errors.map((e) => `${e.where} ${e.message}`).join("; ")}.`, ok: false });
          return;
        }
        const warn = issues.length ? `\n\nCi sono ${issues.length} punti di attenzione nei controlli: li hai valutati?` : "";
        if (!confirm(`Approvare il report e inviarlo al cliente?${warn}`)) return;
      }
      setBusy(action);
      setMsg(action === "regenerate" ? { text: "Generazione in corso: può richiedere uno o due minuti.", ok: true } : null);
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action, narrative: value }),
      }).catch(() => null);
      const j = (await res?.json().catch(() => ({}))) as { error?: string; narrative?: Obj; status?: string } | undefined;
      setBusy(null);
      if (!res?.ok) return setMsg({ text: j?.error ?? "Operazione non riuscita: controlla la connessione e riprova.", ok: false });
      if (j?.narrative) {
        setValue(j.narrative);
        setSaved(JSON.stringify(j.narrative));
      }
      if (j?.status) setState(j.status);
      setSavedAt(new Date());
      setMsg({
        text:
          action === "approve"
            ? "Report approvato e inviato al cliente."
            : action === "save"
              ? "Modifiche salvate."
              : "Nuova versione pronta da rivedere.",
        ok: true,
      });
    },
    [endpoint, value, errors, issues.length],
  );

  // Ctrl/Cmd+S salva; avviso se si lascia la pagina con modifiche non salvate
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        if (dirty && !busy) void call("save");
      }
    };
    const leave = (e: BeforeUnloadEvent) => {
      if (dirty) e.preventDefault();
    };
    window.addEventListener("keydown", key);
    window.addEventListener("beforeunload", leave);
    return () => {
      window.removeEventListener("keydown", key);
      window.removeEventListener("beforeunload", leave);
    };
  }, [dirty, busy, call]);

  const badge = BADGE[state] ?? { text: state, cls: "bg-paper text-navy" };
  const go = (anchor: string) => document.getElementById(anchor)?.scrollIntoView({ behavior: "smooth", block: "center" });

  return (
    <section className="rounded-xl border border-navy/30">
      {/* barra degli strumenti, sempre visibile */}
      <div className="sticky top-0 z-20 rounded-t-xl border-b border-line bg-white/95 backdrop-blur px-4 py-3">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="mr-1 text-base font-semibold text-navy">Report approfondito</h2>
          <span className={`text-xs px-2.5 py-1 rounded-full ${badge.cls}`}>{badge.text}</span>
          <span className="text-xs text-muted">
            {dirty ? (
              <span className="font-medium text-[#8a5a00]">● Modifiche non salvate</span>
            ) : savedAt ? (
              `Salvato alle ${savedAt.toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Rome" })}`
            ) : (
              ""
            )}
          </span>
          <div className="ml-auto flex flex-wrap gap-2">
            {value && (
              <button
                onClick={() => call("save")}
                disabled={!!busy || !dirty}
                title="Salva (Ctrl+S)"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-line text-sm hover:bg-paper disabled:opacity-50"
              >
                <Save className="size-4" aria-hidden /> {busy === "save" ? "Salvataggio…" : "Salva"}
              </button>
            )}
            {value && pdfHref && (
              <a
                href={dirty ? undefined : pdfHref}
                onClick={(e) => {
                  if (dirty) {
                    e.preventDefault();
                    setMsg({ text: "Salva le modifiche prima di scaricare l'anteprima: il PDF usa l'ultima versione salvata.", ok: false });
                  }
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-line text-sm hover:bg-paper"
              >
                <FileDown className="size-4" aria-hidden /> Anteprima PDF
              </a>
            )}
            <button
              onClick={() => call("regenerate")}
              disabled={!!busy}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-line text-sm hover:bg-paper disabled:opacity-50"
            >
              <RefreshCw className={`size-4 ${busy === "regenerate" ? "animate-spin" : ""}`} aria-hidden />
              {busy === "regenerate" ? "Generazione…" : value ? "Rigenera" : "Genera ora"}
            </button>
            {value && state !== "ready" && (
              <button
                onClick={() => call("approve")}
                disabled={!!busy}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-navy text-white text-sm font-semibold hover:bg-navy-soft disabled:opacity-60"
              >
                <Check className="size-4" aria-hidden /> {busy === "approve" ? "Invio…" : "Approva e invia"}
              </button>
            )}
          </div>
        </div>
        {value && (
          <nav aria-label="Sezioni del report" className="mt-2 flex gap-1.5 overflow-x-auto text-xs">
            {sectionsOf(spec, value, labels).map((s) => {
              const n = issues.filter((i) => i.anchor === s.anchor || i.anchor.startsWith(`${s.anchor}-`)).length;
              return (
                <button
                  key={s.anchor}
                  type="button"
                  onClick={() => go(s.anchor)}
                  className="shrink-0 rounded-full border border-line px-2.5 py-1 text-muted hover:border-navy-soft hover:text-navy"
                >
                  {s.label}
                  {n > 0 && <span className="ml-1 font-semibold text-[#8a5a00]">· {n}</span>}
                </button>
              );
            })}
          </nav>
        )}
        {msg && <p className={`mt-2 text-sm ${msg.ok ? "text-muted" : "text-accent"}`}>{msg.text}</p>}
      </div>

      <div className="p-5">
        {value && <Checks issues={issues} open={showChecks} onToggle={() => setShowChecks((o) => !o)} onGo={go} />}
        {value ? (
          <div className="mt-5 space-y-7">
            <Fields spec={spec} value={value} onChange={setValue} labels={labels} issues={issues} expected={expected} prefix="" />
          </div>
        ) : (
          <p className="text-sm text-muted">Il report non è ancora stato generato.</p>
        )}
        {state === "ready" && value && (
          <p className="mt-4 text-xs text-muted">
            Il report è già stato inviato: le modifiche salvate ora sono visibili subito al cliente.
          </p>
        )}
      </div>
    </section>
  );
}

function sectionsOf(spec: FieldSpec[], value: Obj, labels: Record<string, string>) {
  const out: { anchor: string; label: string }[] = [];
  for (const f of spec) {
    if (f.type === "fixed") continue;
    if (f.type === "group") {
      const items = (value[f.key] as Obj[]) ?? [];
      if (items.length > 4) out.push({ anchor: f.key, label: f.label });
      else
        items.forEach((it, i) =>
          out.push({ anchor: `${f.key}-${i}`, label: labels[String(it[f.itemTitle])] ?? String(it[f.itemTitle] ?? i + 1) }),
        );
    } else out.push({ anchor: f.key, label: f.label.replace(/ \(un[oa] per riga\)$/, "") });
  }
  return out;
}

function Checks({
  issues,
  open,
  onToggle,
  onGo,
}: {
  issues: ReviewIssue[];
  open: boolean;
  onToggle: () => void;
  onGo: (a: string) => void;
}) {
  const errors = issues.filter((i) => i.level === "errore").length;
  return (
    <div className={`rounded-lg border ${issues.length ? "border-[#e9c98a] bg-[#fdf8ee]" : "border-line bg-paper"}`}>
      <button type="button" onClick={onToggle} className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm">
        <ListChecks className="size-4 text-navy" aria-hidden />
        <span className="font-semibold text-navy">Controlli prima dell&apos;approvazione</span>
        <span className="text-muted">
          {issues.length === 0
            ? "· nessun punto da verificare"
            : `· ${errors ? `${errors} da completare, ` : ""}${issues.length - errors} da valutare`}
        </span>
        <span className="ml-auto text-xs text-navy-soft">{open ? "Nascondi" : "Mostra"}</span>
      </button>
      {open && issues.length > 0 && (
        <ul className="border-t border-[#e9c98a] px-4 py-2 text-sm">
          {issues.map((i, k) => (
            <li key={k} className="flex items-start gap-2 py-1">
              {i.level === "errore" ? (
                <CircleAlert className="size-4 mt-0.5 shrink-0 text-accent" aria-hidden />
              ) : (
                <TriangleAlert className="size-4 mt-0.5 shrink-0 text-[#b7791f]" aria-hidden />
              )}
              <button type="button" onClick={() => onGo(i.anchor)} className="text-left hover:underline">
                <span className="font-medium">{i.where}</span> {i.message}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function FieldIssues({ issues, anchor }: { issues: ReviewIssue[]; anchor: string }) {
  const own = issues.filter((i) => i.anchor === anchor);
  if (!own.length) return null;
  return (
    <ul className="mt-1 space-y-0.5 text-xs">
      {own.map((i, k) => (
        <li key={k} className={i.level === "errore" ? "text-accent" : "text-[#8a5a00]"}>
          {i.message}
        </li>
      ))}
    </ul>
  );
}

function Counter({ n, range, unit }: { n: number; range?: [number, number]; unit: string }) {
  const off = range && (n < range[0] || n > range[1] * 1.3);
  return (
    <span className={`text-xs tabular-nums ${off ? "text-[#8a5a00]" : "text-muted"}`}>
      {n} {unit}
      {range ? ` · consigliate ${range[0]}-${range[1]}` : ""}
    </span>
  );
}

function Fields({
  spec,
  value,
  onChange,
  labels,
  issues,
  expected,
  prefix,
}: {
  spec: FieldSpec[];
  value: Obj;
  onChange: (v: Obj) => void;
  labels: Record<string, string>;
  issues: ReviewIssue[];
  expected?: Record<string, string[]>;
  prefix: string;
}) {
  const set = (k: string, v: unknown) => onChange({ ...value, [k]: v });
  return (
    <>
      {spec.map((f) => {
        if (f.type === "fixed") return null;
        const anchor = `${prefix}${f.key}`;
        if (f.type === "text") {
          const text = String(value[f.key] ?? "");
          return (
            <label key={f.key} id={anchor} className="block text-sm scroll-mt-40">
              <span className="flex flex-wrap items-baseline justify-between gap-2">
                <span className="font-semibold text-ink">{f.label}</span>
                <Counter n={words(text)} range={f.words} unit="parole" />
              </span>
              {f.hint && <span className="block text-xs text-muted">{f.hint}</span>}
              <textarea
                value={text}
                onChange={(e) => set(f.key, e.target.value)}
                rows={f.rows === 1 ? 1 : 3}
                className={`mt-1.5 w-full resize-none rounded-lg border border-line px-3 py-2 leading-relaxed field-sizing-content focus:border-navy-soft focus:outline-none ${
                  f.rows === 1 ? "font-semibold" : "min-h-24"
                }`}
              />
              <FieldIssues issues={issues} anchor={anchor} />
            </label>
          );
        }
        if (f.type === "list") {
          const items = (value[f.key] as string[]) ?? [];
          return (
            <label key={f.key} id={anchor} className="block text-sm scroll-mt-40">
              <span className="flex flex-wrap items-baseline justify-between gap-2">
                <span className="font-semibold text-ink">{f.label}</span>
                <Counter n={items.filter((x) => x.trim()).length} range={f.items} unit="voci" />
              </span>
              {f.hint && <span className="block text-xs text-muted">{f.hint}</span>}
              <textarea
                value={items.join("\n")}
                onChange={(e) => set(f.key, e.target.value.split("\n"))}
                rows={3}
                className="mt-1.5 w-full resize-none rounded-lg border border-line px-3 py-2 leading-relaxed field-sizing-content min-h-20 focus:border-navy-soft focus:outline-none"
              />
              <FieldIssues issues={issues} anchor={anchor} />
            </label>
          );
        }
        return <Group key={f.key} f={f} value={value} set={set} labels={labels} issues={issues} expected={expected} anchor={anchor} />;
      })}
    </>
  );
}

function Group({
  f,
  value,
  set,
  labels,
  issues,
  expected,
  anchor,
}: {
  f: Extract<FieldSpec, { type: "group" }>;
  value: Obj;
  set: (k: string, v: unknown) => void;
  labels: Record<string, string>;
  issues: ReviewIssue[];
  expected?: Record<string, string[]>;
  anchor: string;
}) {
  const items = (value[f.key] as Obj[]) ?? [];
  // elementi tolti in questa sessione, per poterli ripristinare
  const [removed, setRemoved] = useState<Obj[]>([]);
  const exp = expected?.[f.key];
  const move = (i: number, d: -1 | 1) => {
    const next = [...items];
    [next[i], next[i + d]] = [next[i + d], next[i]];
    set(f.key, next);
  };
  return (
    <div id={anchor} className="scroll-mt-40">
      <p className="text-sm font-semibold text-ink">{f.label}</p>
      {f.hint && <p className="text-xs text-muted">{f.hint}</p>}
      <FieldIssues issues={issues} anchor={anchor} />
      <div className="mt-2 space-y-4">
        {items.map((it, i) => {
          const id = String(it[f.itemTitle] ?? "");
          const rank = exp ? exp.indexOf(id) : -1;
          return (
            <div key={id || i} id={`${anchor}-${i}`} className="rounded-xl border border-line bg-paper/60 p-4 space-y-4 scroll-mt-40">
              <div className="flex flex-wrap items-center gap-2">
                <span className="size-6 rounded-full bg-navy text-white text-xs font-semibold flex items-center justify-center">
                  {i + 1}
                </span>
                <span className="text-sm font-semibold uppercase tracking-wide text-navy">{labels[id] ?? id}</span>
                {exp &&
                  (rank >= 0 ? (
                    <span className="rounded-full bg-navy/10 px-2 py-0.5 text-[11px] text-navy">priorità {rank + 1} del diagnostico</span>
                  ) : (
                    <span className="rounded-full bg-[#f9eeda] px-2 py-0.5 text-[11px] text-[#8a5a00]">non tra le priorità calcolate</span>
                  ))}
                {f.reorderable && (
                  <span className="ml-auto flex gap-1">
                    <IconButton label="Sposta su" disabled={i === 0} onClick={() => move(i, -1)}>
                      <ArrowUp className="size-4" />
                    </IconButton>
                    <IconButton label="Sposta giù" disabled={i === items.length - 1} onClick={() => move(i, 1)}>
                      <ArrowDown className="size-4" />
                    </IconButton>
                    <IconButton
                      label="Togli dal report"
                      disabled={items.length <= 1}
                      onClick={() => {
                        setRemoved((rs) => [...rs, it]);
                        set(
                          f.key,
                          items.filter((_, j) => j !== i),
                        );
                      }}
                    >
                      <X className="size-4" />
                    </IconButton>
                  </span>
                )}
              </div>
              <Fields
                spec={f.fields}
                value={it}
                labels={labels}
                issues={issues}
                prefix={`${anchor}-${i}-`}
                onChange={(nv) =>
                  set(
                    f.key,
                    items.map((x, j) => (j === i ? nv : x)),
                  )
                }
              />
            </div>
          );
        })}
        {removed.filter((r) => !items.some((it) => it[f.itemTitle] === r[f.itemTitle])).length > 0 && (
          <div className="flex flex-wrap items-center gap-2 text-sm text-muted">
            Tolti dal report:
            {removed
              .filter((r) => !items.some((it) => it[f.itemTitle] === r[f.itemTitle]))
              .map((r) => (
                <button
                  key={String(r[f.itemTitle])}
                  type="button"
                  onClick={() => {
                    set(f.key, [...items, r]);
                    setRemoved((rs) => rs.filter((x) => x !== r));
                  }}
                  className="inline-flex items-center gap-1 rounded-full border border-line px-2.5 py-1 hover:border-navy-soft"
                >
                  <RotateCcw className="size-3.5" aria-hidden /> {labels[String(r[f.itemTitle])] ?? String(r[f.itemTitle])}
                </button>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}

function IconButton({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="size-7 rounded-md border border-line bg-white text-muted flex items-center justify-center hover:text-navy hover:border-navy-soft disabled:opacity-40"
    >
      {children}
    </button>
  );
}
