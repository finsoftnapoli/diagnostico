import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import ModuleReport from "@/components/ModuleReport";
import ModuleWizard from "@/components/ModuleWizard";
import type { ModuleNarrative } from "@/lib/module-report";
import { bandText, normativeBenchmark } from "@/config/benchmark";
import { computeModule, emptyModuleResponses, type ModuleResponses } from "@/lib/module-scoring";
import { supabaseServer } from "@/lib/supabase/server";
import type { AreaCode } from "@/lib/types";

export default function ModulePage({ params }: PageProps<"/area/modulo/[id]">) {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <Link href="/area/servizi" className="no-print text-sm underline text-navy-soft">
        ← I tuoi servizi
      </Link>
      <div className="mt-6">
        <Suspense fallback={<p className="text-muted">Caricamento…</p>}>
          <Module params={params} />
        </Suspense>
      </div>
    </div>
  );
}

async function Module({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sb = await supabaseServer();
  const { data: auth } = await sb.auth.getUser();
  if (!auth.user) redirect(`/accedi?next=/area/modulo/${id}`);
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const { data: m } = await sb
    .from("module_assessments")
    .select("id, area, status, responses, report_status, report_narrative, company_id, companies(name)")
    .eq("id", id)
    .maybeSingle();
  if (!m) notFound();
  const area = m.area as AreaCode;
  if (m.status !== "completed")
    return <ModuleWizard id={m.id} area={area} initial={{ ...emptyModuleResponses(), ...(m.responses as ModuleResponses) }} />;
  const { data: diag } = await sb
    .from("assessments")
    .select("profile, area_scores(area, score)")
    .eq("company_id", m.company_id)
    .eq("status", "completed")
    .order("completed_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  const diagnosticScore =
    (diag?.area_scores as { area: string; score: number | null }[] | undefined)?.find((s) => s.area === area)?.score ?? null;
  // riferimento indicativo dell'ambito per la fascia di fatturato del diagnostico
  const band = (diag?.profile as Record<string, string> | null)?.["PR-02"];
  const reference = band ? { value: normativeBenchmark(band).values[area], label: `Riferimento aziende ${bandText(band)}` } : null;
  return (
    <ModuleReport
      area={area}
      company={(m.companies as unknown as { name: string } | null)?.name ?? ""}
      result={computeModule(area, { ...emptyModuleResponses(), ...(m.responses as ModuleResponses) })}
      diagnosticScore={diagnosticScore}
      reference={reference}
      narrative={m.report_status === "ready" ? (m.report_narrative as ModuleNarrative) : null}
      failed={m.report_status === "failed"}
    />
  );
}
