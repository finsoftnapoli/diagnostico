import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import DocumentList, { type DocRow } from "@/components/DocumentList";
import TeamView from "@/components/TeamView";
import { BRAND } from "@/config/brand";
import { currentUser, supabaseServer } from "@/lib/supabase/server";
import { latestByMember, type MemberResult } from "@/lib/team";
import type { AreaCode } from "@/lib/types";

export const metadata: Metadata = { title: "Area personale" };

export default function AreaPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <Suspense fallback={<p className="text-muted">Caricamento…</p>}>
        <AreaContent />
      </Suspense>
    </div>
  );
}

type AssessmentRow = {
  id: string;
  user_id: string;
  company_id: string;
  respondent_email: string | null;
  completed_at: string;
  overall_score: number | null;
  companies: { name: string } | null;
  area_scores?: { area: string; score: number | null }[];
  answers?: { question_id: string; level: number }[];
};

async function AreaContent() {
  const { user, isStaff } = await currentUser();
  if (!user) redirect("/accedi?next=/area");
  const sb = await supabaseServer();

  const [{ data: mine }, { data: docs }, { data: adminOf }] = await Promise.all([
    sb
      .from("assessments")
      .select("id, user_id, company_id, respondent_email, completed_at, overall_score, companies(name)")
      .eq("user_id", user.id)
      .eq("status", "completed")
      .order("completed_at", { ascending: false }),
    sb.from("documents").select("id, kind, created_at, size_bytes, companies(name)").eq("user_id", user.id).order("created_at", { ascending: false }),
    sb.from("company_members").select("company_id, companies(name)").eq("user_id", user.id).eq("role", "admin"),
  ]);

  const teams = await Promise.all(
    (adminOf ?? []).map(async (c) => {
      const [{ data: rows }, { data: invites }] = await Promise.all([
        sb
          .from("assessments")
          .select("id, user_id, company_id, respondent_email, completed_at, overall_score, companies(name), area_scores(area, score), answers(question_id, level)")
          .eq("company_id", c.company_id)
          .eq("status", "completed"),
        sb.from("invitations").select("id, email, invitee_name, status, sent_at, expires_at").eq("company_id", c.company_id).order("created_at", { ascending: false }),
      ]);
      const latest = latestByMember(((rows ?? []) as unknown as AssessmentRow[]).map((r) => ({ ...r, userId: r.user_id, completedAt: r.completed_at })));
      const members: MemberResult[] = latest.map((r) => ({
        id: r.id,
        label: r.user_id === user.id ? "Tu" : (r.respondent_email ?? "Collega"),
        completedAt: r.completed_at,
        scores: Object.fromEntries((r.area_scores ?? []).map((s) => [s.area, s.score])) as Partial<Record<AreaCode, number | null>>,
        levels: Object.fromEntries((r.answers ?? []).map((a) => [a.question_id, a.level])),
      }));
      return { companyId: c.company_id, name: (c.companies as unknown as { name: string } | null)?.name ?? "", members, invites: invites ?? [] };
    }),
  );

  const docRows: DocRow[] = (docs ?? []).map((d) => ({
    id: d.id,
    kind: d.kind,
    created_at: d.created_at,
    size_bytes: d.size_bytes,
    company: (d.companies as unknown as { name: string } | null)?.name ?? null,
  }));

  return (
    <>
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h1 className="text-3xl font-semibold text-navy">Area personale</h1>
        <p className="text-sm text-muted">
          {user.email}
          {isStaff && (
            <>
              {" · "}
              <Link href="/admin" className="underline text-navy-soft">
                Area staff
              </Link>
            </>
          )}
        </p>
      </div>

      <section className="mt-10">
        <h2 className="text-xl font-semibold text-navy">I tuoi {BRAND.reportName}</h2>
        {mine?.length ? (
          <ul className="mt-4 divide-y divide-line border-y border-line">
            {(mine as unknown as AssessmentRow[]).map((a) => (
              <li key={a.id} className="py-3 flex flex-wrap items-center justify-between gap-3 text-sm">
                <span>
                  <strong>{a.companies?.name}</strong>
                  <span className="text-muted"> · {new Date(a.completed_at).toLocaleDateString("it-IT")} · punteggio {a.overall_score}</span>
                </span>
                <Link href={`/area/report/${a.id}`} className="underline text-navy-soft">
                  Apri il report
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-sm text-muted">
            Non hai ancora completato un diagnostico.{" "}
            <Link href="/diagnostico" className="underline">
              Inizia ora
            </Link>
            .
          </p>
        )}
      </section>

      {teams.map((t) => (
        <section key={t.companyId} className="mt-12">
          <h2 className="text-xl font-semibold text-navy">Il management di {t.name}</h2>
          <p className="mt-1 text-sm text-muted">
            Sei amministratore di questo spazio aziendale: vedi le compilazioni dei colleghi che hai invitato. Gli inviti si
            inviano dal report.
          </p>
          <div className="mt-6">
            <TeamView members={t.members} />
          </div>
          {t.invites.length > 0 && (
            <div className="mt-6">
              <h3 className="font-semibold text-navy">Inviti</h3>
              <ul className="mt-2 text-sm space-y-1">
                {t.invites.map((i) => (
                  <li key={i.id}>
                    {i.invitee_name ? `${i.invitee_name} · ` : ""}
                    {i.email} ·{" "}
                    <span className="text-muted">
                      {i.status === "accepted"
                        ? "accettato"
                        : new Date(i.expires_at) < new Date()
                          ? "scaduto"
                          : i.sent_at
                            ? "in attesa"
                            : "non inviato"}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      ))}

      <section className="mt-12">
        <h2 className="text-xl font-semibold text-navy">I tuoi documenti</h2>
        <p className="mt-1 text-sm text-muted">
          Visure e bilanci che hai caricato. Restano in un archivio privato per 24 mesi dall&apos;ultimo accesso; puoi
          eliminarli in qualsiasi momento.
        </p>
        <div className="mt-4">
          <DocumentList docs={docRows} />
        </div>
      </section>
    </>
  );
}
