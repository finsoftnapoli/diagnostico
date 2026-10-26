"use client";

import { useState } from "react";
import { markSaved, type Draft } from "@/lib/draft";
import { supabaseBrowser } from "@/lib/supabase/browser";

type Phase = "email" | "code" | "saving";

/** Prima dei risultati: email con codice di verifica, poi salvataggio nel database. */
export default function SaveGate({ draft, onSaved }: { draft: Draft; onSaved: (d: Draft) => void }) {
  const [phase, setPhase] = useState<Phase>("email");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function sendCode(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!/^\S+@\S+\.\S+$/.test(email)) return setError("Controlla l'indirizzo email.");
    if (!company.trim()) return setError("Indica il nome dell'azienda.");
    setBusy(true);
    const { error } = await supabaseBrowser().auth.signInWithOtp({ email: email.trim(), options: { shouldCreateUser: true } });
    setBusy(false);
    if (error) return setError(otpError(error.message));
    setPhase("code");
  }

  async function verify(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    const sb = supabaseBrowser();
    const { error } = await sb.auth.verifyOtp({ email: email.trim(), token: code.trim(), type: "email" });
    if (error) {
      setBusy(false);
      return setError("Codice non valido o scaduto. Controlla l'email o richiedine uno nuovo.");
    }
    await save();
  }

  async function save() {
    setPhase("saving");
    setBusy(true);
    try {
      const res = await fetch("/api/compilazioni", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ responses: draft.responses, companyName: company.trim() }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Salvataggio non riuscito");
      const next = markSaved(json.id) ?? { ...draft, savedId: json.id };
      onSaved(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Salvataggio non riuscito");
      setPhase("code");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-16">
      <h1 className="text-2xl font-semibold text-navy">I risultati sono pronti</h1>
      {phase === "email" && (
        <form onSubmit={sendCode} className="mt-6 space-y-4">
          <p className="text-muted">
            Indica la tua email aziendale: ti inviamo un codice per confermarla. Così salviamo il profilo e potrai
            ritrovarlo, confrontarlo nel tempo e invitare i colleghi.
          </p>
          <Field label="Email" type="email" value={email} onChange={setEmail} autoComplete="email" />
          <Field label="Nome dell'azienda" value={company} onChange={setCompany} autoComplete="organization" />
          <Submit busy={busy}>Inviami il codice</Submit>
        </form>
      )}
      {phase !== "email" && (
        <form onSubmit={verify} className="mt-6 space-y-4">
          <p className="text-muted">
            Abbiamo inviato un codice a <strong className="text-ink">{email}</strong>. Inseriscilo qui sotto: se non lo
            trovi, controlla nella posta indesiderata.
          </p>
          <Field label="Codice" value={code} onChange={setCode} inputMode="numeric" autoComplete="one-time-code" />
          <Submit busy={busy}>{phase === "saving" ? "Salvataggio…" : "Conferma e vedi i risultati"}</Submit>
          <button type="button" className="text-sm underline text-navy-soft" onClick={() => { setPhase("email"); setCode(""); }}>
            Cambia email o richiedi un nuovo codice
          </button>
        </form>
      )}
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
  if (/rate|too many|seconds/i.test(msg)) return "Hai richiesto troppi codici: attendi un minuto e riprova.";
  return "Non siamo riusciti a inviare il codice. Riprova tra poco.";
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
