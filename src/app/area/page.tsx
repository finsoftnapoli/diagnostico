import { ArrowRight, CalendarClock, FileText, Layers } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import DocumentList, { type DocRow } from "@/components/DocumentList";
import SignOutButton from "@/components/SignOutButton";
import TeamView from "@/components/TeamView";
import { BRAND } from "@/config/brand";
import { consultCredit } from "@/lib/commerce";
import type { PlanSummary } from "@/lib/documents";
import { AREAS } from "@/lib/questionnaire";
import type { ReleaseVerdict } from "@/lib/release-checks";
import { releaseLabel } from "@/lib/release-schedule";
import { levelShort } from "@/lib/score-meaning";
import { currentUser, supabaseServer, supabaseService } from "@/lib/supabase/server";
import { latestByMember, type MemberResult } from "@/lib/team";
import type { AreaCode } from "@/lib/types";

export const metadata: Metadata = { title: "Area personale" };

export default function AreaPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <Suspense fallback={<p className="text-muted">Caricamento…</p>}>
        <AreaContent />
      </Suspense>
    </div>
  );
}

type AssessmentRow = {
  id: string;
  user_id: string;
  company_id: string;
  respondent_email: string | null;
  completed_at: string;
  overall_score: number | null;
  report_status?: string;
  companies: { name: string } | null;
  area_scores?: { area: string; score: number | null }[];
  answers?: { question_id: string; level: number }[];
  objectives?: string[] | null;
  issues?: string[] | null;
};

interface Todo {
  icon: typeof FileText;
  title: string;
  text: string;
  href: string;
  cta: string;
}

const areaName = (c: string) => AREAS.find((a) => a.code === c)?.name ?? c;
const day = (iso: string) =>
  new Date(iso).toLocaleDateString("it-IT", { day: "numeric", month: "long", year: "numeric", timeZone: "Europe/Rome" });
const moment = (iso: string) =>
  new Date(iso).toLocaleString("it-IT", {
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Rome",
  });

async function AreaContent() {
  const { user, isStaff } = await currentUser();
  if (!user) redirect("/accedi?next=/area");
  const sb = await supabaseServer();
  const db = supabaseService();

  const [{ data: mineRaw }, { data: docs }, { data: memberships }] = await Promise.all([
    sb
      .from("assessments")
      .select("id, user_id, company_id, respondent_email, completed_at, overall_score, report_status, companies(name)")
      .eq("user_id", user.id)
      .eq("status", "completed")
      .order("completed_at", { ascending: false }),
    sb
      .from("documents")
      .select("id, kind, created_at, size_bytes, period, label, extracted, companies(name)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
    sb.from("company_members").select("company_id, role, companies(name)").eq("user_id", user.id),
  ]);
  const mine = (mineRaw ?? []) as unknown as AssessmentRow[];
  const memberOf = (memberships ?? []).map((m) => ({
    id: m.company_id as string,
    role: m.role as string,
    name: (m.companies as unknown as { name: string } | null)?.name ?? "",
  }));
  const adminOf = memberOf.filter((m) => m.role === "admin");
  const companyIds = memberOf.map((m) => m.id);

  // quando arriva il report in preparazione, moduli attivi, consulenze: letti dal server per le sole aziende dell'utente
  const waiting = mine.filter((a) => a.report_status !== "ready").map((a) => a.id);
  const nowIso = new Date().toISOString();
  const [checks, ents, modules, bookings, credits, actions] = await Promise.all([
    waiting.length ? db.from("assessments").select("id, report_checks").in("id", waiting) : { data: [] },
    companyIds.length
      ? db.from("entitlements").select("id, company_id, kind, area").in("company_id", companyIds).eq("kind", "area_module")
      : { data: [] },
    companyIds.length
      ? db.from("module_assessments").select("id, entitlement_id, status, report_status").in("company_id", companyIds)
      : { data: [] },
    companyIds.length
      ? db.from("bookings").select("id, expert_slots(starts_at)").in("company_id", companyIds).eq("status", "confirmed")
      : { data: [] },
    Promise.all(companyIds.map((id) => consultCredit(db, id).catch(() => ({ total: 0 })))),
    mine.length
      ? db
          .from("report_actions")
          .select("assessment_id")
          .in(
            "assessment_id",
            mine.map((a) => a.id),
          )
      : { data: [] },
  ]);
  const arrival = new Map<string, string>();
  for (const c of (checks.data ?? []) as { id: string; report_checks: ReleaseVerdict | null }[])
    if (c.report_checks?.ok && c.report_checks.releaseAfter && !c.report_checks.hold) arrival.set(c.id, c.report_checks.releaseAfter);
  const started = new Map<string, number>();
  for (const a of (actions.data ?? []) as { assessment_id: string }[])
    started.set(a.assessment_id, (started.get(a.assessment_id) ?? 0) + 1);
  const mods = ((ents.data ?? []) as { id: string; area: string }[]).map((e) => {
    const m = ((modules.data ?? []) as { id: string; entitlement_id: string; status: string; report_status: string }[]).find(
      (x) => x.entitlement_id === e.id,
    );
    return {
      area: e.area,
      id: m?.id ?? null,
      status: !m ? "da iniziare" : m.status !== "completed" ? "in corso" : m.report_status === "ready" ? "pronto" : "in analisi",
    };
  });
  const nextBooking = ((bookings.data ?? []) as unknown as { expert_slots: { starts_at: string } | null }[])
    .map((b) => b.expert_slots?.starts_at)
    .filter((s): s is string => !!s && s > nowIso)
    .sort()[0];
  const hours = credits.reduce((s, c) => s + (c.total ?? 0), 0);

  const teams = await Promise.all(
    adminOf.map(async (c) => {
      const [{ data: rows }, { data: invites }] = await Promise.all([
        sb
          .from("assessments")
          .select(
            "id, user_id, company_id, respondent_email, completed_at, overall_score, companies(name), area_scores(area, score), answers(question_id, level), objectives:responses->objectives, issues:responses->issues",
          )
          .eq("company_id", c.id)
          .eq("status", "completed"),
        sb
          .from("invitations")
          .select("id, email, invitee_name, status, sent_at, expires_at")
          .eq("company_id", c.id)
          .order("created_at", { ascending: false }),
      ]);
      const latest = latestByMember(
        ((rows ?? []) as unknown as AssessmentRow[]).map((r) => ({ ...r, userId: r.user_id, completedAt: r.completed_at })),
      );
      const members: MemberResult[] = latest.map((r) => ({
        id: r.id,
        label: r.user_id === user.id ? "La Sua compilazione" : (r.respondent_email ?? "Collega"),
        completedAt: r.completed_at,
        scores: Object.fromEntries((r.area_scores ?? []).map((s) => [s.area, s.score])) as Partial<Record<AreaCode, number | null>>,
        levels: Object.fromEntries((r.answers ?? []).map((a) => [a.question_id, a.level])),
        objectives: Array.isArray(r.objectives) ? r.objectives : [],
        issues: Array.isArray(r.issues) ? r.issues : [],
      }));
      return { companyId: c.id, name: c.name, members, invites: invites ?? [] };
    }),
  );

  const docRows: DocRow[] = (docs ?? []).map((d) => ({
    id: d.id,
    kind: d.kind,
    created_at: d.created_at,
    size_bytes: d.size_bytes,
    company: (d.companies as unknown as { name: string } | null)?.name ?? null,
    period: d.period,
    label: d.label,
    plan: (d.extracted as { plan?: PlanSummary } | null)?.plan ?? null,
  }));

  // che cosa fare adesso: al massimo tre voci, dalla più vicina al risultato
  const latest = mine[0];
  const todo: Todo[] = [];
  if (!latest)
    todo.push({
      icon: FileText,
      title: "Inizi il diagnostico",
      text: `Circa 15 minuti: l'${BRAND.reportName} subito, il report approfondito ${BRAND.reportPromise}.`,
      href: "/diagnostico",
      cta: "Inizia",
    });
  else if (latest.report_status === "ready")
    todo.push({
      icon: FileText,
      title: started.get(latest.id) ? "Prosegua con le azioni del report" : "Il report approfondito è pronto",
      text: started.get(latest.id)
        ? `Ha avviato ${started.get(latest.id)} ${started.get(latest.id) === 1 ? "azione" : "azioni"}: spunti le successive man mano che partono.`
        : "Legga le priorità, spunti le azioni che avvia e lo invii a chi lavora con Lei.",
      href: `/area/report/${latest.id}`,
      cta: "Apri il report",
    });
  else
    todo.push({
      icon: FileText,
      title: latest.report_status === "failed" ? "Il report approfondito è in ritardo" : "Il report approfondito è in preparazione",
      text:
        latest.report_status === "failed"
          ? "Ci stiamo lavorando: La avvisiamo per email appena è pronto. Intanto può rileggere l'Ottogramma."
          : `${BRAND.reportWorking}: lo riceve per email ${arrival.has(latest.id) ? releaseLabel(arrival.get(latest.id)!) : BRAND.reportPromise}. Intanto può rileggere l'${BRAND.reportName}.`,
      href: `/area/report/${latest.id}`,
      cta: `Apri l'${BRAND.reportName}`,
    });
  for (const m of mods.filter((x) => x.status === "da iniziare" || x.status === "in corso" || x.status === "pronto").slice(0, 2))
    todo.push({
      icon: Layers,
      title:
        m.status === "pronto"
          ? `Approfondimento ${areaName(m.area)}: il report è pronto`
          : `Approfondimento ${areaName(m.area)}: ${m.status === "in corso" ? "da completare" : "da compilare"}`,
      text:
        m.status === "pronto"
          ? "La lettura per sotto-ambito, il piano di lavoro e gli indicatori da seguire."
          : "Otto sotto-ambiti, circa 15 minuti. Può fermarsi e riprendere.",
      href: m.id ? `/area/modulo/${m.id}` : "/area/servizi",
      cta: m.status === "pronto" ? "Apri" : m.status === "in corso" ? "Riprendi" : "Inizia",
    });
  if (nextBooking)
    todo.push({
      icon: CalendarClock,
      title: "La Sua consulenza",
      text: `${moment(nextBooking).replace(/^./, (c) => c.toUpperCase())}. Trova il link della videochiamata tra i servizi.`,
      href: "/area/servizi#consulenza",
      cta: "Dettagli",
    });
  else if (hours > 0)
    todo.push({
      icon: CalendarClock,
      title: "Prenoti la consulenza",
      text: `Ha ${hours === 1 ? "un'ora disponibile" : `${hours} ore disponibili`} con un nostro consulente senior.`,
      href: "/area/servizi#consulenza",
      cta: "Scegli l'orario",
    });

  return (
    <>
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold text-navy">Area personale</h1>
          {memberOf.length > 0 && <p className="mt-1 text-muted">{memberOf.map((m) => m.name).join(" · ")}</p>}
        </div>
        <p className="text-sm text-muted flex flex-wrap items-center gap-x-1">
          {user.email}
          {isStaff && (
            <>
              {" · "}
              <Link href="/admin" className="underline text-navy-soft">
                Area staff
              </Link>
            </>
          )}
          {" · "}
          <SignOutButton />
        </p>
      </div>

      <section className="mt-8" aria-label="Da fare adesso">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">Da fare adesso</h2>
        <div className={`mt-3 grid gap-4 ${todo.length > 1 ? "md:grid-cols-2" : ""} ${todo.length > 2 ? "lg:grid-cols-3" : ""}`}>
          {todo.slice(0, 3).map((t, i) => (
            <Link
              key={t.title}
              href={t.href}
              className={`group flex flex-col rounded-xl border p-5 ${i === 0 ? "border-navy bg-navy text-white" : "border-line hover:border-navy"}`}
            >
              <t.icon className={`size-6 ${i === 0 ? "text-white" : "text-navy"}`} aria-hidden strokeWidth={1.75} />
              <span className={`mt-3 font-semibold leading-snug ${i === 0 ? "" : "text-navy"}`}>{t.title}</span>
              <span className={`mt-1 flex-1 text-sm ${i === 0 ? "text-white/80" : "text-muted"}`}>{t.text}</span>
              <span className={`mt-4 inline-flex items-center gap-1.5 text-sm font-semibold ${i === 0 ? "" : "text-navy"}`}>
                {t.cta} <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-xl font-semibold text-navy">I vostri report</h2>
        {mine.length ? (
          <ul className="mt-4 divide-y divide-line border-y border-line">
            {mine.map((a) => {
              const ready = a.report_status === "ready";
              return (
                <li key={a.id} className="py-3 flex flex-wrap items-center justify-between gap-3 text-sm">
                  <span>
                    <strong>{a.companies?.name}</strong>
                    <span className="block text-muted">
                      {day(a.completed_at)} · {levelShort(a.overall_score)} ({a.overall_score} su 100)
                    </span>
                  </span>
                  <span className="flex flex-wrap items-center gap-3">
                    <span className={`text-xs px-2.5 py-1 rounded-full ${ready ? "bg-navy text-white" : "bg-paper text-muted"}`}>
                      {ready
                        ? "Report approfondito pronto"
                        : a.report_status === "failed"
                          ? "Report in ritardo"
                          : arrival.has(a.id)
                            ? `Report in arrivo ${releaseLabel(arrival.get(a.id)!)}`
                            : "Report in preparazione"}
                    </span>
                    <Link href={`/area/report/${a.id}`} className="font-medium underline text-navy">
                      {ready ? "Apri il report" : `Apri l'${BRAND.reportName}`}
                    </Link>
                    {ready && (
                      <a href={`/api/report/${a.id}/pdf`} className="underline text-navy-soft">
                        PDF
                      </a>
                    )}
                  </span>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="mt-3 text-sm text-muted">Qui trova i report dopo il primo diagnostico.</p>
        )}
        {mine.length > 0 && (
          <p className="mt-3 text-sm">
            <Link href="/diagnostico" className="underline text-navy-soft">
              Ripeta il diagnostico
            </Link>{" "}
            <span className="text-muted">tra qualche mese per vedere i progressi: il report mette a confronto i due profili.</span>
          </p>
        )}
      </section>

      {memberOf.length > 0 && (
        <section className="mt-12">
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <h2 className="text-xl font-semibold text-navy">Approfondimenti e consulenze</h2>
            <Link href="/area/servizi" className="text-sm font-semibold text-navy underline">
              Tutti i servizi, acquisti e fatture
            </Link>
          </div>
          {mods.length === 0 && !nextBooking && hours === 0 ? (
            <p className="mt-3 text-sm text-muted">
              Dopo il report può andare più a fondo su un ambito, con un approfondimento in 8 sotto-ambiti, oppure confrontarsi per
              un&apos;ora con un nostro consulente senior.
            </p>
          ) : (
            <ul className="mt-4 divide-y divide-line border-y border-line text-sm">
              {mods.map((m) => (
                <li key={m.area} className="py-3 flex flex-wrap items-center justify-between gap-3">
                  <span>
                    <strong>Approfondimento {areaName(m.area)}</strong>
                  </span>
                  <span className="flex items-center gap-3">
                    <span
                      className={`text-xs px-2.5 py-1 rounded-full ${m.status === "pronto" ? "bg-navy text-white" : "bg-paper text-muted"}`}
                    >
                      {m.status === "pronto"
                        ? "Report pronto"
                        : m.status === "in analisi"
                          ? "Report in preparazione"
                          : m.status === "in corso"
                            ? "Da completare"
                            : "Da compilare"}
                    </span>
                    <Link href={m.id ? `/area/modulo/${m.id}` : "/area/servizi"} className="font-medium underline text-navy">
                      {m.status === "da iniziare" ? "Inizia" : "Apri"}
                    </Link>
                  </span>
                </li>
              ))}
              {(nextBooking || hours > 0) && (
                <li className="py-3 flex flex-wrap items-center justify-between gap-3">
                  <span>
                    <strong>Consulenza con un esperto</strong>
                    <span className="block text-muted">
                      {nextBooking ? `Prenotata per ${moment(nextBooking)}` : `${hours === 1 ? "Un'ora" : `${hours} ore`} da prenotare`}
                    </span>
                  </span>
                  <Link href="/area/servizi#consulenza" className="font-medium underline text-navy">
                    {nextBooking ? "Dettagli" : "Scegli l'orario"}
                  </Link>
                </li>
              )}
            </ul>
          )}
        </section>
      )}

      {teams.map((t) => (
        <section key={t.companyId} className="mt-12">
          <h2 className="text-xl font-semibold text-navy">Il management di {t.name}</h2>
          <p className="mt-1 text-sm text-muted">
            Lei è amministratore di questo spazio aziendale: vede le compilazioni dei colleghi che ha invitato, i temi su cui le risposte
            divergono e le ambizioni su cui convergono. Gli inviti si inviano dal report.
          </p>
          <div className="mt-6">
            <TeamView members={t.members} />
          </div>
          {t.invites.length > 0 && (
            <div className="mt-6">
              <h3 className="font-semibold text-navy">Inviti</h3>
              <ul className="mt-2 text-sm space-y-1">
                {t.invites.map((i) => (
                  <li key={i.id}>
                    {i.invitee_name ? `${i.invitee_name} · ` : ""}
                    {i.email} ·{" "}
                    <span className="text-muted">
                      {i.status === "accepted" ? "accettato" : i.expires_at < nowIso ? "scaduto" : i.sent_at ? "in attesa" : "non inviato"}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      ))}

      <section className="mt-12">
        <h2 className="text-xl font-semibold text-navy">I vostri documenti</h2>
        <p className="mt-1 text-sm text-muted">
          Visure, bilanci, business plan e altri documenti dell&apos;azienda. Caricando un bilancio più recente o il piano aziendale, il
          prossimo report approfondito ne terrà conto. Restano in un archivio privato per 24 mesi dall&apos;ultimo accesso; può eliminarli
          in qualsiasi momento.
        </p>
        {!memberOf.length && (
          <p className="mt-3 text-sm text-muted">Potrete aggiungere documenti dopo aver completato il primo diagnostico.</p>
        )}
        <DocumentList docs={docRows} companies={memberOf.map(({ id, name }) => ({ id, name }))} />
      </section>
    </>
  );
}
