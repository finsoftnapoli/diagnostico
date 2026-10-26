"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { AuthChangeEvent } from "@supabase/supabase-js";
import { supabaseBrowser } from "@/lib/supabase/browser";

/** Accesso con codice via email, per l'area riservata. */
export default function Login() {
  const router = useRouter();
  const [next] = useState(() => {
    const n = new URLSearchParams(window.location.search).get("next") ?? "/area";
    return n.startsWith("/") && !n.startsWith("//") ? n : "/area";
  });
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ritorno dal link nell'email (stesso browser): il client legge la sessione e si va all'area riservata
  useEffect(() => {
    const sb = supabaseBrowser();
    const go = async () => {
      const { data } = await sb.auth.getUser();
      if (data.user) {
        router.replace(next);
        router.refresh();
      }
    };
    void go();
    const { data: sub } = sb.auth.onAuthStateChange((event: AuthChangeEvent) => {
      if (event === "SIGNED_IN") void go();
    });
    return () => sub.subscription.unsubscribe();
  }, [router, next]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    const sb = supabaseBrowser();
    if (!sent) {
      const { error } = await sb.auth.signInWithOtp({
        email: email.trim(),
        options: { shouldCreateUser: false, emailRedirectTo: `${window.location.origin}/accedi?next=${encodeURIComponent(next)}` },
      });
      setBusy(false);
      if (error) return setError("Non troviamo un accesso con questa email: se non hai ancora completato un diagnostico, inizia da lì. Altrimenti riprova tra un minuto.");
      setSent(true);
      return;
    }
    const { error } = await sb.auth.verifyOtp({ email: email.trim(), token: code.trim(), type: "email" });
    setBusy(false);
    if (error) return setError("Codice non valido o scaduto.");
    router.push(next);
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
            <span className="font-medium">Codice ricevuto via email (oppure apri il link nell&apos;email da questo browser)</span>
            <input required inputMode="numeric" autoComplete="one-time-code" className="mt-1 w-full border border-line rounded px-3 py-2" value={code} onChange={(e) => setCode(e.target.value)} />
          </label>
        )}
        <button disabled={busy} className="w-full bg-navy text-white font-semibold px-5 py-2.5 rounded disabled:opacity-60">
          {busy ? "Attendere…" : sent ? "Accedi" : "Inviami l'email di accesso"}
        </button>
      </form>
      {error && <p role="alert" className="mt-4 text-sm text-accent">{error}</p>}
    </div>
  );
}
