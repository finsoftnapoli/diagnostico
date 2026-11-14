import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import ModuleReport from "@/components/ModuleReport";
import ModuleWizard from "@/components/ModuleWizard";
import type { ModuleNarrative } from "@/lib/module-report";
import { moduleContext } from "@/lib/module-context";
import { computeModule, emptyModuleResponses, type ModuleResponses } from "@/lib/module-scoring";
import { readReport, trackReport } from "@/lib/report-access";
import { currentUser, supabaseServer } from "@/lib/supabase/server";
import type { AreaCode } from "@/lib/types";

export default function ModulePage({ params }: PageProps<"/area/modulo/[id]">) {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <Link href="/area/servizi" className="no-print text-sm underline text-navy-soft">
        ← I servizi
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
  const { user, isStaff } = await currentUser();
  if (!user) redirect(`/accedi?next=/area/modulo/${id}`);
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const { data: m } = await sb
    .from("module_assessments")
    .select("id, area, status, responses, report_status, company_id, companies(name)")
    .eq("id", id)
    .maybeSingle();
  if (!m) notFound();
  const area = m.area as AreaCode;
  if (m.status !== "completed")
    return <ModuleWizard id={m.id} area={area} initial={{ ...emptyModuleResponses(), ...(m.responses as ModuleResponses) }} />;
  const { diagnosticScore, reference } = await moduleContext(sb, m.company_id as string, area);
  // il testo del report si legge dal server, solo quando è rilasciato; l'apertura da parte del cliente si registra
  const report = m.report_status === "ready" ? await readReport("module_assessments", id) : null;
  if (report?.narrative && !isStaff) await trackReport("modulo", id, user.id, "open");
  return (
    <ModuleReport
      id={m.id}
      area={area}
      company={(m.companies as unknown as { name: string } | null)?.name ?? ""}
      result={computeModule(area, { ...emptyModuleResponses(), ...(m.responses as ModuleResponses) })}
      diagnosticScore={diagnosticScore}
      reference={reference}
      pdfHref={report?.narrative ? `/api/moduli/${m.id}/pdf` : undefined}
      narrative={(report?.narrative as ModuleNarrative | null) ?? null}
      reviewed={report?.releasedBy === "staff"}
      failed={m.report_status === "failed"}
    />
  );
}
