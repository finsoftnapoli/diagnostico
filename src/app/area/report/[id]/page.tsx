import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import Ottogramma from "@/components/Ottogramma";
import Report from "@/components/Report";
import type { ReportInputs } from "@/lib/company-docs";
import type { ReportNarrative } from "@/lib/report";
import { QUESTIONNAIRE_VERSION } from "@/lib/questionnaire";
import { emptyResponses } from "@/lib/scoring";
import { supabaseServer } from "@/lib/supabase/server";
import type { Responses } from "@/lib/types";

export default function SavedReportPage({ params }: PageProps<"/area/report/[id]">) {
  return (
    <Suspense fallback={<p className="mx-auto max-w-5xl px-4 py-10 text-muted">Caricamento…</p>}>
      <SavedReport params={params} />
    </Suspense>
  );
}

async function SavedReport({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sb = await supabaseServer();
  const { data: auth } = await sb.auth.getUser();
  if (!auth.user) redirect(`/accedi?next=/area/report/${id}`);
  // la regola di accesso restituisce la compilazione solo al suo autore, all'amministratore o allo staff
  const { data } = await sb.from("assessments").select("id, responses, completed_at, user_id, report_status, report_narrative, report_inputs").eq("id", id).maybeSingle();
  if (!data) notFound();
  // un bilancio più recente archiviato dopo la compilazione è quello usato nel report approfondito
  const inputs = data.report_status === "ready" ? (data.report_inputs as ReportInputs | null) : null;
  const draft = {
    version: QUESTIONNAIRE_VERSION,
    step: 0,
    responses: {
      ...emptyResponses(),
      ...(data.responses as Responses),
      ...(inputs?.financials ? { financials: inputs.financials } : {}),
      ...(inputs?.governance ? { governance: inputs.governance } : {}),
    },
    updatedAt: data.completed_at,
    completedAt: data.completed_at,
    savedId: data.id,
  };
  return (
    <>
      <div className="mx-auto max-w-5xl px-4 pt-6">
        <Link href="/area" className="text-sm underline text-navy-soft">
          ← Area personale
        </Link>
      </div>
      {data.report_status === "ready" && data.report_narrative ? (
        <Report draft={draft} narrative={data.report_narrative as ReportNarrative} sources={sourcesOf(inputs)} />
      ) : (
        <Ottogramma
          draft={draft}
          reportStatus={(data.report_status as "pending" | "failed" | undefined) ?? "pending"}
        />
      )}
    </>
  );
}

function sourcesOf(i: ReportInputs | null): string[] {
  if (!i) return [];
  const out: string[] = [];
  if (i.financials) out.push(`bilancio${i.financials.year ? ` ${i.financials.year}` : ""}`);
  if (i.governance) out.push("visura camerale");
  if (i.plan) out.push(`business plan${i.plan.periodo ? ` ${i.plan.periodo}` : ""}`);
  if (i.others?.length) out.push(i.others.length === 1 ? "un altro documento aziendale" : `${i.others.length} altri documenti aziendali`);
  return out;
}
