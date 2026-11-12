"use client";

import { MailCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { AuthChangeEvent } from "@supabase/supabase-js";
import ResendCode, { RESEND_SECONDS } from "@/components/ResendCode";
import { otpSendError } from "@/lib/otp-errors";
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
  /** Email inviata: secondi da attendere prima di poterne chiedere un'altra. */
  const [sent, setSent] = useState<number | null>(null);
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

  async function sendEmail(): Promise<{ error: string | null; wait?: number }> {
    const { error } = await supabaseBrowser().auth.signInWithOtp({
      email: email.trim(),
      options: { shouldCreateUser: false, emailRedirectTo: `${window.location.origin}/accedi?next=${encodeURIComponent(next)}` },
    });
    return error ? otpSendError(error.message) : { error: null };
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    if (sent === null) {
      const r = await sendEmail();
      setBusy(false);
      // un'email appena inviata (richiesta ravvicinata): si passa comunque al codice, con l'attesa indicata
      if (r.error && !r.wait) return setError(r.error);
      setSent(r.wait ?? RESEND_SECONDS);
      return;
    }
    const { error } = await supabaseBrowser().auth.verifyOtp({ email: email.trim(), token: code.trim(), type: "email" });
    setBusy(false);
    if (error) return setError("Codice non valido o scaduto: controllate l'ultima email ricevuta o richiedete un nuovo codice.");
    router.push(next);
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-sm px-4 py-16">
      <h1 className="text-2xl font-semibold text-navy">Accedi</h1>
      {sent === null ? (
        <p className="mt-2 text-sm text-muted">
          Vi inviamo un&apos;email con un codice e un link di accesso: niente password da ricordare.
        </p>
      ) : (
        <div className="mt-4 flex gap-3 rounded-lg bg-paper px-4 py-3 text-sm">
          <MailCheck className="size-5 shrink-0 text-navy" aria-hidden />
          <p>
            Abbiamo scritto a <strong>{email.trim()}</strong>. Inserite il codice, oppure aprite il link dell&apos;email da questo browser.
            Se non la trovi, guarda anche nella posta indesiderata.
          </p>
        </div>
      )}
      <form onSubmit={submit} className="mt-6 space-y-4">
        {sent === null ? (
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
        ) : (
          <label className="block text-sm">
            <span className="font-medium">Codice di accesso</span>
            <input
              required
              autoFocus
              inputMode="numeric"
              autoComplete="one-time-code"
              className="mt-1 w-full border border-line rounded-lg px-3 py-2 tracking-[0.3em] text-lg"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\s/g, ""))}
            />
          </label>
        )}
        <button disabled={busy} className="w-full bg-navy text-white font-semibold px-5 py-2.5 rounded-lg disabled:opacity-60">
          {busy ? "Attendere…" : sent !== null ? "Accedi" : "Invia il codice di accesso"}
        </button>
      </form>
      {error && (
        <p role="alert" className="mt-4 text-sm text-accent">
          {error}
        </p>
      )}
      {sent !== null && (
        <div className="mt-6 space-y-3">
          <ResendCode key={email} initialWait={sent} onResend={sendEmail} />
          <button
            type="button"
            className="text-sm text-muted underline"
            onClick={() => {
              setSent(null);
              setCode("");
              setError(null);
            }}
          >
            Usa un&apos;altra email
          </button>
        </div>
      )}
    </div>
  );
}
