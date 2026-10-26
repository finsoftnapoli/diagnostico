"use client";

import type { AuthChangeEvent } from "@supabase/supabase-js";
import { Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { BRAND } from "@/config/brand";
import { saveDraft } from "@/lib/draft";
import { emptyResponses } from "@/lib/scoring";
import { supabaseBrowser } from "@/lib/supabase/browser";

interface Info {
  company: string;
  name: string | null;
  email: string;
  status: string;
  expired: boolean;
}

/** Pagina di accettazione dell'invito di un collega. */
export default function Invite() {
  const router = useRouter();
  const [token] = useState(() => new URLSearchParams(window.location.search).get("t") ?? "");
  const [info, setInfo] = useState<Info | null>(null);
  const [message, setMessage] = useState<string | null>("Caricamento dell'invito…");
  const [phase, setPhase] = useState<"start" | "sent" | "accepting">("start");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const accepting = useRef(false);

  async function accept() {
    if (accepting.current) return;
    accepting.current = true;
    setPhase("accepting");
    const res = await fetch("/api/inviti/accetta", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ t: token }),
    });
    const j = (await res.json()) as { error?: string; companyId?: string; companyName?: string; profile?: Record<string, string> };
    if (!res.ok || !j.companyId) {
      accepting.current = false;
      setPhase("start");
      setMessage(j.error ?? "Invito non valido");
      return;
    }
    saveDraft({
      step: 0,
      responses: { ...emptyResponses(), profile: j.profile ?? {}, context: { companyId: j.companyId, companyName: j.companyName ?? "" } },
    });
    router.push("/diagnostico");
  }

  useEffect(() => {
    void (async () => {
      const res = await fetch(`/api/inviti/info?t=${encodeURIComponent(token)}`);
      if (!res.ok) return setMessage("Invito non valido o non più disponibile.");
      const j = (await res.json()) as Info;
      setInfo(j);
      if (j.status === "accepted") return setMessage("Questo invito è già stato utilizzato: accedi dalla tua area personale.");
      if (j.expired || j.status !== "pending") return setMessage("L'invito è scaduto: chiedi a chi ti ha invitato di inviarne uno nuovo.");
      setMessage(null);
      const sb = supabaseBrowser();
      const { data } = await sb.auth.getUser();
      if (data.user?.email?.toLowerCase() === j.email.toLowerCase()) void accept();
    })();
    const { data: sub } = supabaseBrowser().auth.onAuthStateChange((event: AuthChangeEvent) => {
      if (event === "SIGNED_IN") void accept();
    });
    return () => sub.subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- da eseguire una sola volta all'apertura
  }, []);

  async function send() {
    if (!info) return;
    setBusy(true);
    const { error } = await supabaseBrowser().auth.signInWithOtp({
      email: info.email,
      options: { shouldCreateUser: true, emailRedirectTo: `${window.location.origin}/invito?t=${token}` },
    });
    setBusy(false);
    if (error) return setMessage("Non siamo riusciti a inviare l'email. Riprova tra qualche minuto.");
    setPhase("sent");
  }

  async function verify(e: React.FormEvent) {
    e.preventDefault();
    if (!info) return;
    setBusy(true);
    const { error } = await supabaseBrowser().auth.verifyOtp({ email: info.email, token: code.trim(), type: "email" });
    setBusy(false);
    if (error) return setMessage("Codice non valido o scaduto.");
    void accept();
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-16">
      <Users className="size-8 text-navy" aria-hidden strokeWidth={1.5} />
      <h1 className="mt-3 text-3xl font-semibold text-navy">
        {info ? `Diagnostico di ${info.company}` : "Invito"}
      </h1>
      {info && !message && phase === "start" && (
        <>
          <p className="mt-4 text-muted">
            {info.name ? `${info.name}, sei` : "Sei"} stato invitato a compilare il diagnostico gestionale di{" "}
            <strong className="text-ink">{info.company}</strong> su {BRAND.name}. Le risposte dei diversi responsabili
            permettono di confrontare le visioni del management.
          </p>
          <p className="mt-3 text-sm text-muted">
            Per iniziare confermiamo il tuo indirizzo <strong className="text-ink">{info.email}</strong>: ti inviamo un
            messaggio con un link e un codice.
          </p>
          <button
            onClick={send}
            disabled={busy}
            className="mt-6 w-full bg-navy text-white font-semibold px-5 py-2.5 rounded-lg disabled:opacity-60"
          >
            {busy ? "Attendere…" : "Conferma l'email e inizia"}
          </button>
        </>
      )}
      {info && phase === "sent" && (
        <form onSubmit={verify} className="mt-6 space-y-4">
          <p className="text-muted">
            Abbiamo scritto a <strong className="text-ink">{info.email}</strong>: apri il link oppure inserisci qui il codice.
          </p>
          <label className="block text-sm">
            <span className="font-medium">Codice</span>
            <input required inputMode="numeric" autoComplete="one-time-code" className="mt-1 w-full border border-line rounded-lg px-3 py-2" value={code} onChange={(e) => setCode(e.target.value)} />
          </label>
          <button disabled={busy} className="w-full bg-navy text-white font-semibold px-5 py-2.5 rounded-lg disabled:opacity-60">
            {busy ? "Attendere…" : "Conferma"}
          </button>
        </form>
      )}
      {phase === "accepting" && <p className="mt-6 text-muted">Preparazione del diagnostico…</p>}
      {message && <p className="mt-6 text-muted">{message}</p>}
    </div>
  );
}
