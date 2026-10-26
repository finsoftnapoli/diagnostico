"use client";

import Link from "next/link";
import { useState } from "react";
import { BRAND } from "@/config/brand";
import { loadDraft, type Draft } from "@/lib/draft";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { computeResult } from "@/lib/scoring";
import RadarProfile from "./RadarProfile";
import SaveGate from "./SaveGate";

function levelLabel(score: number | null) {
  if (score === null) return "—";
  if (score < 25) return "Informale";
  if (score < 50) return "Di base";
  if (score < 75) return "Strutturato";
  return "Gestito e migliorato";
}

export default function ResultsView() {
  // Il componente gira solo nel browser (vedi ClientOnly), quindi la bozza si legge all'avvio.
  const [draft, setDraft] = useState<Draft | null>(() => loadDraft());
  if (!draft || !draft.completedAt)
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <h1 className="text-2xl font-semibold text-navy">Nessun risultato da mostrare</h1>
        <p className="mt-2 text-muted">Completa il diagnostico per vedere il profilo della tua azienda.</p>
        <Link href="/diagnostico" className="mt-6 inline-block bg-navy text-white px-5 py-2.5 rounded">
          Vai al diagnostico
        </Link>
      </div>
    );

  // con il database collegato, i risultati si vedono dopo aver confermato l'email
  if (isSupabaseConfigured() && !draft.savedId) return <SaveGate draft={draft} onSaved={setDraft} />;

  const res = computeResult(draft.responses);
  const company = draft.responses.profile["PR-01"]; // settore

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <p className="text-sm text-muted">Risultati del diagnostico{company ? ` · Settore: ${company}` : ""}</p>
      <h1 className="mt-1 text-3xl font-semibold text-navy">Il profilo di gestione della tua azienda</h1>

      <div className="mt-8 grid gap-10 lg:grid-cols-[1.1fr_1fr] items-start">
        <section aria-label="Profilo a radar">
          <RadarProfile areas={res.areas} />
          <p className="text-center text-sm text-muted">
            Punteggio medio <strong className="text-ink">{res.overall}</strong> su 100 · scala da 0 (informale) a 100
            (gestito e migliorato)
          </p>
        </section>

        <section aria-label="Priorità">
          <h2 className="text-xl font-semibold text-navy">Le tre priorità</h2>
          <p className="mt-1 text-sm text-muted">
            Gli ambiti in cui il divario dal livello più alto, l&apos;importanza che hai indicato e il legame con i tuoi
            obiettivi e criticità sono maggiori.
          </p>
          <ol className="mt-5 space-y-4">
            {res.priorities.map((p, i) => (
              <li key={p.code} className="border border-line rounded p-4">
                <div className="flex items-baseline justify-between gap-3">
                  <h3 className="font-semibold">
                    {i + 1}. {p.name}
                  </h3>
                  <span className="text-sm text-muted whitespace-nowrap">{levelLabel(p.score)}</span>
                </div>
                <ul className="mt-2 text-sm text-muted list-disc pl-5 space-y-0.5">
                  {p.reasons.map((x) => (
                    <li key={x}>{x}</li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>
        </section>
      </div>

      {res.flags.length > 0 && (
        <section className="mt-12 bg-paper border border-line rounded p-5">
          <h2 className="font-semibold text-navy">Da verificare</h2>
          <p className="mt-1 text-sm text-muted">
            In questi punti la risposta di verifica non è coerente con il livello scelto: il punteggio potrebbe essere
            ottimista.
          </p>
          <ul className="mt-3 text-sm space-y-2">
            {res.flags.map((f) => (
              <li key={f.questionId}>{f.message}</li>
            ))}
          </ul>
        </section>
      )}

      <section className="mt-12">
        <h2 className="text-xl font-semibold text-navy">Dettaglio per ambito</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b border-line text-muted">
                <th className="py-2 pr-4 font-medium">Ambito</th>
                <th className="py-2 pr-4 font-medium">Punteggio</th>
                <th className="py-2 pr-4 font-medium">Livello</th>
                <th className="py-2 font-medium">Priorità</th>
              </tr>
            </thead>
            <tbody>
              {res.areas.map((a) => (
                <tr key={a.code} className="border-b border-line">
                  <td className="py-2 pr-4">{a.name}</td>
                  <td className="py-2 pr-4 tabular-nums">{a.score}</td>
                  <td className="py-2 pr-4">{levelLabel(a.score)}</td>
                  <td className="py-2">{a.isPriority ? `${a.rank}ª` : ""}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-muted">
          Confronto con aziende simili: sarà disponibile quando ci saranno abbastanza compilazioni nel tuo segmento.
          Non mostriamo medie stimate.
        </p>
      </section>

      <section className="mt-12 bg-navy text-white rounded p-6 sm:p-8">
        <h2 className="text-xl font-semibold">Vuoi approfondire con un esperto?</h2>
        <p className="mt-2 text-white/85 max-w-2xl">
          Stiamo selezionando un piccolo gruppo di aziende per il programma pilota: una sessione di restituzione per
          validare le priorità e definire i primi interventi.
        </p>
        <a
          href={`mailto:${BRAND.contactEmail}?subject=${encodeURIComponent("Programma pilota diagnostico")}`}
          className="mt-5 inline-block bg-white text-navy font-semibold px-5 py-2.5 rounded"
        >
          Partecipa al pilota
        </a>
      </section>

      <div className="mt-8 flex gap-4 text-sm">
        <Link href="/diagnostico" className="underline text-navy-soft">
          Nuovo diagnostico
        </Link>
      </div>
      <p className="mt-6 text-xs text-muted">
        Autovalutazione orientativa basata sulle risposte fornite: non è una consulenza né un rating.
      </p>
    </div>
  );
}
