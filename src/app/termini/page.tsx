import type { Metadata } from "next";
import Link from "next/link";
import { BRAND } from "@/config/brand";
import { BUNDLE_HOURS, euro, PRODUCTS, VAT_RATE } from "@/config/offers";

export const metadata: Metadata = { title: "Condizioni di vendita" };

// BOZZA da sottoporre a revisione legale prima dell'apertura al pubblico.
const UPDATED = "26 ottobre 2026";

export default function Terms() {
  const mail = BRAND.contactEmail;
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 text-[15px] leading-relaxed">
      <p className="rounded-lg border border-accent/30 bg-accent/5 px-4 py-3 text-sm">
        <strong>Bozza in revisione.</strong> Queste condizioni sono in fase di verifica legale e potranno essere aggiornate
        prima dell&apos;apertura al pubblico del servizio.
      </p>
      <h1 className="mt-8 text-3xl font-semibold text-navy">Condizioni generali di vendita</h1>
      <p className="mt-2 text-sm text-muted">Ultimo aggiornamento {UPDATED}</p>

      <S n="1" t="Chi vende e a chi">
        <p>
          I servizi a pagamento di «{BRAND.name}» sono offerti da <strong>{BRAND.ownerLegal}</strong>, sede in {BRAND.ownerAddress}, partita
          IVA {BRAND.ownerVat}, PEC {BRAND.ownerPec} («{BRAND.owner}»).
        </p>
        <p>
          I servizi sono riservati a imprese, professionisti ed enti che acquistano nell&apos;ambito della propria attività, con partita IVA.
          Non si applicano quindi le norme del Codice del consumo sui contratti con i consumatori, compreso il diritto di recesso. Chi
          acquista dichiara di agire per conto dell&apos;azienda indicata nei dati di fatturazione e di esserne autorizzato.
        </p>
      </S>

      <S n="2" t="Servizi e prezzi">
        <ul className="list-disc pl-5 space-y-1">
          <li>
            <strong>{PRODUCTS.modulo.name}</strong>: {euro(PRODUCTS.modulo.price)} per ambito. Questionario di dettaglio sull&apos;ambito in 8 sotto-ambiti,
            punteggi per sotto-ambito e report scritto con piano di lavoro e indicatori, rivisto dai nostri esperti.
          </li>
          <li>
            <strong>{PRODUCTS.consulenza.name}</strong>: {euro(PRODUCTS.consulenza.price)} per un&apos;ora in videochiamata con un consulente
            senior, da prenotare scegliendo uno degli orari disponibili.
          </li>
          <li>
            <strong>{PRODUCTS.bundle.name}</strong>: {euro(PRODUCTS.bundle.price)}. Tutti gli 8 approfondimenti per ambito e {BUNDLE_HOURS} ore di
            consulenza, utilizzabili anche in sessioni separate.
          </li>
        </ul>
        <p>Prezzi in euro, IVA esclusa: al pagamento si aggiunge l&apos;IVA al {VAT_RATE}%.</p>
      </S>

      <S n="3" t="Pagamento e fattura">
        <p>
          Il pagamento avviene online al momento dell&apos;acquisto, tramite Stripe; per la consulenza, al momento della prenotazione. I dati di
          pagamento sono trattati solo da Stripe. Il contratto si conclude quando il pagamento è confermato. A ogni acquisto emettiamo fattura
          elettronica, recapitata tramite il Sistema di Interscambio secondo i dati di fatturazione indicati: chi acquista è responsabile della
          loro correttezza.
        </p>
      </S>

      <S n="4" t="Attivazione e consegna">
        <p>
          Gli approfondimenti si attivano subito dopo il pagamento e si compilano dall&apos;area personale. Il report scritto è consegnato entro 2
          giorni lavorativi dall&apos;invio del questionario completo, dopo la revisione dei nostri esperti. Moduli e ore di consulenza restano
          disponibili nell&apos;area personale dell&apos;azienda per 12 mesi dall&apos;acquisto. [Da confermare.]
        </p>
      </S>

      <S n="5" t="Consulenze: prenotazione, spostamento e annullamento">
        <p>
          La consulenza si svolge da remoto nella data e all&apos;ora prenotate. Si può annullare dall&apos;area personale fino a 24 ore prima:
          l&apos;ora resta disponibile per una nuova prenotazione. Oltre quel termine, o in caso di mancata partecipazione, l&apos;ora si considera
          fruita. Se siamo noi a dover annullare, proponiamo una nuova data o, a scelta di chi ha acquistato, rimborsiamo l&apos;importo pagato.
        </p>
      </S>

      <S n="6" t="Natura dei servizi">
        <p>
          Diagnostico, approfondimenti e consulenze offrono una valutazione orientativa basata sulle informazioni fornite dall&apos;azienda e
          non costituiscono certificazione, rating, revisione contabile né consulenza legale o fiscale. {BRAND.owner} si impegna a svolgerli con
          diligenza professionale (obbligazione di mezzi) ma non garantisce risultati specifici; le decisioni restano dell&apos;azienda.
        </p>
      </S>

      <S n="7" t="Responsabilità">
        <p>
          Salvo dolo o colpa grave, la responsabilità di {BRAND.owner} per i servizi acquistati è limitata all&apos;importo pagato per il servizio
          che ha causato il danno. {BRAND.owner} non risponde di danni indiretti né di interruzioni del servizio dovute a cause non imputabili.
        </p>
      </S>

      <S n="8" t="Riservatezza e proprietà dei contenuti">
        <p>
          Le informazioni dell&apos;azienda sono riservate e trattate come indicato nell&apos;
          <Link href="/privacy" className="underline">
            informativa privacy
          </Link>
          . Questionari, metodo e testi del servizio restano di {BRAND.owner}; i report consegnati possono essere usati liberamente
          dall&apos;azienda per i propri scopi interni.
        </p>
      </S>

      <S n="9" t="Reclami, legge e foro">
        <p>
          Per reclami e richieste:{" "}
          <a className="underline" href={`mailto:${mail}`}>
            {mail}
          </a>
          . Il contratto è regolato dalla legge italiana; per ogni controversia è competente in via esclusiva il Foro di [Napoli, da
          confermare].
        </p>
      </S>
    </div>
  );
}

function S({ n, t, children }: { n: string; t: string; children: React.ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="text-lg font-semibold text-navy">
        {n}. {t}
      </h2>
      <div className="mt-3 space-y-3 text-ink">{children}</div>
    </section>
  );
}
