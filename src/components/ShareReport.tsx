"use client";

import { Check, Copy, Send, Share2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { SHARE_DAYS, type ShareRow, shareState } from "@/lib/share";

const day = (iso: string) => new Date(iso).toLocaleDateString("it-IT", { day: "numeric", month: "short" });

/** «Invia il report a…»: crea un link in sola lettura con scadenza, lo invia per email o lo fa copiare, e permette di ritirarlo. */
export default function ShareReport({ assessmentId }: { assessmentId: string }) {
  const [open, setOpen] = useState(false);
  const [shares, setShares] = useState<ShareRow[] | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [note, setNote] = useState("");
  const [scope, setScope] = useState<"completo" | "sintesi">("completo");
  const [days, setDays] = useState<number>(30);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<{ link: string; sent: boolean; emailFailed: boolean } | null>(null);
  const [copied, setCopied] = useState(false);
  const url = `/api/report/${assessmentId}/condivisioni`;

  useEffect(() => {
    if (!open || shares) return;
    fetch(url)
      .then((r) => (r.ok ? r.json() : { shares: [] }))
      .then((j: { shares: ShareRow[] }) => setShares(j.shares ?? []))
      .catch(() => setShares([]));
  }, [open, shares, url]);

  async function create(withEmail: boolean) {
    setError(null);
    if (withEmail && !/^\S+@\S+\.\S+$/.test(email.trim())) return setError("Scrivete l'email di chi deve ricevere il report.");
    setBusy(true);
    const res = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name, email: withEmail ? email : "", note: withEmail ? note : "", scope, days }),
    }).catch(() => null);
    const json = (await res?.json().catch(() => ({}))) as
      { link?: string; share?: ShareRow; sent?: boolean; emailFailed?: boolean; error?: string } | undefined;
    setBusy(false);
    if (!res?.ok || !json?.link) return setError(json?.error ?? "Condivisione non riuscita, riprovate.");
    setCreated({ link: json.link, sent: !!json.sent, emailFailed: !!json.emailFailed });
    setCopied(false);
    if (json.share) setShares((s) => [json.share as ShareRow, ...(s ?? [])]);
    setEmail("");
    setName("");
    setNote("");
  }

  async function revoke(id: string) {
    const res = await fetch(`${url}?link=${id}`, { method: "DELETE" }).catch(() => null);
    if (res?.ok) setShares((s) => (s ?? []).map((x) => (x.id === id ? { ...x, revoked_at: new Date().toISOString() } : x)));
  }

  async function copy(link: string) {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  const field = "mt-1 w-full rounded-lg border border-line px-3 py-2 text-sm";
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="no-print inline-flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg border border-navy text-navy hover:bg-navy hover:text-white"
      >
        <Share2 className="size-4" aria-hidden /> Invia il report a…
      </button>
      {open && (
        <div
          className="no-print fixed inset-0 z-40 flex items-end sm:items-center justify-center bg-ink/40 p-0 sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Invia il report"
        >
          <div className="w-full sm:max-w-xl max-h-[92vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl bg-white p-5 sm:p-6 shadow-xl">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold text-navy">Invia il report a…</h2>
                <p className="mt-1 text-sm text-muted">
                  Un socio, il commercialista, la banca: chi riceve il link legge il report online, in sola lettura e senza registrarsi.
                  Potete ritirare il link in ogni momento.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Chiudi"
                className="rounded-lg p-1.5 text-muted hover:bg-paper"
              >
                <X className="size-5" aria-hidden />
              </button>
            </div>

            <fieldset className="mt-5">
              <legend className="text-sm font-semibold text-navy">Che cosa condividere</legend>
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                {(
                  [
                    ["completo", "Report completo", "Tutte le sezioni, compresi i numeri del bilancio"],
                    ["sintesi", "Solo la sintesi", "Ottogramma, sintesi per la direzione, priorità e azioni"],
                  ] as const
                ).map(([v, t, d]) => (
                  <label
                    key={v}
                    className={`cursor-pointer rounded-lg border p-3 text-sm ${scope === v ? "border-navy bg-navy/5" : "border-line"}`}
                  >
                    <input type="radio" name="scope" className="sr-only" checked={scope === v} onChange={() => setScope(v)} />
                    <span className="font-semibold text-navy">{t}</span>
                    <span className="block text-muted">{d}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            <label className="mt-4 block text-sm">
              <span className="font-semibold text-navy">Il link resta valido per</span>
              <select value={days} onChange={(e) => setDays(Number(e.target.value))} className={field}>
                {SHARE_DAYS.map((d) => (
                  <option key={d} value={d}>
                    {d} giorni
                  </option>
                ))}
              </select>
            </label>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <label className="block text-sm">
                <span className="font-semibold text-navy">Nome di chi lo riceve</span>
                <input value={name} onChange={(e) => setName(e.target.value)} maxLength={120} className={field} placeholder="Facoltativo" />
              </label>
              <label className="block text-sm">
                <span className="font-semibold text-navy">La sua email</span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  maxLength={200}
                  className={field}
                  placeholder="nome@azienda.it"
                />
              </label>
            </div>
            <label className="mt-3 block text-sm">
              <span className="font-semibold text-navy">Due righe di accompagnamento</span>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                maxLength={400}
                rows={2}
                className={field}
                placeholder="Facoltativo"
              />
            </label>

            {error && <p className="mt-3 text-sm text-accent">{error}</p>}
            <div className="mt-4 flex flex-wrap gap-3">
              <button
                type="button"
                disabled={busy}
                onClick={() => create(true)}
                className="inline-flex items-center gap-2 rounded-lg bg-navy px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
              >
                <Send className="size-4" aria-hidden /> Invia per email
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => create(false)}
                className="inline-flex items-center gap-2 rounded-lg border border-navy px-4 py-2.5 text-sm font-semibold text-navy disabled:opacity-60"
              >
                <Copy className="size-4" aria-hidden /> Crea solo il link
              </button>
            </div>

            {created && (
              <div className="mt-5 rounded-lg border border-navy/30 bg-navy/[0.03] p-4 text-sm">
                <p className="font-semibold text-navy">
                  {created.sent
                    ? "Email inviata."
                    : created.emailFailed
                      ? "Link creato, ma l'email non è partita: inviatelo voi."
                      : "Link creato."}
                </p>
                <p className="mt-1 text-muted">Copiatelo adesso: per sicurezza non lo conserviamo e non potremo mostrarlo di nuovo.</p>
                <div className="mt-2 flex gap-2">
                  <input
                    readOnly
                    value={created.link}
                    onFocus={(e) => e.currentTarget.select()}
                    className="w-full rounded-lg border border-line bg-white px-3 py-2 text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => copy(created.link)}
                    className="shrink-0 inline-flex items-center gap-1 rounded-lg border border-navy px-3 text-navy font-medium"
                  >
                    {copied ? <Check className="size-4" aria-hidden /> : <Copy className="size-4" aria-hidden />}{" "}
                    {copied ? "Copiato" : "Copia"}
                  </button>
                </div>
              </div>
            )}

            <h3 className="mt-6 text-sm font-semibold text-navy">Link già creati</h3>
            {shares === null ? (
              <p className="mt-2 text-sm text-muted">Caricamento…</p>
            ) : shares.length === 0 ? (
              <p className="mt-2 text-sm text-muted">Non avete ancora condiviso questo report.</p>
            ) : (
              <ul className="mt-2 divide-y divide-line border-y border-line text-sm">
                {shares.map((s) => {
                  const st = shareState(s);
                  return (
                    <li key={s.id} className="flex flex-wrap items-center justify-between gap-2 py-2">
                      <span>
                        <strong>{s.recipient_name || s.recipient_email || "Link senza destinatario"}</strong>
                        <span className="block text-muted">
                          {s.scope === "sintesi" ? "Sintesi" : "Report completo"} · creato il {day(s.created_at)} ·{" "}
                          {st === "attivo" ? `valido fino al ${day(s.expires_at)}` : st} ·{" "}
                          {s.views === 0
                            ? "non ancora aperto"
                            : `aperto ${s.views} ${s.views === 1 ? "volta" : "volte"}${s.last_viewed_at ? `, l'ultima il ${day(s.last_viewed_at)}` : ""}`}
                        </span>
                      </span>
                      {st === "attivo" && (
                        <button type="button" onClick={() => revoke(s.id)} className="underline text-accent">
                          Ritira
                        </button>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      )}
    </>
  );
}
