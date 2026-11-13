import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import Report from "@/components/Report";
import { BRAND } from "@/config/brand";
import type { ReportInputs } from "@/lib/company-docs";
import { QUESTIONNAIRE_VERSION } from "@/lib/questionnaire";
import type { ReportNarrative } from "@/lib/report";
import { emptyResponses } from "@/lib/scoring";
import { hashShareToken, isShareToken, type ShareScope } from "@/lib/share";
import { supabaseService } from "@/lib/supabase/server";
import type { Responses } from "@/lib/types";

export const metadata: Metadata = { title: "Report condiviso", robots: { index: false, follow: false }, referrer: "no-referrer" };

export default function SharedReportPage({ params }: PageProps<"/condiviso/[token]">) {
  return (
    <Suspense fallback={<p className="mx-auto max-w-5xl px-4 py-10 text-muted">Caricamento…</p>}>
      <Shared params={params} />
    </Suspense>
  );
}

function Unavailable() {
  return (
    <div className="mx-auto max-w-xl px-4 py-20 text-center">
      <h1 className="text-2xl font-semibold text-navy">Questo link non è più valido</h1>
      <p className="mt-3 text-muted">
        Il report non è più condiviso: il link è scaduto oppure chi ve lo ha inviato lo ha ritirato. Chiedetegli di inviarvene uno nuovo.
      </p>
      <Link href="/" className="mt-6 inline-block underline text-navy-soft">
        Scoprite {BRAND.name}
      </Link>
    </div>
  );
}

async function Shared({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  if (!isShareToken(token)) return <Unavailable />;
  const db = supabaseService();
  const { data: share } = await db
    .from("report_shares")
    .select("id, assessment_id, scope, expires_at, revoked_at, views")
    .eq("token_hash", hashShareToken(token))
    .maybeSingle();
  if (!share || share.revoked_at || new Date(share.expires_at as string) <= new Date()) return <Unavailable />;
  const { data } = await db
    .from("assessments")
    .select("id, responses, completed_at, report_status, report_narrative, report_inputs, companies(name)")
    .eq("id", share.assessment_id)
    .maybeSingle();
  if (!data || data.report_status !== "ready" || !data.report_narrative) return <Unavailable />;
  const [{ data: done }] = await Promise.all([
    db.from("report_actions").select("action_key").eq("assessment_id", data.id),
    db
      .from("report_shares")
      .update({ views: (share.views as number) + 1, last_viewed_at: new Date().toISOString() })
      .eq("id", share.id),
  ]);

  const scope = share.scope as ShareScope;
  const inputs = data.report_inputs as ReportInputs | null;
  const saved = data.responses as Responses;
  const responses = {
    ...emptyResponses(),
    ...saved,
    ...(inputs?.financials ? { financials: inputs.financials } : {}),
    ...(inputs?.governance ? { governance: inputs.governance } : {}),
  };
  // la sintesi non porta con sé i numeri del bilancio, la governance né i testi liberi
  if (scope === "sintesi") {
    delete responses.financials;
    delete responses.governance;
    responses.objectivesText = "";
    responses.issuesText = "";
  }
  delete responses.people;
  const companyName = (data.companies as unknown as { name: string } | null)?.name;
  if (companyName && !responses.profile["PR-11"]) responses.profile = { ...responses.profile, "PR-11": companyName };
  return (
    <Report
      draft={{ version: QUESTIONNAIRE_VERSION, step: 0, responses, updatedAt: data.completed_at, completedAt: data.completed_at }}
      narrative={data.report_narrative as ReportNarrative}
      shared={scope}
      doneActions={((done ?? []) as { action_key: string }[]).map((x) => x.action_key)}
    />
  );
}
