"use client";

import { Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export interface SlotRow {
  id: string;
  startsAt: string;
  duration: number;
  meetingUrl: string | null;
  state: "open" | "held" | "booked";
  booking: { id: string; company: string; email: string; topic: string | null } | null;
}

const fmt = (iso: string) =>
  new Date(iso).toLocaleString("it-IT", { timeZone: "Europe/Rome", weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

/** Disponibilità dell'esperto: aggiunta di orari, elenco con prenotazioni, cancellazione. */
export default function AgendaAdmin({ slots, defaultUrl }: { slots: SlotRow[]; defaultUrl: string }) {
  const router = useRouter();
  const [date, setDate] = useState("");
  const [times, setTimes] = useState("10:00, 15:00");
  const [duration, setDuration] = useState(60);
  const [url, setUrl] = useState(defaultUrl);
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function add() {
    setBusy(true);
    setMsg(null);
    const res = await fetch("/api/admin/slot", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ date, times: times.split(/[,\s]+/).filter(Boolean), duration, meetingUrl: url }),
    });
    const j = (await res.json().catch(() => ({}))) as { error?: string; created?: number };
    setBusy(false);
    if (!res.ok) return setMsg(j.error ?? "Non riuscito");
    setMsg(`Aggiunti ${j.created} orari.`);
    router.refresh();
  }

  async function remove(s: SlotRow) {
    if (s.booking && !confirm(`Annullare la consulenza prenotata da ${s.booking.company}? Il cliente riceverà un avviso e l'ora tornerà disponibile.`)) return;
    await fetch(`/api/admin/slot/${s.id}`, { method: "DELETE" });
    router.refresh();
  }

  const upcoming = slots.filter((s) => new Date(s.startsAt) > new Date());
  const past = slots.filter((s) => new Date(s.startsAt) <= new Date() && s.booking);

  return (
    <>
      <div className="mt-6 rounded-xl border border-line p-4 grid gap-3 sm:grid-cols-[auto_1fr_auto] items-end">
        <label className="text-sm">
          <span className="font-medium">Giorno</span>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="mt-1 block rounded-lg border border-line px-3 py-2" />
        </label>
        <label className="text-sm">
          <span className="font-medium">Orari di inizio (ora italiana, separati da virgola)</span>
          <input value={times} onChange={(e) => setTimes(e.target.value)} className="mt-1 w-full rounded-lg border border-line px-3 py-2" />
        </label>
        <label className="text-sm">
          <span className="font-medium">Durata</span>
          <select value={duration} onChange={(e) => setDuration(Number(e.target.value))} className="mt-1 block rounded-lg border border-line px-3 py-2">
            <option value={60}>60 minuti</option>
            <option value={90}>90 minuti</option>
          </select>
        </label>
        <label className="text-sm sm:col-span-3">
          <span className="font-medium">Collegamento alla videochiamata (facoltativo)</span>
          <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://meet.google.com/..." className="mt-1 w-full rounded-lg border border-line px-3 py-2" />
        </label>
        <div className="sm:col-span-3 flex flex-wrap items-center gap-3">
          <button onClick={add} disabled={busy || !date} className="inline-flex items-center gap-1.5 bg-navy text-white text-sm font-semibold px-4 py-2 rounded-lg disabled:opacity-50">
            <Plus className="size-4" aria-hidden /> Aggiungi disponibilità
          </button>
          {msg && <span className="text-sm text-muted">{msg}</span>}
        </div>
      </div>

      <h2 className="mt-10 text-lg font-semibold text-navy">Prossimi orari</h2>
      {upcoming.length === 0 ? (
        <p className="mt-2 text-sm text-muted">Nessuna disponibilità inserita.</p>
      ) : (
        <ul className="mt-3 divide-y divide-line border-y border-line text-sm">
          {upcoming.map((s) => (
            <li key={s.id} className="py-2.5 flex flex-wrap items-center gap-3">
              <span className="w-48 font-medium">{fmt(s.startsAt)}</span>
              <span className="text-muted">{s.duration} min</span>
              <span className="flex-1 min-w-48">
                {s.booking ? (
                  <>
                    <strong>{s.booking.company}</strong> · <a className="underline" href={`mailto:${s.booking.email}`}>{s.booking.email}</a>
                    {s.booking.topic && <span className="block text-muted">Temi: {s.booking.topic}</span>}
                  </>
                ) : s.state === "held" ? (
                  <span className="text-muted">In pagamento</span>
                ) : (
                  <span className="text-muted">Libero</span>
                )}
              </span>
              <button onClick={() => remove(s)} className="inline-flex items-center gap-1 px-3 py-1 rounded-lg border border-line hover:bg-paper">
                <Trash2 className="size-4" aria-hidden /> {s.booking ? "Annulla" : "Togli"}
              </button>
            </li>
          ))}
        </ul>
      )}
      {past.length > 0 && (
        <>
          <h2 className="mt-10 text-lg font-semibold text-navy">Ultimi 7 giorni</h2>
          <ul className="mt-3 text-sm space-y-1">
            {past.map((s) => (
              <li key={s.id}>
                {fmt(s.startsAt)} · {s.booking?.company} · {s.booking?.email}
              </li>
            ))}
          </ul>
        </>
      )}
    </>
  );
}
