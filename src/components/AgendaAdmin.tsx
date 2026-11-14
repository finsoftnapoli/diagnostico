"use client";

import { ChevronLeft, ChevronRight, Eraser, MousePointerClick, Repeat } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useRef, useState } from "react";
import { addDays, expandTemplate, mondayOf, overlapsBusy, romeParts, romeToUtc, toMinutes, toTime, type Interval } from "@/lib/agenda-time";
import AgendaCalendari from "./AgendaCalendari";

export interface SlotRow {
  id: string;
  startsAt: string;
  duration: number;
  meetingUrl: string | null;
  state: "open" | "held" | "booked";
  booking: { id: string; company: string; email: string; topic: string | null } | null;
}
export interface FeedRow {
  id: string;
  label: string;
  syncedAt: string | null;
  error: string | null;
}

const DAY_START = 8 * 60;
const DAY_END = 20 * 60;
const STEP = 30;
const ROW_H = 22;
const ROWS = (DAY_END - DAY_START) / STEP;
const DAYS_IT = ["lun", "mar", "mer", "gio", "ven", "sab", "dom"];
const MONTHS_IT = [
  "gennaio",
  "febbraio",
  "marzo",
  "aprile",
  "maggio",
  "giugno",
  "luglio",
  "agosto",
  "settembre",
  "ottobre",
  "novembre",
  "dicembre",
];
const TIMES = Array.from({ length: (DAY_END - DAY_START) / STEP + 1 }, (_, i) => toTime(DAY_START + i * STEP));

const dayLabel = (date: string) => `${Number(date.slice(8))} ${MONTHS_IT[Number(date.slice(5, 7)) - 1]}`;
const fmt = (iso: string) =>
  new Date(iso).toLocaleString("it-IT", {
    timeZone: "Europe/Rome",
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  });

type Mode = "add" | "erase";
type Drag = { day: string; a: number; b: number };

/** Agenda dell'esperto: calendario settimanale su cui si cliccano o si trascinano gli orari liberi, modello settimanale, calendari collegati. */
export default function AgendaAdmin({
  slots,
  busy,
  feeds,
  exportUrl,
  defaultUrl,
}: {
  slots: SlotRow[];
  busy: Interval[];
  feeds: FeedRow[];
  exportUrl: string | null;
  defaultUrl: string;
}) {
  const router = useRouter();
  const [today] = useState(() => romeParts(new Date()).date);
  const [week, setWeek] = useState(mondayOf(today));
  const [mode, setMode] = useState<Mode>("add");
  const [duration, setDuration] = useState(60);
  const [url, setUrl] = useState(defaultUrl);
  const [selected, setSelected] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [drag, setDrag] = useState<Drag | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [busyNow, setBusyNow] = useState(false);
  const dragRef = useRef<Drag | null>(null);

  // modello settimanale
  const [tplDays, setTplDays] = useState<number[]>([0, 1, 2, 3, 4]);
  const [tplFrom, setTplFrom] = useState("10:00");
  const [tplTo, setTplTo] = useState("12:00");
  const [tplWeeks, setTplWeeks] = useState(4);

  const dates = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(week, i)), [week]);
  const rows = useMemo(
    () =>
      slots.map((s) => {
        const start = new Date(s.startsAt);
        const p = romeParts(start);
        return {
          ...s,
          date: p.date,
          minutes: toMinutes(p.time),
          startMs: start.getTime(),
          collides: overlapsBusy(busy, start.getTime(), s.duration),
        };
      }),
    [slots, busy],
  );
  const [now] = useState(() => Date.now());
  const pick = rows.find((s) => s.id === selected) ?? null;
  const upcomingBookings = rows.filter((s) => s.booking && s.startMs + s.duration * 60000 > now - 2 * 3600 * 1000);

  /** Blocchi occupati dai calendari collegati, per giorno (in minuti dall'inizio del giorno). */
  function busyOn(date: string): { from: number; to: number }[] {
    const s = romeToUtc(date, "00:00")?.getTime() ?? 0;
    const e = romeToUtc(addDays(date, 1), "00:00")?.getTime() ?? s + 86400000;
    return busy
      .filter((b) => b.start < e && b.end > s)
      .map((b) => ({
        from: b.start <= s ? 0 : toMinutes(romeParts(new Date(b.start)).time),
        to: b.end >= e ? 24 * 60 : toMinutes(romeParts(new Date(b.end)).time),
      }))
      .filter((b) => b.to > DAY_START && b.from < DAY_END);
  }

  async function send(path: string, init: RequestInit) {
    setBusyNow(true);
    const res = await fetch(path, { ...init, headers: { "content-type": "application/json" } });
    const j = (await res.json().catch(() => ({}))) as { error?: string; created?: number; skipped?: number };
    setBusyNow(false);
    return { ok: res.ok, j };
  }

  async function addSlots(list: { date: string; time: string }[]) {
    const clean = list.filter((x) => {
      const d = romeToUtc(x.date, x.time);
      return d && d.getTime() > Date.now() && !overlapsBusy(busy, d.getTime(), duration);
    });
    const dropped = list.length - clean.length;
    if (!clean.length)
      return setMsg(dropped ? "Quegli orari sono passati o cadono su un impegno dei calendari collegati." : "Nessun orario da aggiungere.");
    const { ok, j } = await send("/api/admin/slot", { method: "POST", body: JSON.stringify({ slots: clean, duration, meetingUrl: url }) });
    if (!ok) return setMsg(j.error ?? "Non riuscito");
    const skipped = (j.skipped ?? 0) + dropped;
    setMsg(
      `${j.created === 1 ? "Aggiunto 1 orario" : `Aggiunti ${j.created} orari`}${skipped ? `, ${skipped} saltati perché già presenti, passati o in conflitto` : ""}.`,
    );
    router.refresh();
  }

  async function removeSlot(id: string) {
    const { ok } = await send(`/api/admin/slot/${id}`, { method: "DELETE" });
    if (!ok) return setMsg("Non riuscito");
    setSelected(null);
    setConfirming(false);
    router.refresh();
  }

  async function eraseRange(date: string, fromMin: number, toMin: number) {
    const hit = rows.filter((s) => s.date === date && s.state === "open" && s.minutes < toMin && s.minutes + s.duration > fromMin);
    if (!hit.length)
      return setMsg("Nessun orario libero in quel punto: le consulenze prenotate si annullano dal riquadro che si apre cliccandole.");
    setBusyNow(true);
    await Promise.all(hit.map((s) => fetch(`/api/admin/slot/${s.id}`, { method: "DELETE" })));
    setBusyNow(false);
    setMsg(hit.length === 1 ? "Tolto 1 orario." : `Tolti ${hit.length} orari.`);
    router.refresh();
  }

  function commit(d: Drag) {
    const lo = Math.min(d.a, d.b);
    const hi = Math.max(d.a, d.b);
    const from = DAY_START + lo * STEP;
    const to = DAY_START + (hi + 1) * STEP;
    if (mode === "erase") return void eraseRange(d.day, from, to);
    const list: { date: string; time: string }[] = [];
    for (let t = from; t + duration <= to; t += duration) list.push({ date: d.day, time: toTime(t) });
    if (!list.length) list.push({ date: d.day, time: toTime(from) });
    void addSlots(list);
  }

  const rowAt = (e: React.PointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    return Math.max(0, Math.min(ROWS - 1, Math.floor((e.clientY - r.top) / ROW_H)));
  };

  function onDown(day: string, e: React.PointerEvent<HTMLDivElement>) {
    if (e.button !== 0 || busyNow) return;
    setSelected(null);
    setMsg(null);
    const r = rowAt(e);
    const d = { day, a: r, b: r };
    dragRef.current = d;
    setDrag(d);
    if (e.pointerType !== "touch") e.currentTarget.setPointerCapture(e.pointerId);
  }
  function onMove(day: string, e: React.PointerEvent<HTMLDivElement>) {
    const cur = dragRef.current;
    if (!cur || cur.day !== day || e.pointerType === "touch") return;
    const d = { ...cur, b: rowAt(e) };
    dragRef.current = d;
    setDrag(d);
  }
  function onUp() {
    const d = dragRef.current;
    dragRef.current = null;
    setDrag(null);
    if (d) commit(d);
  }
  function onCancel() {
    dragRef.current = null;
    setDrag(null);
  }

  const range = `${dayLabel(dates[0])} – ${dayLabel(dates[6])} ${dates[6].slice(0, 4)}`;

  return (
    <>
      {upcomingBookings.length > 0 && (
        <section className="mt-6">
          <h2 className="text-lg font-semibold text-navy">Consulenze prenotate</h2>
          <ul className="mt-2 divide-y divide-line border-y border-line text-sm">
            {upcomingBookings.map((s) => (
              <li key={s.id} className="py-2.5 flex flex-wrap items-center gap-x-4 gap-y-1">
                <span className="w-56 font-medium capitalize">{fmt(s.startsAt)}</span>
                <span className="flex-1 min-w-48">
                  <strong>{s.booking?.company}</strong> ·{" "}
                  <a className="underline" href={`mailto:${s.booking?.email}`}>
                    {s.booking?.email}
                  </a>
                  {s.booking?.topic && <span className="block text-muted">Temi: {s.booking.topic}</span>}
                </span>
                <button
                  onClick={() => {
                    setWeek(mondayOf(s.date));
                    setSelected(s.id);
                    setConfirming(false);
                  }}
                  className="px-3 py-1 rounded-lg border border-line hover:bg-paper"
                >
                  Apri
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="mt-8">
        <div className="flex flex-wrap items-end gap-x-6 gap-y-3">
          <div
            role="group"
            aria-label="Azione sul calendario"
            className="inline-flex rounded-lg border border-line overflow-hidden text-sm"
          >
            <button
              onClick={() => setMode("add")}
              aria-pressed={mode === "add"}
              className={`inline-flex items-center gap-1.5 px-3 py-2 ${mode === "add" ? "bg-navy text-white" : "hover:bg-paper"}`}
            >
              <MousePointerClick className="size-4" aria-hidden /> Aggiungi
            </button>
            <button
              onClick={() => setMode("erase")}
              aria-pressed={mode === "erase"}
              className={`inline-flex items-center gap-1.5 px-3 py-2 border-l border-line ${mode === "erase" ? "bg-navy text-white" : "hover:bg-paper"}`}
            >
              <Eraser className="size-4" aria-hidden /> Togli
            </button>
          </div>
          <label className="text-sm">
            <span className="font-medium">Durata di ogni orario</span>
            <select
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="mt-1 block rounded-lg border border-line px-3 py-2"
            >
              <option value={60}>60 minuti</option>
              <option value={90}>90 minuti</option>
            </select>
          </label>
          <label className="text-sm flex-1 min-w-64">
            <span className="font-medium">Videochiamata (facoltativo)</span>
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://meet.google.com/..."
              className="mt-1 w-full rounded-lg border border-line px-3 py-2"
            />
          </label>
        </div>
        <p className="mt-2 text-sm text-muted">
          {mode === "add"
            ? "Clicca una casella per aprire un orario, oppure trascina su più caselle per aprirne diversi di seguito."
            : "Clicca o trascina sugli orari liberi per toglierli. Le consulenze prenotate si annullano cliccandole."}
        </p>

        <div className="mt-4 flex items-center gap-2">
          <button
            onClick={() => setWeek(addDays(week, -7))}
            aria-label="Settimana precedente"
            className="p-2 rounded-lg border border-line hover:bg-paper"
          >
            <ChevronLeft className="size-4" aria-hidden />
          </button>
          <button onClick={() => setWeek(mondayOf(today))} className="px-3 py-2 rounded-lg border border-line hover:bg-paper text-sm">
            Oggi
          </button>
          <button
            onClick={() => setWeek(addDays(week, 7))}
            aria-label="Settimana successiva"
            className="p-2 rounded-lg border border-line hover:bg-paper"
          >
            <ChevronRight className="size-4" aria-hidden />
          </button>
          <h2 className="ml-2 font-semibold text-navy">{range}</h2>
          {msg && (
            <span role="status" className="ml-auto text-sm text-muted">
              {msg}
            </span>
          )}
        </div>

        <div className="mt-3 overflow-x-auto rounded-xl border border-line">
          <div className="min-w-[720px] select-none">
            <div className="grid" style={{ gridTemplateColumns: "48px repeat(7, 1fr)" }}>
              <div />
              {dates.map((d, i) => (
                <div
                  key={d}
                  className={`px-2 py-2 text-center text-sm border-l border-line ${d === today ? "bg-accent/10 font-semibold text-navy" : ""}`}
                >
                  <span className="capitalize">{DAYS_IT[i]}</span> {Number(d.slice(8))}
                </div>
              ))}
            </div>
            <div className="grid border-t border-line" style={{ gridTemplateColumns: "48px repeat(7, 1fr)" }}>
              <div className="relative" style={{ height: ROWS * ROW_H }}>
                {TIMES.filter((_, i) => i % 2 === 0 && i < ROWS).map((t) => (
                  <span
                    key={t}
                    className="absolute right-1.5 -translate-y-1/2 text-[11px] text-muted"
                    style={{ top: ((toMinutes(t) - DAY_START) / STEP) * ROW_H + (t === TIMES[0] ? 6 : 0) }}
                  >
                    {t}
                  </span>
                ))}
              </div>
              {dates.map((day) => {
                const mine = rows.filter((s) => s.date === day && s.minutes < DAY_END && s.minutes + s.duration > DAY_START);
                const past = day < today;
                return (
                  <div
                    key={day}
                    onPointerDown={(e) => onDown(day, e)}
                    onPointerMove={(e) => onMove(day, e)}
                    onPointerUp={onUp}
                    onPointerCancel={onCancel}
                    className={`relative border-l border-line ${past ? "cursor-not-allowed bg-paper/60" : mode === "erase" ? "cursor-crosshair" : "cursor-pointer hover:bg-accent/5"}`}
                    style={{
                      height: ROWS * ROW_H,
                      backgroundImage: `repeating-linear-gradient(to bottom, transparent 0, transparent ${ROW_H * 2 - 1}px, var(--line) ${ROW_H * 2 - 1}px, var(--line) ${ROW_H * 2}px)`,
                      touchAction: "pan-y pan-x",
                    }}
                  >
                    {busyOn(day).map((b, i) => (
                      <div
                        key={i}
                        aria-hidden
                        className="absolute inset-x-0 pointer-events-none text-[10px] text-muted px-1 overflow-hidden"
                        style={{
                          top: ((Math.max(b.from, DAY_START) - DAY_START) / STEP) * ROW_H,
                          height: ((Math.min(b.to, DAY_END) - Math.max(b.from, DAY_START)) / STEP) * ROW_H,
                          backgroundImage: "repeating-linear-gradient(45deg, rgba(100,116,139,.22) 0 4px, rgba(100,116,139,.08) 4px 8px)",
                        }}
                      >
                        Occupato
                      </div>
                    ))}
                    {mine.map((s) => {
                      const sel = s.id === selected;
                      const tone =
                        s.state === "booked"
                          ? "bg-navy text-white border-navy"
                          : s.state === "held"
                            ? "bg-amber-100 text-amber-900 border-amber-400"
                            : "bg-accent/20 text-navy border-accent";
                      return (
                        <button
                          key={s.id}
                          type="button"
                          onPointerDown={(e) => e.stopPropagation()}
                          onClick={() => {
                            if (mode === "erase" && s.state === "open") return void removeSlot(s.id);
                            setSelected(s.id);
                            setConfirming(false);
                          }}
                          aria-label={`${fmt(s.startsAt)}, ${s.state === "booked" ? `prenotato da ${s.booking?.company}` : s.state === "held" ? "in pagamento" : "libero"}`}
                          className={`absolute inset-x-0.5 rounded-md border px-1.5 py-0.5 text-left text-[11px] leading-tight overflow-hidden ${tone} ${sel ? "ring-2 ring-navy ring-offset-1" : ""} ${s.collides ? "border-dashed border-red-500" : ""}`}
                          style={{
                            top: ((Math.max(s.minutes, DAY_START) - DAY_START) / STEP) * ROW_H + 1,
                            height: ((Math.min(s.minutes + s.duration, DAY_END) - Math.max(s.minutes, DAY_START)) / STEP) * ROW_H - 2,
                          }}
                        >
                          <strong className="block">{toTime(s.minutes)}</strong>
                          <span className="block truncate">
                            {s.state === "booked"
                              ? s.booking?.company
                              : s.state === "held"
                                ? "In pagamento"
                                : s.collides
                                  ? "In conflitto"
                                  : "Libero"}
                          </span>
                        </button>
                      );
                    })}
                    {drag?.day === day && (
                      <div
                        aria-hidden
                        className={`absolute inset-x-0 pointer-events-none border-2 ${mode === "erase" ? "bg-red-200/50 border-red-400" : "bg-accent/30 border-accent"}`}
                        style={{ top: Math.min(drag.a, drag.b) * ROW_H, height: (Math.abs(drag.b - drag.a) + 1) * ROW_H }}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        <p className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-xs text-muted">
          <span>
            <i className="inline-block size-2.5 rounded-sm bg-accent/40 border border-accent align-middle" /> libero
          </span>
          <span>
            <i className="inline-block size-2.5 rounded-sm bg-navy align-middle" /> prenotato
          </span>
          <span>
            <i className="inline-block size-2.5 rounded-sm bg-amber-100 border border-amber-400 align-middle" /> in pagamento
          </span>
          <span>
            <i
              className="inline-block size-2.5 rounded-sm align-middle"
              style={{ backgroundImage: "repeating-linear-gradient(45deg, rgba(100,116,139,.4) 0 2px, rgba(100,116,139,.12) 2px 4px)" }}
            />{" "}
            occupato nei calendari collegati
          </span>
        </p>

        {pick && (
          <div className="mt-4 rounded-xl border border-line p-4 text-sm" role="region" aria-label="Dettaglio orario">
            <p className="font-semibold text-navy capitalize">
              {fmt(pick.startsAt)} · {pick.duration} minuti
            </p>
            {pick.booking ? (
              <p className="mt-1">
                Prenotato da <strong>{pick.booking.company}</strong> ·{" "}
                <a className="underline" href={`mailto:${pick.booking.email}`}>
                  {pick.booking.email}
                </a>
                {pick.booking.topic && <span className="block text-muted">Temi: {pick.booking.topic}</span>}
              </p>
            ) : pick.state === "held" ? (
              <p className="mt-1 text-muted">Un cliente sta completando il pagamento: se non lo conclude torna libero da solo.</p>
            ) : (
              <p className="mt-1 text-muted">Libero: i clienti lo vedono nella loro area personale.</p>
            )}
            {pick.collides && <p className="mt-1 text-red-700">Cade su un impegno dei calendari collegati: i clienti non lo vedono.</p>}
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {!confirming ? (
                <button
                  onClick={() => (pick.booking ? setConfirming(true) : void removeSlot(pick.id))}
                  disabled={busyNow}
                  className="px-3 py-1.5 rounded-lg border border-line hover:bg-paper disabled:opacity-50"
                >
                  {pick.booking ? "Annulla la consulenza" : "Togli questo orario"}
                </button>
              ) : (
                <>
                  <span>Il cliente riceverà un avviso e l&apos;ora tornerà disponibile. Confermi?</span>
                  <button
                    onClick={() => void removeSlot(pick.id)}
                    disabled={busyNow}
                    className="px-3 py-1.5 rounded-lg bg-navy text-white font-semibold disabled:opacity-50"
                  >
                    Sì, annulla
                  </button>
                  <button onClick={() => setConfirming(false)} className="px-3 py-1.5 rounded-lg border border-line hover:bg-paper">
                    No
                  </button>
                </>
              )}
              <button onClick={() => setSelected(null)} className="px-3 py-1.5 rounded-lg hover:bg-paper">
                Chiudi
              </button>
            </div>
          </div>
        )}
      </section>

      <section className="mt-10 rounded-xl border border-line p-4">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-navy">
          <Repeat className="size-5" aria-hidden /> Ripeti ogni settimana
        </h2>
        <p className="mt-1 text-sm text-muted">
          Apri in un colpo solo le stesse fasce per le prossime settimane. Gli orari già presenti o in conflitto con i calendari collegati
          vengono saltati.
        </p>
        <div className="mt-3 flex flex-wrap items-end gap-x-6 gap-y-3 text-sm">
          <fieldset>
            <legend className="font-medium">Giorni</legend>
            <div className="mt-1 flex gap-1.5">
              {DAYS_IT.map((d, i) => {
                const on = tplDays.includes(i);
                return (
                  <button
                    key={d}
                    type="button"
                    aria-pressed={on}
                    onClick={() => setTplDays(on ? tplDays.filter((x) => x !== i) : [...tplDays, i])}
                    className={`w-11 py-2 rounded-lg border capitalize ${on ? "bg-navy text-white border-navy" : "border-line hover:bg-paper"}`}
                  >
                    {d}
                  </button>
                );
              })}
            </div>
          </fieldset>
          <label>
            <span className="font-medium">Dalle</span>
            <select
              value={tplFrom}
              onChange={(e) => setTplFrom(e.target.value)}
              className="mt-1 block rounded-lg border border-line px-3 py-2"
            >
              {TIMES.slice(0, -1).map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </label>
          <label>
            <span className="font-medium">Alle</span>
            <select value={tplTo} onChange={(e) => setTplTo(e.target.value)} className="mt-1 block rounded-lg border border-line px-3 py-2">
              {TIMES.slice(1).map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </label>
          <label>
            <span className="font-medium">Per</span>
            <select
              value={tplWeeks}
              onChange={(e) => setTplWeeks(Number(e.target.value))}
              className="mt-1 block rounded-lg border border-line px-3 py-2"
            >
              {[1, 2, 4, 8, 12].map((n) => (
                <option key={n} value={n}>
                  {n === 1 ? "1 settimana" : `${n} settimane`}
                </option>
              ))}
            </select>
          </label>
          <button
            disabled={busyNow || !tplDays.length || toMinutes(tplTo) <= toMinutes(tplFrom)}
            onClick={() =>
              void addSlots(expandTemplate({ startDate: today, weeks: tplWeeks, days: tplDays, from: tplFrom, to: tplTo, duration }))
            }
            className="bg-navy text-white font-semibold px-4 py-2 rounded-lg disabled:opacity-50"
          >
            Crea gli orari
          </button>
        </div>
        <p className="mt-2 text-xs text-muted">Durata di ogni orario: {duration} minuti (si cambia qui sopra).</p>
      </section>

      <AgendaCalendari feeds={feeds} exportUrl={exportUrl} />
    </>
  );
}
