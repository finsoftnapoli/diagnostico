// Pagine pubbliche degli 8 ambiti: indirizzo e testi pensati per chi cerca un diagnostico su un tema specifico.
// I contenuti del questionario (temi e sotto-ambiti) arrivano da questionnaire.ts e modules.ts.
import type { AreaCode } from "@/lib/types";

export interface AreaPage {
  code: AreaCode;
  slug: string;
  /** Titolo della pagina e del risultato nei motori di ricerca. */
  seoTitle: string;
  /** Descrizione per i motori di ricerca (circa 150 caratteri). */
  seoDescription: string;
  /** Apertura della pagina: perché l'ambito conta per una PMI. */
  intro: string;
  /** Segnali tipici che l'ambito va approfondito. */
  signals: string[];
}

export const AREA_PAGES: AreaPage[] = [
  {
    code: "STR",
    slug: "strategia-governance",
    seoTitle: "Diagnostico di strategia e governance per PMI",
    seoDescription:
      "Valuta direzione strategica, pianificazione, delega, organo amministrativo, passaggio generazionale e adeguati assetti della tua PMI. Gratuito.",
    intro:
      "Nelle PMI la strategia vive spesso nella testa del titolare: funziona finché l'azienda è piccola, poi rallenta le decisioni e rende fragile la continuità. Il diagnostico misura quanto la direzione è chiara e condivisa, come si decide e si delega, che ruolo svolgono l'organo amministrativo e i soci e quanto sono presidiati i rischi e gli adeguati assetti richiesti dal Codice della crisi.",
    signals: [
      "Le decisioni importanti passano tutte dal titolare",
      "Non esiste un piano scritto per i prossimi 3 anni",
      "Il passaggio generazionale non è stato preparato",
      "Il consiglio di amministrazione si riunisce solo per il bilancio",
    ],
  },
  {
    code: "FIN",
    slug: "finanza-controllo",
    seoTitle: "Check-up di finanza e controllo di gestione per PMI",
    seoDescription:
      "Budget, previsione di cassa, marginalità per prodotto e cliente, capitale circolante, banche e merito di credito: misura la maturità della funzione finanza.",
    intro:
      "Molte PMI conoscono il proprio risultato solo con il bilancio di fine anno. Il diagnostico misura la capacità di pianificare e controllare: budget e piano pluriennale, reporting mensile, margini per prodotto, cliente o commessa, previsione di cassa, gestione del circolante, rapporti con le banche e merito di credito. Caricando il bilancio, il report aggiunge i principali indicatori economici e finanziari.",
    signals: [
      "La liquidità si controlla guardando il saldo del conto",
      "Non sapete quali clienti o prodotti rendono meno",
      "Il budget non c'è o non viene confrontato con i risultati",
      "Non conoscete come vi valutano banche e Fondo di garanzia",
    ],
  },
  {
    code: "MKT",
    slug: "marketing-vendite",
    seoTitle: "Diagnostico di marketing e vendite per PMI",
    seoDescription:
      "Segmenti di clientela, proposta di valore, generazione di contatti, processo commerciale e CRM, rete di vendita e prezzi: dove intervenire per crescere.",
    intro:
      "La crescita di una PMI dipende spesso da pochi clienti storici e dalla capacità dei singoli venditori. Il diagnostico misura quanto conoscete mercato e segmenti, quanto è chiara la proposta di valore, come generate nuovi contatti, come seguite le trattative, come sono organizzati e incentivati i venditori e come governate prezzi, sconti e fidelizzazione dei clienti.",
    signals: [
      "Il fatturato dipende da pochi clienti o da un solo venditore",
      "Le trattative non sono registrate in un sistema condiviso",
      "Gli sconti sono decisi caso per caso",
      "Non sapete perché perdete le gare o le trattative",
    ],
  },
  {
    code: "PER",
    slug: "persone-organizzazione",
    seoTitle: "Diagnostico di organizzazione e gestione delle persone per PMI",
    seoDescription:
      "Ruoli e organigramma, selezione, formazione, obiettivi e valutazione, retribuzione, ruoli chiave e clima: misura la maturità della gestione delle persone.",
    intro:
      "Trovare e trattenere le persone giuste è oggi uno dei vincoli principali alla crescita delle PMI. Il diagnostico misura la chiarezza di ruoli e responsabilità, la capacità di attrarre e selezionare, l'inserimento e la formazione, la gestione di obiettivi e prestazioni, le politiche retributive e di welfare, la protezione dei ruoli chiave e il clima interno.",
    signals: [
      "L'organigramma non rispecchia come si lavora davvero",
      "Le posizioni aperte restano scoperte per mesi",
      "Non ci sono obiettivi individuali né colloqui di valutazione",
      "Alcune persone sono insostituibili e non hanno un sostituto",
    ],
  },
  {
    code: "OPS",
    slug: "operations-supply-chain",
    seoTitle: "Diagnostico di operations e supply chain per PMI",
    seoDescription:
      "Pianificazione, produttività, qualità, acquisti e fornitori, scorte e logistica, manutenzione e sicurezza: valuta l'efficienza delle operations della tua azienda.",
    intro:
      "Ritardi nelle consegne, scorte che non tornano e costi di produzione poco noti erodono margini e reputazione. Il diagnostico misura come si allineano vendite e capacità, come si programma il lavoro, quanto si conoscono produttività e costi della non qualità, come si gestiscono acquisti e fornitori critici, scorte, logistica, manutenzione e sicurezza. Vale anche per le aziende di servizi: le domande che non vi riguardano si possono escludere.",
    signals: [
      "Il programma di lavoro cambia ogni giorno per le urgenze",
      "Non misurate la puntualità delle consegne",
      "Dipendete da un fornitore unico per materiali critici",
      "Il magazzino nel gestionale non coincide con quello reale",
    ],
  },
  {
    code: "DIG",
    slug: "digitale-dati",
    seoTitle: "Diagnostico di maturità digitale e dati per PMI",
    seoDescription:
      "Gestionale e integrazione dei sistemi, qualità dei dati, cruscotti, automazione, intelligenza artificiale e sicurezza informatica: misura la maturità digitale.",
    intro:
      "Il digitale nelle PMI cresce spesso per aggiunte successive: un gestionale, qualche foglio di calcolo, strumenti scelti dai singoli. Il diagnostico misura quanto i sistemi coprono e collegano i processi, quanto sono affidabili i dati e i cruscotti per decidere, quanto sono automatizzati i flussi ripetitivi, come usate l'intelligenza artificiale e quanto siete protetti da incidenti informatici.",
    signals: [
      "Gli stessi dati vengono reinseriti a mano in più sistemi",
      "I report per la direzione si preparano a mano ogni volta",
      "Non avete mai provato a ripristinare i dati da un salvataggio",
      "Ognuno usa l'intelligenza artificiale senza regole comuni",
    ],
  },
  {
    code: "INN",
    slug: "innovazione",
    seoTitle: "Diagnostico della capacità di innovazione per PMI",
    seoDescription:
      "Strategia dell'innovazione, raccolta delle idee, selezione dei progetti, sviluppo e lancio, collaborazioni, incentivi e brevetti: misura come innova la tua PMI.",
    intro:
      "Molte PMI innovano di continuo su richiesta dei clienti, ma senza priorità, risorse dedicate né misura dei risultati. Il diagnostico misura quanto è chiaro dove innovare, come nascono e si scelgono i progetti, come si sviluppano e si lanciano prodotti e servizi, con chi collaborate, quanto sfruttate incentivi e proprietà intellettuale e quanto la cultura aziendale sostiene chi sperimenta.",
    signals: [
      "Si innova solo quando un cliente lo chiede",
      "I progetti si accumulano e pochi arrivano alla fine",
      "Non sapete quanta parte del fatturato viene da prodotti recenti",
      "Crediti d'imposta e bandi si usano solo se li propone un consulente",
    ],
  },
  {
    code: "SOS",
    slug: "sostenibilita",
    seoTitle: "Diagnostico di sostenibilità ed ESG per PMI",
    seoDescription:
      "Temi rilevanti, energia ed emissioni, economia circolare, persone, etica e conformità, filiera e rendicontazione ESG: preparati alle richieste di clienti e banche.",
    intro:
      "Clienti, banche e committenti chiedono sempre più spesso dati di sostenibilità anche alle aziende non obbligate a rendicontare. Il diagnostico misura quanto avete individuato i temi rilevanti, come gestite energia, emissioni e risorse, come presidiate persone, etica e conformità, quanto considerate la filiera e quanto siete pronti a rispondere a questionari, rating e richieste di rendicontazione come lo standard VSME.",
    signals: [
      "I questionari ESG dei clienti arrivano e si compilano con fatica",
      "Non conoscete le emissioni dell'azienda",
      "Nessuno ha la responsabilità della sostenibilità",
      "Le banche chiedono dati che non avete raccolto",
    ],
  },
];

export const areaPage = (code: AreaCode) => AREA_PAGES.find((p) => p.code === code)!;
export const areaPageBySlug = (slug: string) => AREA_PAGES.find((p) => p.slug === slug) ?? null;
