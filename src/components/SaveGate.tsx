"use client";

import { useEffect, useRef, useState } from "react";
import type { AuthChangeEvent } from "@supabase/supabase-js";
import { patchDraft, type Draft } from "@/lib/draft";
import { supabaseBrowser } from "@/lib/supabase/browser";

type Phase = "email" | "sent" | "saving";

/**
 * Prima dei risultati: conferma dell'email, poi salvataggio nel database.
 * Funziona sia con il codice nell'email sia con il link (aperto nello stesso browser):
 * in quel caso la pagina si riapre, il client Supabase legge la sessione dal link e il salvataggio riparte da solo.
 */
export default function SaveGate({ draft, onSaved }: { draft: Draft; onSaved: (d: Draft) => void }) {
  const [phase, setPhase] = useState<Phase>(draft.pending ? "sent" : "email");
  const [email, setEmail] = useState(draft.pending?.email ?? "");
  const [company, setCompany] = useState(draft.pending?.company ?? "");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const started = useRef(false);

  async function sendCode(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!/^\S+@\S+\.\S+$/.test(email)) return setError("Controlla l'indirizzo email.");
    if (!company.trim()) return setError("Indica il nome dell'azienda.");
    setBusy(true);
    patchDraft({ pending: { email: email.trim(), company: company.trim() } });
    const { error } = await supabaseBrowser().auth.signInWithOtp({
      email: email.trim(),
      options: { shouldCreateUser: true, emailRedirectTo: `${window.location.origin}/risultati` },
    });
    setBusy(false);
    if (error) return setError(otpError(error.message));
    setPhase("sent");
  }

  async function verify(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    const { error } = await supabaseBrowser().auth.verifyOtp({ email: email.trim(), token: code.trim(), type: "email" });
    if (error) {
      setBusy(false);
      return setError("Codice non valido o scaduto. Controlla l'email o richiedine uno nuovo.");
    }
    started.current = true;
    await save(company.trim());
  }

  async function save(companyName: string) {
    setPhase("saving");
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/compilazioni", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ responses: draft.responses, companyName }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Salvataggio non riuscito");
      const next = patchDraft({ savedId: json.id, pending: undefined }) ?? { ...draft, savedId: json.id };
      // toglie dall'indirizzo eventuali parametri del link
      window.history.replaceState(null, "", "/risultati");
      onSaved(next);
    } catch (err) {
      started.current = false;
      setError(err instanceof Error ? err.message : "Salvataggio non riuscito");
      setPhase("sent");
    } finally {
      setBusy(false);
    }
  }

  // ritorno dal link nell'email: se c'è una sessione valida, si salva subito
  useEffect(() => {
    if (!draft.pending) return;
    const sb = supabaseBrowser();
    const trySave = async () => {
      const { data } = await sb.auth.getUser();
      if (data.user && !started.current) {
        started.current = true;
        void save(draft.pending!.company);
      }
    };
    void trySave();
    const { data: sub } = sb.auth.onAuthStateChange((event: AuthChangeEvent) => {
      if (event === "SIGNED_IN") void trySave();
    });
    return () => sub.subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- da eseguire una sola volta all'apertura
  }, []);

  return (
    <div className="mx-auto max-w-lg px-4 py-16">
      <h1 className="text-2xl font-semibold text-navy">I risultati sono pronti</h1>
      {phase === "email" && (
        <form onSubmit={sendCode} className="mt-6 space-y-4">
          <p className="text-muted">
            Indica la tua email aziendale: ti inviamo un messaggio per confermarla. Così salviamo il profilo e potrai
            ritrovarlo, confrontarlo nel tempo e invitare i colleghi.
          </p>
          <Field label="Email" type="email" value={email} onChange={setEmail} autoComplete="email" />
          <Field label="Nome dell'azienda" value={company} onChange={setCompany} autoComplete="organization" />
          <Submit busy={busy}>Conferma l&apos;email</Submit>
        </form>
      )}
      {phase === "sent" && (
        <form onSubmit={verify} className="mt-6 space-y-4">
          <p className="text-muted">
            Abbiamo scritto a <strong className="text-ink">{email}</strong>. Apri il link contenuto nell&apos;email da
            questo stesso browser, oppure inserisci qui il codice se l&apos;email ne contiene uno. Se non la trovi,
            controlla nella posta indesiderata.
          </p>
          <Field label="Codice" value={code} onChange={setCode} inputMode="numeric" autoComplete="one-time-code" />
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
        Usiamo l&apos;email solo per l&apos;accesso e per i consensi che hai indicato all&apos;inizio.
      </p>
    </div>
  );
}

function otpError(msg: string) {
  if (/rate|too many|seconds/i.test(msg)) return "Hai richiesto troppi messaggi: attendi qualche minuto e riprova.";
  return "Non siamo riusciti a inviare l'email. Riprova tra poco.";
}

function Field(props: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  inputMode?: "numeric" | "text";
  autoComplete?: string;
}) {
  return (
    <label className="block text-sm">
      <span className="font-medium">{props.label}</span>
      <input
        className="mt-1 w-full border border-line rounded px-3 py-2"
        type={props.type ?? "text"}
        inputMode={props.inputMode}
        autoComplete={props.autoComplete}
        value={props.value}
        onChange={(e) => props.onChange(e.target.value)}
        required
      />
    </label>
  );
}

function Submit({ busy, children }: { busy: boolean; children: React.ReactNode }) {
  return (
    <button disabled={busy} className="w-full bg-navy text-white font-semibold px-5 py-2.5 rounded disabled:opacity-60">
      {busy ? "Attendere…" : children}
    </button>
  );
}
