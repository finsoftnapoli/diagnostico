"use client";

import type { AuthChangeEvent } from "@supabase/supabase-js";
import { MailCheck } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { BRAND } from "@/config/brand";
import { patchDraft, type Draft } from "@/lib/draft";
import { saveDraftAndSendLink } from "@/lib/emailLink";
import { supabaseBrowser } from "@/lib/supabase/browser";

type Phase = "checking" | "email" | "sent" | "saving";

/**
 * Prima dei risultati: conferma dell'email, poi salvataggio nel database.
 * - Se l'utente ha già un accesso attivo, salva subito.
 * - Altrimenti invia un'email con link e, quando il modello lo prevede, un codice.
 *   Il link riporta a /risultati?bozza=<id>: dallo stesso browser riprende questa pagina,
 *   da un altro dispositivo la bozza viene recuperata dal server.
 */
export default function SaveGate({ draft, onSaved }: { draft: Draft; onSaved: (d: Draft) => void }) {
  const [phase, setPhase] = useState<Phase>("checking");
  const [email, setEmail] = useState(draft.pending?.email ?? "");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const started = useRef(false);

  async function save() {
    if (started.current) return;
    started.current = true;
    setPhase("saving");
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/compilazioni", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ responses: draft.responses }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Salvataggio non riuscito");
      const next = patchDraft({ savedId: json.id, pending: undefined }) ?? { ...draft, savedId: json.id, pending: undefined };
      window.history.replaceState(null, "", "/risultati");
      onSaved(next);
    } catch (err) {
      started.current = false;
      setError(err instanceof Error ? err.message : "Salvataggio non riuscito");
      setPhase(draft.pending ? "sent" : "email");
    } finally {
      setBusy(false);
    }
  }

  async function sendLink(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!/^\S+@\S+\.\S+$/.test(email)) return setError("Controlla l'indirizzo email.");
    setBusy(true);
    const res = await saveDraftAndSendLink({
      email: email.trim(),
      step: draft.step,
      responses: draft.responses,
      path: "/risultati",
      param: "bozza",
    });
    setBusy(false);
    if ("error" in res) return setError(res.error);
    patchDraft({ pending: { email: email.trim(), draftId: res.id } });
    setPhase("sent");
  }

  async function verify(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    const { error } = await supabaseBrowser().auth.verifyOtp({ email: email.trim(), token: code.trim(), type: "email" });
    setBusy(false);
    if (error) return setError("Codice non valido o scaduto. Controlla l'email o richiedine uno nuovo.");
    await save();
  }

  // all'apertura: se c'è già un accesso (link appena aperto o sessione precedente) si salva subito
  useEffect(() => {
    const sb = supabaseBrowser();
    void sb.auth.getUser().then(({ data }: { data: { user: unknown } }) => {
      if (data.user) void save();
      else setPhase(draft.pending ? "sent" : "email");
    });
    const { data: sub } = sb.auth.onAuthStateChange((event: AuthChangeEvent) => {
      if (event === "SIGNED_IN") void save();
    });
    return () => sub.subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- da eseguire una sola volta all'apertura
  }, []);

  return (
    <div className="mx-auto max-w-lg px-4 py-16">
      <MailCheck className="size-8 text-navy" aria-hidden strokeWidth={1.5} />
      <h1 className="mt-3 text-3xl font-semibold text-navy">Il tuo {BRAND.reportName} è pronto</h1>
      {phase === "checking" && <p className="mt-6 text-muted">Un momento…</p>}
      {phase === "email" && (
        <form onSubmit={sendLink} className="mt-6 space-y-4">
          <p className="text-muted">
            Indica la tua email aziendale: ti inviamo un messaggio per confermarla. Così salviamo il profilo, ti inviamo il
            report approfondito entro 2 giorni lavorativi e potrai ritrovarlo, confrontarlo nel tempo e invitare i colleghi.
          </p>
          <label className="block text-sm">
            <span className="font-medium">Email</span>
            <input type="email" required autoComplete="email" className="mt-1 w-full border border-line rounded-lg px-3 py-2" value={email} onChange={(e) => setEmail(e.target.value)} />
          </label>
          <Submit busy={busy}>Conferma l&apos;email</Submit>
        </form>
      )}
      {phase === "sent" && (
        <form onSubmit={verify} className="mt-6 space-y-4">
          <p className="text-muted">
            Abbiamo scritto a <strong className="text-ink">{email}</strong>. Apri il link contenuto nell&apos;email, oppure
            inserisci qui il codice se l&apos;email ne contiene uno. Se non la trovi, controlla nella posta indesiderata.
          </p>
          <label className="block text-sm">
            <span className="font-medium">Codice</span>
            <input required inputMode="numeric" autoComplete="one-time-code" className="mt-1 w-full border border-line rounded-lg px-3 py-2" value={code} onChange={(e) => setCode(e.target.value)} />
          </label>
          <Submit busy={busy}>Conferma e vedi i risultati</Submit>
          <button
            type="button"
            className="text-sm underline text-navy-soft"
            onClick={() => {
              patchDraft({ pending: undefined });
              setPhase("email");
              setCode("");
            }}
          >
            Cambia email o invia di nuovo
          </button>
        </form>
      )}
      {phase === "saving" && <p className="mt-6 text-muted">Salvataggio del profilo in corso…</p>}
      {error && (
        <p role="alert" className="mt-4 text-sm text-accent">
          {error}
        </p>
      )}
      <p className="mt-8 text-xs text-muted">
        Usiamo l&apos;email per l&apos;accesso e per le comunicazioni che hai scelto all&apos;inizio.
      </p>
    </div>
  );
}

function Submit({ busy, children }: { busy: boolean; children: React.ReactNode }) {
  return (
    <button disabled={busy} className="w-full bg-navy text-white font-semibold px-5 py-2.5 rounded-lg disabled:opacity-60">
      {busy ? "Attendere…" : children}
    </button>
  );
}
