"use client";

import { Check, Copy, RefreshCw, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { FeedRow } from "./AgendaAdmin";

const ago = (iso: string | null) => {
  if (!iso) return "mai";
  const m = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  if (m < 1) return "adesso";
  if (m < 60) return `${m} min fa`;
  const h = Math.round(m / 60);
  return h < 24 ? `${h} h fa` : `${Math.round(h / 24)} giorni fa`;
};

/** Calendari collegati (Google, Outlook, Apple, qualunque link ICS) e calendario delle prenotazioni da sottoscrivere. */
export default function AgendaCalendari({ feeds, exportUrl }: { feeds: FeedRow[]; exportUrl: string | null }) {
  const router = useRouter();
  const [label, setLabel] = useState("");
  const [link, setLink] = useState("");
  const [msg, setMsg] = useState<{ text: string; bad?: boolean } | null>(null);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const [feedUrl, setFeedUrl] = useState(exportUrl);

  async function call(path: string, init: RequestInit) {
    setBusy(true);
    setMsg(null);
    const res = await fetch(path, { ...init, headers: { "content-type": "application/json" } });
    const j = (await res.json().catch(() => ({}))) as { error?: string; url?: string; events?: number };
    setBusy(false);
    return { ok: res.ok, j };
  }

  async function add() {
    const { ok, j } = await call("/api/admin/calendari", { method: "POST", body: JSON.stringify({ label, url: link }) });
    if (!ok) return setMsg({ text: j.error ?? "Non riuscito", bad: true });
    setLabel("");
    setLink("");
    setMsg({ text: `Calendario collegato: letti ${j.events ?? 0} impegni.` });
    router.refresh();
  }
  async function refresh() {
    const { ok } = await call("/api/admin/calendari", { method: "POST", body: JSON.stringify({ refresh: true }) });
    setMsg(ok ? { text: "Calendari aggiornati." } : { text: "Non riuscito", bad: true });
    router.refresh();
  }
  async function unlink(id: string) {
    await call(`/api/admin/calendari/${id}`, { method: "DELETE" });
    router.refresh();
  }
  async function makeFeed() {
    if (feedUrl && !window.confirm("Il link attuale smetterà di funzionare: dovrai sottoscrivere di nuovo il calendario. Proseguire?"))
      return;
    const { ok, j } = await call("/api/admin/calendari/collegamento", { method: "POST" });
    if (ok && j.url) setFeedUrl(j.url);
    else setMsg({ text: j.error ?? "Non riuscito", bad: true });
  }
  async function copy() {
    if (!feedUrl) return;
    try {
      await navigator.clipboard.writeText(feedUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* il link resta selezionabile nel campo */
    }
  }

  return (
    <section className="mt-10 grid gap-6 lg:grid-cols-2">
      <div className="rounded-xl border border-line p-4">
        <h2 className="text-lg font-semibold text-navy">I tuoi calendari</h2>
        <p className="mt-1 text-sm text-muted">
          Collega il calendario che usi (Google, Outlook, Apple): gli orari in cui sei già impegnato non vengono più offerti ai clienti e li
          vedi a righe sul calendario qui sopra.
        </p>
        {feeds.length > 0 && (
          <ul className="mt-3 divide-y divide-line border-y border-line text-sm">
            {feeds.map((f) => (
              <li key={f.id} className="py-2 flex items-center gap-3">
                <span className="flex-1 min-w-0">
                  <strong className="block truncate">{f.label}</strong>
                  {f.error ? (
                    <span className="text-red-700">{f.error} (uso gli ultimi orari letti)</span>
                  ) : (
                    <span className="text-muted">Letto {ago(f.syncedAt)}</span>
                  )}
                </span>
                <button
                  onClick={() => void unlink(f.id)}
                  disabled={busy}
                  aria-label={`Scollega ${f.label}`}
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-lg border border-line hover:bg-paper disabled:opacity-50"
                >
                  <Trash2 className="size-4" aria-hidden /> Scollega
                </button>
              </li>
            ))}
          </ul>
        )}
        <div className="mt-3 grid gap-2 text-sm">
          <input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="Nome (per esempio Google lavoro)"
            aria-label="Nome del calendario"
            className="rounded-lg border border-line px-3 py-2"
          />
          <input
            value={link}
            onChange={(e) => setLink(e.target.value)}
            placeholder="Link ICS del calendario (https:// o webcal://)"
            aria-label="Link ICS del calendario"
            className="rounded-lg border border-line px-3 py-2"
          />
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => void add()}
              disabled={busy || !label.trim() || !link.trim()}
              className="bg-navy text-white text-sm font-semibold px-4 py-2 rounded-lg disabled:opacity-50"
            >
              Collega
            </button>
            {feeds.length > 0 && (
              <button
                onClick={() => void refresh()}
                disabled={busy}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-line hover:bg-paper disabled:opacity-50"
              >
                <RefreshCw className="size-4" aria-hidden /> Aggiorna ora
              </button>
            )}
            {msg && (
              <span role="status" className={msg.bad ? "text-red-700" : "text-muted"}>
                {msg.text}
              </span>
            )}
          </div>
        </div>
        <details className="mt-3 text-sm">
          <summary className="cursor-pointer font-medium text-navy-soft">Dove trovo il link?</summary>
          <ul className="mt-2 space-y-1.5 text-muted list-disc pl-5">
            <li>
              <strong className="text-ink">Google Calendar</strong> (da computer): Impostazioni del calendario, «Integra calendario», copia
              «Indirizzo segreto in formato iCal». Google lo aggiorna con qualche ora di ritardo.
            </li>
            <li>
              <strong className="text-ink">Outlook / Microsoft 365</strong>: Impostazioni, Calendario, «Calendari condivisi», «Pubblica un
              calendario», scegli il calendario e copia il link ICS.
            </li>
            <li>
              <strong className="text-ink">Apple (iCloud)</strong>: nell&apos;app Calendario, accanto al calendario scegli «Condividi»,
              attiva «Calendario pubblico» e copia il link (inizia con webcal://).
            </li>
          </ul>
          <p className="mt-2 text-muted">
            Il link è una chiave di sola lettura del calendario: tienilo riservato. Di ogni impegno leggiamo solo l&apos;orario, mai titolo
            o partecipanti.
          </p>
        </details>
      </div>

      <div className="rounded-xl border border-line p-4">
        <h2 className="text-lg font-semibold text-navy">Le prenotazioni nel tuo calendario</h2>
        <p className="mt-1 text-sm text-muted">
          Sottoscrivi questo link nel tuo calendario: ogni consulenza prenotata compare da sola e blocca l&apos;ora anche per gli inviti che
          ricevi da altri.
        </p>
        {feedUrl ? (
          <div className="mt-3 flex gap-2">
            <input
              readOnly
              value={feedUrl}
              onFocus={(e) => e.currentTarget.select()}
              aria-label="Link del calendario delle prenotazioni"
              className="flex-1 min-w-0 rounded-lg border border-line px-3 py-2 text-sm bg-paper"
            />
            <button
              onClick={() => void copy()}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-line hover:bg-paper text-sm"
            >
              {copied ? <Check className="size-4" aria-hidden /> : <Copy className="size-4" aria-hidden />} {copied ? "Copiato" : "Copia"}
            </button>
          </div>
        ) : null}
        <div className="mt-3">
          <button
            onClick={() => void makeFeed()}
            disabled={busy}
            className={`text-sm px-4 py-2 rounded-lg disabled:opacity-50 ${feedUrl ? "border border-line hover:bg-paper" : "bg-navy text-white font-semibold"}`}
          >
            {feedUrl ? "Genera un nuovo link" : "Attiva il calendario delle prenotazioni"}
          </button>
        </div>
        <details className="mt-3 text-sm">
          <summary className="cursor-pointer font-medium text-navy-soft">Come lo sottoscrivo?</summary>
          <ul className="mt-2 space-y-1.5 text-muted list-disc pl-5">
            <li>
              <strong className="text-ink">Google Calendar</strong>: «Altri calendari», «+», «Da URL», incolla il link.
            </li>
            <li>
              <strong className="text-ink">Outlook</strong>: «Aggiungi calendario», «Sottoscrivi dal web», incolla il link.
            </li>
            <li>
              <strong className="text-ink">Apple Calendario</strong>: menu File, «Nuova sottoscrizione calendario», incolla il link.
            </li>
          </ul>
          <p className="mt-2 text-muted">
            Chi ha il link vede nome dell&apos;azienda e orario delle consulenze: se finisce in mani sbagliate, generane uno nuovo e il
            vecchio smette di funzionare.
          </p>
        </details>
      </div>
    </section>
  );
}
