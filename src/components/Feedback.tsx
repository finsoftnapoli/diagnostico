"use client";

import { MessageSquare, Star } from "lucide-react";
import { useState } from "react";

/** Riscontro dell'utente: un voto da 1 a 5 e, se vuole, due righe. Con `ask` diventa «fate una domanda». */
export default function Feedback({
  kind,
  refId,
  ask = false,
}: {
  kind: "ottogramma" | "report" | "modulo";
  refId?: string;
  ask?: boolean;
}) {
  const [rating, setRating] = useState(0);
  const [message, setMessage] = useState("");
  const [state, setState] = useState<"idle" | "busy" | "done">("idle");
  const [error, setError] = useState<string | null>(null);

  async function send() {
    setError(null);
    if (!ask && !rating) return setError("Scegliete un voto da 1 a 5.");
    if (ask && !message.trim()) return setError("Scrivete la vostra domanda.");
    setState("busy");
    const res = await fetch("/api/riscontri", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ kind: ask ? "domanda" : kind, refId, rating: ask ? undefined : rating, message }),
    }).catch(() => null);
    if (!res?.ok) {
      const json = (await res?.json().catch(() => ({}))) as { error?: string } | undefined;
      setState("idle");
      return setError(json?.error ?? "Invio non riuscito, riprovate.");
    }
    setState("done");
  }

  if (state === "done")
    return (
      <section className="no-print mt-10 rounded-xl border border-line bg-paper p-5 text-sm" role="status">
        {ask ? "Domanda ricevuta: vi rispondiamo per email." : "Grazie: il vostro riscontro ci aiuta a migliorare il servizio."}
      </section>
    );
  return (
    <section className="no-print mt-10 rounded-xl border border-line p-5">
      <h2 className="flex items-center gap-2 font-semibold text-navy">
        {ask ? <MessageSquare className="size-5" aria-hidden /> : <Star className="size-5" aria-hidden />}
        {ask
          ? "Una domanda ai nostri esperti"
          : kind === "ottogramma"
            ? "Quanto vi è utile questa lettura?"
            : "Quanto vi è stato utile il report?"}
      </h2>
      {!ask && (
        <div className="mt-3 flex items-center gap-2" role="radiogroup" aria-label="Voto da 1 a 5">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              role="radio"
              aria-checked={rating === n}
              onClick={() => setRating(n)}
              className={`size-10 rounded-lg border text-sm font-semibold ${rating === n ? "border-navy bg-navy text-white" : "border-line hover:border-navy-soft"}`}
            >
              {n}
            </button>
          ))}
          <span className="ml-1 text-xs text-muted">1 = poco, 5 = molto</span>
        </div>
      )}
      <label className="mt-3 block text-sm">
        <span className="text-muted">
          {ask ? "Scrivete qui: rispondiamo per email." : "Che cosa mancava o non era chiaro? (facoltativo)"}
        </span>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          maxLength={2000}
          rows={ask ? 3 : 2}
          className="mt-1 w-full rounded-lg border border-line px-3 py-2 field-sizing-content"
        />
      </label>
      <div className="mt-3 flex items-center gap-3">
        <button
          type="button"
          onClick={send}
          disabled={state === "busy"}
          className="rounded-lg bg-navy px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
        >
          {state === "busy" ? "Invio…" : ask ? "Invia la domanda" : "Invia"}
        </button>
        {error && (
          <span role="alert" className="text-sm text-accent">
            {error}
          </span>
        )}
      </div>
    </section>
  );
}
