// Report del diagnostico in PDF, impaginato sul server. Per il cliente solo quando il report è approvato;
// lo staff può scaricarlo anche in revisione, come anteprima.
import { renderToBuffer } from "@react-pdf/renderer";
import { medianBenchmark, normativeBenchmark } from "@/config/benchmark";
import { siteUrl } from "@/config/site";
import { realBenchmark } from "@/lib/benchmark-server";
import type { ReportInputs } from "@/lib/company-docs";
import type { ReportNarrative } from "@/lib/report";
import { emptyResponses } from "@/lib/scoring";
import { currentUser, supabaseServer } from "@/lib/supabase/server";
import type { Responses } from "@/lib/types";
import ReportPdf from "@/pdf/ReportPdf";
import { reportPdfData } from "@/pdf/report-data";

export const maxDuration = 60;

function sourcesOf(i: ReportInputs | null): string[] {
  if (!i) return [];
  const out: string[] = [];
  if (i.financials) out.push(`bilancio${i.financials.year ? ` ${i.financials.year}` : ""}`);
  if (i.governance) out.push("visura camerale");
  if (i.plan) out.push(`business plan${i.plan.periodo ? ` ${i.plan.periodo}` : ""}`);
  if (i.others?.length) out.push(i.others.length === 1 ? "un altro documento aziendale" : `${i.others.length} altri documenti aziendali`);
  return out;
}

export async function GET(request: Request, ctx: RouteContext<"/api/report/[id]/pdf">) {
  const { id } = await ctx.params;
  const { user, isStaff } = await currentUser();
  if (!user) return new Response("Accesso richiesto", { status: 401 });
  // la regola di accesso restituisce la compilazione solo al suo autore, all'amministratore o allo staff
  const sb = await supabaseServer();
  const { data } = await sb
    .from("assessments")
    .select("id, responses, completed_at, report_status, report_narrative, report_inputs")
    .eq("id", id)
    .maybeSingle();
  if (!data?.report_narrative || !data.completed_at) return new Response("Report non disponibile", { status: 404 });
  if (data.report_status !== "ready" && !isStaff) return new Response("Il report non è ancora stato approvato", { status: 404 });

  const inputs = data.report_inputs as ReportInputs | null;
  const r: Responses = {
    ...emptyResponses(),
    ...(data.responses as Responses),
    ...(inputs?.financials ? { financials: inputs.financials } : {}),
    ...(inputs?.governance ? { governance: inputs.governance } : {}),
  };
  const band = r.profile["PR-02"];
  const bench = (band ? medianBenchmark(await realBenchmark(band)) : null) ?? normativeBenchmark(band);
  const d = reportPdfData(r, data.report_narrative as ReportNarrative, bench, data.completed_at as string, sourcesOf(inputs));
  const pdf = await renderToBuffer(<ReportPdf d={d} siteUrl={siteUrl()} />);

  const slug = d.company
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  const day = (data.completed_at as string).slice(0, 10);
  return new Response(new Uint8Array(pdf), {
    headers: {
      "content-type": "application/pdf",
      "content-disposition": `attachment; filename="${d.reportName}-${slug || "azienda"}-${day}.pdf"`,
      "cache-control": "private, no-store",
    },
  });
}
