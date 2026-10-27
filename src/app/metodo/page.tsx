import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { BRAND } from "@/config/brand";

const TITLE = "Il nostro metodo di diagnosi aziendale";
const DESCRIPTION = `Una metodologia proprietaria, costruita sull'esperienza di consulenza di direzione: 8 ambiti, livelli di maturità concreti, priorità legate alle tue ambizioni e report validati dai nostri esperti.`;

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/metodo" },
  openGraph: { title: TITLE, description: DESCRIPTION, url: "/metodo", images: ["/opengraph-image"] },
};

export default function MethodPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 leading-relaxed">
      <h1 className="text-3xl sm:text-4xl font-semibold text-navy">Il nostro metodo</h1>
      <p className="mt-3 text-lg text-muted">
        Il diagnostico unisce l&apos;esperienza di consulenza di direzione di {BRAND.owner} con metodologie, algoritmi e sistemi di analisi
        proprietari, per trasformare le risposte dell&apos;azienda in indicazioni concrete su dove intervenire.
      </p>

      <S t="Otto ambiti di gestione">
        <p>
          Il diagnostico guarda l&apos;azienda nel suo insieme: strategia e governance, finanza e controllo, marketing e vendite, persone e
          organizzazione, operations e supply chain, digitale e dati, innovazione, sostenibilità. Gli ambiti sono gli stessi che un consulente
          esamina quando affianca la direzione di una PMI.{" "}
          <Link href="/ambiti" className="underline text-navy-soft">
            Vedi gli 8 ambiti
          </Link>
          .
        </p>
      </S>

      <S t="Situazioni concrete, non voti">
        <p>
          Per ogni tema si sceglie la descrizione più vicina a come l&apos;azienda lavora oggi, tra quattro livelli di maturità che vanno dalla
          gestione più informale alla più strutturata. Niente scale da 1 a 10: ogni livello descrive pratiche riconoscibili, e alcune domande
          di verifica aiutano a mantenere il quadro realistico.
        </p>
      </S>

      <S t="Priorità che partono dalle tue ambizioni">
        <p>
          Le priorità non sono semplicemente gli ambiti più deboli. I nostri algoritmi pesano ogni ambito rispetto alle ambizioni per i prossimi
          anni e alle sfide di oggi che indichi all&apos;inizio: conta di più ciò da cui dipendono i risultati che vuoi raggiungere.
        </p>
      </S>

      <S t="Il confronto con aziende simili">
        <p>
          Ogni ambito è letto a confronto con aziende della stessa fascia di fatturato, sulla base dei riferimenti definiti dai nostri esperti e
          dei dati, anonimi e aggregati, delle aziende che hanno compilato il diagnostico.
        </p>
      </S>

      <S t="Il valore dell'esperto">
        <p>
          Dietro ogni report c&apos;è un nostro esperto, che lo legge e lo valida prima dell&apos;invio. Con gli approfondimenti per ambito e le
          consulenze da remoto, un consulente senior ti aiuta a trasformare le priorità in un piano, con tempi e responsabili.
        </p>
      </S>

      <S t="Gli approfondimenti per ambito">
        <p>
          Ogni approfondimento è un {BRAND.reportName} dell&apos;ambito: 8 sotto-ambiti esaminati nel dettaglio, con un piano di lavoro a 3, 6 e
          12 mesi e gli indicatori da seguire.
        </p>
      </S>

      <S t="Cosa il diagnostico non è">
        <p>
          È un&apos;autovalutazione orientativa basata sulle risposte fornite: non è una consulenza, una certificazione né un rating, e non
          sostituisce l&apos;analisi di un professionista sui dati dell&apos;azienda.
        </p>
      </S>

      <Link href="/diagnostico" className="mt-12 inline-flex items-center gap-2 bg-navy text-white font-semibold px-6 py-3 rounded-lg hover:bg-navy-soft">
        Inizia il diagnostico gratuito <ArrowRight className="size-4" aria-hidden />
      </Link>
    </div>
  );
}

function S({ t, children }: { t: string; children: React.ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="text-xl font-semibold text-navy">{t}</h2>
      <div className="mt-3 space-y-3">{children}</div>
    </section>
  );
}
