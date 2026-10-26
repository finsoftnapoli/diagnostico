"use client";

import { Check, RefreshCw, Save } from "lucide-react";
import { useState } from "react";
import type { FieldSpec } from "@/lib/narrative-spec";

type Obj = Record<string, unknown>;

/** Revisione di un report scritto dall'AI: lo staff corregge i testi, salva, rigenera o approva e invia. */
export default function NarrativeEditor({
  endpoint,
  spec,
  initial,
  status,
  labels = {},
}: {
  endpoint: string;
  spec: FieldSpec[];
  initial: Obj | null;
  status: string;
  /** Nomi leggibili per i campi fissi (per esempio codice ambito → nome). */
  labels?: Record<string, string>;
}) {
  const [value, setValue] = useState<Obj | null>(initial);
  const [state, setState] = useState(status);
  const [busy, setBusy] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  async function call(action: "save" | "approve" | "regenerate") {
    if (action === "approve" && !confirm("Approvare il report e inviarlo al cliente?")) return;
    setBusy(action);
    setMsg(action === "regenerate" ? "Generazione in corso, può richiedere un minuto…" : null);
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ action, narrative: value }),
    });
    const j = (await res.json().catch(() => ({}))) as { error?: string; narrative?: Obj; status?: string };
    setBusy(null);
    if (!res.ok) return setMsg(j.error ?? "Operazione non riuscita");
    if (j.narrative) setValue(j.narrative);
    if (j.status) setState(j.status);
    setMsg(action === "approve" ? "Report approvato e inviato al cliente." : action === "save" ? "Modifiche salvate." : "Nuova versione pronta da rivedere.");
  }

  const badge: Record<string, string> = {
    pending: "In coda di generazione",
    review: "Da rivedere",
    ready: "Approvato e inviato",
    failed: "Generazione non riuscita",
  };

  return (
    <section className="mt-10 rounded-xl border border-navy/30 p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-navy">Report approfondito</h2>
        <span className={`text-xs px-2.5 py-1 rounded-full ${state === "review" ? "bg-accent text-white" : "bg-paper text-navy"}`}>
          {badge[state] ?? state}
        </span>
      </div>
      {value ? (
        <div className="mt-4 space-y-5">
          <Fields spec={spec} value={value} onChange={setValue} labels={labels} />
        </div>
      ) : (
        <p className="mt-3 text-sm text-muted">Il report non è ancora stato generato.</p>
      )}
      <div className="mt-6 flex flex-wrap gap-3">
        {value && (
          <button onClick={() => call("save")} disabled={!!busy} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-line text-sm hover:bg-paper">
            <Save className="size-4" aria-hidden /> {busy === "save" ? "Salvataggio…" : "Salva le modifiche"}
          </button>
        )}
        <button onClick={() => call("regenerate")} disabled={!!busy} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-line text-sm hover:bg-paper">
          <RefreshCw className="size-4" aria-hidden /> {busy === "regenerate" ? "Generazione…" : value ? "Rigenera" : "Genera ora"}
        </button>
        {value && state !== "ready" && (
          <button onClick={() => call("approve")} disabled={!!busy} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-navy text-white text-sm font-semibold hover:bg-navy-soft">
            <Check className="size-4" aria-hidden /> {busy === "approve" ? "Invio…" : "Approva e invia al cliente"}
          </button>
        )}
      </div>
      {msg && <p className="mt-3 text-sm text-muted">{msg}</p>}
      {state === "ready" && value && <p className="mt-3 text-xs text-muted">Le modifiche salvate ora sono visibili subito al cliente.</p>}
    </section>
  );
}

function Fields({ spec, value, onChange, labels }: { spec: FieldSpec[]; value: Obj; onChange: (v: Obj) => void; labels: Record<string, string> }) {
  const set = (k: string, v: unknown) => onChange({ ...value, [k]: v });
  return (
    <>
      {spec.map((f) => {
        if (f.type === "fixed") return null;
        if (f.type === "text")
          return (
            <label key={f.key} className="block text-sm">
              <span className="font-medium">{f.label}</span>
              <textarea
                value={String(value[f.key] ?? "")}
                onChange={(e) => set(f.key, e.target.value)}
                rows={f.rows ?? 4}
                className="mt-1 w-full rounded-lg border border-line px-3 py-2 leading-relaxed"
              />
            </label>
          );
        if (f.type === "list")
          return (
            <label key={f.key} className="block text-sm">
              <span className="font-medium">{f.label}</span>
              <textarea
                value={((value[f.key] as string[]) ?? []).join("\n")}
                onChange={(e) => set(f.key, e.target.value.split("\n"))}
                rows={Math.max(3, ((value[f.key] as string[]) ?? []).length + 1)}
                className="mt-1 w-full rounded-lg border border-line px-3 py-2 leading-relaxed"
              />
            </label>
          );
        const items = (value[f.key] as Obj[]) ?? [];
        return (
          <div key={f.key}>
            <p className="text-sm font-medium">{f.label}</p>
            <div className="mt-2 space-y-3">
              {items.map((it, i) => (
                <div key={i} className="rounded-lg bg-paper p-3 space-y-3">
                  <p className="text-xs uppercase tracking-wide text-muted">{labels[String(it[f.itemTitle])] ?? String(it[f.itemTitle] ?? "")}</p>
                  <Fields
                    spec={f.fields}
                    value={it}
                    labels={labels}
                    onChange={(nv) => set(f.key, items.map((x, j) => (j === i ? nv : x)))}
                  />
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </>
  );
}
