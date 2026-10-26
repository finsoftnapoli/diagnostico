"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { loadDraft, saveDraft, type Draft } from "@/lib/draft";
import { supabaseBrowser } from "@/lib/supabase/browser";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import type { Responses } from "@/lib/types";
import Ottogramma from "./Ottogramma";
import SaveGate from "./SaveGate";

export default function ResultsView() {
  // Il componente gira solo nel browser (vedi ClientOnly), quindi la bozza si legge all'avvio.
  const [draft, setDraft] = useState<Draft | null>(() => loadDraft());
  const [remoteId] = useState(() => new URLSearchParams(window.location.search).get("bozza"));

  const complete = draft?.completedAt ? draft : null;
  if (!complete) {
    if (remoteId && isSupabaseConfigured()) return <RemoteDraft id={remoteId} onLoaded={setDraft} />;
    return <Empty />;
  }
  // con il database collegato, i risultati si vedono dopo aver confermato l'email
  if (isSupabaseConfigured() && !complete.savedId) return <SaveGate draft={complete} onSaved={setDraft} />;
  return <Immediate draft={complete} />;
}

/** Vista immediata: Ottogramma leggero; il report approfondito arriva in differita. */
function Immediate({ draft }: { draft: Draft }) {
  const [status, setStatus] = useState<"none" | "pending" | "ready" | "failed">(
    draft.savedId && isSupabaseConfigured() ? "pending" : "none",
  );
  useEffect(() => {
    if (!draft.savedId || !isSupabaseConfigured()) return;
    fetch(`/api/stato-report?id=${draft.savedId}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((j: { status?: "none" | "pending" | "ready" | "failed" } | null) => {
        if (j?.status && j.status !== "none") setStatus(j.status);
      })
      .catch(() => {});
  }, [draft.savedId]);
  return <Ottogramma draft={draft} reportStatus={status} reportHref={draft.savedId ? `/area/report/${draft.savedId}` : undefined} />;
}

function Empty() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-2xl font-semibold text-navy">Nessun risultato da mostrare</h1>
      <p className="mt-2 text-muted">Completa il diagnostico per vedere il profilo della tua azienda.</p>
      <Link href="/diagnostico" className="mt-6 inline-block bg-navy text-white px-5 py-2.5 rounded-lg">
        Vai al diagnostico
      </Link>
    </div>
  );
}

/** Link aperto su un altro dispositivo: recupera dal server il questionario completato. */
function RemoteDraft({ id, onLoaded }: { id: string; onLoaded: (d: Draft) => void }) {
  const [message, setMessage] = useState("Recupero delle risposte…");
  useEffect(() => {
    void (async () => {
      const { data } = await supabaseBrowser().auth.getUser();
      if (!data.user) {
        setMessage("Per vedere i risultati apri il link dell'email dallo stesso browser in cui hai compilato il diagnostico.");
        return;
      }
      const res = await fetch(`/api/bozze/${encodeURIComponent(id)}`);
      if (!res.ok) {
        setMessage("Non abbiamo trovato le risposte: il link potrebbe essere scaduto.");
        return;
      }
      const d = (await res.json()) as { step: number; responses: Responses };
      saveDraft({ step: d.step, responses: d.responses, completedAt: new Date().toISOString() });
      const loaded = loadDraft();
      if (loaded) onLoaded(loaded);
    })();
  }, [id, onLoaded]);
  return <div className="mx-auto max-w-3xl px-4 py-16 text-muted">{message}</div>;
}
