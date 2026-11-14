import { CircleAlert, FileText, Quote } from "lucide-react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import NarrativeEditor from "@/components/NarrativeEditor";
import { normativeBenchmark } from "@/config/benchmark";
import { getAssessment } from "@/lib/admin";
import { AreaIcon } from "@/lib/areaIcons";
import { financialKpis } from "@/lib/documents";
import { levelLabel } from "@/lib/insights";
import { DIAGNOSTIC_SPEC } from "@/lib/narrative-spec";
import { AREAS, ISSUES, OBJECTIVES, PROFILE_FIELDS, QUESTIONS } from "@/lib/questionnaire";
import { areaReading, overallReading } from "@/lib/score-meaning";
import { currentUser } from "@/lib/supabase/server";
import type { AreaCode, Financials } from "@/lib/types";
import GrantCredit from "@/components/GrantCredit";
import ReleaseInfo from "@/components/ReleaseInfo";
import { readReport, reportUsage } from "@/lib/report-access";

export default function DetailPage({ params }: PageProps<"/admin/[id]">) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <Suspense fallback={<p className="text-muted">Caricamento…</p>}>
        <Detail params={params} />
      </Suspense>
    </div>
  );
}

const pct = (v: number | null) => (v === null ? "—" : `${v.toLocaleString("it-IT")}%`);
const eur = (v: number | null | undefined) =>
  v === null || v === undefined
    ? "—"
    : Math.abs(v) >= 1_000_000
      ? `${(v / 1_000_000).toLocaleString("it-IT", { maximumFractionDigits: 1 })} mln €`
      : `${Math.round(v / 1000).toLocaleString("it-IT")} mila €`;

async function Detail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { user, isStaff } = await currentUser();
  if (!user) redirect("/accedi?next=/admin");
  if (!isStaff) return <p>Questa area è riservata allo staff.</p>;
  const r = await getAssessment(id);
  if (!r) notFound();
  const [release, usage] = await Promise.all([readReport("assessments", id), reportUsage("diagnostico", [id])]);
  const label = (list: { code: string; label: string }[], c: string) => list.find((x) => x.code === c)?.label ?? c;
  const names = Object.fromEntries(AREAS.map((a) => [a.code, a.name]));
  const bench = normativeBenchmark(r.profile?.["PR-02"]);
  const levelOf = (qid: string) => r.answers?.find((x) => x.question_id === qid)?.level ?? 1;
  const allLevels = QUESTIONS.map((q) => levelOf(q.id));
  const refAvg = Math.round(AREAS.reduce((s, a) => s + bench.values[a.code], 0) / AREAS.length);
  const computed = [...r.area_scores]
    .filter((s) => s.is_priority)
    .sort((a, b) => (a.rank ?? 9) - (b.rank ?? 9))
    .map((s) => s.area);
  const flags = (r.answers ?? []).filter((a) => a.overestimate_flag).length;
  const inputs = (r.report_inputs ?? null) as { financials?: Financials } | null;
  const fin = inputs?.financials ?? (r.responses as { financials?: Financials } | null)?.financials ?? null;
  const k = fin ? financialKpis(fin) : null;

  return (
    <>
      <Link href="/admin" className="text-sm underline text-navy-soft">
        ← Tutte le compilazioni
      </Link>
      <div className="mt-3 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-navy">{r.companies?.name}</h1>
          <p className="text-muted text-sm">
            {r.respondent_email} · {new Date(r.completed_at).toLocaleString("it-IT", { timeZone: "Europe/Rome" })} · provenienza {r.source}
          </p>
        </div>
        <Link href={`/area/report/${r.id}`} className="text-sm underline text-navy-soft">
          Pagina del cliente
        </Link>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem] items-start">
        <NarrativeEditor
          endpoint={`/api/admin/report/diagnostico/${r.id}`}
          spec={DIAGNOSTIC_SPEC}
          initial={r.report_narrative ?? null}
          status={r.report_status}
          labels={names}
          pdfHref={`/api/report/${r.id}/pdf`}
          expected={{ priorities: computed }}
        />

        {/* contesto per chi rivede, sempre a portata */}
        <aside className="space-y-4 text-sm lg:sticky lg:top-4 lg:max-h-[calc(100vh-2rem)] lg:overflow-y-auto lg:pr-1">
          <ReleaseInfo
            endpoint={`/api/admin/report/diagnostico/${id}`}
            status={r.report_status}
            checks={release.checks}
            releasedBy={release.releasedBy}
            releasedAt={release.releasedAt}
            usage={usage.get(id)}
          />
          <Box title="Accredito di servizi">
            <GrantCredit assessmentId={id} />
          </Box>
          <Box title="Il quadro">
            <p>
              <span className="text-2xl font-semibold text-navy tabular-nums">{r.overall_score ?? "—"}</span>
              <span className="text-muted">/100 · {levelLabel(r.overall_score)}</span>
              <span className="text-muted"> · riferimento {refAvg}</span>
            </p>
            <div className="mt-2 space-y-1.5 text-xs leading-relaxed text-muted">
              {overallReading(r.overall_score, refAvg, allLevels).map((x) => (
                <p key={x}>{x}</p>
              ))}
            </div>
            <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-muted">Priorità calcolate</p>
            <ol className="mt-1 space-y-1">
              {computed.map((c, i) => (
                <li key={c} className="flex items-center gap-2">
                  <span className="size-5 rounded-full bg-navy text-white text-[11px] font-semibold flex items-center justify-center">
                    {i + 1}
                  </span>
                  {names[c]}
                </li>
              ))}
            </ol>
            {flags > 0 && (
              <p className="mt-3 flex items-start gap-1.5 text-xs text-accent">
                <CircleAlert className="size-3.5 mt-0.5 shrink-0" aria-hidden /> {flags === 1 ? "Una risposta" : `${flags} risposte`} con
                possibile sovrastima: il report dovrebbe tenerne conto.
              </p>
            )}
          </Box>

          <Box title="Ambizioni e sfide">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">Obiettivi</p>
            <ol className="mt-1 list-decimal pl-5">
              {(r.objectives ?? []).map((c) => (
                <li key={c}>{label(OBJECTIVES, c)}</li>
              ))}
            </ol>
            {r.objectives_text && <Said text={r.objectives_text} />}
            <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-muted">Criticità</p>
            <ol className="mt-1 list-decimal pl-5">
              {(r.issues ?? []).map((c) => (
                <li key={c}>{label(ISSUES, c)}</li>
              ))}
            </ol>
            {r.issues_text && <Said text={r.issues_text} />}
          </Box>

          <Box title="Ambiti e risposte">
            <ul className="space-y-3">
              {AREAS.map((a) => {
                const sc = r.area_scores.find((s) => s.area === a.code);
                const qs = QUESTIONS.filter((q) => q.area === a.code);
                const ref = bench.values[a.code as AreaCode];
                return (
                  <li key={a.code}>
                    <details>
                      <summary className="flex cursor-pointer list-none items-center gap-2">
                        <AreaIcon code={a.code} className="size-4 text-navy" />
                        <span className="flex-1 font-medium">{a.name}</span>
                        {sc?.is_priority && <span className="rounded-full bg-navy px-1.5 text-[10px] text-white">P{sc.rank}</span>}
                        <span className="tabular-nums font-semibold">{sc?.score ?? "—"}</span>
                        <span className="w-8 text-right text-xs text-muted tabular-nums">/{ref}</span>
                      </summary>
                      <p className="mt-1.5 text-xs leading-relaxed text-muted">
                        {areaReading(
                          sc?.score ?? null,
                          ref,
                          qs.map((q) => levelOf(q.id)),
                        )}
                      </p>
                      <ul className="mt-1.5 space-y-1 text-xs">
                        {qs.map((q) => {
                          const ans = r.answers?.find((x) => x.question_id === q.id);
                          const lvl = ans?.level ?? 1;
                          return (
                            <li key={q.id} className="rounded-md bg-paper px-2 py-1.5">
                              <span className="font-medium">{q.theme}</span> · livello {lvl}
                              {ans?.check_answer && <span className="text-muted"> · verifica «{ans.check_answer}»</span>}
                              {ans?.overestimate_flag && <span className="ml-1 font-semibold text-accent">possibile sovrastima</span>}
                              <span className="block text-muted">{q.levels[lvl - 1]}</span>
                            </li>
                          );
                        })}
                      </ul>
                    </details>
                  </li>
                );
              })}
            </ul>
          </Box>

          {fin && k && (
            <Box title={`Bilancio${fin.year ? ` ${fin.year}` : ""}`}>
              <dl className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs">
                <Kv k="Ricavi" v={eur(fin.ricavi ?? fin.valore_produzione)} />
                <Kv k="EBITDA" v={`${eur(fin.ebitda)} · ${pct(k.ebitdaMargin)}`} />
                <Kv k="Utile netto" v={`${eur(fin.utile_netto)} · ${pct(k.netMargin)}`} />
                <Kv k="Patrimonio netto" v={`${eur(fin.patrimonio_netto)} · ${pct(k.equityRatio)}`} />
                <Kv k="PFN" v={eur(k.pfn)} />
                <Kv k="Giorni di incasso" v={k.dso === null ? "—" : String(k.dso)} />
              </dl>
              {k.notes.length > 0 && (
                <ul className="mt-2 list-disc pl-4 text-xs text-muted">
                  {k.notes.map((n) => (
                    <li key={n}>{n}</li>
                  ))}
                </ul>
              )}
            </Box>
          )}

          <Box title="Profilo">
            <dl className="space-y-1 text-xs">
              {PROFILE_FIELDS.map((f) => (
                <div key={f.id} className="flex gap-2">
                  <dt className="w-32 shrink-0 text-muted">{f.label}</dt>
                  <dd>{r.profile?.[f.id] ?? "—"}</dd>
                </div>
              ))}
            </dl>
          </Box>
        </aside>
      </div>
    </>
  );
}

function Box({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-line bg-white p-4">
      <h2 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-navy">
        <FileText className="size-4" aria-hidden /> {title}
      </h2>
      {children}
    </section>
  );
}

function Said({ text }: { text: string }) {
  return (
    <p className="mt-2 flex gap-1.5 rounded-md bg-paper px-2.5 py-2 text-xs italic text-ink">
      <Quote className="size-3.5 shrink-0 text-muted" aria-hidden /> {text}
    </p>
  );
}

function Kv({ k, v }: { k: string; v: string }) {
  return (
    <>
      <dt className="text-muted">{k}</dt>
      <dd className="text-right tabular-nums">{v}</dd>
    </>
  );
}
