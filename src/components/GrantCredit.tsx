"use client";

import { Gift } from "lucide-react";
import { useState } from "react";
import { AREAS } from "@/lib/questionnaire";

/** Area staff: attiva servizi senza pagamento per l'azienda di una compilazione. */
export default function GrantCredit({ assessmentId }: { assessmentId: string }) {
  const [area, setArea] = useState<string>(AREAS[0].code);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);

  async function grant(sku: "bundle" | "modulo" | "consulenza") {
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch("/api/admin/accrediti", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ assessmentId, sku, area: sku === "modulo" ? area : undefined }),
      });
      const json = (await res.json().catch(() => ({}))) as { error?: string; items?: string[] };
      setMsg(
        res.ok
          ? { text: `Attivato: ${(json.items ?? []).join(", ")}. Il cliente è stato avvisato per email.`, ok: true }
          : { text: json.error ?? "Accredito non riuscito", ok: false },
      );
    } catch {
      setMsg({ text: "Accredito non riuscito", ok: false });
    } finally {
      setBusy(false);
    }
  }

  const btn = "rounded-lg border border-line px-3 py-1.5 text-sm hover:border-navy-soft disabled:opacity-50";
  return (
    <div className="space-y-2">
      <p className="text-muted">Attiva servizi senza pagamento, per esempio per le aziende che provano il servizio. Nessuna fattura.</p>
      <button
        type="button"
        disabled={busy}
        onClick={() => grant("bundle")}
        className={`${btn} w-full flex items-center justify-center gap-2 font-semibold text-navy`}
      >
        <Gift className="size-4" aria-hidden /> Percorso completo
      </button>
      <div className="flex gap-2">
        <select
          value={area}
          onChange={(e) => setArea(e.target.value)}
          aria-label="Ambito"
          className="min-w-0 flex-1 border border-line rounded-lg px-2 py-1.5 text-sm"
        >
          {AREAS.map((a) => (
            <option key={a.code} value={a.code}>
              {a.name}
            </option>
          ))}
        </select>
        <button type="button" disabled={busy} onClick={() => grant("modulo")} className={btn}>
          Approfondimento
        </button>
      </div>
      <button type="button" disabled={busy} onClick={() => grant("consulenza")} className={`${btn} w-full`}>
        Un&apos;ora di consulenza
      </button>
      {msg && (
        <p role="status" className={msg.ok ? "text-navy-soft" : "text-accent"}>
          {msg.text}
        </p>
      )}
    </div>
  );
}
