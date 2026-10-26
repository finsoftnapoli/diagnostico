"use client";

import { Send, UserPlus } from "lucide-react";
import { useState } from "react";

interface Row {
  name: string;
  role: string;
  email: string;
  state: "idle" | "sending" | "sent" | "error";
  note?: string;
  suggested: boolean;
}

/** Inviti ai colleghi dal report: persone suggerite dalla visura (solo in questo browser) o inserite a mano. */
export default function InviteColleagues({ people }: { people: { name: string; role: string }[] }) {
  const [rows, setRows] = useState<Row[]>(() =>
    people.length
      ? people.map((p) => ({ name: p.name, role: p.role, email: "", state: "idle", suggested: true }))
      : [{ name: "", role: "", email: "", state: "idle", suggested: false }],
  );
  const set = (i: number, patch: Partial<Row>) => setRows((rs) => rs.map((r, j) => (j === i ? { ...r, ...patch } : r)));

  async function send(i: number) {
    const r = rows[i];
    if (!/^\S+@\S+\.\S+$/.test(r.email)) return set(i, { state: "error", note: "Inserisci un'email valida" });
    set(i, { state: "sending", note: undefined });
    const res = await fetch("/api/inviti", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email: r.email.trim(), name: r.name.trim(), role: r.role.trim() }),
    });
    const j = (await res.json().catch(() => ({}))) as { error?: string };
    if (!res.ok) return set(i, { state: "error", note: j.error ?? "Invio non riuscito" });
    set(i, { state: "sent", note: "Invito inviato" });
  }

  return (
    <section className="mt-14 rounded-xl border border-line p-5 sm:p-6">
      <h2 className="text-2xl font-semibold text-navy flex items-center gap-2">
        <UserPlus className="size-6" aria-hidden strokeWidth={1.75} /> Confronta la tua visione con quella dei colleghi
      </h2>
      <p className="mt-2 text-sm text-muted max-w-3xl">
        Invita soci, amministratori o responsabili a compilare il diagnostico della stessa azienda. Vedrai le loro risposte
        accanto alle tue e dove il management non è allineato: spesso è lì che si trovano le priorità vere.
        {people.length > 0 && " Abbiamo suggerito le persone indicate nella visura: inserisci l'email di chi vuoi invitare."}
      </p>
      <div className="mt-5 space-y-3">
        {rows.map((r, i) => (
          <div key={i} className="grid gap-2 sm:grid-cols-[1.2fr_1fr_1.4fr_auto] items-start">
            <input
              aria-label="Nome"
              placeholder="Nome e cognome"
              className="border border-line rounded-lg px-3 py-2 text-sm"
              value={r.name}
              onChange={(e) => set(i, { name: e.target.value })}
            />
            <input
              aria-label="Ruolo"
              placeholder="Ruolo"
              className="border border-line rounded-lg px-3 py-2 text-sm"
              value={r.role}
              onChange={(e) => set(i, { role: e.target.value })}
            />
            <input
              aria-label="Email"
              type="email"
              placeholder="Email"
              className="border border-line rounded-lg px-3 py-2 text-sm"
              value={r.email}
              disabled={r.state === "sent"}
              onChange={(e) => set(i, { email: e.target.value, state: "idle", note: undefined })}
            />
            <div>
              <button
                onClick={() => send(i)}
                disabled={r.state === "sending" || r.state === "sent" || !r.email}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 bg-navy text-white text-sm font-semibold px-4 py-2 rounded-lg disabled:opacity-50"
              >
                <Send className="size-4" aria-hidden />
                {r.state === "sending" ? "Invio…" : r.state === "sent" ? "Inviato" : "Invita"}
              </button>
              {r.note && <p className={`mt-1 text-xs ${r.state === "error" ? "text-accent" : "text-muted"}`}>{r.note}</p>}
            </div>
          </div>
        ))}
      </div>
      <button
        onClick={() => setRows((rs) => [...rs, { name: "", role: "", email: "", state: "idle", suggested: false }])}
        className="mt-4 text-sm underline text-navy-soft"
      >
        Aggiungi un&apos;altra persona
      </button>
      <p className="mt-4 text-xs text-muted">
        L&apos;invito parte a tuo nome, con la tua email come indirizzo di risposta, e spiega che le risposte individuali
        saranno visibili a te come amministratore dello spazio aziendale. Non mostriamo i tuoi risultati a chi inviti.
      </p>
    </section>
  );
}
