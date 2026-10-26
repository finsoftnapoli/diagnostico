"use client";

import Link from "next/link";
import { useState } from "react";

export interface InterestRow {
  id: string;
  created_at: string;
  kind: string;
  area: string | null;
  contact_email: string | null;
  company: string | null;
  assessment_id: string | null;
  handled_at: string | null;
}

const KIND: Record<string, string> = {
  consulenza: "Sessione con un esperto",
  approfondimento_priorita: "Approfondimento 3 priorità",
  approfondimento_ambito: "Approfondimento ambito",
};

/** Richieste di approfondimento e consulenza, per lo staff. */
export default function InterestList({ rows, areaNames }: { rows: InterestRow[]; areaNames: Record<string, string> }) {
  const [list, setList] = useState(rows);
  const [showHandled, setShowHandled] = useState(false);

  async function toggle(id: string, handled: boolean) {
    const res = await fetch(`/api/interessi/${id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ handled }),
    });
    if (res.ok) setList((l) => l.map((r) => (r.id === id ? { ...r, handled_at: handled ? new Date().toISOString() : null } : r)));
  }

  const open = list.filter((r) => !r.handled_at);
  const shown = showHandled ? list : open;
  return (
    <section>
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h2 className="text-xl font-semibold text-navy">Richieste da ricontattare ({open.length})</h2>
        <label className="text-sm text-muted flex items-center gap-2">
          <input type="checkbox" checked={showHandled} onChange={(e) => setShowHandled(e.target.checked)} /> Mostra anche le gestite
        </label>
      </div>
      {shown.length === 0 ? (
        <p className="mt-3 text-sm text-muted">Nessuna richiesta aperta.</p>
      ) : (
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b border-line text-muted">
                <th className="py-2 pr-4 font-medium">Data</th>
                <th className="py-2 pr-4 font-medium">Richiesta</th>
                <th className="py-2 pr-4 font-medium">Azienda</th>
                <th className="py-2 pr-4 font-medium">Email</th>
                <th className="py-2 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {shown.map((r) => (
                <tr key={r.id} className={`border-b border-line align-top ${r.handled_at ? "text-muted" : ""}`}>
                  <td className="py-2 pr-4 whitespace-nowrap">{new Date(r.created_at).toLocaleDateString("it-IT")}</td>
                  <td className="py-2 pr-4">
                    {KIND[r.kind] ?? r.kind}
                    {r.area ? `: ${areaNames[r.area] ?? r.area}` : ""}
                  </td>
                  <td className="py-2 pr-4">
                    {r.assessment_id ? (
                      <Link href={`/admin/${r.assessment_id}`} className="underline text-navy-soft">
                        {r.company ?? "—"}
                      </Link>
                    ) : (
                      (r.company ?? "—")
                    )}
                  </td>
                  <td className="py-2 pr-4">
                    {r.contact_email ? (
                      <a href={`mailto:${r.contact_email}`} className="underline">
                        {r.contact_email}
                      </a>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="py-2 whitespace-nowrap">
                    <button onClick={() => toggle(r.id, !r.handled_at)} className="px-3 py-1 rounded-lg border border-line hover:bg-paper">
                      {r.handled_at ? "Riapri" : "Segna come gestita"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
