import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import Ottogramma from "@/components/Ottogramma";
import Report from "@/components/Report";
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
  const { data } = await sb.from("assessments").select("id, responses, completed_at, user_id, report_status, report_narrative").eq("id", id).maybeSingle();
  if (!data) notFound();
  const draft = {
    version: QUESTIONNAIRE_VERSION,
    step: 0,
    responses: { ...emptyResponses(), ...(data.responses as Responses) },
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
        <Report draft={draft} narrative={data.report_narrative as ReportNarrative} />
      ) : (
        <Ottogramma
          draft={draft}
          reportStatus={(data.report_status as "pending" | "failed" | undefined) ?? "pending"}
        />
      )}
    </>
  );
}
