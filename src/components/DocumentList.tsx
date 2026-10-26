"use client";

import { FileText, Trash2 } from "lucide-react";
import { useState } from "react";

export interface DocRow {
  id: string;
  kind: string;
  created_at: string;
  size_bytes: number | null;
  company: string | null;
}

/** Documenti caricati dall'utente, con cancellazione definitiva. */
export default function DocumentList({ docs }: { docs: DocRow[] }) {
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

  if (!list.length) return <p className="text-sm text-muted">Nessun documento caricato.</p>;
  return (
    <ul className="divide-y divide-line border-y border-line">
      {list.map((d) => (
        <li key={d.id} className="py-3 flex flex-wrap items-center gap-3 text-sm">
          <FileText className="size-5 text-navy" aria-hidden strokeWidth={1.75} />
          <span className="flex-1 min-w-48">
            <span className="font-medium">{d.kind === "visura" ? "Visura camerale" : "Bilancio"}</span>
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
            <button onClick={() => setConfirm(d.id)} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-line hover:bg-paper">
              <Trash2 className="size-4" aria-hidden /> Elimina
            </button>
          )}
        </li>
      ))}
    </ul>
  );
}
