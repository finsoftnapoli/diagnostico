"use client";

import { Mail, Save, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { loadDraft } from "@/lib/draft";
import { saveDraftAndSendLink } from "@/lib/emailLink";
import { isSupabaseConfigured } from "@/lib/supabase/env";

/** Azione in alto a destra: durante il questionario diventa "Salva e continua più tardi". */
export default function HeaderAction() {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  if (path.startsWith("/diagnostico")) {
    if (!isSupabaseConfigured()) return null;
    return (
      <>
        <button onClick={() => setOpen(true)} className="text-sm text-navy-soft hover:underline inline-flex items-center gap-1.5">
          <Save className="size-4" aria-hidden /> Salva e continua più tardi
        </button>
        {open && <SaveLaterDialog onClose={() => setOpen(false)} />}
      </>
    );
  }
  if (path.startsWith("/admin") || path.startsWith("/risultati")) return null;
  return (
    <Link href="/diagnostico" className="text-sm text-navy-soft hover:underline">
      Inizia il diagnostico
    </Link>
  );
}

function SaveLaterDialog({ onClose }: { onClose: () => void }) {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const d = loadDraft();
    if (!d) return setError("Non c'è ancora nulla da salvare.");
    if (!/^\S+@\S+\.\S+$/.test(email)) return setError("Controlla l'indirizzo email.");
    setBusy(true);
    const res = await saveDraftAndSendLink({ email: email.trim(), step: d.step, responses: d.responses, path: "/diagnostico", param: "riprendi" });
    setBusy(false);
    if ("error" in res) return setError(res.error);
    setSent(true);
  }

  return (
    <div className="fixed inset-0 z-50 bg-ink/40 flex items-center justify-center px-4" role="dialog" aria-modal="true" aria-labelledby="salva-titolo">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 relative">
        <button onClick={onClose} className="absolute right-3 top-3 p-1 text-muted hover:text-ink" aria-label="Chiudi">
          <X className="size-5" />
        </button>
        <Mail className="size-6 text-navy" aria-hidden strokeWidth={1.75} />
        <h2 id="salva-titolo" className="mt-2 text-xl font-semibold text-navy">
          Salva e continua più tardi
        </h2>
        {sent ? (
          <>
            <p className="mt-3 text-muted">
              Ti abbiamo inviato un&apos;email a <strong className="text-ink">{email}</strong>: apri il link quando vuoi
              per riprendere da dove sei rimasto. La bozza resta disponibile per 30 giorni.
            </p>
            <button onClick={onClose} className="mt-5 w-full bg-navy text-white font-semibold px-5 py-2.5 rounded-lg">
              Continua ora
            </button>
          </>
        ) : (
          <form onSubmit={submit} className="mt-3 space-y-4">
            <p className="text-muted">Ti mandiamo un link per riprendere il diagnostico, anche da un altro dispositivo.</p>
            <label className="block text-sm">
              <span className="font-medium">Email</span>
              <input type="email" required autoComplete="email" className="mt-1 w-full border border-line rounded-lg px-3 py-2" value={email} onChange={(e) => setEmail(e.target.value)} />
            </label>
            <button disabled={busy} className="w-full bg-navy text-white font-semibold px-5 py-2.5 rounded-lg disabled:opacity-60">
              {busy ? "Attendere…" : "Inviami il link"}
            </button>
            {error && <p role="alert" className="text-sm text-accent">{error}</p>}
          </form>
        )}
      </div>
    </div>
  );
}
