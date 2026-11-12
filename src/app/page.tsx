import { ArrowRight, Award, Clock, FileText, Gauge, PauseCircle, Radar, Scale, Users } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import ExampleOttogramma from "@/components/ExampleOttogramma";
import JsonLd from "@/components/JsonLd";
import { areaPage } from "@/config/ambiti";
import { BRAND } from "@/config/brand";
import { FAQ } from "@/config/faq";
import { siteUrl } from "@/config/site";
import { AreaIcon } from "@/lib/areaIcons";
import { AREAS } from "@/lib/questionnaire";

const TITLE = `Diagnostico aziendale gratuito per PMI · ${BRAND.name}`;
const DESCRIPTION = `Check-up gratuito della vostra azienda su 8 ambiti di gestione: strategia, finanza, vendite, persone, operations, digitale, innovazione e sostenibilità. Subito l'${BRAND.reportName} con il confronto con aziende simili, ${BRAND.reportPromise} il report con le priorità.`;

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: { title: TITLE, description: DESCRIPTION, url: "/", images: ["/opengraph-image"] },
};

const STEPS = [
  [
    "Rispondete su 8 ambiti",
    `Una domanda alla volta: per ogni tema scegliete tra quattro descrizioni concrete quella più vicina alla situazione di oggi. Mentre rispondete si disegna l'${BRAND.reportName}.`,
  ],
  [
    "Raccontate ambizioni e sfide",
    "Dove volete portare l'azienda e che cosa oggi la frena. Se avete visura e bilancio, in PDF o nel formato XBRL del Registro Imprese, li leggiamo noi e compiliamo i dati.",
  ],
  [
    `Leggete l'${BRAND.reportName}`,
    "Il profilo della vostra azienda, il confronto con aziende della stessa fascia di fatturato e le evidenze chiave, subito.",
  ],
  [
    "Ricevete il report approfondito",
    `Per email, ${BRAND.reportPromise}: le tre priorità, le cause delle sfide e gli interventi da cui partire.`,
  ],
];

export default function Home() {
  const url = siteUrl();
  return (
    <div>
      <JsonLd
        data={[
          {
            "@context": "https://schema.org",
            "@type": "Organization",
            name: BRAND.ownerLegal,
            url,
            email: BRAND.contactEmail,
            brand: { "@type": "Brand", name: BRAND.name },
          },
          { "@context": "https://schema.org", "@type": "WebSite", name: BRAND.name, url, inLanguage: "it-IT" },
          {
            "@context": "https://schema.org",
            "@type": "Service",
            name: `Diagnostico aziendale · ${BRAND.reportName}`,
            serviceType: "Diagnostico gestionale per piccole e medie imprese",
            provider: { "@type": "Organization", name: BRAND.ownerLegal },
            areaServed: { "@type": "Country", name: "Italia" },
            audience: { "@type": "BusinessAudience", name: "Piccole e medie imprese" },
            offers: [{ "@type": "Offer", name: "Diagnostico sugli 8 ambiti", price: 0, priceCurrency: "EUR" }],
          },
          {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: FAQ.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
          },
        ]}
      />

      <section className="bg-navy text-white">
        <div className="mx-auto max-w-5xl px-4 py-14 sm:py-20 grid gap-10 lg:grid-cols-[1.25fr_1fr] items-center">
          <div>
            <p className="text-sm uppercase tracking-widest text-white/70">Diagnostico aziendale gratuito per PMI</p>
            <h1 className="mt-4 text-3xl sm:text-5xl font-semibold leading-tight">
              Dove è solida la vostra azienda, e dove conviene intervenire per primo.
            </h1>
            <p className="mt-6 text-lg text-white/85 max-w-2xl">
              Un check-up della gestione su 8 ambiti, frutto di 40 anni di esperienza in piccole e grandi aziende. Mentre rispondete si
              disegna l&apos;{BRAND.reportName}, il profilo della vostra azienda: alla fine lo leggete a confronto con aziende simili e{" "}
              {BRAND.reportPromise} ricevete il report approfondito con le priorità.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Link
                href="/diagnostico"
                className="inline-flex items-center gap-2 bg-white text-navy font-semibold px-6 py-3 rounded-lg hover:bg-paper"
              >
                Inizia il diagnostico <ArrowRight className="size-4" aria-hidden />
              </Link>
              <a href="#come-funziona" className="text-white/85 underline underline-offset-4 hover:text-white">
                Come funziona
              </a>
            </div>
            <p className="mt-3 text-sm text-white/70">Gratuito · circa 15 minuti · vi fermate e riprendete quando volete</p>
          </div>
          <figure className="bg-white rounded-2xl p-4 sm:p-6 mx-auto w-full max-w-sm">
            <div className="flex justify-center">
              <ExampleOttogramma size={290} />
            </div>
            <figcaption className="mt-2 text-center text-xs text-muted">
              Un esempio di {BRAND.reportName}: più un vertice è lontano dal centro, più le pratiche di quell&apos;ambito sono mature.
            </figcaption>
          </figure>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 pt-16">
        <h2 className="text-2xl font-semibold text-navy">Un quarto d&apos;ora ben speso</h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              icon: Clock,
              t: "Circa 15 minuti, una domanda alla volta",
              d: "24 domande con risposte concrete tra cui scegliere. Non serve preparare nulla: basta conoscere l'azienda.",
            },
            {
              icon: PauseCircle,
              t: "Vi fermate e riprendete quando volete",
              d: "Le risposte si salvano da sole: potete interrompere e continuare più tardi, anche da un altro dispositivo.",
            },
            {
              icon: Users,
              t: "Lo condividete con i collaboratori",
              d: "Invitate soci e responsabili a compilarlo: vedete le visioni a confronto e i temi su cui il management non è allineato.",
            },
            {
              icon: Award,
              t: "40 anni di esperienza, per le PMI",
              d: "Il metodo nasce dal lavoro in piccole e grandi aziende e porta alle PMI competenze manageriali d'avanguardia, che di solito non hanno a disposizione.",
            },
          ].map(({ icon: Icon, t, d }) => (
            <div key={t}>
              <Icon className="size-6 text-navy" aria-hidden strokeWidth={1.75} />
              <h3 className="mt-3 font-semibold text-navy">{t}</h3>
              <p className="mt-2 text-sm text-muted leading-relaxed">{d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-16">
        <h2 className="text-2xl font-semibold text-navy">Cosa ricevete</h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-3">
          {[
            {
              icon: Radar,
              t: `L'${BRAND.reportName}, subito`,
              d: "Il profilo a radar sugli 8 ambiti di gestione, con i punti di forza, le fragilità e l'equilibrio complessivo dell'azienda.",
            },
            {
              icon: Scale,
              t: "Il confronto con aziende simili",
              d: "Ogni ambito a confronto con le aziende della stessa fascia di fatturato, per capire dove siete avanti e dove indietro.",
            },
            {
              icon: FileText,
              t: `Il report approfondito, ${BRAND.reportPromise}`,
              d: "Le tre priorità collegate alle vostre ambizioni e alle vostre sfide, con gli interventi da cui partire e, se caricate il bilancio, i numeri chiave.",
            },
          ].map(({ icon: Icon, t, d }) => (
            <div key={t}>
              <Icon className="size-6 text-navy" aria-hidden strokeWidth={1.75} />
              <h3 className="mt-3 font-semibold text-navy">{t}</h3>
              <p className="mt-2 text-muted leading-relaxed">{d}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="come-funziona" className="bg-paper scroll-mt-4">
        <div className="mx-auto max-w-5xl px-4 py-16">
          <h2 className="text-2xl font-semibold text-navy">Come funziona il diagnostico</h2>
          <ol className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map(([t, d], i) => (
              <li key={t} className="bg-white border border-line rounded-xl p-5">
                <span className="size-8 rounded-full bg-navy text-white text-sm font-semibold flex items-center justify-center">
                  {i + 1}
                </span>
                <h3 className="mt-3 font-semibold">{t}</h3>
                <p className="mt-2 text-sm text-muted leading-relaxed">{d}</p>
              </li>
            ))}
          </ol>
          <p className="mt-6 text-sm text-muted max-w-3xl">
            Il diagnostico applica la nostra metodologia proprietaria, costruita sull&apos;esperienza di consulenza di direzione: algoritmi
            e sistemi di analisi trasformano le risposte in indicazioni concrete per la vostra azienda. Ogni report passa da controlli di
            qualità e dalla supervisione dei nostri esperti.{" "}
            <Link href="/metodo" className="underline text-navy-soft">
              Il nostro metodo
            </Link>
            .
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-16">
        <h2 className="text-2xl font-semibold text-navy">Gli 8 ambiti di gestione</h2>
        <p className="mt-2 text-muted max-w-3xl">
          Tre temi per ambito nel diagnostico gratuito; otto sotto-ambiti per ciascuno negli approfondimenti.
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {AREAS.map((a) => (
            <Link
              key={a.code}
              href={`/ambiti/${areaPage(a.code).slug}`}
              className="group bg-white border border-line rounded-xl p-4 flex gap-4 hover:border-navy-soft"
            >
              <span className="shrink-0 size-11 rounded-xl bg-navy text-white flex items-center justify-center">
                <AreaIcon code={a.code} className="size-5" />
              </span>
              <span>
                <span className="block font-semibold group-hover:underline">{a.name}</span>
                <span className="mt-1 block text-sm text-muted">{a.description}</span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-paper">
        <div className="mx-auto max-w-5xl px-4 py-16 grid gap-10 md:grid-cols-2">
          <div>
            <Users className="size-6 text-navy" aria-hidden strokeWidth={1.75} />
            <h2 className="mt-3 text-xl font-semibold text-navy">Più manager, una visione comune</h2>
            <p className="mt-2 text-muted leading-relaxed">
              Invitate i responsabili dell&apos;azienda a compilare il diagnostico: nell&apos;area personale vedete le diverse visioni a
              confronto e i temi su cui il management non è allineato.
            </p>
          </div>
          <div>
            <Gauge className="size-6 text-navy" aria-hidden strokeWidth={1.75} />
            <h2 className="mt-3 text-xl font-semibold text-navy">I numeri della vostra azienda</h2>
            <p className="mt-2 text-muted leading-relaxed">
              Caricate la visura e il bilancio, in PDF o nel formato XBRL depositato al Registro Imprese: compiliamo i dati
              dell&apos;azienda e il report aggiunge marginalità, indebitamento, giorni di incasso e governance. Più avanti potete
              aggiungere bilanci aggiornati e il business plan.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-paper">
        <div className="mx-auto max-w-3xl px-4 py-16">
          <h2 className="text-2xl font-semibold text-navy">Domande frequenti</h2>
          <div className="mt-6 divide-y divide-line border-y border-line">
            {FAQ.map((f) => (
              <details key={f.q} className="group py-4">
                <summary className="cursor-pointer font-semibold list-none flex justify-between gap-4">
                  {f.q}
                  <span className="text-navy-soft group-open:rotate-45 transition-transform" aria-hidden>
                    +
                  </span>
                </summary>
                <p className="mt-2 text-muted leading-relaxed">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-navy text-white">
        <div className="mx-auto max-w-5xl px-4 py-14 flex flex-wrap items-center justify-between gap-6">
          <div>
            <h2 className="text-2xl font-semibold">Pronti a vedere il profilo della vostra azienda?</h2>
            <p className="mt-1 text-white/80">
              Un servizio di {BRAND.ownerLegal}, società di consulenza di strategia e creazione di valore.
            </p>
          </div>
          <Link
            href="/diagnostico"
            className="inline-flex items-center gap-2 bg-white text-navy font-semibold px-6 py-3 rounded-lg hover:bg-paper"
          >
            Inizia il diagnostico <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>
      </section>
    </div>
  );
}
