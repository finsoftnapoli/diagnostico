"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

/** Area staff: ferma l'invio automatico programmato di un report. */
export default function HoldReport({ endpoint }: { endpoint: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  async function hold() {
    setBusy(true);
    setError(null);
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ action: "hold" }),
    }).catch(() => null);
    setBusy(false);
    if (!res?.ok) return setError("Operazione non riuscita");
    router.refresh();
  }
  return (
    <span className="mt-2 block">
      <button
        type="button"
        onClick={hold}
        disabled={busy}
        className="rounded-lg border border-line px-3 py-1 text-sm hover:border-navy-soft disabled:opacity-50"
      >
        {busy ? "Un momento…" : "Trattieni l'invio"}
      </button>
      {error && <span className="ml-2 text-accent">{error}</span>}
    </span>
  );
}
