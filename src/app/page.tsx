import Link from "next/link";
import { BRAND } from "@/config/brand";
import { AreaIcon } from "@/lib/areaIcons";
import { AREAS } from "@/lib/questionnaire";

export default function Home() {
  return (
    <div>
      <section className="bg-navy text-white">
        <div className="mx-auto max-w-5xl px-4 py-16 sm:py-24">
          <p className="text-sm uppercase tracking-widest text-white/70">Per imprese fino a 100 milioni di fatturato</p>
          <h1 className="mt-4 text-3xl sm:text-5xl font-semibold leading-tight max-w-3xl">
            Dove è solida la tua azienda, e dove conviene intervenire per primo.
          </h1>
          <p className="mt-6 text-lg text-white/85 max-w-2xl">
            Un diagnostico gratuito su 8 ambiti di gestione. In circa 15 minuti ricevi il profilo della tua azienda e le
            tre priorità su cui lavorare, calcolate con regole trasparenti a partire dai tuoi obiettivi.
          </p>
          <Link
            href="/diagnostico"
            className="mt-10 inline-block bg-white text-navy font-semibold px-6 py-3 rounded hover:bg-paper"
          >
            Inizia il diagnostico
          </Link>
          <p className="mt-3 text-sm text-white/70">Gratuito · circa 15 minuti · puoi interrompere e riprendere</p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-16 grid gap-10 sm:grid-cols-3">
        {[
          ["Cosa ricevi", "Un profilo a radar sugli 8 ambiti, le tre priorità con il motivo e gli eventuali punti in cui la tua valutazione potrebbe essere ottimista."],
          ["Come funziona", "Per ogni tema scegli la situazione più vicina alla tua azienda tra quattro descrizioni concrete. Il punteggio non dipende da un algoritmo opaco: le regole sono dichiarate."],
          ["Chi c'è dietro", `${BRAND.owner}, società di consulenza di strategia e creazione di valore. Se vuoi, puoi approfondire i risultati con un consulente esperto.`],
        ].map(([t, d]) => (
          <div key={t}>
            <h2 className="font-semibold text-navy">{t}</h2>
            <p className="mt-2 text-muted leading-relaxed">{d}</p>
          </div>
        ))}
      </section>

      <section className="bg-paper">
        <div className="mx-auto max-w-5xl px-4 py-16">
          <h2 className="text-2xl font-semibold text-navy">Gli 8 ambiti</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {AREAS.map((a) => (
              <div key={a.code} className="bg-white border border-line rounded-xl p-4 flex gap-4">
                <span className="shrink-0 size-11 rounded-xl bg-navy text-white flex items-center justify-center">
                  <AreaIcon code={a.code} className="size-5" />
                </span>
                <div>
                  <h3 className="font-semibold">{a.name}</h3>
                  <p className="mt-1 text-sm text-muted">{a.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
