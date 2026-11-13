import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { RECOMMENDATIONS, SOURCES } from "@/config/recommendations";
import { LEVEL_NAMES } from "@/lib/levels";
import { AREAS, QUESTIONS } from "@/lib/questionnaire";
import { currentUser } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Libreria delle raccomandazioni" };

export default function LibraryPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <Suspense fallback={<p className="text-muted">Caricamento…</p>}>
        <Library />
      </Suspense>
    </div>
  );
}

async function Library() {
  const { user, isStaff } = await currentUser();
  if (!user) redirect("/accedi?next=/admin/raccomandazioni");
  if (!isStaff) return <p>Questa area è riservata allo staff.</p>;
  return (
    <>
      <nav className="mb-6 text-sm">
        <Link href="/admin" className="underline text-navy-soft">
          ← Area staff
        </Link>
      </nav>
      <h1 className="text-2xl font-semibold text-navy">Libreria delle raccomandazioni</h1>
      <p className="mt-1 text-sm text-muted max-w-3xl">
        {RECOMMENDATIONS.length} schede: per ogni tema, che cosa fare per salire di un livello. Sono la base delle azioni scritte nei report
        e del riquadro «Come fare» del report online. Si modificano in <code>src/config/recommendations.ts</code>.
      </p>
      {AREAS.map((a) => (
        <section key={a.code} className="mt-10">
          <h2 className="text-xl font-semibold text-navy">{a.name}</h2>
          {QUESTIONS.filter((q) => q.area === a.code).map((q) => (
            <div key={q.id} className="mt-5">
              <h3 className="font-semibold">
                {q.id} · {q.theme}
              </h3>
              <div className="mt-2 grid gap-3 md:grid-cols-3">
                {RECOMMENDATIONS.filter((x) => x.theme === q.id).map((x) => (
                  <article key={x.from} className="rounded-xl border border-line p-3 text-sm">
                    <p className="text-xs uppercase tracking-wide text-muted">
                      Da «{LEVEL_NAMES[x.from - 1]}» a «{LEVEL_NAMES[x.from]}» · {x.time}
                    </p>
                    <p className="mt-1 font-semibold text-navy">{x.title}</p>
                    <ol className="mt-2 list-decimal pl-4 space-y-1">
                      {x.actions.map((t) => (
                        <li key={t}>{t}</li>
                      ))}
                    </ol>
                    <p className="mt-2">
                      <span className="text-muted">Strumento:</span> {x.tool}
                    </p>
                    <p className="mt-1">
                      <span className="text-muted">Funziona se:</span> {x.indicator}
                    </p>
                    <p className="mt-1">
                      <span className="text-muted">Errore da evitare:</span> {x.pitfall}
                    </p>
                    {x.sources?.length ? (
                      <p className="mt-1 text-xs text-muted">Riferimenti: {x.sources.map((k) => SOURCES[k].label).join("; ")}</p>
                    ) : null}
                  </article>
                ))}
              </div>
            </div>
          ))}
        </section>
      ))}
      <section className="mt-12">
        <h2 className="text-xl font-semibold text-navy">Riferimenti</h2>
        <ul className="mt-3 space-y-3 text-sm">
          {Object.entries(SOURCES).map(([k, s]) => (
            <li key={k}>
              <strong>{s.label}</strong> <span className="text-muted">· verificato a {s.checked}</span>
              <span className="block text-muted">{s.note}</span>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
