"use client";
// "Invia un nuovo codice" con conto alla rovescia: il servizio di accesso accetta una nuova richiesta
// per la stessa email solo dopo un minuto.
import { RotateCw } from "lucide-react";
import { useEffect, useState } from "react";

export const RESEND_SECONDS = 60;

type Props = {
  /** Invia di nuovo l'email; restituisce un messaggio d'errore oppure null, e i secondi da attendere se noti. */
  onResend: () => Promise<{ error: string | null; wait?: number }>;
  /** Secondi da attendere all'apertura (l'email è appena partita). */
  initialWait?: number;
};

export default function ResendCode({ onResend, initialWait = RESEND_SECONDS }: Props) {
  const [until, setUntil] = useState(() => Date.now() + initialWait * 1000);
  const [now, setNow] = useState(() => Date.now());
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<{ text: string; ok: boolean } | null>(null);
  const left = Math.max(0, Math.ceil((until - now) / 1000));

  useEffect(() => {
    if (left <= 0) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [left]);

  async function resend() {
    setBusy(true);
    setNote(null);
    const r = await onResend();
    setBusy(false);
    setNow(Date.now());
    if (r.error) {
      setNote({ text: r.error, ok: false });
      if (r.wait) setUntil(Date.now() + r.wait * 1000);
      return;
    }
    setNote({ text: "Abbiamo inviato un nuovo codice: usi quello dell'ultima email.", ok: true });
    setUntil(Date.now() + RESEND_SECONDS * 1000);
  }

  const mmss = `${Math.floor(left / 60)}:${String(left % 60).padStart(2, "0")}`;
  return (
    <div className="text-sm" aria-live="polite">
      {left > 0 ? (
        <p className="text-muted">
          Non è arrivata? Può richiedere un nuovo codice tra <span className="tabular-nums font-medium text-ink">{mmss}</span>.
        </p>
      ) : (
        <button
          type="button"
          onClick={resend}
          disabled={busy}
          className="inline-flex items-center gap-1.5 font-medium text-navy-soft underline disabled:opacity-60"
        >
          <RotateCw className={`size-3.5 ${busy ? "animate-spin" : ""}`} aria-hidden /> {busy ? "Invio in corso…" : "Invia un nuovo codice"}
        </button>
      )}
      {note && <p className={`mt-1.5 ${note.ok ? "text-muted" : "text-accent"}`}>{note.text}</p>}
    </div>
  );
}
