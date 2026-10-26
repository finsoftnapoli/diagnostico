"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/browser";

/** Accesso con codice via email, per l'area riservata. */
export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    const sb = supabaseBrowser();
    if (!sent) {
      const { error } = await sb.auth.signInWithOtp({ email: email.trim(), options: { shouldCreateUser: false } });
      setBusy(false);
      if (error) return setError("Non siamo riusciti a inviare il codice: controlla l'indirizzo o riprova tra un minuto.");
      setSent(true);
      return;
    }
    const { error } = await sb.auth.verifyOtp({ email: email.trim(), token: code.trim(), type: "email" });
    setBusy(false);
    if (error) return setError("Codice non valido o scaduto.");
    router.push("/admin");
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-sm px-4 py-16">
      <h1 className="text-2xl font-semibold text-navy">Accedi</h1>
      <form onSubmit={submit} className="mt-6 space-y-4">
        <label className="block text-sm">
          <span className="font-medium">Email</span>
          <input type="email" required disabled={sent} className="mt-1 w-full border border-line rounded px-3 py-2" value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        {sent && (
          <label className="block text-sm">
            <span className="font-medium">Codice ricevuto via email</span>
            <input required inputMode="numeric" autoComplete="one-time-code" className="mt-1 w-full border border-line rounded px-3 py-2" value={code} onChange={(e) => setCode(e.target.value)} />
          </label>
        )}
        <button disabled={busy} className="w-full bg-navy text-white font-semibold px-5 py-2.5 rounded disabled:opacity-60">
          {busy ? "Attendere…" : sent ? "Accedi" : "Inviami il codice"}
        </button>
      </form>
      {error && <p role="alert" className="mt-4 text-sm text-accent">{error}</p>}
    </div>
  );
}
