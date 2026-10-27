"use client";

import { FileText, Plus, Trash2, Upload } from "lucide-react";
import { useState } from "react";
import { DOC_KINDS, DOC_LABELS, type AnyDocKind, type PlanSummary } from "@/lib/documents";
import { supabaseBrowser } from "@/lib/supabase/browser";

export interface DocRow {
  id: string;
  kind: string;
  created_at: string;
  size_bytes: number | null;
  company: string | null;
  period: number | null;
  label: string | null;
  plan: PlanSummary | null;
}

const kindLabel = (k: string) => DOC_LABELS[k as AnyDocKind] ?? "Documento";

const HINTS: Record<AnyDocKind, string> = {
  visura: "Aggiorna governance e dati dell'azienda.",
  bilancio: "Un esercizio più recente aggiorna i numeri chiave del prossimo report.",
  business_plan: "Ne ricaviamo obiettivi e iniziative, da confrontare con il diagnostico.",
  altro: "Per esempio presentazione aziendale, organigramma, budget.",
};

/** Documenti dell'utente: caricamento di nuovi documenti e cancellazione definitiva. */
export default function DocumentList({ docs, companies }: { docs: DocRow[]; companies: { id: string; name: string }[] }) {
  const [list, setList] = useState(docs);
  const [busy, setBusy] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<string | null>(null);

  async function remove(id: string) {
    setBusy(id);
    const res = await fetch(`/api/documenti/${id}`, { method: "DELETE" });
    setBusy(null);
    setConfirm(null);
    if (res.ok) setList((l) => l.filter((d) => d.id !== id));
  }

  return (
    <>
      {companies.length > 0 && <AddDocument companies={companies} onAdded={(d) => setList((l) => [d, ...l])} />}
      {!list.length ? (
        <p className="mt-4 text-sm text-muted">Nessun documento caricato.</p>
      ) : (
        <ul className="mt-4 divide-y divide-line border-y border-line">
          {list.map((d) => (
            <li key={d.id} className="py-3 text-sm">
              <div className="flex flex-wrap items-center gap-3">
                <FileText className="size-5 text-navy shrink-0" aria-hidden strokeWidth={1.75} />
                <span className="flex-1 min-w-48">
                  <span className="font-medium">
                    {kindLabel(d.kind)}
                    {d.plan?.periodo ? ` ${d.plan.periodo}` : d.period ? ` ${d.period}` : ""}
                  </span>
                  {d.label && <span> · {d.label}</span>}
                  <span className="text-muted">
                    {d.company ? ` · ${d.company}` : ""} · caricato il {new Date(d.created_at).toLocaleDateString("it-IT")}
                    {d.size_bytes ? ` · ${Math.round(d.size_bytes / 1024)} KB` : ""}
                  </span>
                </span>
                {confirm === d.id ? (
                  <span className="flex gap-2">
                    <button onClick={() => remove(d.id)} disabled={busy === d.id} className="px-3 py-1.5 rounded-lg bg-accent text-white">
                      {busy === d.id ? "Eliminazione…" : "Conferma eliminazione"}
                    </button>
                    <button onClick={() => setConfirm(null)} className="px-3 py-1.5 rounded-lg border border-line">
                      Annulla
                    </button>
                  </span>
                ) : (
                  <button
                    onClick={() => setConfirm(d.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-line hover:bg-paper"
                  >
                    <Trash2 className="size-4" aria-hidden /> Elimina
                  </button>
                )}
              </div>
              {d.plan?.sintesi && (
                <details className="mt-2 ml-8">
                  <summary className="cursor-pointer text-navy-soft">Cosa ne abbiamo ricavato</summary>
                  <p className="mt-2 leading-relaxed">{d.plan.sintesi}</p>
                  {d.plan.obiettivi.length > 0 && (
                    <ul className="mt-2 list-disc pl-5 space-y-0.5">
                      {d.plan.obiettivi.map((o, i) => (
                        <li key={i}>
                          {o.indicatore}
                          {o.anno ? ` ${o.anno}` : ""}: {o.valore}
                        </li>
                      ))}
                    </ul>
                  )}
                </details>
              )}
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

function AddDocument({ companies, onAdded }: { companies: { id: string; name: string }[]; onAdded: (d: DocRow) => void }) {
  const [open, setOpen] = useState(false);
  const [companyId, setCompanyId] = useState(companies[0].id);
  const [kind, setKind] = useState<AnyDocKind>("bilancio");
  const [label, setLabel] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);

  async function submit() {
    if (!file) return setMsg({ text: "Scegli il file da caricare.", ok: false });
    if ((file.type && file.type !== "application/pdf") || !file.name.toLowerCase().endsWith(".pdf"))
      return setMsg({ text: "Il file deve essere un PDF: da Word, Excel o PowerPoint usa «Salva come PDF».", ok: false });
    if (file.size > 20 * 1024 * 1024) return setMsg({ text: "Il file supera i 20 MB: prova con una versione più leggera.", ok: false });
    setBusy(true);
    setMsg({ text: "Caricamento…", ok: true });
    try {
      const prep = await fetch("/api/documenti/caricamento", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ tipo: kind, size: file.size, companyId }),
      });
      const p = (await prep.json()) as { error?: string; path?: string; token?: string };
      if (!prep.ok || !p.path || !p.token) throw new Error(p.error ?? "Caricamento non riuscito");
      const { error: upErr } = await supabaseBrowser()
        .storage.from("documenti")
        .uploadToSignedUrl(p.path, p.token, file, { contentType: "application/pdf" });
      if (upErr) throw new Error("Caricamento non riuscito, riprova");
      setMsg({ text: "Lettura in corso, può richiedere fino a un minuto…", ok: true });
      const res = await fetch("/api/documenti", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ tipo: kind, path: p.path, companyId, label }),
      });
      const j = (await res.json()) as { error?: string; documentId?: string; period?: number | null; read?: boolean; plan?: PlanSummary };
      if (!res.ok || !j.documentId) throw new Error(j.error ?? "Lettura non riuscita");
      onAdded({
        id: j.documentId,
        kind,
        created_at: new Date().toISOString(),
        size_bytes: file.size,
        company: companies.find((c) => c.id === companyId)?.name ?? null,
        period: j.period ?? null,
        label: label.trim() || null,
        plan: j.plan ?? null,
      });
      setMsg({
        text: j.read
          ? "Documento archiviato e letto: ne terremo conto nei prossimi report."
          : "Documento archiviato. Non siamo riusciti a leggerne il contenuto (forse è una scansione): resta comunque a disposizione dei nostri esperti.",
        ok: true,
      });
      setFile(null);
      setLabel("");
    } catch (e) {
      setMsg({ text: e instanceof Error ? e.message : "Caricamento non riuscito", ok: false });
    } finally {
      setBusy(false);
    }
  }

  if (!open)
    return (
      <button
        onClick={() => setOpen(true)}
        className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-lg border border-navy text-navy hover:bg-navy/5"
      >
        <Plus className="size-4" aria-hidden /> Aggiungi un documento
      </button>
    );

  return (
    <div className="mt-4 rounded-xl border border-dashed border-navy/40 bg-paper p-4 sm:p-5">
      <div className="grid gap-3 sm:grid-cols-2">
        {companies.length > 1 && (
          <label className="text-sm sm:col-span-2">
            <span className="font-medium">Azienda</span>
            <select value={companyId} onChange={(e) => setCompanyId(e.target.value)} className="mt-1 w-full rounded-lg border border-line bg-white px-3 py-2">
              {companies.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
        )}
        <label className="text-sm">
          <span className="font-medium">Tipo di documento</span>
          <select value={kind} onChange={(e) => setKind(e.target.value as AnyDocKind)} className="mt-1 w-full rounded-lg border border-line bg-white px-3 py-2">
            {DOC_KINDS.map((k) => (
              <option key={k} value={k}>
                {DOC_LABELS[k]}
              </option>
            ))}
          </select>
          <span className="mt-1 block text-xs text-muted">{HINTS[kind]}</span>
        </label>
        <label className="text-sm">
          <span className="font-medium">Descrizione (facoltativa)</span>
          <input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            maxLength={120}
            placeholder="Per esempio: bilancio approvato 2025"
            className="mt-1 w-full rounded-lg border border-line bg-white px-3 py-2"
          />
        </label>
        <label
          className={`sm:col-span-2 flex items-center gap-3 rounded-lg border bg-white px-3 py-3 cursor-pointer ${
            busy ? "opacity-60 pointer-events-none" : "hover:border-navy-soft"
          } ${file ? "border-navy" : "border-line"}`}
        >
          <span className="size-9 rounded-lg flex items-center justify-center bg-paper text-navy">
            <Upload className="size-4" aria-hidden />
          </span>
          <span className="text-sm">
            <span className="font-medium block">{file ? file.name : "Scegli il file PDF"}</span>
            <span className="text-muted">Fino a 20 MB</span>
          </span>
          <input type="file" accept="application/pdf" className="sr-only" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
        </label>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button onClick={submit} disabled={busy} className="bg-navy text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-navy-soft disabled:opacity-60">
          {busy ? "Elaborazione…" : "Carica e archivia"}
        </button>
        <button onClick={() => setOpen(false)} disabled={busy} className="text-sm underline text-navy-soft">
          Chiudi
        </button>
      </div>
      {msg && <p className={`mt-3 text-sm ${msg.ok ? "text-muted" : "text-accent"}`}>{msg.text}</p>}
      <p className="mt-3 text-xs text-muted">
        I documenti restano in un archivio privato, visibili solo a te e ai nostri esperti, e sono usati per i tuoi report e,
        in forma anonima e aggregata, per i confronti tra aziende. Non salviamo nomi di persone.
      </p>
    </div>
  );
}
