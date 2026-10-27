import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { BRAND } from "@/config/brand";
import { MIN_SAMPLE } from "@/config/benchmark";
import { PARAMS } from "@/lib/scoring";

const TITLE = "Il metodo del diagnostico: punteggi, priorità e confronto";
const DESCRIPTION = `Come calcoliamo l'${BRAND.reportName}: scala a quattro livelli, domande di verifica, priorità legate ad ambizioni e sfide, confronto con aziende simili e ruolo dell'intelligenza artificiale.`;

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/metodo" },
  openGraph: { title: TITLE, description: DESCRIPTION, url: "/metodo", images: ["/opengraph-image"] },
};

const [l1, l2, l3, l4] = PARAMS.levelPoints;

export default function MethodPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 leading-relaxed">
      <h1 className="text-3xl sm:text-4xl font-semibold text-navy">Il metodo del diagnostico</h1>
      <p className="mt-3 text-lg text-muted">
        Punteggi e priorità si calcolano con regole dichiarate, uguali per tutte le aziende. Questa pagina le descrive.
      </p>

      <S t="Otto ambiti, tre temi ciascuno">
        <p>
          Il diagnostico valuta la gestione dell&apos;azienda su 8 ambiti: strategia e governance, finanza e controllo, marketing e vendite,
          persone e organizzazione, operations e supply chain, digitale e dati, innovazione, sostenibilità. Ogni ambito ha tre temi, per un
          totale di 24 domande.{" "}
          <Link href="/ambiti" className="underline text-navy-soft">
            Vedi gli 8 ambiti
          </Link>
          .
        </p>
      </S>

      <S t="Una scala a quattro livelli, descritti in concreto">
        <p>
          Per ogni tema si sceglie tra quattro descrizioni di come l&apos;azienda lavora oggi, dalla più informale alla più strutturata. Non ci
          sono scale da 1 a 10 né giudizi di valore: ogni livello descrive pratiche osservabili. I livelli valgono {l1}, {l2}, {l3} e {l4}
          punti; il punteggio di un ambito è la media dei suoi temi e il punteggio complessivo la media degli ambiti.
        </p>
        <p>
          Alcuni temi hanno una domanda di verifica su un fatto (per esempio: esiste un budget approvato prima dell&apos;inizio
          dell&apos;anno?). Se il livello scelto è alto ma la verifica dice il contrario, il report segnala una possibile sovrastima.
        </p>
      </S>

      <S t="Priorità legate alle tue ambizioni e alle tue sfide">
        <p>
          Le tre priorità non sono semplicemente gli ambiti con il punteggio più basso. Per ogni ambito si combinano due elementi: il divario
          dal livello più alto (100 meno il punteggio) e la rilevanza per l&apos;azienda, che dipende dalle ambizioni per i prossimi anni e dalle
          sfide di oggi indicate all&apos;inizio, in ordine di importanza, e da quanto i testi liberi richiamano l&apos;ambito. Un ambito debole
          ma lontano dai tuoi obiettivi pesa meno di un ambito intermedio da cui dipendono le tue ambizioni.
        </p>
      </S>

      <S t="Il confronto con aziende simili">
        <p>
          Ogni ambito è confrontato con le aziende della stessa fascia di fatturato. Finché in un segmento non ci sono almeno {MIN_SAMPLE}{" "}
          aziende, usiamo un riferimento indicativo: il livello atteso per un&apos;azienda ben gestita di quella dimensione, definito dai nostri
          esperti e dichiarato come tale nel report. Poi il confronto passa alla mediana delle aziende reali, prima per macro-fascia di
          fatturato e poi per singola fascia. Ogni azienda conta una volta sola, anche se più manager compilano il diagnostico.
        </p>
      </S>

      <S t="Il ruolo dell'intelligenza artificiale">
        <p>
          L&apos;intelligenza artificiale non calcola punteggi né sceglie le priorità. La usiamo per due compiti: leggere visura e bilancio
          quando li carichi, per compilare i dati dell&apos;azienda e calcolare gli indicatori economici, e scrivere la prima stesura del
          report approfondito a partire dai punteggi già calcolati e dalle tue risposte, senza aggiungere numeri o fatti. Ogni report è rivisto
          da un nostro esperto prima dell&apos;invio.
        </p>
      </S>

      <S t="Gli approfondimenti per ambito">
        <p>
          Ogni approfondimento è un {BRAND.reportName} dell&apos;ambito: 8 sotto-ambiti con 2-3 domande ciascuno, con la stessa scala e le
          stesse regole. Il report aggiunge un piano di lavoro a 3, 6 e 12 mesi e gli indicatori da seguire.
        </p>
      </S>

      <S t="Cosa il diagnostico non è">
        <p>
          È un&apos;autovalutazione orientativa basata sulle risposte fornite: non è una consulenza, una certificazione né un rating, e non
          sostituisce l&apos;analisi di un professionista sui dati dell&apos;azienda. I parametri del modello sono rivisti periodicamente sulla base
          delle compilazioni raccolte.
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
