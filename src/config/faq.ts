// Domande frequenti: mostrate nella pagina iniziale e pubblicate come dati strutturati per i motori di ricerca.
// Tenerle coerenti con prezzi (offers.ts), tempi e metodo descritti nel resto del sito.
import { BRAND } from "./brand";
import { BUNDLE_HOURS, euro, PRODUCTS } from "./offers";

export const FAQ: { q: string; a: string }[] = [
  {
    q: "Il diagnostico è davvero gratuito?",
    a: `Sì. Il diagnostico sugli 8 ambiti, l'${BRAND.reportName} e il report approfondito sono gratuiti. Sono a pagamento, e facoltativi, solo gli approfondimenti per singolo ambito e le consulenze con un nostro esperto.`,
  },
  {
    q: "Quanto tempo richiede e posso interrompere?",
    a: "Sono 24 domande sugli 8 ambiti, più alcune informazioni sull'azienda, le ambizioni e le sfide principali. Le risposte si salvano mentre compili: puoi interrompere e riprendere anche da un altro dispositivo con il link che ti inviamo per email.",
  },
  {
    q: "Cosa ricevo alla fine?",
    a: `Subito l'${BRAND.reportName}: il profilo a radar sugli 8 ambiti, il confronto con aziende della tua fascia di fatturato e le evidenze chiave. Entro 2 giorni lavorativi ricevi per email il report approfondito, con l'analisi delle priorità e gli interventi suggeriti, validato da un nostro esperto.`,
  },
  {
    q: "Come nascono punteggi e priorità?",
    a: "Da una metodologia proprietaria sviluppata dai nostri consulenti. Per ogni tema scegli tra quattro descrizioni concrete della situazione di oggi; i nostri algoritmi trasformano le risposte nel profilo dell'azienda e in priorità coerenti con le ambizioni e le sfide che hai indicato.",
  },
  {
    q: "Con quali aziende mi confronto?",
    a: "Con aziende della stessa fascia di fatturato, sulla base dei riferimenti definiti dai nostri esperti e dei dati delle aziende che hanno compilato il diagnostico, sempre in forma anonima e aggregata.",
  },
  {
    q: "Chi prepara il report approfondito?",
    a: "Il report nasce dai nostri sistemi di analisi, che leggono insieme le risposte, i documenti che carichi e il confronto con aziende simili; un nostro esperto lo valida prima dell'invio. Se vuoi discuterlo, puoi prenotare un'ora con un consulente senior.",
  },
  {
    q: "I dati della mia azienda restano riservati?",
    a: "Sì. Le risposte e i documenti sono visibili solo a te, ai colleghi che inviti e ai nostri esperti. Per i confronti tra aziende usiamo solo dati anonimi e aggregati, e un confronto è mostrato solo se riguarda un numero minimo di aziende.",
  },
  {
    q: "Posso coinvolgere gli altri manager dell'azienda?",
    a: "Sì. Dopo il diagnostico puoi invitare i colleghi: ciascuno compila il questionario e nell'area personale vedi le diverse visioni a confronto e dove il management non è allineato.",
  },
  {
    q: "Cosa sono gli approfondimenti per ambito?",
    a: `Un questionario di dettaglio su un singolo ambito, con 8 sotto-ambiti e un report con piano di lavoro a 3, 6 e 12 mesi e indicatori da seguire: ${euro(PRODUCTS.modulo.price)} + IVA per ambito. Una consulenza da remoto di un'ora con un consulente senior costa ${euro(PRODUCTS.consulenza.price)} + IVA; il percorso completo con tutti gli 8 approfondimenti e ${BUNDLE_HOURS} ore di consulenza ${euro(PRODUCTS.bundle.price)} + IVA.`,
  },
  {
    q: "A quali aziende è rivolto?",
    a: "A piccole e medie imprese italiane, indicativamente fino a 100 milioni di fatturato, di qualsiasi settore. Lo compila chi guida l'azienda o una sua area: titolare, amministratore, direttore o responsabile di funzione.",
  },
];
