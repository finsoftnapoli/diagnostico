import type { Metadata } from "next";
import { BRAND } from "@/config/brand";

export const metadata: Metadata = { title: "Informativa privacy" };

// BOZZA da sottoporre a revisione legale prima dell'apertura al pubblico.
// I punti tra parentesi quadre vanno completati o verificati.

const UPDATED = "26 ottobre 2026";

export default function Privacy() {
  const mail = BRAND.contactEmail;
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 text-[15px] leading-relaxed">
      <p className="rounded-lg border border-accent/30 bg-accent/5 px-4 py-3 text-sm">
        <strong>Bozza in revisione.</strong> Questa informativa è in fase di verifica legale e potrà essere aggiornata prima
        dell&apos;apertura al pubblico del servizio.
      </p>

      <h1 className="mt-8 text-3xl font-semibold text-navy">Informativa sul trattamento dei dati personali</h1>
      <p className="mt-2 text-sm text-muted">
        Ai sensi degli articoli 13 e 14 del Regolamento (UE) 2016/679 (GDPR) · Versione {BRAND.privacyVersion} · ultimo
        aggiornamento {UPDATED}
      </p>

      <Section n="1" title="Chi tratta i dati">
        <p>
          Il titolare del trattamento è <strong>{BRAND.ownerLegal}</strong>, con sede in {BRAND.ownerAddress}, partita IVA{" "}
          {BRAND.ownerVat}, PEC {BRAND.ownerPec} (di seguito «{BRAND.owner}»). Per qualsiasi domanda sul trattamento dei dati
          e per esercitare i tuoi diritti puoi scrivere a{" "}
          <a className="underline" href={`mailto:${mail}`}>
            {mail}
          </a>
          .
        </p>
        <p>
          Il servizio «{BRAND.name}» (di seguito «il servizio») è un diagnostico gestionale rivolto a imprese: chi lo
          compila lo fa in qualità di titolare, amministratore, manager o collaboratore di un&apos;azienda.
        </p>
      </Section>

      <Section n="2" title="Quali dati trattiamo">
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <strong>Dati di contatto e di accesso:</strong> il tuo indirizzo email, usato per confermare l&apos;identità,
            inviarti i link di accesso e ritrovare i tuoi risultati.
          </li>
          <li>
            <strong>Dati dell&apos;azienda:</strong> ragione sociale, partita IVA, settore, dimensione, regione, assetto di
            controllo, il tuo ruolo in azienda. Sono in prevalenza dati dell&apos;impresa; diventano dati personali quando
            riguardano una ditta individuale o permettono di identificare una persona.
          </li>
          <li>
            <strong>Risposte al questionario:</strong> le scelte sugli 8 ambiti di gestione, gli obiettivi, le sfide e i
            testi liberi che scrivi. Ti chiediamo di non inserire nei testi liberi dati di altre persone o informazioni
            sensibili.
          </li>
          <li>
            <strong>Documenti facoltativi:</strong> se carichi la visura camerale o il bilancio, li conserviamo in un
            archivio privato e li leggiamo in modo automatico per estrarre i dati anagrafici, di bilancio e di governance
            dell&apos;azienda. Dei soci e degli amministratori indicati nella visura estraiamo solo nome e ruolo, che
            mostriamo esclusivamente a te per suggerirti chi invitare: non li salviamo nel nostro database e non li usiamo
            per contattare queste persone. Dalla tua area personale puoi aggiungere altri documenti dell&apos;azienda
            (visure e bilanci aggiornati, business plan, altri documenti): ne estraiamo una sintesi dei contenuti
            gestionali, senza dati di persone, usata per i report approfonditi della tua azienda.
          </li>
          <li>
            <strong>Dati dei colleghi che inviti:</strong> nome, ruolo ed email delle persone che scegli di invitare, usati
            solo per inviare l&apos;invito e, se lo accettano, per collegare le loro risposte allo spazio della tua azienda.
          </li>
          <li>
            <strong>Dati tecnici:</strong> indirizzo IP, tipo di browser, data e ora delle richieste, dati necessari alla
            verifica di sicurezza contro gli accessi automatici e ai cookie tecnici descritti al punto 9.
          </li>
        </ul>
      </Section>

      <Section n="3" title="Perché li trattiamo e su quale base giuridica">
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="text-left border-b border-line">
                <th className="py-2 pr-4 font-semibold">Finalità</th>
                <th className="py-2 font-semibold">Base giuridica</th>
              </tr>
            </thead>
            <tbody className="align-top">
              <Row
                a="Fornire il servizio: calcolare il profilo e le priorità, produrre il report, salvare le bozze, consentirti di accedere e ritrovare i risultati, leggere i documenti che carichi."
                b="Esecuzione del servizio che richiedi (art. 6.1.b GDPR)."
              />
              <Row
                a="Inviare, su tua richiesta, l'invito ai colleghi che indichi e mostrare all'amministratore dello spazio aziendale le risposte dei colleghi che hanno accettato, per confrontare le visioni del management."
                b="Esecuzione del servizio che richiedi (art. 6.1.b) per chi invita; per chi è invitato, l'accettazione dell'invito e del servizio. Chi è invitato viene informato, prima di compilare, che le sue risposte individuali saranno visibili all'amministratore."
              />
              <Row
                a="Rispondere alle tue richieste, per esempio di partecipare al programma pilota o di parlare con un consulente."
                b="Misure precontrattuali su tua richiesta (art. 6.1.b)."
              />
              <Row
                a="Elaborare statistiche, confronti tra aziende e ricerche sulla gestione delle imprese, anche sui dati di bilancio estratti dai documenti caricati, sempre in forma aggregata e anonima: nessun dato della tua azienda è mostrato ad altri, e un confronto è pubblicato solo se riguarda un numero minimo di aziende."
                b="Legittimo interesse del titolare a migliorare il servizio e a svolgere ricerca (art. 6.1.f), bilanciato dall'uso esclusivo di dati aggregati. Puoi opporti in qualsiasi momento scrivendo all'indirizzo indicato al punto 1. È una condizione del servizio, indicata al momento dell'accesso."
              />
              <Row
                a="Inviarti comunicazioni su servizi, ricerche e iniziative di Finsoft."
                b="Il tuo consenso facoltativo (art. 6.1.a), revocabile in ogni momento con il link presente in ogni comunicazione o scrivendoci."
              />
              <Row
                a="Proteggere il servizio da accessi automatici, abusi e attacchi informatici."
                b="Legittimo interesse alla sicurezza del servizio (art. 6.1.f)."
              />
              <Row
                a="Adempiere a obblighi di legge, per esempio fiscali e contabili se acquisti un servizio a pagamento."
                b="Obbligo legale (art. 6.1.c)."
              />
            </tbody>
          </table>
        </div>
      </Section>

      <Section n="4" title="Il punteggio e l'uso dell'intelligenza artificiale">
        <p>
          Il profilo e le priorità sono calcolati con regole dichiarate a partire dalle risposte che fornisci. Si tratta di
          un&apos;autovalutazione orientativa: non è una consulenza, non è un rating e non produce decisioni che abbiano
          effetti giuridici o analogamente significativi su di te (art. 22 GDPR).
        </p>
        <p>
          Per leggere i documenti caricati e per scrivere il report approfondito usiamo il servizio Claude di
          Anthropic, che opera come nostro fornitore. In base ai termini commerciali del fornitore, i dati inviati non sono
          usati per addestrare i suoi modelli. [Da verificare: periodo di conservazione presso il fornitore secondo i
          termini vigenti.]
        </p>
      </Section>

      <Section n="5" title="Se conferire i dati è obbligatorio">
        <p>
          Email, dati dell&apos;azienda indicati come obbligatori e risposte al questionario sono necessari per fornire il
          servizio: senza di essi non possiamo produrre il profilo. Il caricamento dei documenti e il consenso alle
          comunicazioni sono facoltativi e non influiscono sul servizio.
        </p>
      </Section>

      <Section n="6" title="A chi comunichiamo i dati">
        <p>
          I dati non sono venduti né ceduti a terzi per loro finalità. Sono trattati da personale autorizzato di Finsoft e
          da fornitori che ci supportano nella gestione del servizio, nominati responsabili del trattamento (art. 28 GDPR):
        </p>
        <ul className="mt-2 list-disc pl-5 space-y-1">
          <li>Supabase: database e accesso, con server nell&apos;Unione europea (Francoforte);</li>
          <li>Vercel: hosting del sito, con elaborazione nell&apos;Unione europea (Francoforte);</li>
          <li>Anthropic: lettura dei documenti e testi del report;</li>
          <li>Resend: invio delle email del servizio;</li>
          <li>Cloudflare: verifica di sicurezza contro gli accessi automatici;</li>
          <li>Google (Workspace): gestione della corrispondenza con te.</li>
        </ul>
        <p className="mt-2">
          Alcuni fornitori hanno sede negli Stati Uniti. In questi casi il trasferimento avviene sulla base del Data Privacy
          Framework UE-USA, per i fornitori certificati, o delle clausole contrattuali tipo approvate dalla Commissione
          europea (art. 45 e 46 GDPR). [Da verificare per ciascun fornitore nei rispettivi accordi sul trattamento dei
          dati.] L&apos;elenco aggiornato è disponibile su richiesta.
        </p>
      </Section>

      <Section n="7" title="Per quanto tempo li conserviamo">
        <ul className="list-disc pl-5 space-y-1">
          <li>
            Documenti caricati: 24 mesi dall&apos;ultimo accesso al servizio, per gli approfondimenti e per aggiornare i dati
            estratti; puoi eliminarli prima in qualsiasi momento dalla tua area personale. I documenti caricati senza
            completare il diagnostico sono eliminati dopo 30 giorni.
          </li>
          <li>
            Dati di bilancio estratti: riguardano l&apos;azienda e sono conservati per statistiche e confronti aggregati;
            per le ditte individuali, in cui riguardano una persona, sono resi anonimi dopo 24 mesi.
          </li>
          <li>Inviti ai colleghi non accettati: 14 giorni, poi scadono; i dati dell&apos;invito sono eliminati dopo 6 mesi. [Da confermare.]</li>
          <li>Bozze del questionario salvate per riprendere più tardi: 30 giorni.</li>
          <li>
            Account, compilazioni e report: finché usi il servizio e fino a 24 mesi dall&apos;ultimo accesso, poi sono
            cancellati o resi anonimi. [Periodo da confermare.]
          </li>
          <li>Dati per le comunicazioni: fino alla revoca del consenso e comunque non oltre 24 mesi dall&apos;ultimo contatto.</li>
          <li>Registro dei consensi: per il tempo necessario a dimostrare il consenso raccolto.</li>
          <li>Dati di fatturazione: 10 anni, come previsto dalla legge.</li>
          <li>Dati anonimi e aggregati: possono essere conservati senza limiti, perché non riferibili a persone.</li>
        </ul>
      </Section>

      <Section n="8" title="I tuoi diritti">
        <p>
          Puoi chiedere in ogni momento l&apos;accesso ai tuoi dati, la rettifica, la cancellazione, la limitazione del
          trattamento, la portabilità e opporti ai trattamenti basati sul legittimo interesse (artt. 15-22 GDPR), scrivendo a{" "}
          <a className="underline" href={`mailto:${mail}`}>
            {mail}
          </a>
          . Puoi revocare il consenso alle comunicazioni senza pregiudicare la liceità del trattamento precedente. Se ritieni
          che il trattamento violi la normativa, puoi presentare reclamo al Garante per la protezione dei dati personali
          (www.garanteprivacy.it).
        </p>
      </Section>

      <Section n="9" title="Cookie e memorizzazione nel browser">
        <p>Il servizio usa solo strumenti tecnici necessari al funzionamento, per i quali non serve il consenso:</p>
        <ul className="mt-2 list-disc pl-5 space-y-1">
          <li>cookie di sessione per mantenerti collegato dopo la conferma dell&apos;email;</li>
          <li>un cookie tecnico che ricorda per alcune ore l&apos;esito della verifica di sicurezza;</li>
          <li>
            la memoria locale del browser, per salvare le risposte mentre compili e permetterti di riprendere: resta sul tuo
            dispositivo e puoi cancellarla dalle impostazioni del browser;
          </li>
          <li>
            la verifica di sicurezza di Cloudflare, che analizza segnali tecnici del browser per distinguere le persone dai
            programmi automatici, senza finalità pubblicitarie.
          </li>
        </ul>
        <p className="mt-2">
          Non usiamo cookie di profilazione o pubblicitari. Se in futuro introdurremo strumenti di analisi statistica, lo
          indicheremo qui e chiederemo il consenso quando necessario.
        </p>
      </Section>

      <Section n="10" title="Dati di altre persone">
        <p>
          Se nei testi liberi o nei documenti compaiono dati di altre persone, li trattiamo solo per fornire il servizio e
          non le contattiamo mai di nostra iniziativa: scriviamo a un collega solo se sei tu a chiedere di invitarlo. Ti
          chiediamo di inserire solo le informazioni necessarie.
        </p>
      </Section>

      <Section n="11" title="Modifiche">
        <p>
          Possiamo aggiornare questa informativa, per esempio quando introduciamo nuove funzioni. La versione in vigore è
          sempre pubblicata in questa pagina, con la data dell&apos;ultimo aggiornamento; le modifiche sostanziali ti saranno
          comunicate.
        </p>
      </Section>
    </div>
  );
}

function Section({ n, title, children }: { n: string; title: string; children: React.ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="text-lg font-semibold text-navy">
        {n}. {title}
      </h2>
      <div className="mt-3 space-y-3 text-ink">{children}</div>
    </section>
  );
}

function Row({ a, b }: { a: string; b: string }) {
  return (
    <tr className="border-b border-line">
      <td className="py-3 pr-4 w-1/2">{a}</td>
      <td className="py-3 text-muted">{b}</td>
    </tr>
  );
}
