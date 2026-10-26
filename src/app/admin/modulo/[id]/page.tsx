import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import NarrativeEditor from "@/components/NarrativeEditor";
import { computeModule, emptyModuleResponses, type ModuleResponses } from "@/lib/module-scoring";
import { MODULE_QUESTIONS } from "@/lib/modules";
import { MODULE_SPEC } from "@/lib/narrative-spec";
import { AREAS } from "@/lib/questionnaire";
import { currentUser, supabaseService } from "@/lib/supabase/server";
import type { AreaCode } from "@/lib/types";

export default function AdminModulePage({ params }: PageProps<"/admin/modulo/[id]">) {
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
  if (!user) redirect(`/accedi?next=/admin/modulo/${id}`);
  if (!isStaff) return <p>Questa area è riservata allo staff.</p>;
  const { data: m } = await supabaseService()
    .from("module_assessments")
    .select("id, user_id, area, status, responses, score, report_status, report_narrative, completed_at, companies(name)")
    .eq("id", id)
    .maybeSingle();
  if (!m) notFound();
  const area = m.area as AreaCode;
  const r = { ...emptyModuleResponses(), ...(m.responses as ModuleResponses) };
  const res = computeModule(area, r);
  const themes = res.themes;
  return (
    <>
      <Link href="/admin" className="text-sm underline text-navy-soft">
        ← Area staff
      </Link>
      <h1 className="mt-3 text-2xl font-semibold text-navy">
        {(m.companies as unknown as { name: string } | null)?.name} · {AREAS.find((a) => a.code === area)?.name}
      </h1>
      <p className="text-sm text-muted">
        Modulo {m.status === "completed" ? `inviato il ${new Date(m.completed_at as string).toLocaleString("it-IT")}` : "in compilazione"} ·
        punteggio {m.score ?? "—"}
      </p>
      {m.status === "completed" && (
        <NarrativeEditor
          endpoint={`/api/admin/report/modulo/${m.id}`}
          spec={MODULE_SPEC}
          initial={(m.report_narrative as Record<string, unknown>) ?? null}
          status={m.report_status as string}
        />
      )}
      <h2 className="mt-10 font-semibold text-navy">Risposte</h2>
      <table className="mt-3 w-full text-sm">
        {res.subs.map((sa) => (
          <tbody key={sa.code}>
            <tr className="bg-paper">
              <td colSpan={2} className="py-2 px-2 font-semibold text-navy">
                {sa.name} · {sa.score ?? "n.a."}
              </td>
            </tr>
            {MODULE_QUESTIONS[area]
              .filter((q) => q.sub === sa.code)
              .map((q) => {
                const t = themes.find((x) => x.id === q.id);
                const l = r.levels?.[q.id];
                return (
                  <tr key={q.id} className="border-b border-line align-top">
                    <td className="py-2 pr-4 w-48 font-medium">{q.theme}</td>
                    <td className="py-2">
                      {l === 0 ? "Non applicabile" : l ? `Livello ${l}: ${q.levels[l - 1]}` : "—"}
                      {q.check && r.checks?.[q.id] && <span className="block text-muted">Verifica: {r.checks[q.id]}</span>}
                      {t?.flag && <span className="block text-accent">{t.flag}</span>}
                    </td>
                  </tr>
                );
              })}
          </tbody>
        ))}
      </table>
      {r.notes && (
        <>
          <h2 className="mt-8 font-semibold text-navy">Note dell&apos;azienda</h2>
          <p className="mt-2 text-sm whitespace-pre-line">{r.notes}</p>
        </>
      )}
    </>
  );
}
