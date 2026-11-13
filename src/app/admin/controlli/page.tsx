import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { siteUrl } from "@/config/site";
import { isArubaConfigured } from "@/lib/aruba";
import { lastBackup } from "@/lib/backup";
import { isEmailConfigured } from "@/lib/email";
import { isTurnstileConfigured } from "@/lib/human";
import { sellerFromEnv } from "@/lib/invoice";
import { QUESTIONNAIRE_VERSION, QUESTIONS } from "@/lib/questionnaire";
import { autoReleaseEnabled } from "@/lib/release";
import { isStripeConfigured } from "@/lib/stripe";
import { currentUser, supabaseService } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Controlli e andamento" };

export default function ControlsPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <Suspense fallback={<p className="text-muted">Caricamento…</p>}>
        <Controls />
      </Suspense>
    </div>
  );
}

const LABEL: Record<string, string> = {
  home: "Pagina iniziale vista",
  avvio: "Questionario aperto",
  inizio: "Prima domanda",
  ambizioni: "Ambizioni",
  sfide: "Sfide",
  azienda: "Dati dell'azienda",
  anteprima: "Ottogramma in anteprima",
  codice: "Codice richiesto",
  salvato: "Compilazione salvata",
};
const when = (iso: string) => new Date(iso).toLocaleString("it-IT", { dateStyle: "short", timeStyle: "short", timeZone: "Europe/Rome" });
const daysAgo = (n: number) => new Date(Date.now() - n * 86_400_000);

async function Controls() {
  const { user, isStaff } = await currentUser();
  if (!user) redirect("/accedi?next=/admin/controlli");
  if (!isStaff) return <p>Questa area è riservata allo staff.</p>;
  const db = supabaseService();
  const since = daysAgo(14).toISOString();
  const [events, feedback, errors, probe, backup] = await Promise.all([
    db.from("funnel_events").select("name, step, device").gte("created_at", since).limit(20000),
    db.from("feedback").select("id, kind, rating, message, created_at").order("created_at", { ascending: false }).limit(50),
    db.from("error_log").select("id, source, message, path, created_at").order("created_at", { ascending: false }).limit(30),
    db.from("report_events").select("id", { count: "exact", head: true }),
    lastBackup(db).catch(() => null),
  ]);
  const ev = (events.data ?? []) as { name: string; step: string | null; device: string | null }[];
  const count = (name: string, step?: string) => ev.filter((e) => e.name === name && (step === undefined || e.step === step)).length;
  const funnel: { label: string; n: number }[] = [
    ...(["home", "avvio", "inizio"] as const).map((n) => ({ label: LABEL[n], n: count(n) })),
    ...QUESTIONS.map((q, i) => ({ label: `Risposta ${i + 1} · ${q.theme}`, n: count("risposta", q.id) })),
    ...(["ambizioni", "sfide", "azienda", "anteprima", "codice", "salvato"] as const).map((n) => ({ label: LABEL[n], n: count(n) })),
  ];
  const top = Math.max(1, ...funnel.map((f) => f.n));
  const mobile = ev.filter((e) => e.name === "avvio" && e.device === "mobile").length;
  const fb = (feedback.data ?? []) as { id: number; kind: string; rating: number | null; message: string | null; created_at: string }[];
  const rated = fb.filter((f) => f.rating);
  const errs = (errors.data ?? []) as { id: number; source: string; message: string; path: string | null; created_at: string }[];
  const today = daysAgo(0).toISOString().slice(0, 10);
  const yesterday = daysAgo(1).toISOString().slice(0, 10);
  const stripeLive = (process.env.STRIPE_SECRET_KEY ?? "").startsWith("sk_live");

  const checks: { ok: boolean; label: string; hint: string }[] = [
    {
      ok: !events.error && !feedback.error && !errors.error,
      label: "Database: tabelle di osservazione",
      hint: "eseguire la migrazione 20261114000000_osservazione.sql",
    },
    {
      ok: !probe.error,
      label: "Database: rilascio dei report e tracciamento",
      hint: "eseguire la migrazione 20261113000000_rilascio_report.sql",
    },
    {
      ok: autoReleaseEnabled(),
      label: "Invio automatico dei report dopo i controlli",
      hint: "disattivato con REPORT_AUTO_RELEASE=0: ogni report attende l'approvazione",
    },
    { ok: !!process.env.ANTHROPIC_API_KEY, label: "Generazione dei report", hint: "variabile ANTHROPIC_API_KEY" },
    { ok: isEmailConfigured(), label: "Invio delle email", hint: "variabile RESEND_API_KEY" },
    {
      ok: !!process.env.STAFF_NOTIFY_EMAIL,
      label: "Indirizzo per gli avvisi allo staff",
      hint: "variabile STAFF_NOTIFY_EMAIL; senza, gli avvisi vanno alla casella dei contatti",
    },
    {
      ok: isTurnstileConfigured(),
      label: "Verifica anti-bot",
      hint: "variabili TURNSTILE_SECRET_KEY e NEXT_PUBLIC_TURNSTILE_SITE_KEY: senza, lettura dei documenti e bozze non sono protette",
    },
    {
      ok: !!process.env.CRON_SECRET,
      label: "Attività pianificate protette",
      hint: "variabile CRON_SECRET: senza, invio dei report e copie di sicurezza non partono",
    },
    {
      ok: !!process.env.PUBLIC_SITE_URL,
      label: `Indirizzo pubblico del sito (${siteUrl()})`,
      hint: "variabile PUBLIC_SITE_URL: senza, i link delle email usano il dominio di Vercel",
    },
    {
      ok: backup === today || backup === yesterday,
      label: `Copia di sicurezza dei dati${backup ? ` (ultima: ${backup})` : ""}`,
      hint: "parte ogni notte con la pulizia; la prima compare il giorno dopo la migrazione",
    },
    {
      ok: isStripeConfigured(),
      label: `Pagamenti Stripe${isStripeConfigured() ? (stripeLive ? " (reali)" : " (ambiente di prova)") : ""}`,
      hint: "variabili STRIPE_SECRET_KEY e STRIPE_WEBHOOK_SECRET",
    },
    { ok: !!sellerFromEnv(), label: "Dati di Finsoft per le fatture", hint: "variabili SELLER_*" },
    {
      ok: isArubaConfigured(),
      label: `Invio delle fatture ad Aruba${process.env.ARUBA_ENV === "prod" ? "" : " (ambiente di prova)"}`,
      hint: "variabili ARUBA_USERNAME, ARUBA_PASSWORD, ARUBA_ENV",
    },
  ];

  return (
    <>
      <nav className="mb-6 flex gap-4 text-sm">
        <Link href="/admin" className="underline text-navy-soft">
          ← Area staff
        </Link>
      </nav>
      <h1 className="text-2xl font-semibold text-navy">Controlli e andamento</h1>
      <p className="mt-1 text-sm text-muted">Questionario v{QUESTIONNAIRE_VERSION}. Percorso e riscontri degli ultimi 14 giorni.</p>

      <section className="mt-8">
        <h2 className="text-lg font-semibold text-navy">Controlli di configurazione</h2>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2 text-sm">
          {checks.map((c) => (
            <li key={c.label} className={`rounded-lg border px-3 py-2 ${c.ok ? "border-line" : "border-accent/40 bg-accent/5"}`}>
              <span className={`font-semibold ${c.ok ? "text-navy" : "text-accent"}`}>{c.ok ? "✓" : "!"}</span> {c.label}
              {!c.ok && <span className="block text-xs text-muted">{c.hint}</span>}
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-semibold text-navy">Dove si fermano le persone</h2>
        <p className="mt-1 text-sm text-muted">
          Numero di visite che hanno raggiunto ogni passo. Non si registrano identificativi: chi riprende una compilazione conta solo dal
          passo in cui rientra. Da telefono: {mobile} avvii su {count("avvio")}.
        </p>
        {events.error ? (
          <p className="mt-3 text-sm text-accent">Dati non disponibili: manca la migrazione.</p>
        ) : (
          <ol className="mt-4 space-y-1 text-sm">
            {funnel.map((f) => (
              <li key={f.label} className="grid grid-cols-[minmax(0,18rem)_1fr_3rem] items-center gap-3">
                <span className="truncate">{f.label}</span>
                <span className="h-3 rounded bg-paper">
                  <span className="block h-3 rounded bg-navy" style={{ width: `${(f.n / top) * 100}%` }} />
                </span>
                <span className="text-right tabular-nums">{f.n}</span>
              </li>
            ))}
          </ol>
        )}
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-semibold text-navy">Riscontri e domande</h2>
        <p className="mt-1 text-sm text-muted">
          {rated.length
            ? `Voto medio ${(rated.reduce((a, f) => a + (f.rating as number), 0) / rated.length).toLocaleString("it-IT", { maximumFractionDigits: 1 })} su 5 (${rated.length} voti).`
            : "Ancora nessun voto."}
        </p>
        <ul className="mt-3 divide-y divide-line border-y border-line text-sm">
          {fb.length === 0 && <li className="py-2 text-muted">Nessun riscontro.</li>}
          {fb.map((f) => (
            <li key={f.id} className="py-2">
              <span className="text-muted">
                {when(f.created_at)} · {f.kind}
                {f.rating ? ` · voto ${f.rating}/5` : ""}
              </span>
              {f.message && <p className="mt-0.5 whitespace-pre-line">{f.message}</p>}
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-semibold text-navy">Errori recenti</h2>
        <ul className="mt-3 divide-y divide-line border-y border-line text-sm">
          {errs.length === 0 && <li className="py-2 text-muted">Nessun errore registrato.</li>}
          {errs.map((e) => (
            <li key={e.id} className="py-2">
              <span className="text-muted">
                {when(e.created_at)} · {e.source === "client" ? "browser" : "server"}
                {e.path ? ` · ${e.path}` : ""}
              </span>
              <p className="mt-0.5 break-words">{e.message}</p>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
