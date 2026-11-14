"use client";

import { track } from "@/lib/track";
import type { AuthChangeEvent } from "@supabase/supabase-js";
import { useEffect, useRef, useState } from "react";
import LiveOttogramma from "./LiveOttogramma";
import ResendCode from "@/components/ResendCode";
import { BRAND } from "@/config/brand";
import { patchDraft, type Draft } from "@/lib/draft";
import { saveDraftAndSendLink } from "@/lib/emailLink";
import { liveAreas } from "@/lib/flow";
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
      track("salvato");
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

  useEffect(() => {
    track("anteprima");
  }, []);

  async function sendLink(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!/^\S+@\S+\.\S+$/.test(email)) return setError("Controlli l'indirizzo email.");
    setBusy(true);
    track("codice");
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
    if (error) return setError("Codice non valido o scaduto. Controlli l'email o ne richieda uno nuovo.");
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
      <div className="flex justify-center" aria-hidden>
        <LiveOttogramma areas={liveAreas(draft.responses)} size={190} />
      </div>
      <h1 className="mt-4 text-3xl font-semibold text-navy">Il Suo {BRAND.reportName} è completo</h1>
      {phase === "checking" && <p className="mt-6 text-muted">Un momento…</p>}
      {phase === "email" && (
        <form onSubmit={sendLink} className="mt-6 space-y-4">
          <p className="text-muted">
            Manca un passo per leggerlo: indichi l&apos;email aziendale e la confermi con il codice che Le inviamo. Vedrà subito le
            evidenze, il confronto con aziende simili e le priorità; {BRAND.reportPromise} riceverà il report approfondito, e potrà
            ritrovare tutto nell&apos;area personale e invitare i colleghi.
          </p>
          <label className="block text-sm">
            <span className="font-medium">Email</span>
            <input
              type="email"
              required
              autoComplete="email"
              className="mt-1 w-full border border-line rounded-lg px-3 py-2"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
          <Submit busy={busy}>Conferma l&apos;email</Submit>
        </form>
      )}
      {phase === "sent" && (
        <form onSubmit={verify} className="mt-6 space-y-4">
          <p className="text-muted">
            Abbiamo scritto a <strong className="text-ink">{email}</strong>. Inserisca qui il codice che trova nell&apos;email, oppure apra
            il link da questo stesso browser. Se non la trova, controlli nella posta indesiderata.
          </p>
          <label className="block text-sm">
            <span className="font-medium">Codice</span>
            <input
              required
              inputMode="numeric"
              autoComplete="one-time-code"
              className="mt-1 w-full border border-line rounded-lg px-3 py-2"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
          </label>
          <Submit busy={busy}>Conferma e leggi i risultati</Submit>
          <ResendCode
            key={email}
            onResend={async () => {
              const res = await saveDraftAndSendLink({
                email: email.trim(),
                step: draft.step,
                responses: draft.responses,
                path: "/risultati",
                param: "bozza",
              });
              if ("error" in res) return res;
              patchDraft({ pending: { email: email.trim(), draftId: res.id } });
              return { error: null };
            }}
          />
          <button
            type="button"
            className="block text-sm text-muted underline"
            onClick={() => {
              patchDraft({ pending: undefined });
              setPhase("email");
              setCode("");
            }}
          >
            Usa un&apos;altra email
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
        Usiamo l&apos;email per l&apos;accesso, per inviarLe il report e per le comunicazioni scelte all&apos;inizio.
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
