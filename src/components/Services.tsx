"use client";

import { ArrowRight, CalendarDays, Check, CreditCard, FileText, Layers, Loader2, Package, UserRound } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { BRAND } from "@/config/brand";
import { euro, PRODUCTS, VAT_RATE, withVat } from "@/config/offers";
import { AREA_SHORT, AreaIcon } from "@/lib/areaIcons";
import { EMPTY_BILLING, type Billing } from "@/lib/billing";
import { AREAS } from "@/lib/questionnaire";
import type { AreaCode } from "@/lib/types";

export interface ServicesData {
  company: { id: string; name: string; vat: string | null };
  companies: { id: string; name: string }[];
  paymentsActive: boolean;
  result: "ok" | "annullato" | null;
  cancelledOrder: string | null;
  billing: Billing | null;
  priorities: AreaCode[];
  modules: { entitlementId: string; area: AreaCode; moduleId: string | null; status: string; score: number | null }[];
  hours: number;
  bookings: {
    id: string;
    startsAt: string;
    duration: number;
    url: string | null;
    topic: string | null;
    mine: boolean;
    cancellable: boolean;
  }[];
  slots: { id: string; startsAt: string; duration: number }[];
  orders: { id: string; date: string; items: string[]; totalCents: number; invoice: string | null; status: string }[];
}

const day = (iso: string) =>
  new Date(iso).toLocaleDateString("it-IT", { timeZone: "Europe/Rome", weekday: "long", day: "numeric", month: "long" });
const hour = (iso: string) => new Date(iso).toLocaleTimeString("it-IT", { timeZone: "Europe/Rome", hour: "2-digit", minute: "2-digit" });
const dayKey = (iso: string) => new Date(iso).toLocaleDateString("sv-SE", { timeZone: "Europe/Rome" });

/** Area acquisti: dati di fatturazione, moduli, consulenze e ordini dell'azienda. */
export default function Services({ data }: { data: ServicesData }) {
  const router = useRouter();
  const [billing, setBilling] = useState<Billing | null>(data.billing);
  const [editBilling, setEditBilling] = useState(!data.billing);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [terms, setTerms] = useState(false);

  // ritorno dal pagamento: l'attivazione arriva da Stripe dopo pochi secondi
  useEffect(() => {
    if (data.result === "annullato" && data.cancelledOrder)
      void fetch(`/api/acquisti?ordine=${data.cancelledOrder}`, { method: "DELETE" }).then(() =>
        router.replace(`/area/servizi?azienda=${data.company.id}`),
      );
    if (data.result === "ok") {
      const t = setTimeout(() => router.refresh(), 4000);
      return () => clearTimeout(t);
    }
  }, [data.result, data.cancelledOrder, data.company.id, router]);

  async function checkout(lines: { sku: string; area?: string }[], extra: { slotId?: string; topic?: string } = {}) {
    setError(null);
    if (!billing) {
      setEditBilling(true);
      setError("Inserisci i dati di fatturazione per procedere.");
      document.getElementById("fatturazione")?.scrollIntoView({ behavior: "smooth" });
      return;
    }
    if (!terms) {
      setError("Per procedere accetta le condizioni di vendita.");
      document.getElementById("condizioni")?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    setBusy("checkout");
    const res = await fetch("/api/acquisti", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ companyId: data.company.id, lines, ...extra, acceptTerms: true }),
    });
    const j = (await res.json().catch(() => ({}))) as { url?: string; error?: string };
    if (res.ok && j.url) return window.location.assign(j.url);
    setBusy(null);
    setError(j.error ?? "Pagamento non disponibile");
  }

  return (
    <div className="mt-6">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h1 className="text-3xl font-semibold text-navy">I tuoi servizi</h1>
        {data.companies.length > 1 && (
          <select
            value={data.company.id}
            onChange={(e) => router.push(`/area/servizi?azienda=${e.target.value}`)}
            className="rounded-lg border border-line px-3 py-2 text-sm"
          >
            {data.companies.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        )}
      </div>
      <p className="mt-1 text-muted">{data.company.name}</p>

      {data.result === "ok" && (
        <div className="mt-6 rounded-xl border border-navy bg-navy/5 p-4 text-sm flex gap-3">
          <Check className="size-5 text-navy shrink-0" aria-hidden />
          <p>
            <strong className="text-navy">Pagamento ricevuto, grazie.</strong> I servizi si attivano in pochi secondi; riceverai una email
            di conferma e la fattura elettronica tramite il Sistema di Interscambio.
          </p>
        </div>
      )}
      {!data.paymentsActive && (
        <p className="mt-6 rounded-xl bg-paper p-4 text-sm">
          I pagamenti online saranno attivi a breve. Nel frattempo scrivici a{" "}
          <a className="underline" href={`mailto:${BRAND.contactEmail}`}>
            {BRAND.contactEmail}
          </a>{" "}
          per attivare un servizio.
        </p>
      )}
      {data.paymentsActive && (
        <label id="condizioni" className="mt-6 flex items-start gap-2 text-sm">
          <input type="checkbox" checked={terms} onChange={(e) => setTerms(e.target.checked)} className="mt-1" />
          <span>
            Acquisto per conto dell&apos;azienda indicata nei dati di fatturazione e accetto le{" "}
            <Link href="/termini" target="_blank" className="underline">
              condizioni di vendita
            </Link>
            .
          </span>
        </label>
      )}
      {error && <p className="mt-4 text-sm text-accent">{error}</p>}

      <Modules data={data} busy={busy} onBuy={checkout} />
      <Consulting data={data} busy={busy} onBuy={checkout} setError={setError} />

      <section id="fatturazione" className="mt-14">
        <h2 className="text-xl font-semibold text-navy flex items-center gap-2">
          <FileText className="size-5" aria-hidden strokeWidth={1.75} /> Dati di fatturazione
        </h2>
        {editBilling ? (
          <BillingForm
            companyId={data.company.id}
            initial={billing ?? { ...EMPTY_BILLING, denominazione: data.company.name, vat_number: data.company.vat ?? "" }}
            onSaved={(b) => {
              setBilling(b);
              setEditBilling(false);
              setError(null);
            }}
            onCancel={billing ? () => setEditBilling(false) : undefined}
          />
        ) : (
          billing && (
            <div className="mt-3 text-sm flex flex-wrap items-start justify-between gap-3">
              <p>
                <strong>{billing.denominazione}</strong> · P.IVA {billing.vat_number}
                <br />
                {billing.address}, {billing.cap} {billing.city} ({billing.province})
                <br />
                <span className="text-muted">
                  {billing.sdi_code
                    ? `Codice destinatario ${billing.sdi_code}`
                    : billing.pec
                      ? `PEC ${billing.pec}`
                      : "Fattura nel cassetto fiscale (codice 0000000)"}
                </span>
              </p>
              <button onClick={() => setEditBilling(true)} className="underline text-navy-soft">
                Modifica
              </button>
            </div>
          )
        )}
      </section>

      {data.orders.length > 0 && (
        <section className="mt-14">
          <h2 className="text-xl font-semibold text-navy">Acquisti</h2>
          <ul className="mt-3 divide-y divide-line border-y border-line text-sm">
            {data.orders.map((o) => (
              <li key={o.id} className="py-2.5 flex flex-wrap justify-between gap-3">
                <span>
                  {new Date(o.date).toLocaleDateString("it-IT")} · {o.items.join(", ")}
                </span>
                <span className="text-muted">
                  {euro(o.totalCents / 100)} IVA inclusa{o.invoice ? ` · fattura n. ${o.invoice}` : ""}
                  {o.status === "refunded" ? " · rimborsato" : ""}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <p className="mt-10 text-xs text-muted">
        Prezzi IVA esclusa; al pagamento si aggiunge l&apos;IVA al {VAT_RATE}%. Servizi riservati a imprese e professionisti con partita
        IVA.{" "}
        <Link href="/termini" className="underline">
          Condizioni di vendita
        </Link>
        .
      </p>
    </div>
  );
}

function Modules({ data, busy, onBuy }: { data: ServicesData; busy: string | null; onBuy: (l: { sku: string; area?: string }[]) => void }) {
  const owned = new Map(data.modules.map((m) => [m.area, m]));
  const [sel, setSel] = useState<Set<AreaCode>>(new Set());
  const ordered = useMemo(
    () => [...data.priorities, ...AREAS.map((a) => a.code as AreaCode).filter((c) => !data.priorities.includes(c))],
    [data.priorities],
  );
  const toggle = (c: AreaCode) => setSel((s) => (s.has(c) ? new Set([...s].filter((x) => x !== c)) : new Set(s).add(c)));
  const allOwned = owned.size === AREAS.length;
  const p = PRODUCTS.modulo;
  const b = PRODUCTS.bundle;
  return (
    <section className="mt-10">
      <h2 className="text-xl font-semibold text-navy flex items-center gap-2">
        <Layers className="size-5" aria-hidden strokeWidth={1.75} /> Approfondimenti per ambito
      </h2>
      <p className="mt-1 text-sm text-muted max-w-3xl">
        L&apos;Ottogramma dell&apos;ambito: 8 sotto-ambiti con punteggi immediati e un report con piano di lavoro e indicatori rivisto dai
        nostri esperti. {euro(p.price)} + IVA per ambito.
      </p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {ordered.map((c) => {
          const m = owned.get(c);
          const prio = data.priorities.includes(c);
          if (m)
            return (
              <div key={c} className="rounded-xl border border-navy p-3 text-sm flex flex-col gap-2">
                <span className="flex items-center gap-2 font-medium">
                  <AreaIcon code={c} className="size-4 text-navy" /> {AREA_SHORT[c]}
                </span>
                <span className="text-muted">
                  {m.status === "pronto"
                    ? `Report pronto · ${m.score}/100`
                    : m.status === "in analisi"
                      ? "Inviato, in analisi"
                      : m.status === "in corso"
                        ? "In compilazione"
                        : "Attivo"}
                </span>
                <ModuleButton m={m} />
              </div>
            );
          const on = sel.has(c);
          return (
            <button
              key={c}
              onClick={() => toggle(c)}
              aria-pressed={on}
              className={`rounded-xl border p-3 text-sm text-left flex flex-col gap-2 ${on ? "border-navy bg-navy/5" : prio ? "border-navy/50" : "border-line hover:border-navy-soft"}`}
            >
              <span className="flex items-center gap-2 font-medium">
                {on ? <Check className="size-4 text-navy" aria-hidden /> : <AreaIcon code={c} className="size-4 text-navy" />}{" "}
                {AREA_SHORT[c]}
              </span>
              <span className="text-muted">{prio ? "Tra le tue priorità" : "Disponibile"}</span>
            </button>
          );
        })}
      </div>
      {sel.size > 0 && (
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            onClick={() => onBuy([...sel].map((area) => ({ sku: "modulo", area })))}
            disabled={!!busy}
            className="inline-flex items-center gap-2 bg-navy text-white text-sm font-semibold px-4 py-2.5 rounded-lg disabled:opacity-60"
          >
            {busy ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <CreditCard className="size-4" aria-hidden />}
            Acquista {sel.size === 1 ? "1 approfondimento" : `${sel.size} approfondimenti`} · {euro(sel.size * p.price)} + IVA
          </button>
          <span className="text-sm text-muted">Totale {euro(withVat(sel.size * p.price))} IVA inclusa</span>
        </div>
      )}

      {!allOwned && (
        <div className="mt-6 rounded-xl border border-navy bg-navy/5 p-5 grid gap-4 md:grid-cols-[1fr_auto] items-center">
          <div>
            <p className="font-semibold text-navy flex items-center gap-2">
              <Package className="size-5" aria-hidden strokeWidth={1.75} /> {b.name}: {euro(b.price)} + IVA
            </p>
            {owned.size > 0 && (
              <p className="mt-1 text-sm text-muted">
                Hai già {owned.size === 1 ? "1 approfondimento attivo" : `${owned.size} approfondimenti attivi`}: con il percorso si
                attivano gli altri e le 2 ore di consulenza, allo stesso prezzo.
              </p>
            )}
            <ul className="mt-2 text-sm space-y-1">
              {b.bullets.map((x) => (
                <li key={x} className="flex gap-2">
                  <Check className="size-4 mt-0.5 shrink-0 text-navy" aria-hidden /> {x}
                </li>
              ))}
            </ul>
          </div>
          <button
            onClick={() => onBuy([{ sku: "bundle" }])}
            disabled={!!busy}
            className="inline-flex items-center justify-center gap-2 bg-navy text-white text-sm font-semibold px-5 py-2.5 rounded-lg disabled:opacity-60"
          >
            Acquista il percorso <ArrowRight className="size-4" aria-hidden />
          </button>
        </div>
      )}
    </section>
  );
}

function ModuleButton({ m }: { m: ServicesData["modules"][number] }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  if (m.moduleId)
    return (
      <Link href={`/area/modulo/${m.moduleId}`} className="inline-flex items-center gap-1 text-navy font-semibold">
        {m.status === "in corso" ? "Continua" : "Apri"} <ArrowRight className="size-4" aria-hidden />
      </Link>
    );
  return (
    <button
      onClick={async () => {
        setBusy(true);
        const res = await fetch("/api/moduli", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ entitlementId: m.entitlementId }),
        });
        const j = (await res.json().catch(() => ({}))) as { id?: string };
        if (j.id) router.push(`/area/modulo/${j.id}`);
        else setBusy(false);
      }}
      disabled={busy}
      className="inline-flex items-center gap-1 text-navy font-semibold text-left"
    >
      {busy ? "Apertura…" : "Inizia"} <ArrowRight className="size-4" aria-hidden />
    </button>
  );
}

function Consulting({
  data,
  busy,
  onBuy,
  setError,
}: {
  data: ServicesData;
  busy: string | null;
  onBuy: (l: { sku: string }[], extra: { slotId?: string; topic?: string }) => void;
  setError: (e: string | null) => void;
}) {
  const router = useRouter();
  const [slot, setSlot] = useState<string | null>(null);
  const [topic, setTopic] = useState("");
  const [booking, setBooking] = useState(false);
  const p = PRODUCTS.consulenza;
  const byDay = useMemo(() => {
    const m = new Map<string, ServicesData["slots"]>();
    for (const s of data.slots) m.set(dayKey(s.startsAt), [...(m.get(dayKey(s.startsAt)) ?? []), s]);
    return [...m.entries()];
  }, [data.slots]);

  async function bookWithHours() {
    if (!slot) return;
    setBooking(true);
    setError(null);
    const res = await fetch("/api/prenotazioni", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ companyId: data.company.id, slotId: slot, topic }),
    });
    const j = (await res.json().catch(() => ({}))) as { error?: string };
    setBooking(false);
    if (!res.ok) return setError(j.error ?? "Prenotazione non riuscita");
    setSlot(null);
    setTopic("");
    router.refresh();
  }

  async function cancel(id: string) {
    if (!confirm("Annullare la consulenza? L'ora tornerà disponibile per una nuova prenotazione.")) return;
    const res = await fetch(`/api/prenotazioni/${id}`, { method: "DELETE" });
    const j = (await res.json().catch(() => ({}))) as { error?: string };
    if (!res.ok) setError(j.error ?? "Annullamento non riuscito");
    router.refresh();
  }

  return (
    <section id="consulenza" className="mt-14">
      <h2 className="text-xl font-semibold text-navy flex items-center gap-2">
        <UserRound className="size-5" aria-hidden strokeWidth={1.75} /> Consulenza senior da remoto
      </h2>
      <p className="mt-1 text-sm text-muted max-w-3xl">
        Un&apos;ora in videochiamata con un nostro consulente senior sul tuo diagnostico. {euro(p.price)} + IVA, da pagare al momento della
        prenotazione.{" "}
        {data.hours > 0 && (
          <strong className="text-navy">Hai {data.hours === 1 ? "1 ora disponibile" : `${data.hours} ore disponibili`}.</strong>
        )}
      </p>

      {data.bookings.length > 0 && (
        <ul className="mt-4 space-y-2">
          {data.bookings.map((b) => (
            <li key={b.id} className="rounded-xl border border-navy p-3 text-sm flex flex-wrap items-center gap-3">
              <CalendarDays className="size-5 text-navy" aria-hidden />
              <span className="flex-1 min-w-48">
                <strong className="capitalize">{day(b.startsAt)}</strong> alle {hour(b.startsAt)} · {b.duration} minuti
                {b.url ? (
                  <a href={b.url} className="block underline text-navy-soft" target="_blank" rel="noreferrer">
                    Collegamento alla videochiamata
                  </a>
                ) : (
                  <span className="block text-muted">Il collegamento arriverà via email prima della sessione</span>
                )}
              </span>
              {b.cancellable && (
                <button onClick={() => cancel(b.id)} className="px-3 py-1.5 rounded-lg border border-line hover:bg-paper">
                  Annulla
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      {byDay.length === 0 ? (
        <p className="mt-4 text-sm text-muted">
          Al momento non ci sono orari disponibili nelle prossime settimane: scrivici a{" "}
          <a className="underline" href={`mailto:${BRAND.contactEmail}`}>
            {BRAND.contactEmail}
          </a>{" "}
          e ti proporremo una data.
        </p>
      ) : (
        <>
          <p className="mt-5 text-sm font-medium">Scegli data e ora (ora italiana)</p>
          <div className="mt-2 space-y-3">
            {byDay.map(([k, list]) => (
              <div key={k} className="flex flex-wrap items-center gap-2 text-sm">
                <span className="w-44 capitalize text-muted">{day(list[0].startsAt)}</span>
                {list.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setSlot(s.id === slot ? null : s.id)}
                    aria-pressed={s.id === slot}
                    className={`px-3 py-1.5 rounded-full border tabular-nums ${s.id === slot ? "bg-navy text-white border-navy" : "border-line hover:border-navy-soft"}`}
                  >
                    {hour(s.startsAt)}
                  </button>
                ))}
              </div>
            ))}
          </div>
          {slot && (
            <div className="mt-4 rounded-xl bg-paper p-4">
              <label className="block text-sm">
                <span className="font-medium">Su cosa vuoi concentrarti? (facoltativo)</span>
                <textarea
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  maxLength={1000}
                  rows={3}
                  className="mt-1 w-full rounded-lg border border-line bg-white px-3 py-2"
                />
              </label>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                {data.hours >= 1 ? (
                  <button
                    onClick={bookWithHours}
                    disabled={booking}
                    className="inline-flex items-center gap-2 bg-navy text-white text-sm font-semibold px-4 py-2.5 rounded-lg disabled:opacity-60"
                  >
                    {booking ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <Check className="size-4" aria-hidden />} Prenota
                    con le tue ore
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => onBuy([{ sku: "consulenza" }], { slotId: slot, topic })}
                      disabled={!!busy}
                      className="inline-flex items-center gap-2 bg-navy text-white text-sm font-semibold px-4 py-2.5 rounded-lg disabled:opacity-60"
                    >
                      {busy ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <CreditCard className="size-4" aria-hidden />}{" "}
                      Prenota e paga · {euro(withVat(p.price))} IVA inclusa
                    </button>
                    <span className="text-xs text-muted">L&apos;orario resta riservato per 30 minuti durante il pagamento.</span>
                  </>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </section>
  );
}

function BillingForm({
  companyId,
  initial,
  onSaved,
  onCancel,
}: {
  companyId: string;
  initial: Billing;
  onSaved: (b: Billing) => void;
  onCancel?: () => void;
}) {
  const [b, setB] = useState<Billing>(initial);
  const [errs, setErrs] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const set = (k: keyof Billing, v: string) => setB((x) => ({ ...x, [k]: v }));

  async function save() {
    setBusy(true);
    setMsg(null);
    const res = await fetch("/api/fatturazione", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ companyId, billing: b }),
    });
    const j = (await res.json().catch(() => ({}))) as { error?: string; fields?: Record<string, string>; billing?: Billing };
    setBusy(false);
    if (!res.ok || !j.billing) {
      setErrs(j.fields ?? {});
      return setMsg(j.error ?? "Salvataggio non riuscito");
    }
    setErrs({});
    onSaved(j.billing);
  }

  const field = (k: keyof Billing, label: string, opts: { cls?: string; placeholder?: string; max?: number } = {}) => (
    <label className={`text-sm ${opts.cls ?? ""}`}>
      <span className="font-medium">{label}</span>
      <input
        value={(b[k] as string | null) ?? ""}
        onChange={(e) => set(k, e.target.value)}
        maxLength={opts.max}
        placeholder={opts.placeholder}
        className={`mt-1 w-full rounded-lg border bg-white px-3 py-2 ${errs[k] ? "border-accent" : "border-line"}`}
      />
      {errs[k] && <span className="block text-xs text-accent mt-0.5">{errs[k]}</span>}
    </label>
  );

  return (
    <div className="mt-3 rounded-xl border border-line p-4 sm:p-5">
      <div className="grid gap-3 sm:grid-cols-6">
        {field("denominazione", "Ragione sociale", { cls: "sm:col-span-4" })}
        {field("vat_number", "Partita IVA", { cls: "sm:col-span-2", max: 13 })}
        {field("address", "Indirizzo della sede", { cls: "sm:col-span-4" })}
        {field("cap", "CAP", { cls: "sm:col-span-1", max: 5 })}
        {field("province", "Provincia", { cls: "sm:col-span-1", max: 2, placeholder: "NA" })}
        {field("city", "Comune", { cls: "sm:col-span-3" })}
        {field("tax_code", "Codice fiscale (se diverso)", { cls: "sm:col-span-3", max: 16 })}
        {field("sdi_code", "Codice destinatario SDI", { cls: "sm:col-span-2", max: 7, placeholder: "7 caratteri" })}
        {field("pec", "oppure PEC", { cls: "sm:col-span-4" })}
      </div>
      <p className="mt-2 text-xs text-muted">
        Senza codice destinatario né PEC la fattura sarà disponibile nel cassetto fiscale dell&apos;azienda.
      </p>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          onClick={save}
          disabled={busy}
          className="bg-navy text-white text-sm font-semibold px-4 py-2 rounded-lg disabled:opacity-60"
        >
          {busy ? "Salvataggio…" : "Salva i dati"}
        </button>
        {onCancel && (
          <button onClick={onCancel} className="text-sm underline text-navy-soft">
            Annulla
          </button>
        )}
        {msg && <span className="text-sm text-accent">{msg}</span>}
      </div>
    </div>
  );
}
