// Report di un modulo in PDF, impaginato sul server. Per il cliente solo quando l'analisi è rilasciata;
// lo staff può scaricarlo anche in revisione, come anteprima.
import { renderToBuffer } from "@react-pdf/renderer";
import { siteUrl } from "@/config/site";
import { moduleContext } from "@/lib/module-context";
import type { ModuleNarrative } from "@/lib/module-report";
import { computeModule, emptyModuleResponses, type ModuleResponses } from "@/lib/module-scoring";
import { readReport, trackReport } from "@/lib/report-access";
import { currentUser, supabaseServer } from "@/lib/supabase/server";
import type { AreaCode } from "@/lib/types";
import ModulePdf from "@/pdf/ModulePdf";
import { modulePdfData } from "@/pdf/module-data";

export const maxDuration = 60;

export async function GET(_request: Request, ctx: RouteContext<"/api/moduli/[id]/pdf">) {
  const { id } = await ctx.params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) return new Response("Report non disponibile", { status: 404 });
  const { user, isStaff } = await currentUser();
  if (!user) return new Response("Accesso richiesto", { status: 401 });
  // la regola di accesso restituisce il modulo solo al suo autore o allo staff
  const sb = await supabaseServer();
  const { data: m } = await sb
    .from("module_assessments")
    .select("id, area, status, responses, report_status, completed_at, company_id, companies(name)")
    .eq("id", id)
    .maybeSingle();
  if (!m || m.status !== "completed" || !m.completed_at) return new Response("Report non disponibile", { status: 404 });
  if (m.report_status !== "ready" && !isStaff) return new Response("L'analisi non è ancora disponibile", { status: 404 });
  const report = await readReport("module_assessments", id);
  if (!report.narrative) return new Response("Report non disponibile", { status: 404 });
  if (!isStaff) await trackReport("modulo", id, user.id, "pdf");

  const area = m.area as AreaCode;
  const { diagnosticScore, reference } = await moduleContext(sb, m.company_id as string, area);
  const d = modulePdfData({
    area,
    company: (m.companies as unknown as { name: string } | null)?.name ?? "",
    result: computeModule(area, { ...emptyModuleResponses(), ...(m.responses as ModuleResponses) }),
    diagnosticScore,
    reference,
    narrative: report.narrative as ModuleNarrative,
    reviewed: report.releasedBy === "staff",
    completedAt: m.completed_at as string,
  });
  const pdf = await renderToBuffer(<ModulePdf d={d} siteUrl={siteUrl()} />);

  const slug = (s: string) =>
    s
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-zA-Z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  return new Response(new Uint8Array(pdf), {
    headers: {
      "content-type": "application/pdf",
      "content-disposition": `attachment; filename="${d.reportName}-${slug(d.areaName)}-${slug(d.company) || "azienda"}.pdf"`,
      "cache-control": "private, no-store",
    },
  });
}
