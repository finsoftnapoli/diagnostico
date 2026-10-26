import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import InterestList from "@/components/InterestList";
import { listAssessments, listInterests, priorities } from "@/lib/admin";
import { AREAS } from "@/lib/questionnaire";
import { currentUser } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Area riservata" };

export default function AdminPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <Suspense fallback={<p className="text-muted">Caricamento…</p>}>
        <AdminList />
      </Suspense>
    </div>
  );
}

async function AdminList() {
  const { user, isStaff } = await currentUser();
  if (!user) redirect("/accedi?next=/admin");
  if (!isStaff) return <p>Questa area è riservata allo staff.</p>;
  const [rows, interests] = await Promise.all([listAssessments(), listInterests()]);
  return (
    <>
      <InterestList rows={interests} areaNames={Object.fromEntries(AREAS.map((a) => [a.code, a.name]))} />
      <div className="mt-12 flex flex-wrap items-baseline justify-between gap-4">
        <h1 className="text-2xl font-semibold text-navy">Compilazioni ({rows.length})</h1>
        <a href="/admin/export" download className="text-sm bg-navy text-white px-4 py-2 rounded">
          Scarica CSV
        </a>
      </div>
      <div className="mt-6 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left border-b border-line text-muted">
              <th className="py-2 pr-4 font-medium">Data</th>
              <th className="py-2 pr-4 font-medium">Azienda</th>
              <th className="py-2 pr-4 font-medium">Email</th>
              <th className="py-2 pr-4 font-medium">Fatturato</th>
              <th className="py-2 pr-4 font-medium">Media</th>
              <th className="py-2 font-medium">Priorità</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-b border-line align-top">
                <td className="py-2 pr-4 whitespace-nowrap">{new Date(r.completed_at).toLocaleDateString("it-IT")}</td>
                <td className="py-2 pr-4">
                  <Link href={`/admin/${r.id}`} className="underline text-navy-soft">
                    {r.companies?.name ?? "—"}
                  </Link>
                </td>
                <td className="py-2 pr-4">{r.respondent_email}</td>
                <td className="py-2 pr-4">{r.profile?.["PR-02"] ?? ""}</td>
                <td className="py-2 pr-4 tabular-nums">{r.overall_score}</td>
                <td className="py-2">{priorities(r).join(" · ")}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && <p className="mt-6 text-muted">Nessuna compilazione completata.</p>}
      </div>
    </>
  );
}
