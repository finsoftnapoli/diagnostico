import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import { getAssessment, priorities, scoreOf } from "@/lib/admin";
import { AREAS, ISSUES, OBJECTIVES, PROFILE_FIELDS, QUESTIONS } from "@/lib/questionnaire";
import { currentUser } from "@/lib/supabase/server";

export default function DetailPage({ params }: PageProps<"/admin/[id]">) {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <Suspense fallback={<p className="text-muted">Caricamento…</p>}>
        <Detail params={params} />
      </Suspense>
    </div>
  );
}

async function Detail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { user, isStaff } = await currentUser();
  if (!user) redirect("/accedi");
  if (!isStaff) return <p>Questa area è riservata allo staff.</p>;
  const r = await getAssessment(id);
  if (!r) notFound();
  const label = (list: { code: string; label: string }[], c: string) => list.find((x) => x.code === c)?.label ?? c;
  return (
    <>
      <Link href="/admin" className="text-sm underline text-navy-soft">
        ← Tutte le compilazioni
      </Link>
      <h1 className="mt-3 text-2xl font-semibold text-navy">{r.companies?.name}</h1>
      <p className="text-muted text-sm">
        {r.respondent_email} · {new Date(r.completed_at).toLocaleString("it-IT")} · provenienza {r.source}
      </p>

      <h2 className="mt-8 font-semibold text-navy">Profilo</h2>
      <dl className="mt-2 grid sm:grid-cols-2 gap-x-6 gap-y-1 text-sm">
        {PROFILE_FIELDS.map((f) => (
          <div key={f.id} className="flex gap-2">
            <dt className="text-muted">{f.label}:</dt>
            <dd>{r.profile?.[f.id] ?? "—"}</dd>
          </div>
        ))}
      </dl>

      <h2 className="mt-8 font-semibold text-navy">Obiettivi e criticità</h2>
      <div className="mt-2 grid sm:grid-cols-2 gap-6 text-sm">
        <div>
          <ol className="list-decimal pl-5">{(r.objectives ?? []).map((c) => <li key={c}>{label(OBJECTIVES, c)}</li>)}</ol>
          {r.objectives_text && <p className="mt-2 italic text-muted">“{r.objectives_text}”</p>}
        </div>
        <div>
          <ol className="list-decimal pl-5">{(r.issues ?? []).map((c) => <li key={c}>{label(ISSUES, c)}</li>)}</ol>
          {r.issues_text && <p className="mt-2 italic text-muted">“{r.issues_text}”</p>}
        </div>
      </div>

      <h2 className="mt-8 font-semibold text-navy">Punteggi · media {r.overall_score}</h2>
      <p className="text-sm">Priorità: {priorities(r).join(" · ")}</p>
      <table className="mt-3 w-full text-sm">
        <tbody>
          {AREAS.map((a) => (
            <tr key={a.code} className="border-b border-line align-top">
              <td className="py-2 pr-4 font-medium w-56">
                {a.name} <span className="text-muted">({scoreOf(r, a.code)})</span>
              </td>
              <td className="py-2">
                {QUESTIONS.filter((q) => q.area === a.code).map((q) => {
                  const ans = r.answers?.find((x) => x.question_id === q.id);
                  return (
                    <div key={q.id} className="mb-1">
                      {q.theme}: livello {ans?.level ?? "—"} · verifica “{ans?.check_answer ?? "—"}”
                      {ans?.overestimate_flag && <span className="ml-2 text-accent">possibile sovrastima</span>}
                    </div>
                  );
                })}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
