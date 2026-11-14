// Generato da scripts/genera_moduli.py (moduli di approfondimento v0.3). Non modificare a mano:
// cambiare scripts/moduli_content.py e rigenerare.
import type { AreaCode } from "./types";

export const MODULE_VERSION = "0.3";

/** Gli 8 sotto-ambiti di ciascun modulo: i vertici dell'Ottogramma dell'ambito. */
export interface ModuleSubarea {
  code: string;
  name: string;
  /** Etichetta breve per i vertici dell'Ottogramma. */
  short: string;
  description: string;
}

export interface ModuleQuestion {
  id: string;
  area: AreaCode;
  /** Codice del sotto-ambito a cui appartiene la domanda. */
  sub: string;
  theme: string;
  text: string;
  levels: string[];
  check: { text: string; options: string[]; flag: { minLevel: number; answers: string[] } } | null;
  /** La domanda può non riguardare l'azienda: si può rispondere "non applicabile". */
  na: boolean;
}

export const MODULE_SUBAREAS: Record<AreaCode, ModuleSubarea[]> = {
  "STR": [
    {
      "code": "STR-1",
      "name": "Visione e posizionamento",
      "short": "Visione",
      "description": "Direzione di lungo periodo e vantaggio competitivo"
    },
    {
      "code": "STR-2",
      "name": "Analisi e scelte strategiche",
      "short": "Analisi e scelte",
      "description": "Informazioni e metodo a supporto delle decisioni importanti"
    },
    {
      "code": "STR-3",
      "name": "Pianificazione ed esecuzione",
      "short": "Pianificazione",
      "description": "Dalla strategia ai progetti e agli obiettivi dell'anno"
    },
    {
      "code": "STR-4",
      "name": "Decisioni e delega",
      "short": "Decisioni e delega",
      "description": "Come lavora il gruppo di direzione e come distribuisce le decisioni"
    },
    {
      "code": "STR-5",
      "name": "Organo amministrativo e controlli",
      "short": "Organo amministrativo",
      "description": "Ruolo del consiglio o dell'amministratore e degli organi di controllo"
    },
    {
      "code": "STR-6",
      "name": "Soci, famiglia e continuità",
      "short": "Soci e continuità",
      "description": "Regole tra soci e passaggio di testimone"
    },
    {
      "code": "STR-7",
      "name": "Rischi e adeguati assetti",
      "short": "Rischi e assetti",
      "description": "Mappa dei rischi e strumenti di allerta richiesti dal Codice della crisi"
    },
    {
      "code": "STR-8",
      "name": "Crescita e alleanze",
      "short": "Crescita esterna",
      "description": "Acquisizioni, partnership e sviluppo all'esterno dei confini attuali"
    }
  ],
  "FIN": [
    {
      "code": "FIN-1",
      "name": "Pianificazione e budget",
      "short": "Budget e piano",
      "description": "Budget annuale e piano economico-finanziario pluriennale"
    },
    {
      "code": "FIN-2",
      "name": "Reporting e analisi",
      "short": "Reporting",
      "description": "Informazioni economiche in corso d'anno e lettura degli scostamenti"
    },
    {
      "code": "FIN-3",
      "name": "Controllo di gestione e margini",
      "short": "Controllo di gestione",
      "description": "Costi per centro, margini per prodotto, cliente o commessa"
    },
    {
      "code": "FIN-4",
      "name": "Cassa e tesoreria",
      "short": "Cassa",
      "description": "Previsione della liquidità e gestione degli incassi e dei pagamenti"
    },
    {
      "code": "FIN-5",
      "name": "Capitale circolante",
      "short": "Circolante",
      "description": "Crediti verso clienti, scorte e debiti verso fornitori"
    },
    {
      "code": "FIN-6",
      "name": "Banche e struttura finanziaria",
      "short": "Banche e debito",
      "description": "Fonti di finanziamento, rapporti con le banche e merito di credito"
    },
    {
      "code": "FIN-7",
      "name": "Investimenti e capitale",
      "short": "Investimenti",
      "description": "Valutazione degli investimenti e uso degli utili"
    },
    {
      "code": "FIN-8",
      "name": "Amministrazione, controlli e fiscalità",
      "short": "Amministrazione e fisco",
      "description": "Chiusure, controlli interni, fisco e organizzazione della funzione"
    }
  ],
  "MKT": [
    {
      "code": "MKT-1",
      "name": "Mercato e segmenti",
      "short": "Mercato e segmenti",
      "description": "Conoscenza del mercato e scelta dei clienti su cui puntare"
    },
    {
      "code": "MKT-2",
      "name": "Proposta di valore e offerta",
      "short": "Offerta",
      "description": "Perché i clienti scelgono l'azienda e come è gestito il portafoglio"
    },
    {
      "code": "MKT-3",
      "name": "Marca e comunicazione",
      "short": "Marca",
      "description": "Identità di marca, messaggi e presenza online"
    },
    {
      "code": "MKT-4",
      "name": "Generazione della domanda",
      "short": "Nuovi contatti",
      "description": "Nuovi contatti e collaborazione tra marketing e vendite"
    },
    {
      "code": "MKT-5",
      "name": "Processo di vendita",
      "short": "Processo di vendita",
      "description": "Fasi della trattativa, CRM e previsioni di vendita"
    },
    {
      "code": "MKT-6",
      "name": "Rete di vendita",
      "short": "Rete di vendita",
      "description": "Organizzazione, guida e incentivi di venditori, agenti e distributori"
    },
    {
      "code": "MKT-7",
      "name": "Prezzi",
      "short": "Prezzi",
      "description": "Listini, sconti e trasferimento delle variazioni di costo"
    },
    {
      "code": "MKT-8",
      "name": "Clienti e fidelizzazione",
      "short": "Fidelizzazione",
      "description": "Clienti principali, soddisfazione e servizio dopo la vendita"
    }
  ],
  "PER": [
    {
      "code": "PER-1",
      "name": "Struttura e ruoli",
      "short": "Struttura e ruoli",
      "description": "Organigramma, responsabilità e coordinamento tra funzioni"
    },
    {
      "code": "PER-2",
      "name": "Pianificazione e gestione del personale",
      "short": "Gestione del personale",
      "description": "Fabbisogno di persone, amministrazione e dati del personale"
    },
    {
      "code": "PER-3",
      "name": "Attrazione e selezione",
      "short": "Selezione",
      "description": "Capacità di attrarre e scegliere le persone giuste"
    },
    {
      "code": "PER-4",
      "name": "Inserimento e formazione",
      "short": "Formazione",
      "description": "Ingresso dei nuovi assunti e crescita delle competenze"
    },
    {
      "code": "PER-5",
      "name": "Obiettivi e prestazioni",
      "short": "Obiettivi",
      "description": "Assegnazione degli obiettivi, valutazione e riscontro"
    },
    {
      "code": "PER-6",
      "name": "Retribuzione e benessere",
      "short": "Retribuzione e welfare",
      "description": "Politiche retributive, premi, welfare e organizzazione del lavoro"
    },
    {
      "code": "PER-7",
      "name": "Leadership e talenti",
      "short": "Leadership e talenti",
      "description": "Qualità dei responsabili, ruoli chiave e persone a potenziale"
    },
    {
      "code": "PER-8",
      "name": "Clima e comunicazione interna",
      "short": "Clima e comunicazione",
      "description": "Coinvolgimento delle persone e circolazione delle informazioni"
    }
  ],
  "OPS": [
    {
      "code": "OPS-1",
      "name": "Strategia operativa",
      "short": "Strategia operativa",
      "description": "Cosa fare all'interno, capacità e configurazione di stabilimenti e sedi"
    },
    {
      "code": "OPS-2",
      "name": "Pianificazione",
      "short": "Pianificazione",
      "description": "Allineamento tra domanda e capacità e programmazione del lavoro"
    },
    {
      "code": "OPS-3",
      "name": "Produzione ed efficienza",
      "short": "Efficienza",
      "description": "Produttività, standard di lavoro e organizzazione dei reparti"
    },
    {
      "code": "OPS-4",
      "name": "Qualità",
      "short": "Qualità",
      "description": "Controlli, non conformità e sistemi di gestione della qualità"
    },
    {
      "code": "OPS-5",
      "name": "Acquisti e fornitori",
      "short": "Acquisti",
      "description": "Strategia di acquisto, valutazione e rischio dei fornitori"
    },
    {
      "code": "OPS-6",
      "name": "Magazzino e logistica",
      "short": "Logistica",
      "description": "Scorte, magazzino, trasporti e consegne"
    },
    {
      "code": "OPS-7",
      "name": "Impianti, manutenzione e sicurezza",
      "short": "Impianti e sicurezza",
      "description": "Affidabilità di impianti e attrezzature e sicurezza sul lavoro"
    },
    {
      "code": "OPS-8",
      "name": "Miglioramento e indicatori",
      "short": "Miglioramento",
      "description": "Metodo di miglioramento e cruscotto delle operations"
    }
  ],
  "DIG": [
    {
      "code": "DIG-1",
      "name": "Strategia e governo dell'informatica",
      "short": "Governo dell'IT",
      "description": "Piano degli investimenti digitali e organizzazione dell'informatica"
    },
    {
      "code": "DIG-2",
      "name": "Sistemi gestionali e infrastruttura",
      "short": "Gestionale e sistemi",
      "description": "Copertura dei processi, integrazione e infrastruttura tecnologica"
    },
    {
      "code": "DIG-3",
      "name": "Dati e qualità",
      "short": "Dati",
      "description": "Affidabilità, responsabilità e archiviazione dei dati e dei documenti"
    },
    {
      "code": "DIG-4",
      "name": "Reporting e analisi",
      "short": "Reporting",
      "description": "Cruscotti per decidere e uso dei dati da parte dei responsabili"
    },
    {
      "code": "DIG-5",
      "name": "Automazione dei processi",
      "short": "Automazione",
      "description": "Digitalizzazione dei flussi ripetitivi e dei documenti"
    },
    {
      "code": "DIG-6",
      "name": "Digitale con clienti e fornitori",
      "short": "Clienti e fornitori",
      "description": "Strumenti digitali verso il mercato e verso la filiera"
    },
    {
      "code": "DIG-7",
      "name": "Intelligenza artificiale",
      "short": "Intelligenza artificiale",
      "description": "Casi d'uso, regole e competenze per l'intelligenza artificiale"
    },
    {
      "code": "DIG-8",
      "name": "Sicurezza informatica e privacy",
      "short": "Sicurezza e privacy",
      "description": "Misure tecniche, preparazione delle persone e protezione dei dati"
    }
  ],
  "INN": [
    {
      "code": "INN-1",
      "name": "Strategia dell'innovazione",
      "short": "Strategia",
      "description": "Dove e perché innovare e con quali risorse"
    },
    {
      "code": "INN-2",
      "name": "Idee e tendenze",
      "short": "Idee e tendenze",
      "description": "Raccolta delle idee e osservazione di tecnologie e mercati"
    },
    {
      "code": "INN-3",
      "name": "Selezione dei progetti",
      "short": "Selezione progetti",
      "description": "Criteri di scelta e gestione del portafoglio di progetti"
    },
    {
      "code": "INN-4",
      "name": "Sviluppo",
      "short": "Sviluppo",
      "description": "Metodo e tempi di sviluppo di prodotti, servizi e processi"
    },
    {
      "code": "INN-5",
      "name": "Cliente e lancio",
      "short": "Cliente e lancio",
      "description": "Coinvolgimento dei clienti, sperimentazione e lancio sul mercato"
    },
    {
      "code": "INN-6",
      "name": "Collaborazioni esterne",
      "short": "Collaborazioni",
      "description": "Università, centri di ricerca, startup, clienti e fornitori"
    },
    {
      "code": "INN-7",
      "name": "Incentivi e proprietà intellettuale",
      "short": "Incentivi e brevetti",
      "description": "Finanza agevolata per l'innovazione e protezione dei risultati"
    },
    {
      "code": "INN-8",
      "name": "Cultura e risultati",
      "short": "Cultura e risultati",
      "description": "Clima favorevole a sperimentare e misura dei risultati dell'innovazione"
    }
  ],
  "SOS": [
    {
      "code": "SOS-1",
      "name": "Temi rilevanti e strategia",
      "short": "Temi e strategia",
      "description": "Temi di sostenibilità che contano e loro posto nella strategia"
    },
    {
      "code": "SOS-2",
      "name": "Governo e obiettivi",
      "short": "Governo",
      "description": "Responsabilità, obiettivi e consapevolezza interna"
    },
    {
      "code": "SOS-3",
      "name": "Energia ed emissioni",
      "short": "Energia ed emissioni",
      "description": "Consumi energetici, fonti rinnovabili e gas serra"
    },
    {
      "code": "SOS-4",
      "name": "Risorse ed economia circolare",
      "short": "Economia circolare",
      "description": "Materiali, acqua, rifiuti e progettazione circolare"
    },
    {
      "code": "SOS-5",
      "name": "Persone e benessere",
      "short": "Persone",
      "description": "Salute, equità, conciliazione e pari opportunità"
    },
    {
      "code": "SOS-6",
      "name": "Etica e conformità",
      "short": "Etica e conformità",
      "description": "Codice etico, modello 231, segnalazioni e conformità alle norme"
    },
    {
      "code": "SOS-7",
      "name": "Filiera e territorio",
      "short": "Filiera e territorio",
      "description": "Sostenibilità dei fornitori e rapporto con la comunità"
    },
    {
      "code": "SOS-8",
      "name": "Rendicontazione e richieste esterne",
      "short": "Rendicontazione",
      "description": "Dati di sostenibilità per clienti, banche e investitori"
    }
  ]
};

export const MODULE_QUESTIONS: Record<AreaCode, ModuleQuestion[]> = {
  "STR": [
    {
      "id": "STR-1.1",
      "area": "STR",
      "sub": "STR-1",
      "theme": "Visione e direzione",
      "text": "Quanto è chiara e condivisa la direzione dell'azienda per i prossimi 3-5 anni?",
      "levels": [
        "La direzione non è scritta: la conosce chi guida l'azienda e si adatta alle occasioni.",
        "Chi guida l'azienda ha una visione chiara, ma i responsabili la conoscono solo a grandi linee.",
        "Visione e scelte di fondo (mercati, prodotti, dimensione) sono scritte e presentate ai responsabili.",
        "La direzione scritta è il criterio con cui si dice sì o no a opportunità e investimenti."
      ],
      "check": {
        "text": "I responsabili di funzione saprebbero indicare le tre scelte strategiche principali dell'azienda?",
        "options": [
          "Sì",
          "In parte",
          "No"
        ],
        "flag": {
          "minLevel": 3,
          "answers": [
            "No"
          ]
        }
      },
      "na": false
    },
    {
      "id": "STR-1.2",
      "area": "STR",
      "sub": "STR-1",
      "theme": "Vantaggio competitivo",
      "text": "Quanto è definito su cosa l'azienda vuole distinguersi (prezzo, qualità, servizio, specializzazione, innovazione)?",
      "levels": [
        "Non abbiamo definito su che cosa distinguerci dai concorrenti.",
        "Chi guida l'azienda ha un'idea del vantaggio, ma non orienta le scelte quotidiane.",
        "Il posizionamento è esplicito e orienta offerta, prezzi e investimenti principali.",
        "Il posizionamento è verificato con dati di mercato e dei clienti e rivisto quando il mercato cambia."
      ],
      "check": null,
      "na": false
    },
    {
      "id": "STR-2.1",
      "area": "STR",
      "sub": "STR-2",
      "theme": "Analisi a supporto delle scelte",
      "text": "Su cosa si basano le scelte strategiche (nuovi mercati, prodotti, investimenti importanti)?",
      "levels": [
        "Su intuito ed esperienza.",
        "Su qualche dato raccolto di volta in volta (andamento vendite, richieste dei clienti).",
        "Su analisi preparate prima di decidere: mercato, concorrenti, numeri attesi e rischi.",
        "Su analisi con scenari alternativi, e a distanza di tempo si verifica se le scelte hanno dato i risultati attesi."
      ],
      "check": null,
      "na": false
    },
    {
      "id": "STR-2.2",
      "area": "STR",
      "sub": "STR-2",
      "theme": "Osservazione di mercato e concorrenti",
      "text": "Come seguite l'evoluzione del mercato, dei concorrenti e delle regole che vi riguardano?",
      "levels": [
        "Le informazioni arrivano quando capita, da clienti o fornitori.",
        "Qualcuno segue fiere e notizie di settore, senza condividerle in modo ordinato.",
        "Le informazioni su mercato e concorrenti si raccolgono periodicamente e si discutono in direzione almeno una volta l'anno.",
        "Mercato e concorrenti si seguono in modo continuo, con fonti e indicatori definiti che alimentano la revisione della strategia."
      ],
      "check": null,
      "na": false
    },
    {
      "id": "STR-3.1",
      "area": "STR",
      "sub": "STR-3",
      "theme": "Dal piano agli obiettivi",
      "text": "Come si traduce la strategia in obiettivi e progetti per l'anno?",
      "levels": [
        "Non c'è un passaggio esplicito: ogni area lavora sulle proprie urgenze.",
        "Ci sono obiettivi di fatturato o margine, ma non progetti con responsabili e tempi.",
        "Ogni anno si definiscono pochi progetti strategici con responsabile, scadenze e risorse.",
        "Progetti e obiettivi sono collegati al piano, seguiti con indicatori e rivisti in corso d'anno quando serve."
      ],
      "check": null,
      "na": false
    },
    {
      "id": "STR-3.2",
      "area": "STR",
      "sub": "STR-3",
      "theme": "Piano scritto e revisione",
      "text": "Esiste un piano strategico o industriale scritto e come viene aggiornato?",
      "levels": [
        "Non esiste un piano scritto.",
        "Esiste un documento preparato per un'occasione (banca, bando) e poi non aggiornato.",
        "C'è un piano pluriennale scritto, con obiettivi economici e iniziative, aggiornato ogni anno.",
        "Il piano si aggiorna ogni anno con il gruppo di direzione, partendo dalla verifica dei risultati dell'anno precedente."
      ],
      "check": {
        "text": "Il piano è stato aggiornato negli ultimi 12 mesi?",
        "options": [
          "Sì",
          "No",
          "Non c'è un piano"
        ],
        "flag": {
          "minLevel": 3,
          "answers": [
            "No",
            "Non c'è un piano"
          ]
        }
      },
      "na": false
    },
    {
      "id": "STR-3.3",
      "area": "STR",
      "sub": "STR-3",
      "theme": "Indicatori strategici",
      "text": "Con quali indicatori seguite l'avanzamento della strategia?",
      "levels": [
        "Solo con fatturato e utile di fine anno.",
        "Con alcuni indicatori economici mensili, non collegati agli obiettivi strategici.",
        "Con un insieme limitato di indicatori collegati agli obiettivi, discussi periodicamente in direzione.",
        "Con un cruscotto che copre risultati economici, mercato, operazioni e persone, con un obiettivo e un responsabile per ogni indicatore."
      ],
      "check": null,
      "na": false
    },
    {
      "id": "STR-4.1",
      "area": "STR",
      "sub": "STR-4",
      "theme": "Riunioni di direzione",
      "text": "Come funzionano le riunioni del gruppo di direzione?",
      "levels": [
        "Non ci sono riunioni regolari: ci si confronta quando nasce un problema.",
        "Ci sono riunioni, ma senza ordine del giorno né decisioni messe per iscritto.",
        "Le riunioni sono periodiche, con ordine del giorno, numeri aggiornati e decisioni messe per iscritto.",
        "Le riunioni hanno cadenze diverse per livello (operativo, mensile, strategico) e si aprono verificando le azioni decise la volta precedente."
      ],
      "check": {
        "text": "Le decisioni dell'ultima riunione di direzione sono state messe per iscritto con un responsabile?",
        "options": [
          "Sì",
          "No",
          "Non facciamo riunioni"
        ],
        "flag": {
          "minLevel": 3,
          "answers": [
            "No",
            "Non facciamo riunioni"
          ]
        }
      },
      "na": false
    },
    {
      "id": "STR-4.2",
      "area": "STR",
      "sub": "STR-4",
      "theme": "Delega e autonomia",
      "text": "Quanto chi guida l'azienda è coinvolto nelle decisioni operative quotidiane?",
      "levels": [
        "Quasi tutte le decisioni, anche minori, passano da chi guida l'azienda.",
        "I responsabili decidono sulle questioni minori, ma ogni eccezione torna a chi guida l'azienda.",
        "Ogni area ha limiti di autonomia chiari (spesa, prezzi, personale), che vengono rispettati.",
        "Chi guida l'azienda si concentra su strategia e sviluppo; le deleghe sono scritte e si verificano sui risultati."
      ],
      "check": null,
      "na": false
    },
    {
      "id": "STR-5.1",
      "area": "STR",
      "sub": "STR-5",
      "theme": "Organo amministrativo",
      "text": "Che ruolo svolge l'organo amministrativo (consiglio di amministrazione o amministratore unico)?",
      "levels": [
        "Svolge solo adempimenti formali (approvazione del bilancio).",
        "Si riunisce di rado e discute soprattutto l'andamento passato.",
        "Si riunisce con regolarità, esamina piano, risultati e rischi, e prende le decisioni rilevanti.",
        "Include competenze esterne o indipendenti e lavora su un calendario annuale dei temi."
      ],
      "check": null,
      "na": false
    },
    {
      "id": "STR-5.2",
      "area": "STR",
      "sub": "STR-5",
      "theme": "Informazione agli organi e controlli",
      "text": "Che informazioni ricevono amministratori, sindaci o revisore e con che regolarità?",
      "levels": [
        "Ricevono il bilancio a fine anno.",
        "Ricevono situazioni periodiche, spesso solo contabili e in ritardo.",
        "Ricevono con regolarità risultati, previsioni e rischi principali, con il tempo per esaminarli.",
        "Ricevono informazioni con contenuti e tempi definiti e incontrano periodicamente chi gestisce le aree chiave."
      ],
      "check": null,
      "na": false
    },
    {
      "id": "STR-6.1",
      "area": "STR",
      "sub": "STR-6",
      "theme": "Soci e famiglia",
      "text": "Come sono regolati i rapporti tra i soci e, se presente, tra famiglia e impresa?",
      "levels": [
        "Non ci sono regole oltre allo statuto: si decide caso per caso.",
        "Ci sono accordi informali, mai messi per iscritto.",
        "Ci sono patti parasociali o regole scritte su ruoli, ingressi in azienda, dividendi e uscita dei soci.",
        "Le regole scritte si aggiornano, e soci, famiglia e gestione dell'impresa hanno sedi di confronto distinte."
      ],
      "check": null,
      "na": false
    },
    {
      "id": "STR-6.2",
      "area": "STR",
      "sub": "STR-6",
      "theme": "Continuità e successione",
      "text": "Come è preparato il passaggio di testimone al vertice e nei ruoli chiave?",
      "levels": [
        "Il tema non è stato ancora affrontato in modo esplicito.",
        "Se ne parla, ma non ci sono un piano né dei tempi.",
        "C'è un piano con le persone individuate, i tempi e un percorso di preparazione.",
        "Il piano è in corso: le responsabilità passano per gradi e i ruoli chiave hanno sostituti pronti."
      ],
      "check": null,
      "na": false
    },
    {
      "id": "STR-7.1",
      "area": "STR",
      "sub": "STR-7",
      "theme": "Gestione dei rischi",
      "text": "Come vengono individuati e gestiti i rischi principali (clienti, fornitori, persone chiave, mercato, regole)?",
      "levels": [
        "Si affrontano quando si manifestano.",
        "Chi guida l'azienda conosce i rischi principali, ma non ci sono un elenco scritto né contromisure definite.",
        "Esiste una mappa dei rischi principali con probabilità, impatto e azioni di mitigazione.",
        "La mappa si aggiorna almeno una volta l'anno, è collegata a indicatori di allerta e viene discussa dall'organo amministrativo."
      ],
      "check": {
        "text": "Esiste un elenco scritto dei rischi principali aggiornato negli ultimi 12 mesi?",
        "options": [
          "Sì",
          "No"
        ],
        "flag": {
          "minLevel": 3,
          "answers": [
            "No"
          ]
        }
      },
      "na": false
    },
    {
      "id": "STR-7.2",
      "area": "STR",
      "sub": "STR-7",
      "theme": "Adeguati assetti e segnali di crisi",
      "text": "Come presidiate gli adeguati assetti organizzativi, amministrativi e contabili e i segnali di difficoltà previsti dal Codice della crisi?",
      "levels": [
        "Non è un tema che abbiamo ancora affrontato.",
        "Ne siamo consapevoli, ma ci affidiamo al commercialista per gli adempimenti.",
        "Abbiamo strumenti di previsione (cassa a 12 mesi, indicatori) e qualcuno che li verifica con regolarità.",
        "Gli assetti sono documentati e gli indicatori di allerta sono discussi periodicamente dall'organo amministrativo, con azioni già definite se si superano le soglie."
      ],
      "check": null,
      "na": false
    },
    {
      "id": "STR-7.3",
      "area": "STR",
      "sub": "STR-7",
      "theme": "Coperture assicurative e contratti",
      "text": "Come verificate che assicurazioni e contratti principali proteggano davvero l'azienda?",
      "levels": [
        "Le polizze si rinnovano come negli anni precedenti e i contratti non hanno una revisione dedicata.",
        "Si rivedono le polizze quando c'è un sinistro o cambia il broker.",
        "Le coperture si rivedono periodicamente rispetto ai rischi principali e i contratti importanti hanno un controllo legale.",
        "Il programma assicurativo è costruito sulla mappa dei rischi e ci sono contratti standard aggiornati per clienti e fornitori."
      ],
      "check": null,
      "na": false
    },
    {
      "id": "STR-8.1",
      "area": "STR",
      "sub": "STR-8",
      "theme": "Crescita per linee esterne",
      "text": "Come valutate acquisizioni, fusioni o ingressi di nuovi soci come leve di crescita?",
      "levels": [
        "Non è una strada che abbiamo considerato finora.",
        "Valutiamo le occasioni che ci vengono proposte, caso per caso.",
        "Abbiamo criteri chiari su cosa cercare e ci facciamo assistere nelle valutazioni.",
        "Le operazioni straordinarie fanno parte della strategia: seguiamo un elenco di aziende obiettivo e abbiamo un metodo per integrare quelle acquisite."
      ],
      "check": null,
      "na": false
    },
    {
      "id": "STR-8.2",
      "area": "STR",
      "sub": "STR-8",
      "theme": "Alleanze e partnership",
      "text": "Quanto usate alleanze con altre imprese (reti d'impresa, consorzi, accordi commerciali o produttivi)?",
      "levels": [
        "Lavoriamo da soli.",
        "Abbiamo collaborazioni occasionali, legate a singole commesse.",
        "Abbiamo alcune alleanze stabili, con obiettivi e accordi scritti.",
        "Le alleanze si scelgono in base alla strategia, con regole di governo e una verifica periodica dei risultati."
      ],
      "check": null,
      "na": false
    }
  ],
  "FIN": [
    {
      "id": "FIN-1.1",
      "area": "FIN",
      "sub": "FIN-1",
      "theme": "Budget",
      "text": "Come viene preparato il budget annuale?",
      "levels": [
        "Non si prepara un budget.",
        "Si fissano obiettivi di fatturato e qualche voce di costo, senza un conto economico completo.",
        "C'è un budget economico completo, preparato con i responsabili prima dell'inizio dell'anno.",
        "Il budget è economico, patrimoniale e di cassa, e durante l'anno si aggiorna con previsioni di chiusura."
      ],
      "check": {
        "text": "Il budget di quest'anno è stato approvato prima dell'inizio dell'esercizio?",
        "options": [
          "Sì",
          "No",
          "Non c'è un budget"
        ],
        "flag": {
          "minLevel": 3,
          "answers": [
            "No",
            "Non c'è un budget"
          ]
        }
      },
      "na": false
    },
    {
      "id": "FIN-1.2",
      "area": "FIN",
      "sub": "FIN-1",
      "theme": "Piano pluriennale",
      "text": "Avete un piano economico-finanziario a 3-5 anni?",
      "levels": [
        "Non c'è un piano economico-finanziario oltre l'anno in corso.",
        "Si prepara un piano solo quando lo chiede una banca o un bando, poi non si aggiorna.",
        "C'è un piano a 3-5 anni con conto economico, stato patrimoniale e flussi di cassa, aggiornato ogni anno.",
        "Il piano ha scenari sulle ipotesi principali e si usa nelle decisioni di investimento e di finanziamento."
      ],
      "check": null,
      "na": false
    },
    {
      "id": "FIN-2.1",
      "area": "FIN",
      "sub": "FIN-2",
      "theme": "Reporting periodico",
      "text": "Che informazioni economiche ricevete in corso d'anno e con che tempi?",
      "levels": [
        "Il bilancio annuale.",
        "Situazioni contabili trimestrali o semestrali, che arrivano a distanza di tempo.",
        "Un conto economico mensile entro 20-30 giorni, confrontato con il budget.",
        "Un cruscotto mensile entro 10-15 giorni, con indicatori economici, finanziari e operativi e un commento sugli scostamenti."
      ],
      "check": null,
      "na": false
    },
    {
      "id": "FIN-2.2",
      "area": "FIN",
      "sub": "FIN-2",
      "theme": "Analisi degli scostamenti",
      "text": "Cosa succede quando i risultati si discostano dal budget?",
      "levels": [
        "Lo vediamo a fine anno, con il bilancio.",
        "Si commentano gli scostamenti più evidenti, senza azioni definite.",
        "Gli scostamenti rilevanti sono analizzati con i responsabili e portano ad azioni correttive.",
        "Gli scostamenti si analizzano per causa (volumi, prezzi, mix, efficienza) e le azioni decise si verificano il mese successivo."
      ],
      "check": null,
      "na": false
    },
    {
      "id": "FIN-3.1",
      "area": "FIN",
      "sub": "FIN-3",
      "theme": "Contabilità analitica",
      "text": "Come sono attribuiti costi e ricavi alle diverse parti dell'azienda?",
      "levels": [
        "C'è la sola contabilità generale: reparti, linee o commesse non sono distinti.",
        "Si fa qualche ripartizione a mano a fine anno.",
        "Ci sono centri di costo e di ricavo, a cui i costi diretti si attribuiscono ogni mese.",
        "La contabilità analitica è nel gestionale e i costi comuni si ripartiscono con criteri condivisi e stabili."
      ],
      "check": null,
      "na": false
    },
    {
      "id": "FIN-3.2",
      "area": "FIN",
      "sub": "FIN-3",
      "theme": "Margini per prodotto, cliente o commessa",
      "text": "Quanto conoscete la marginalità di prodotti, clienti o commesse?",
      "levels": [
        "Si conosce solo il risultato complessivo.",
        "Si stima il margine dei prodotti o clienti principali, saltuariamente.",
        "Il margine di contribuzione si calcola con regolarità per prodotto, cliente o commessa.",
        "I margini si confrontano con il preventivo e si usano per decidere prezzi, mix e clienti su cui investire."
      ],
      "check": {
        "text": "Sapreste indicare oggi i cinque clienti o prodotti con il margine più basso?",
        "options": [
          "Sì",
          "No"
        ],
        "flag": {
          "minLevel": 3,
          "answers": [
            "No"
          ]
        }
      },
      "na": false
    },
    {
      "id": "FIN-3.3",
      "area": "FIN",
      "sub": "FIN-3",
      "theme": "Preventivazione e costi standard",
      "text": "Come si calcola il costo di un prodotto, servizio o commessa prima di fare il prezzo?",
      "levels": [
        "A esperienza, partendo dal prezzo di mercato.",
        "Con un calcolo dei costi diretti principali; i costi generali si stimano a percentuale.",
        "Con schede di costo aggiornate (materiali, ore, lavorazioni esterne) e quote di costi generali definite.",
        "Con costi standard aggiornati periodicamente, e il costo preventivato si confronta sempre con quello effettivo."
      ],
      "check": null,
      "na": false
    },
    {
      "id": "FIN-4.1",
      "area": "FIN",
      "sub": "FIN-4",
      "theme": "Previsione di cassa",
      "text": "Come prevedete l'andamento della liquidità?",
      "levels": [
        "Si guarda il saldo dei conti correnti.",
        "Si prevedono a breve le uscite principali (stipendi, imposte, fornitori importanti).",
        "C'è un prospetto di cassa a 3-6 mesi, aggiornato almeno una volta al mese.",
        "La previsione è settimanale nel breve e mensile a 12 mesi, e si confronta con quanto è accaduto."
      ],
      "check": {
        "text": "Avete un prospetto di cassa aggiornato nell'ultimo mese?",
        "options": [
          "Sì",
          "No"
        ],
        "flag": {
          "minLevel": 3,
          "answers": [
            "No"
          ]
        }
      },
      "na": false
    },
    {
      "id": "FIN-4.2",
      "area": "FIN",
      "sub": "FIN-4",
      "theme": "Gestione della tesoreria",
      "text": "Come sono gestiti conti, pagamenti e liquidità disponibile?",
      "levels": [
        "I pagamenti si decidono giorno per giorno e ogni conto si gestisce per conto proprio.",
        "C'è un calendario dei pagamenti principali, con qualche controllo sui saldi.",
        "C'è un calendario dei pagamenti con autorizzazioni definite e una visione unica dei saldi di tutti i conti.",
        "La tesoreria è accentrata, con regole sull'impiego della liquidità e, dove servono, coperture dei rischi (tassi, cambi, materie prime)."
      ],
      "check": null,
      "na": false
    },
    {
      "id": "FIN-5.1",
      "area": "FIN",
      "sub": "FIN-5",
      "theme": "Crediti verso clienti",
      "text": "Come gestite incassi e crediti verso clienti?",
      "levels": [
        "I solleciti partono quando serve liquidità.",
        "L'amministrazione sollecita i ritardi, senza regole condivise con il commerciale.",
        "Le condizioni di pagamento sono definite, lo scadenzario si controlla ogni settimana e i solleciti seguono fasi stabilite.",
        "Il rischio del cliente si valuta prima della vendita, con un fido assegnato, e ci sono obiettivi sui giorni di incasso."
      ],
      "check": null,
      "na": false
    },
    {
      "id": "FIN-5.2",
      "area": "FIN",
      "sub": "FIN-5",
      "theme": "Governo del circolante",
      "text": "Quanto conoscete e governate il capitale circolante (crediti, scorte, debiti verso fornitori)?",
      "levels": [
        "Non viene misurato.",
        "Si guarda a fine anno con il bilancio.",
        "Si misurano ogni mese i giorni di incasso, di pagamento e di scorta.",
        "Ci sono obiettivi sui giorni di circolante assegnati ai responsabili, con azioni specifiche e risultati seguiti nel tempo."
      ],
      "check": null,
      "na": false
    },
    {
      "id": "FIN-6.1",
      "area": "FIN",
      "sub": "FIN-6",
      "theme": "Banche e affidamenti",
      "text": "Come gestite i rapporti con le banche e la struttura dei finanziamenti?",
      "levels": [
        "Si chiede credito quando serve, alla banca abituale.",
        "Lavoriamo con più banche, senza un quadro d'insieme di linee, costi e scadenze.",
        "C'è un quadro aggiornato di affidamenti, costi e scadenze, la Centrale Rischi si controlla e le banche ricevono informazioni periodiche.",
        "La struttura finanziaria è pianificata, con scadenze coerenti con gli impieghi, e le banche sono informate con regolarità sui piani."
      ],
      "check": null,
      "na": false
    },
    {
      "id": "FIN-6.2",
      "area": "FIN",
      "sub": "FIN-6",
      "theme": "Merito di credito e fonti alternative",
      "text": "Quanto conoscete e curate il vostro merito di credito e le fonti di finanziamento diverse dal credito bancario?",
      "levels": [
        "Non conosciamo ancora i criteri con cui ci valutano banche e Fondo di garanzia.",
        "Ne abbiamo un'idea dai colloqui con le banche.",
        "Seguiamo gli indicatori su cui siamo valutati (rating, Fondo di garanzia) e conosciamo alternative come leasing, garanzie pubbliche e finanza agevolata.",
        "Lavoriamo sugli indicatori per migliorare il merito di credito e scegliamo le fonti (anche factoring, minibond, capitale) in base al piano."
      ],
      "check": null,
      "na": false
    },
    {
      "id": "FIN-7.1",
      "area": "FIN",
      "sub": "FIN-7",
      "theme": "Valutazione degli investimenti",
      "text": "Come vengono valutati gli investimenti importanti?",
      "levels": [
        "Si decide in base all'opportunità o alla disponibilità di cassa.",
        "Si confrontano preventivi, senza calcolare il ritorno.",
        "Per gli investimenti principali si calcolano ritorno, tempi di recupero e copertura finanziaria, considerando anche gli incentivi.",
        "C'è un processo con soglie di approvazione, e a distanza di tempo i risultati si confrontano con le attese."
      ],
      "check": null,
      "na": false
    },
    {
      "id": "FIN-7.2",
      "area": "FIN",
      "sub": "FIN-7",
      "theme": "Utili e patrimonio",
      "text": "Come si decide quanta parte degli utili reinvestire e quanta distribuire?",
      "levels": [
        "Caso per caso, in base alle esigenze dei soci.",
        "Si distribuisce quando la cassa lo permette.",
        "Esiste un orientamento condiviso tra i soci, coerente con i fabbisogni di investimento.",
        "C'è una politica scritta su dividendi e patrimonio, collegata al piano e al livello di indebitamento desiderato."
      ],
      "check": null,
      "na": false
    },
    {
      "id": "FIN-8.1",
      "area": "FIN",
      "sub": "FIN-8",
      "theme": "Chiusure e controlli interni",
      "text": "Come sono organizzate le chiusure contabili e i controlli interni (riconciliazioni, deleghe di spesa, separazione dei compiti)?",
      "levels": [
        "Le chiusure si fanno a fine anno con il commercialista; i controlli sono affidati all'attenzione delle persone.",
        "Le chiusure periodiche non hanno una cadenza fissa e le procedure scritte sono poche.",
        "Le chiusure sono mensili, con un calendario, le riconciliazioni di banche, clienti e fornitori e deleghe di spesa definite.",
        "Le procedure sono scritte e i controlli si verificano periodicamente, anche da parte di revisore o sindaco, lasciandone traccia."
      ],
      "check": null,
      "na": false
    },
    {
      "id": "FIN-8.2",
      "area": "FIN",
      "sub": "FIN-8",
      "theme": "Pianificazione fiscale",
      "text": "Come gestite gli aspetti fiscali oltre agli adempimenti?",
      "levels": [
        "Ci occupiamo solo delle scadenze, con il commercialista.",
        "Valutiamo con il consulente qualche agevolazione a fine anno.",
        "Pianifichiamo con anticipo le imposte e l'uso delle agevolazioni (crediti d'imposta, iperammortamento, patent box).",
        "La pianificazione fiscale è integrata con budget e investimenti, e i rischi fiscali sono sotto controllo con la documentazione in ordine."
      ],
      "check": null,
      "na": false
    },
    {
      "id": "FIN-8.3",
      "area": "FIN",
      "sub": "FIN-8",
      "theme": "Organizzazione della funzione",
      "text": "Come è organizzata la funzione amministrazione e finanza?",
      "levels": [
        "Una persona amministrativa e il commercialista esterno.",
        "Un piccolo ufficio concentrato su contabilità e adempimenti.",
        "Un responsabile amministrativo e finanziario che segue anche budget, cassa e banche.",
        "Una funzione con competenze di controllo di gestione, il cui responsabile partecipa alle decisioni di direzione."
      ],
      "check": null,
      "na": false
    }
  ],
  "MKT": [
    {
      "id": "MKT-1.1",
      "area": "MKT",
      "sub": "MKT-1",
      "theme": "Segmenti di clientela",
      "text": "Come sono individuati i segmenti di clientela su cui puntare?",
      "levels": [
        "Serviamo tutti i clienti che arrivano, senza distinzioni.",
        "Si distinguono i clienti grandi da quelli piccoli.",
        "I segmenti sono definiti per esigenze, settore o canale, e di ciascuno conosciamo fatturato e margine.",
        "I segmenti prioritari sono scelti per attrattività e capacità di servirli, e hanno offerte e azioni commerciali dedicate."
      ],
      "check": null,
      "na": false
    },
    {
      "id": "MKT-1.2",
      "area": "MKT",
      "sub": "MKT-1",
      "theme": "Conoscenza del mercato",
      "text": "Quanto conoscete dimensioni, andamento e quote del vostro mercato?",
      "levels": [
        "Non abbiamo dati sul mercato.",
        "Abbiamo una percezione basata sull'esperienza e sui clienti.",
        "Stimiamo dimensione e crescita del mercato e la nostra quota nei segmenti principali.",
        "Usiamo dati di mercato aggiornati (associazioni, banche dati, ricerche) per misurare la quota e orientare dove crescere."
      ],
      "check": null,
      "na": false
    },
    {
      "id": "MKT-2.1",
      "area": "MKT",
      "sub": "MKT-2",
      "theme": "Proposta di valore",
      "text": "Quanto è chiaro perché i clienti scelgono voi invece della concorrenza?",
      "levels": [
        "Non lo abbiamo ancora verificato.",
        "Lo sappiamo a grandi linee, ma ognuno in azienda lo racconta in modo diverso.",
        "La proposta di valore è definita per segmento e verificata con alcuni clienti.",
        "È verificata con regolarità (interviste, trattative vinte e perse) e guida offerta, prezzi e comunicazione."
      ],
      "check": {
        "text": "Negli ultimi 12 mesi avete analizzato perché avete perso le trattative principali?",
        "options": [
          "Sì",
          "No"
        ],
        "flag": {
          "minLevel": 3,
          "answers": [
            "No"
          ]
        }
      },
      "na": false
    },
    {
      "id": "MKT-2.2",
      "area": "MKT",
      "sub": "MKT-2",
      "theme": "Portafoglio di offerta",
      "text": "Come gestite il portafoglio di prodotti o servizi?",
      "levels": [
        "L'offerta cresce per aggiunte successive; di rado si toglie qualcosa.",
        "Si eliminano prodotti o servizi in modo occasionale.",
        "L'offerta si rivede periodicamente su vendite e margini, decidendo che cosa sviluppare e che cosa eliminare.",
        "Ogni linea ha un ruolo e obiettivi propri, e introduzioni ed eliminazioni sono programmate."
      ],
      "check": null,
      "na": false
    },
    {
      "id": "MKT-3.1",
      "area": "MKT",
      "sub": "MKT-3",
      "theme": "Marca e comunicazione",
      "text": "Come gestite marca e comunicazione verso il mercato?",
      "levels": [
        "Non c'è un'attività di comunicazione pianificata.",
        "Abbiamo sito, materiali e presenza alle fiere, senza un piano né una misura dei risultati.",
        "C'è un piano annuale di comunicazione, con messaggi coerenti, budget e responsabile.",
        "La comunicazione ha obiettivi misurati (notorietà, contatti generati) e i risultati servono a correggere il piano."
      ],
      "check": null,
      "na": false
    },
    {
      "id": "MKT-3.2",
      "area": "MKT",
      "sub": "MKT-3",
      "theme": "Presenza digitale",
      "text": "Quanto il sito e i canali online lavorano per l'azienda?",
      "levels": [
        "Il sito presenta l'azienda e si aggiorna di rado; i canali social non sono presidiati.",
        "Il sito è aggiornato e sui social si pubblica ogni tanto, senza obiettivi.",
        "Sito e canali online aggiornati con regolarità, con contenuti utili ai clienti e misura delle visite.",
        "La presenza online è progettata per generare contatti, con contenuti pianificati e conversioni misurate."
      ],
      "check": null,
      "na": false
    },
    {
      "id": "MKT-4.1",
      "area": "MKT",
      "sub": "MKT-4",
      "theme": "Generazione di nuovi contatti",
      "text": "Come generate nuovi contatti commerciali?",
      "levels": [
        "Soprattutto con il passaparola e le richieste spontanee.",
        "Con iniziative occasionali (fiere, campagne, liste di contatti).",
        "Con attività programmate e misurate per canale (digitale, eventi, partner, telefono).",
        "Con un processo continuo che misura costo e conversione per canale e sposta il budget sui canali più efficaci."
      ],
      "check": null,
      "na": false
    },
    {
      "id": "MKT-4.2",
      "area": "MKT",
      "sub": "MKT-4",
      "theme": "Marketing e vendite insieme",
      "text": "Quanto marketing e vendite lavorano in modo coordinato?",
      "levels": [
        "Non c'è un'attività di marketing distinta dalle vendite.",
        "Il marketing prepara i materiali, che le vendite usano solo in parte.",
        "Marketing e vendite hanno obiettivi comuni e criteri condivisi per passare i contatti alle vendite.",
        "C'è un processo unico dal primo contatto alla vendita, e le vendite danno un riscontro sulla qualità dei contatti ricevuti."
      ],
      "check": null,
      "na": false
    },
    {
      "id": "MKT-5.1",
      "area": "MKT",
      "sub": "MKT-5",
      "theme": "Processo di vendita e CRM",
      "text": "Come sono seguite le trattative commerciali?",
      "levels": [
        "Ogni venditore segue i propri clienti con il proprio metodo e le informazioni restano a lui.",
        "Su fogli di calcolo o note personali, condivisi solo in parte.",
        "Le fasi della vendita sono definite e le trattative sono registrate in un CRM usato da tutto il commerciale.",
        "Dal CRM si ricavano previsioni di vendita e tassi di conversione per fase, e le trattative in corso si analizzano periodicamente."
      ],
      "check": {
        "text": "Sapreste indicare oggi il valore delle trattative aperte e la loro probabilità di chiusura?",
        "options": [
          "Sì",
          "No"
        ],
        "flag": {
          "minLevel": 3,
          "answers": [
            "No"
          ]
        }
      },
      "na": false
    },
    {
      "id": "MKT-5.2",
      "area": "MKT",
      "sub": "MKT-5",
      "theme": "Offerte e preventivi",
      "text": "Come vengono preparate e seguite le offerte ai clienti?",
      "levels": [
        "Ogni offerta è preparata da zero, con tempi variabili.",
        "Ci sono modelli di offerta, ma tempi e seguito sono lasciati al singolo venditore.",
        "Modelli e regole sono definiti, i tempi di risposta si misurano e le offerte aperte vengono sempre richiamate.",
        "Le offerte si compongono con regole e prezzi preimpostati, e si analizzano quelle vinte e quelle perse."
      ],
      "check": null,
      "na": false
    },
    {
      "id": "MKT-6.1",
      "area": "MKT",
      "sub": "MKT-6",
      "theme": "Organizzazione e incentivi",
      "text": "Come sono organizzati, guidati e incentivati i venditori (interni, agenti, distributori)?",
      "levels": [
        "Ogni venditore lavora in autonomia e gli incentivi sono legati al solo fatturato.",
        "Ci sono obiettivi di fatturato annuali, con poche verifiche intermedie.",
        "Ci sono obiettivi per cliente o zona, riunioni commerciali periodiche e incentivi che tengono conto del margine.",
        "I ruoli di sviluppo e di gestione dei clienti sono distinti, con affiancamento e incentivi su margine e obiettivi strategici."
      ],
      "check": null,
      "na": false
    },
    {
      "id": "MKT-6.2",
      "area": "MKT",
      "sub": "MKT-6",
      "theme": "Copertura e canali",
      "text": "Come sono decisi zone, canali e copertura dei clienti (incluso l'estero)?",
      "levels": [
        "Per storia: ogni venditore o agente ha i suoi clienti.",
        "Le zone sono definite, ma la copertura dei clienti potenziali non è misurata.",
        "Zone e canali sono definiti in base al potenziale, con piani di visita per i clienti principali.",
        "La copertura è progettata sul potenziale, con canali diversi per segmento (diretto, agenti, distributori, digitale, estero) e obiettivi per canale."
      ],
      "check": null,
      "na": false
    },
    {
      "id": "MKT-7.1",
      "area": "MKT",
      "sub": "MKT-7",
      "theme": "Prezzi e sconti",
      "text": "Come si governano listini, sconti e condizioni commerciali?",
      "levels": [
        "Ogni venditore decide sconti e condizioni caso per caso.",
        "C'è un listino, ma gli sconti sono frequenti e non tracciati.",
        "Gli sconti hanno regole e livelli di autorizzazione, e i prezzi effettivi si analizzano periodicamente.",
        "I prezzi si basano sul valore per il cliente oltre che sui costi, e si analizza quanto variano gli sconti da cliente a cliente."
      ],
      "check": null,
      "na": false
    },
    {
      "id": "MKT-7.2",
      "area": "MKT",
      "sub": "MKT-7",
      "theme": "Revisione dei prezzi",
      "text": "Come gestite gli aumenti di prezzo quando crescono i costi?",
      "levels": [
        "Di solito assorbiamo l'aumento dei costi e rinviamo l'adeguamento dei prezzi.",
        "Aumentiamo quando i margini sono già scesi, con trattative caso per caso.",
        "I listini si rivedono periodicamente e i contratti principali hanno clausole di adeguamento.",
        "Costi e prezzi di mercato si seguono in modo continuo, i contratti sono indicizzati e la comunicazione degli aumenti è preparata per segmento."
      ],
      "check": null,
      "na": false
    },
    {
      "id": "MKT-8.1",
      "area": "MKT",
      "sub": "MKT-8",
      "theme": "Clienti principali",
      "text": "Come gestite i clienti più importanti?",
      "levels": [
        "Come tutti gli altri.",
        "Li segue personalmente chi guida l'azienda o un venditore, senza un piano.",
        "Ogni cliente principale ha un responsabile dedicato e un piano annuale.",
        "I piani sono condivisi con i clienti principali in incontri periodici, e per ciascuno si misurano quota e redditività."
      ],
      "check": null,
      "na": false
    },
    {
      "id": "MKT-8.2",
      "area": "MKT",
      "sub": "MKT-8",
      "theme": "Soddisfazione e fidelizzazione",
      "text": "Come misurate e migliorate la soddisfazione dei clienti?",
      "levels": [
        "La ricaviamo dai reclami che riceviamo.",
        "Chiediamo un parere ai clienti in modo occasionale.",
        "Facciamo un'indagine di soddisfazione periodica e i reclami hanno una gestione definita.",
        "Seguiamo nel tempo indicatori di soddisfazione e di abbandono, e verifichiamo l'effetto delle azioni di miglioramento."
      ],
      "check": null,
      "na": false
    },
    {
      "id": "MKT-8.3",
      "area": "MKT",
      "sub": "MKT-8",
      "theme": "Servizio dopo la vendita",
      "text": "Come è organizzato il servizio al cliente dopo la vendita (assistenza, ricambi, consulenza)?",
      "levels": [
        "Si interviene quando il cliente chiama.",
        "C'è un riferimento per l'assistenza, senza tempi definiti.",
        "Il servizio è organizzato, con tempi di risposta definiti e richieste registrate.",
        "Il servizio ha livelli misurati e offerte dedicate, e le informazioni raccolte servono a migliorare i prodotti."
      ],
      "check": null,
      "na": true
    }
  ],
  "PER": [
    {
      "id": "PER-1.1",
      "area": "PER",
      "sub": "PER-1",
      "theme": "Organigramma e responsabilità",
      "text": "Quanto sono chiari organigramma e responsabilità?",
      "levels": [
        "Non c'è un organigramma e alcuni ruoli si sovrappongono.",
        "C'è un organigramma, ma non è aggiornato o non rispecchia il lavoro di oggi.",
        "L'organigramma è aggiornato e i ruoli principali sono descritti, con responsabilità e riporti.",
        "L'organizzazione si rivede in base alla strategia e ogni posizione chiave ha responsabilità e indicatori propri."
      ],
      "check": {
        "text": "L'organigramma è stato aggiornato negli ultimi 12 mesi?",
        "options": [
          "Sì",
          "No",
          "Non c'è"
        ],
        "flag": {
          "minLevel": 3,
          "answers": [
            "No",
            "Non c'è"
          ]
        }
      },
      "na": false
    },
    {
      "id": "PER-1.2",
      "area": "PER",
      "sub": "PER-1",
      "theme": "Coordinamento tra funzioni",
      "text": "Come si coordinano le diverse funzioni (commerciale, produzione, acquisti, amministrazione)?",
      "levels": [
        "Ogni funzione lavora in autonomia e il coordinamento avviene quando nasce un problema.",
        "Ci si coordina tramite chi guida l'azienda, che fa da collegamento.",
        "Ci sono momenti di coordinamento periodici e responsabilità chiare sui passaggi tra funzioni.",
        "I processi principali sono disegnati da un capo all'altro, con un responsabile e indicatori comuni alle funzioni coinvolte."
      ],
      "check": null,
      "na": false
    },
    {
      "id": "PER-2.1",
      "area": "PER",
      "sub": "PER-2",
      "theme": "Pianificazione delle persone",
      "text": "Come pianificate il fabbisogno di persone e competenze?",
      "levels": [
        "Si assume quando qualcuno lascia o quando il carico di lavoro lo impone.",
        "Si stimano le assunzioni dell'anno insieme al budget.",
        "C'è un piano annuale di organico e competenze, collegato agli obiettivi.",
        "C'è un piano pluriennale delle competenze critiche, che considera uscite e pensionamenti e fa partire le azioni in anticipo."
      ],
      "check": null,
      "na": false
    },
    {
      "id": "PER-2.2",
      "area": "PER",
      "sub": "PER-2",
      "theme": "Gestione del personale",
      "text": "Come è organizzata la gestione del personale (amministrazione, regole interne, dati)?",
      "levels": [
        "Se ne occupano il consulente del lavoro e chi guida l'azienda.",
        "Una persona interna gestisce gli aspetti amministrativi.",
        "C'è una funzione o un referente dedicato, con regolamenti interni e dati del personale aggiornati.",
        "La funzione partecipa alle decisioni di direzione e porta con regolarità indicatori su costo, assenze e uscite."
      ],
      "check": null,
      "na": false
    },
    {
      "id": "PER-3.1",
      "area": "PER",
      "sub": "PER-3",
      "theme": "Selezione",
      "text": "Come selezionate le nuove persone?",
      "levels": [
        "Con il passaparola e colloqui informali.",
        "Con annunci e colloqui, senza criteri definiti.",
        "Con profili scritti e più colloqui, valutati con criteri condivisi.",
        "Con un processo che comprende prove pratiche, e la riuscita delle assunzioni si verifica nel tempo."
      ],
      "check": null,
      "na": false
    },
    {
      "id": "PER-3.2",
      "area": "PER",
      "sub": "PER-3",
      "theme": "Attrattività come datore di lavoro",
      "text": "Quanto l'azienda riesce ad attrarre candidati per i ruoli che servono?",
      "levels": [
        "Facciamo fatica a trovare candidati e non ne abbiamo ancora analizzato le ragioni.",
        "Attraiamo per i ruoli generici, molto meno per quelli specializzati.",
        "Curiamo la presentazione come datore di lavoro (sito, annunci, scuole e università) e misuriamo le candidature.",
        "Abbiamo una proposta chiara per chi lavora con noi e rapporti stabili con scuole e università; i tempi di copertura delle posizioni sono misurati."
      ],
      "check": {
        "text": "Negli ultimi 12 mesi avete coperto le posizioni aperte nei tempi previsti?",
        "options": [
          "Quasi tutte",
          "Circa metà",
          "Poche"
        ],
        "flag": {
          "minLevel": 3,
          "answers": [
            "Poche"
          ]
        }
      },
      "na": false
    },
    {
      "id": "PER-4.1",
      "area": "PER",
      "sub": "PER-4",
      "theme": "Inserimento",
      "text": "Come vengono inserite le persone appena assunte?",
      "levels": [
        "Imparano sul campo.",
        "Con l'affiancamento a un collega, senza un programma.",
        "Con un programma di inserimento: referente, formazione iniziale e verifica a fine prova.",
        "Con un percorso di cui si misurano i risultati (permanenza a 12 mesi, opinione dei nuovi assunti) per migliorarlo."
      ],
      "check": null,
      "na": false
    },
    {
      "id": "PER-4.2",
      "area": "PER",
      "sub": "PER-4",
      "theme": "Formazione e sviluppo",
      "text": "Come gestite formazione e crescita professionale?",
      "levels": [
        "Con la formazione obbligatoria.",
        "Con corsi su richiesta delle persone o su proposta dei fornitori.",
        "Con un piano annuale della formazione basato sulle competenze necessarie, anche con i fondi interprofessionali.",
        "Con percorsi di sviluppo per ruolo e per le persone a potenziale, verificando l'efficacia della formazione."
      ],
      "check": {
        "text": "Esiste un piano della formazione per quest'anno?",
        "options": [
          "Sì",
          "No"
        ],
        "flag": {
          "minLevel": 3,
          "answers": [
            "No"
          ]
        }
      },
      "na": false
    },
    {
      "id": "PER-5.1",
      "area": "PER",
      "sub": "PER-5",
      "theme": "Obiettivi e valutazione",
      "text": "Come vengono assegnati gli obiettivi e valutate le prestazioni?",
      "levels": [
        "Non ci sono obiettivi individuali né valutazioni.",
        "Gli obiettivi sono informali e il giudizio del responsabile non viene condiviso con la persona.",
        "I ruoli chiave hanno obiettivi annuali scritti e un colloquio di valutazione almeno annuale.",
        "Tutti i ruoli hanno obiettivi collegati alla strategia, e la valutazione si usa per sviluppo e riconoscimenti."
      ],
      "check": null,
      "na": false
    },
    {
      "id": "PER-5.2",
      "area": "PER",
      "sub": "PER-5",
      "theme": "Riscontro e prestazioni insufficienti",
      "text": "Come si danno riscontri sul lavoro e come si gestiscono le prestazioni insufficienti?",
      "levels": [
        "Se ne parla quando nasce un problema rilevante.",
        "Il riscontro è lasciato al singolo responsabile e le prestazioni insufficienti si affrontano tardi.",
        "Ci sono momenti periodici di riscontro e percorsi definiti per chi non raggiunge gli obiettivi.",
        "Il riscontro continuo è pratica di tutti i responsabili, e i piani di miglioramento hanno tempi e decisioni conseguenti."
      ],
      "check": null,
      "na": false
    },
    {
      "id": "PER-6.1",
      "area": "PER",
      "sub": "PER-6",
      "theme": "Retribuzione e riconoscimenti",
      "text": "Come sono definite retribuzioni, premi e benefit?",
      "levels": [
        "Caso per caso, spesso in base alle richieste.",
        "Aumenti e premi sono decisi da chi guida l'azienda, senza criteri dichiarati.",
        "Ci sono criteri per livello e ruolo, un confronto con il mercato e premi legati ai risultati.",
        "La politica retributiva è scritta, i premi sono collegati agli obiettivi e l'equità interna si verifica periodicamente."
      ],
      "check": null,
      "na": false
    },
    {
      "id": "PER-6.2",
      "area": "PER",
      "sub": "PER-6",
      "theme": "Welfare e flessibilità",
      "text": "Quanto welfare aziendale e flessibilità del lavoro sono usati in modo pensato?",
      "levels": [
        "Applichiamo quanto prevede il contratto.",
        "Ci sono iniziative isolate (buoni, flessibilità concessa caso per caso).",
        "Ci sono un piano di welfare e regole su orari e lavoro da remoto, comunicati a tutti.",
        "Welfare e flessibilità sono costruiti sulle esigenze rilevate tra le persone, e se ne misurano utilizzo e gradimento."
      ],
      "check": null,
      "na": false
    },
    {
      "id": "PER-7.1",
      "area": "PER",
      "sub": "PER-7",
      "theme": "Ruoli chiave e talenti",
      "text": "Come proteggete i ruoli chiave e fate crescere chi ha potenziale?",
      "levels": [
        "Non abbiamo ancora individuato le persone difficili da sostituire.",
        "Le conosciamo, ma non ci sono sostituti né azioni per trattenerle.",
        "I ruoli chiave sono individuati, con sostituti indicati e azioni per trattenere le persone importanti.",
        "Ci sono un piano di successione per i ruoli chiave e percorsi per le persone a potenziale, rivisti ogni anno."
      ],
      "check": null,
      "na": false
    },
    {
      "id": "PER-7.2",
      "area": "PER",
      "sub": "PER-7",
      "theme": "Sviluppo dei responsabili",
      "text": "Come preparate i responsabili a guidare le persone?",
      "levels": [
        "Si diventa responsabili per anzianità o competenza tecnica, senza una preparazione dedicata.",
        "Con qualche corso occasionale.",
        "Con un percorso di sviluppo su guida dei collaboratori, delega e gestione dei conflitti.",
        "Con un modello condiviso dei comportamenti attesi e una valutazione che raccoglie anche il parere dei collaboratori."
      ],
      "check": null,
      "na": false
    },
    {
      "id": "PER-8.1",
      "area": "PER",
      "sub": "PER-8",
      "theme": "Clima e coinvolgimento",
      "text": "Come conoscete e curate il clima e il coinvolgimento delle persone?",
      "levels": [
        "Non viene rilevato.",
        "Se ne ha un'idea dal confronto informale.",
        "Facciamo un'indagine periodica di clima e abbiamo momenti di ascolto organizzati.",
        "All'indagine periodica segue un piano di azione condiviso, e assenze e uscite volontarie si seguono nel tempo."
      ],
      "check": {
        "text": "Conoscete il tasso di uscite volontarie dell'ultimo anno?",
        "options": [
          "Sì",
          "No"
        ],
        "flag": {
          "minLevel": 3,
          "answers": [
            "No"
          ]
        }
      },
      "na": false
    },
    {
      "id": "PER-8.2",
      "area": "PER",
      "sub": "PER-8",
      "theme": "Comunicazione interna",
      "text": "Come circolano in azienda le informazioni su risultati, obiettivi e cambiamenti?",
      "levels": [
        "Le informazioni circolano a voce, senza canali definiti.",
        "Chi guida l'azienda comunica in modo occasionale, soprattutto nei momenti difficili.",
        "Ci sono incontri periodici con tutto il personale su risultati e obiettivi, e strumenti di comunicazione interna definiti.",
        "La comunicazione è regolare e a due direzioni: ci sono canali per raccogliere domande e proposte, che ricevono risposta."
      ],
      "check": null,
      "na": false
    }
  ],
  "OPS": [
    {
      "id": "OPS-1.1",
      "area": "OPS",
      "sub": "OPS-1",
      "theme": "Fare o comprare",
      "text": "Come decidete cosa produrre o erogare all'interno e cosa affidare all'esterno?",
      "levels": [
        "Si prosegue con l'assetto adottato in passato, senza una valutazione dedicata.",
        "Si valuta quando c'è un problema di capacità o di costo.",
        "Le scelte principali sono valutate con un confronto di costi, qualità e controllo.",
        "Ci sono criteri collegati alla strategia (competenze distintive, rischi, costi totali) e le scelte si rivedono periodicamente."
      ],
      "check": null,
      "na": false
    },
    {
      "id": "OPS-1.2",
      "area": "OPS",
      "sub": "OPS-1",
      "theme": "Capacità e sedi",
      "text": "Quanto conoscete e pianificate la capacità produttiva o di servizio e la configurazione delle sedi?",
      "levels": [
        "I limiti di capacità emergono quando gli ordini superano ciò che riusciamo a evadere.",
        "Conosciamo a grandi linee la capacità dei reparti principali.",
        "La capacità è misurata per reparto o squadra, con un piano di adeguamento collegato alle previsioni.",
        "Capacità e sedi sono pianificate sul medio periodo, con scenari di domanda e investimenti programmati."
      ],
      "check": null,
      "na": false
    },
    {
      "id": "OPS-2.1",
      "area": "OPS",
      "sub": "OPS-2",
      "theme": "Allineamento tra vendite e operations",
      "text": "Come si allineano previsioni di vendita e capacità di produzione o erogazione?",
      "levels": [
        "Si produce o si eroga sugli ordini, affrontando i picchi quando arrivano.",
        "Il commerciale comunica le previsioni in modo informale.",
        "C'è una riunione mensile tra vendite, operations e acquisti su previsioni, capacità e scorte.",
        "La pianificazione è integrata: l'accuratezza delle previsioni si misura e le decisioni su capacità e scorte sono condivise."
      ],
      "check": null,
      "na": false
    },
    {
      "id": "OPS-2.2",
      "area": "OPS",
      "sub": "OPS-2",
      "theme": "Programmazione",
      "text": "Come viene programmato il lavoro quotidiano (produzione, cantieri, servizi)?",
      "levels": [
        "Giorno per giorno in base alle urgenze.",
        "Con un programma settimanale fatto a mano, che cambia spesso in corso d'opera.",
        "Con un programma basato su capacità, priorità e materiali disponibili, rispettato nella maggior parte dei casi.",
        "Con il supporto del gestionale: il rispetto dei piani si misura e le cause degli scostamenti si analizzano."
      ],
      "check": {
        "text": "Misurate la percentuale di consegne o servizi completati nei tempi promessi?",
        "options": [
          "Sì",
          "No"
        ],
        "flag": {
          "minLevel": 3,
          "answers": [
            "No"
          ]
        }
      },
      "na": false
    },
    {
      "id": "OPS-3.1",
      "area": "OPS",
      "sub": "OPS-3",
      "theme": "Produttività ed efficienza",
      "text": "Come misurate la produttività di persone, macchine o squadre?",
      "levels": [
        "Non viene misurata.",
        "Si osserva a grandi linee (ore lavorate, pezzi o servizi a fine mese).",
        "Con indicatori di produttività o di utilizzo, rilevati con regolarità per reparto o squadra.",
        "Con indicatori di efficienza complessiva (per esempio ore produttive su ore disponibili), con obiettivi e analisi delle perdite."
      ],
      "check": null,
      "na": false
    },
    {
      "id": "OPS-3.2",
      "area": "OPS",
      "sub": "OPS-3",
      "theme": "Standard di lavoro",
      "text": "Quanto sono definiti i modi di lavorare e l'ordine dei posti di lavoro?",
      "levels": [
        "Ogni persona lavora secondo la propria esperienza.",
        "Ci sono istruzioni scritte per alcune attività, non sempre aggiornate.",
        "Le attività principali hanno istruzioni e standard, e l'ordine dei posti di lavoro si verifica.",
        "Gli standard si aggiornano con chi lavora, sono visibili sul posto e sono la base da cui partono i miglioramenti."
      ],
      "check": null,
      "na": false
    },
    {
      "id": "OPS-4.1",
      "area": "OPS",
      "sub": "OPS-4",
      "theme": "Controlli e indicatori di qualità",
      "text": "Come garantite la qualità di prodotti o servizi?",
      "levels": [
        "Si interviene sui problemi segnalati dai clienti.",
        "Con controlli a fine processo, registrati solo in parte.",
        "Con controlli definiti lungo il processo e non conformità registrate e analizzate.",
        "La qualità è progettata nei processi: scarti, resi e reclami hanno obiettivi e se ne analizzano le cause."
      ],
      "check": null,
      "na": false
    },
    {
      "id": "OPS-4.2",
      "area": "OPS",
      "sub": "OPS-4",
      "theme": "Costo della non qualità",
      "text": "Quanto conoscete il costo di scarti, rilavorazioni, resi e interventi in garanzia?",
      "levels": [
        "Non lo abbiamo ancora misurato.",
        "Ne abbiamo una stima approssimativa.",
        "Lo misuriamo per le voci principali con regolarità.",
        "Lo misuriamo in modo completo, con obiettivi di riduzione e progetti dedicati alle cause più costose."
      ],
      "check": {
        "text": "Sapreste indicare il costo degli scarti o delle rilavorazioni dell'ultimo anno?",
        "options": [
          "Sì",
          "No"
        ],
        "flag": {
          "minLevel": 3,
          "answers": [
            "No"
          ]
        }
      },
      "na": false
    },
    {
      "id": "OPS-5.1",
      "area": "OPS",
      "sub": "OPS-5",
      "theme": "Strategia di acquisto",
      "text": "Come vengono gestiti gli acquisti principali?",
      "levels": [
        "Si compra dai fornitori di sempre quando serve.",
        "Si chiedono più preventivi per gli acquisti importanti.",
        "Le categorie di acquisto sono analizzate per spesa e rischio, con fornitori alternativi e accordi quadro.",
        "Ogni categoria ha una strategia, si considera il costo totale di acquisto e i risparmi ottenuti si misurano."
      ],
      "check": {
        "text": "Conoscete la spesa annua per i dieci fornitori principali?",
        "options": [
          "Sì",
          "No"
        ],
        "flag": {
          "minLevel": 3,
          "answers": [
            "No"
          ]
        }
      },
      "na": false
    },
    {
      "id": "OPS-5.2",
      "area": "OPS",
      "sub": "OPS-5",
      "theme": "Valutazione dei fornitori",
      "text": "Come valutate e sviluppate i fornitori?",
      "levels": [
        "Non vengono valutati.",
        "Si tiene memoria dei problemi avuti, senza una valutazione scritta.",
        "I fornitori principali si valutano periodicamente su qualità, tempi e prezzo.",
        "La valutazione porta a piani di miglioramento condivisi con i fornitori e comprende criteri ambientali e sociali."
      ],
      "check": null,
      "na": false
    },
    {
      "id": "OPS-5.3",
      "area": "OPS",
      "sub": "OPS-5",
      "theme": "Rischio di fornitura",
      "text": "Quanto siete protetti da interruzioni di fornitura (fornitori unici, materiali critici, fornitori esteri)?",
      "levels": [
        "Il tema non è stato ancora affrontato in modo preventivo.",
        "Conosciamo i fornitori critici, ma non abbiamo alternative pronte.",
        "I fornitori critici sono individuati, con alternative qualificate o scorte di sicurezza per i materiali principali.",
        "Il rischio di fornitura è seguito con indicatori, e per i materiali critici ci sono piani di continuità."
      ],
      "check": null,
      "na": false
    },
    {
      "id": "OPS-6.1",
      "area": "OPS",
      "sub": "OPS-6",
      "theme": "Scorte e magazzino",
      "text": "Come sono gestiti scorte e magazzino?",
      "levels": [
        "Le scorte si controllano a vista e l'inventario si fa a fine anno.",
        "Le giacenze sono nel gestionale, ma non sempre corrispondono a quelle reali.",
        "Le giacenze sono affidabili e gli articoli principali hanno livelli di scorta definiti.",
        "Le scorte si gestiscono per classe di articolo, con obiettivi di rotazione e di livello di servizio."
      ],
      "check": null,
      "na": true
    },
    {
      "id": "OPS-6.2",
      "area": "OPS",
      "sub": "OPS-6",
      "theme": "Trasporti e consegne",
      "text": "Come sono organizzati trasporti e consegne ai clienti?",
      "levels": [
        "Si organizzano volta per volta.",
        "Con i trasportatori abituali, senza un controllo di costi e puntualità.",
        "Le consegne sono programmate, i trasportatori sono scelti con criteri e i costi per spedizione sono controllati.",
        "La logistica si misura su costo, puntualità e danni, e gli accordi con i trasportatori prevedono livelli di servizio."
      ],
      "check": null,
      "na": true
    },
    {
      "id": "OPS-7.1",
      "area": "OPS",
      "sub": "OPS-7",
      "theme": "Manutenzione e attrezzature",
      "text": "Come gestite manutenzione di impianti, macchine, mezzi o attrezzature?",
      "levels": [
        "Si ripara quando si rompe.",
        "La manutenzione è programmata solo per gli impianti principali.",
        "C'è un piano di manutenzione preventiva, e fermi e guasti si misurano.",
        "La manutenzione si basa sui dati (condizioni, frequenza dei guasti), con obiettivi di disponibilità e di costo."
      ],
      "check": null,
      "na": true
    },
    {
      "id": "OPS-7.2",
      "area": "OPS",
      "sub": "OPS-7",
      "theme": "Salute e sicurezza sul lavoro",
      "text": "Come gestite salute e sicurezza sul lavoro oltre agli obblighi di legge?",
      "levels": [
        "Curiamo gli adempimenti di legge, con il supporto di un consulente.",
        "Gli adempimenti sono in ordine e i rischi principali ricevono un'attenzione specifica.",
        "La valutazione dei rischi è aggiornata, la formazione è regolare e infortuni e quasi incidenti si registrano e si analizzano.",
        "C'è un sistema di gestione, anche certificato, con indicatori seguiti nel tempo e il coinvolgimento attivo dei lavoratori."
      ],
      "check": null,
      "na": false
    },
    {
      "id": "OPS-8.1",
      "area": "OPS",
      "sub": "OPS-8",
      "theme": "Miglioramento continuo",
      "text": "Come nascono e si realizzano i miglioramenti dei processi?",
      "levels": [
        "Quando un problema rilevante li rende necessari.",
        "Su iniziativa di singole persone, senza un metodo.",
        "Con progetti di miglioramento periodici, condotti con un metodo (per esempio lean) e con risultati misurati.",
        "Il miglioramento è parte del lavoro quotidiano: i suggerimenti si raccolgono e i risultati sono condivisi e riconosciuti."
      ],
      "check": null,
      "na": false
    },
    {
      "id": "OPS-8.2",
      "area": "OPS",
      "sub": "OPS-8",
      "theme": "Cruscotto delle operations",
      "text": "Con quali indicatori seguite le operations?",
      "levels": [
        "Non ci sono indicatori operativi definiti.",
        "Con qualche indicatore calcolato a mano, saltuariamente.",
        "Con gli indicatori principali (puntualità, produttività, qualità, scorte), aggiornati e discussi ogni mese.",
        "Con un cruscotto che ha un obiettivo per ogni indicatore, è visibile nei reparti e si usa nelle riunioni quotidiane o settimanali."
      ],
      "check": null,
      "na": false
    }
  ],
  "DIG": [
    {
      "id": "DIG-1.1",
      "area": "DIG",
      "sub": "DIG-1",
      "theme": "Strategia digitale",
      "text": "Come vengono decisi gli investimenti in tecnologia e digitale?",
      "levels": [
        "Quando un sistema smette di funzionare o un fornitore propone qualcosa.",
        "Chi guida l'azienda decide caso per caso, senza un piano.",
        "C'è un piano pluriennale degli investimenti digitali, collegato alle priorità aziendali e con un budget.",
        "Il piano si rivede ogni anno: i progetti si scelgono per i benefici attesi e i risultati si verificano dopo la realizzazione."
      ],
      "check": null,
      "na": false
    },
    {
      "id": "DIG-1.2",
      "area": "DIG",
      "sub": "DIG-1",
      "theme": "Organizzazione dell'informatica",
      "text": "Come è organizzata la gestione dell'informatica?",
      "levels": [
        "Se ne occupa, accanto al proprio lavoro, la persona con più dimestichezza.",
        "Un fornitore esterno interviene a chiamata.",
        "C'è un responsabile interno, oppure un fornitore con contratto e livelli di servizio definiti.",
        "Il responsabile partecipa alle scelte di direzione, i fornitori sono valutati e l'inventario di sistemi e licenze è aggiornato."
      ],
      "check": null,
      "na": false
    },
    {
      "id": "DIG-2.1",
      "area": "DIG",
      "sub": "DIG-2",
      "theme": "Gestionale e integrazione",
      "text": "Quanto i sistemi gestionali coprono e collegano i processi aziendali?",
      "levels": [
        "La contabilità è informatizzata; il resto è su fogli di calcolo e carta.",
        "Il gestionale copre amministrazione e ordini; produzione, magazzino o commesse si gestiscono a parte.",
        "Un gestionale integrato copre i processi principali, con poche doppie registrazioni.",
        "I sistemi sono integrati tra loro (gestionale, CRM, produzione, e-commerce) e i dati si inseriscono una sola volta."
      ],
      "check": {
        "text": "Ci sono dati che vengono reinseriti a mano da un sistema all'altro?",
        "options": [
          "Spesso",
          "A volte",
          "Quasi mai"
        ],
        "flag": {
          "minLevel": 3,
          "answers": [
            "Spesso"
          ]
        }
      },
      "na": false
    },
    {
      "id": "DIG-2.2",
      "area": "DIG",
      "sub": "DIG-2",
      "theme": "Infrastruttura e servizi in cloud",
      "text": "Quanto è adeguata l'infrastruttura (server, rete, postazioni, servizi in cloud)?",
      "levels": [
        "Gli apparati hanno diversi anni e rallentamenti o fermi sono frequenti.",
        "Funziona, ma senza un piano di rinnovo né una visione d'insieme.",
        "L'infrastruttura è aggiornata e ha un piano di rinnovo; i servizi principali, in cloud o in sede, sono sotto controllo.",
        "L'infrastruttura è progettata per crescita e continuità, con costi e prestazioni seguiti nel tempo."
      ],
      "check": null,
      "na": false
    },
    {
      "id": "DIG-3.1",
      "area": "DIG",
      "sub": "DIG-3",
      "theme": "Qualità e governo dei dati",
      "text": "Quanto sono affidabili e governati i dati aziendali (anagrafiche, codici, definizioni)?",
      "levels": [
        "Capita spesso di trovare dati doppi o diversi tra un ufficio e l'altro.",
        "Le anagrafiche principali sono abbastanza pulite, ma senza regole.",
        "Le anagrafiche hanno un responsabile e regole di codifica definite.",
        "Gli indicatori hanno definizioni comuni a tutti e la qualità dei dati si controlla periodicamente."
      ],
      "check": null,
      "na": false
    },
    {
      "id": "DIG-3.2",
      "area": "DIG",
      "sub": "DIG-3",
      "theme": "Documenti e archiviazione",
      "text": "Come sono gestiti documenti e archivi (contratti, progetti, documenti tecnici e amministrativi)?",
      "levels": [
        "In cartelle personali, email e carta.",
        "In cartelle condivise, con regole seguite solo in parte.",
        "In un archivio digitale con struttura e permessi definiti e versioni sotto controllo.",
        "In un sistema documentale integrato con i processi, con conservazione a norma e accessi tracciati."
      ],
      "check": null,
      "na": false
    },
    {
      "id": "DIG-4.1",
      "area": "DIG",
      "sub": "DIG-4",
      "theme": "Cruscotti e reporting",
      "text": "Come vengono prodotti i report per decidere?",
      "levels": [
        "Ogni responsabile prepara i propri fogli di calcolo quando serve.",
        "Con report periodici estratti a mano dal gestionale.",
        "Con cruscotti che si aggiornano in automatico per le aree principali.",
        "Con cruscotti per direzione e responsabili, basati su indicatori dalla definizione unica e usati nelle riunioni."
      ],
      "check": {
        "text": "Il report usato nell'ultima riunione di direzione è stato preparato in automatico?",
        "options": [
          "Sì",
          "No"
        ],
        "flag": {
          "minLevel": 3,
          "answers": [
            "No"
          ]
        }
      },
      "na": false
    },
    {
      "id": "DIG-4.2",
      "area": "DIG",
      "sub": "DIG-4",
      "theme": "Uso dei dati nelle decisioni",
      "text": "Quanto i responsabili usano davvero i dati per decidere?",
      "levels": [
        "Si decide soprattutto in base all'esperienza.",
        "I dati si guardano dopo aver deciso, come conferma.",
        "I responsabili consultano con regolarità dati e indicatori prima di decidere.",
        "I responsabili analizzano i dati in autonomia e le decisioni importanti poggiano su numeri e ipotesi verificabili."
      ],
      "check": null,
      "na": false
    },
    {
      "id": "DIG-5.1",
      "area": "DIG",
      "sub": "DIG-5",
      "theme": "Automazione dei processi",
      "text": "Quanto sono automatizzati i processi ripetitivi (fatture passive, ordini, approvazioni, documenti)?",
      "levels": [
        "Quasi tutto è manuale.",
        "C'è qualche automazione isolata.",
        "I processi principali sono digitali, con flussi di approvazione.",
        "L'automazione è estesa, si misurano i tempi risparmiati e i processi si rivedono periodicamente."
      ],
      "check": null,
      "na": false
    },
    {
      "id": "DIG-5.2",
      "area": "DIG",
      "sub": "DIG-5",
      "theme": "Flussi senza carta",
      "text": "Quanto i flussi interni avvengono senza carta e senza passaggi manuali (note spese, presenze, richieste, firme)?",
      "levels": [
        "Prevalgono carta, firme a mano e passaggi via email.",
        "Alcuni flussi sono digitali, altri no; i documenti si stampano spesso.",
        "I flussi principali sono digitali con firma elettronica e tracciabilità.",
        "I flussi sono digitali da un capo all'altro e collegati al gestionale, e se ne misurano i tempi."
      ],
      "check": null,
      "na": false
    },
    {
      "id": "DIG-6.1",
      "area": "DIG",
      "sub": "DIG-6",
      "theme": "Strumenti verso i clienti",
      "text": "Quanto usate strumenti digitali nel rapporto con i clienti (CRM, portali, e-commerce, firma elettronica)?",
      "levels": [
        "Quasi per nulla.",
        "Usiamo il sito di presentazione e l'email.",
        "Usiamo un CRM e almeno un canale digitale per ordini, preventivi o assistenza.",
        "Il cliente trova online tutto ciò che gli serve (portale, ordini, documenti, assistenza) e ne misuriamo l'uso per migliorarlo."
      ],
      "check": null,
      "na": false
    },
    {
      "id": "DIG-6.2",
      "area": "DIG",
      "sub": "DIG-6",
      "theme": "Integrazione con i fornitori",
      "text": "Quanto sono digitali gli scambi con i fornitori (ordini, conferme, documenti, consegne)?",
      "levels": [
        "Passano da telefono ed email, e i documenti si reinseriscono a mano.",
        "Gli ordini partono dal gestionale; conferme e documenti si gestiscono a mano.",
        "Con i fornitori principali gli scambi sono digitali (portali, documenti strutturati).",
        "Gli scambi sono integrati con i sistemi dei fornitori principali, con lo stato degli ordini visibile in tempo reale."
      ],
      "check": null,
      "na": true
    },
    {
      "id": "DIG-7.1",
      "area": "DIG",
      "sub": "DIG-7",
      "theme": "Analisi avanzate e intelligenza artificiale",
      "text": "Quanto usate analisi avanzate o intelligenza artificiale?",
      "levels": [
        "Per nulla.",
        "Qualche persona usa strumenti di intelligenza artificiale in modo personale.",
        "Abbiamo alcuni casi d'uso definiti (previsioni, testi, assistenza), con risultati verificati.",
        "Abbiamo un programma con priorità e competenze interne, e misuriamo i benefici di ogni iniziativa."
      ],
      "check": null,
      "na": false
    },
    {
      "id": "DIG-7.2",
      "area": "DIG",
      "sub": "DIG-7",
      "theme": "Regole d'uso dell'intelligenza artificiale",
      "text": "Avete regole sull'uso dell'intelligenza artificiale (dati riservati, strumenti ammessi, verifica dei risultati)?",
      "levels": [
        "Non ancora: ogni persona sceglie gli strumenti da usare.",
        "Abbiamo dato indicazioni a voce.",
        "Ci sono regole scritte, comunicate a tutti, su strumenti ammessi e dati che non si possono inserire.",
        "Alle regole scritte si aggiungono la formazione di chi usa gli strumenti e la verifica della conformità alle norme europee."
      ],
      "check": null,
      "na": false
    },
    {
      "id": "DIG-8.1",
      "area": "DIG",
      "sub": "DIG-8",
      "theme": "Sicurezza: misure tecniche",
      "text": "Quali misure tecniche di sicurezza informatica sono in uso?",
      "levels": [
        "L'antivirus.",
        "Antivirus, firewall e salvataggi dei dati, non ancora verificati.",
        "Accessi con doppia verifica, aggiornamenti regolari e salvataggi separati, di cui si prova il ripristino.",
        "Monitoraggio continuo e verifiche periodiche delle vulnerabilità, con misure in linea con la normativa (per esempio NIS2, se applicabile)."
      ],
      "check": {
        "text": "Negli ultimi 12 mesi avete provato a ripristinare i dati da un salvataggio?",
        "options": [
          "Sì",
          "No"
        ],
        "flag": {
          "minLevel": 3,
          "answers": [
            "No"
          ]
        }
      },
      "na": false
    },
    {
      "id": "DIG-8.2",
      "area": "DIG",
      "sub": "DIG-8",
      "theme": "Sicurezza: persone e continuità",
      "text": "Come preparate persone e azienda a un incidente informatico?",
      "levels": [
        "Non abbiamo ancora affrontato il tema.",
        "Sappiamo a chi telefonare in caso di problemi.",
        "Con la formazione periodica del personale (per esempio sulle email truffa) e una procedura di risposta agli incidenti.",
        "Con un piano di continuità provato con simulazioni e ruoli chiari in caso di attacco."
      ],
      "check": null,
      "na": false
    },
    {
      "id": "DIG-8.3",
      "area": "DIG",
      "sub": "DIG-8",
      "theme": "Protezione dei dati personali",
      "text": "Come gestite la protezione dei dati personali di clienti, dipendenti e fornitori?",
      "levels": [
        "Abbiamo predisposto le informative essenziali.",
        "Gli adempimenti di base sono stati fatti con un consulente e non sono stati più aggiornati.",
        "Registro dei trattamenti, nomine e informative sono aggiornati, e c'è un responsabile, interno o esterno.",
        "La protezione dei dati è considerata in ogni nuovo progetto, con verifiche periodiche e una gestione documentata di richieste e incidenti."
      ],
      "check": null,
      "na": false
    }
  ],
  "INN": [
    {
      "id": "INN-1.1",
      "area": "INN",
      "sub": "INN-1",
      "theme": "Priorità di innovazione",
      "text": "Quanto è definito dove e perché innovare?",
      "levels": [
        "Si innova quando un cliente lo chiede.",
        "Chi guida l'azienda ha in mente le direzioni, non ancora messe per iscritto.",
        "Le priorità di innovazione sono scritte e collegate alla strategia.",
        "C'è una strategia dell'innovazione con obiettivi misurabili, che bilancia miglioramenti e progetti di rottura e si rivede ogni anno."
      ],
      "check": null,
      "na": false
    },
    {
      "id": "INN-1.2",
      "area": "INN",
      "sub": "INN-1",
      "theme": "Risorse per l'innovazione",
      "text": "Quante risorse sono dedicate all'innovazione (persone, tempo, budget)?",
      "levels": [
        "Non ci sono risorse dedicate: ci si lavora accanto all'attività ordinaria.",
        "Ci sono spese decise caso per caso.",
        "Ci sono un budget annuale e persone con tempo dedicato all'innovazione.",
        "L'investimento è programmato e misurato (per esempio in rapporto al fatturato) e le risorse dedicate non vengono assorbite dalle urgenze."
      ],
      "check": {
        "text": "Sapreste indicare quanto avete speso in ricerca, sviluppo e innovazione nell'ultimo anno?",
        "options": [
          "Sì",
          "No"
        ],
        "flag": {
          "minLevel": 3,
          "answers": [
            "No"
          ]
        }
      },
      "na": false
    },
    {
      "id": "INN-2.1",
      "area": "INN",
      "sub": "INN-2",
      "theme": "Raccolta delle idee",
      "text": "Come nascono e vengono raccolte le idee?",
      "levels": [
        "Da chi guida l'azienda o da qualche persona particolarmente intraprendente.",
        "Dalle richieste dei clienti, raccolte in modo informale.",
        "Attraverso canali definiti, da persone, clienti e fornitori, con una valutazione periodica.",
        "Con un processo continuo che coinvolge tutta l'azienda e dà riscontro a chi propone."
      ],
      "check": null,
      "na": false
    },
    {
      "id": "INN-2.2",
      "area": "INN",
      "sub": "INN-2",
      "theme": "Osservazione di tecnologie e tendenze",
      "text": "Come seguite le nuove tecnologie e le tendenze che possono cambiare il vostro settore?",
      "levels": [
        "Non le seguiamo in modo particolare.",
        "Le scopriamo da fiere e fornitori.",
        "Qualcuno ha il compito di seguirle e riferire periodicamente in direzione.",
        "Le seguiamo con fonti e partner definiti e valutiamo periodicamente l'impatto sul nostro modo di fare impresa."
      ],
      "check": null,
      "na": false
    },
    {
      "id": "INN-3.1",
      "area": "INN",
      "sub": "INN-3",
      "theme": "Selezione e portafoglio",
      "text": "Come vengono scelti e seguiti i progetti di innovazione?",
      "levels": [
        "Si avvia ciò che sembra promettente, senza criteri scritti.",
        "Sceglie chi guida l'azienda; i progetti aperti sono molti e pochi arrivano a conclusione.",
        "Ci sono criteri di selezione chiari (valore, fattibilità, coerenza) e un elenco unico dei progetti, con priorità.",
        "I progetti passano da momenti di decisione in cui si sceglie se proseguire o fermarsi, e i risultati si confrontano con le attese."
      ],
      "check": {
        "text": "Negli ultimi 12 mesi avete fermato un progetto che non dava i risultati attesi?",
        "options": [
          "Sì",
          "No",
          "Non abbiamo progetti"
        ],
        "flag": {
          "minLevel": 3,
          "answers": [
            "Non abbiamo progetti"
          ]
        }
      },
      "na": false
    },
    {
      "id": "INN-3.2",
      "area": "INN",
      "sub": "INN-3",
      "theme": "Valutazione economica dei progetti",
      "text": "Prima di investire in un progetto innovativo, ne valutate il ritorno?",
      "levels": [
        "Non ancora: si procede quando l'idea convince.",
        "Si stimano i costi, non i benefici.",
        "Si stimano costi, ricavi attesi e tempi per i progetti principali.",
        "Si costruisce un caso economico con ipotesi esplicite, aggiornato durante il progetto e verificato dopo il lancio."
      ],
      "check": null,
      "na": false
    },
    {
      "id": "INN-4.1",
      "area": "INN",
      "sub": "INN-4",
      "theme": "Processo di sviluppo",
      "text": "Come si sviluppa un nuovo prodotto, servizio o processo?",
      "levels": [
        "Per tentativi successivi, senza fasi definite.",
        "Con alcune fasi, ma tempi e costi non sono sotto controllo.",
        "Con un processo a fasi, con responsabili, prototipi e verifiche prima del lancio.",
        "Con un processo di cui si misurano tempi e successo dei lanci, e che coinvolge fin dall'inizio funzioni diverse."
      ],
      "check": null,
      "na": false
    },
    {
      "id": "INN-4.2",
      "area": "INN",
      "sub": "INN-4",
      "theme": "Tempi di sviluppo",
      "text": "Quanto riuscite a rispettare tempi e budget dei progetti di sviluppo?",
      "levels": [
        "Non li misuriamo e i ritardi sono frequenti.",
        "Li misuriamo a fine progetto, quando i ritardi si sono già accumulati.",
        "Tempi e costi sono pianificati e seguiti, e la maggior parte dei progetti li rispetta.",
        "I tempi di sviluppo sono misurati e in riduzione, grazie a metodi per accelerare (sviluppi in parallelo, rilasci progressivi)."
      ],
      "check": null,
      "na": false
    },
    {
      "id": "INN-5.1",
      "area": "INN",
      "sub": "INN-5",
      "theme": "Ascolto del cliente e sperimentazione",
      "text": "Quanto coinvolgete i clienti nello sviluppo e sperimentate prima di investire?",
      "levels": [
        "Al cliente si presenta il prodotto finito.",
        "Si raccoglie il parere di qualche cliente a fine sviluppo.",
        "I clienti sono coinvolti già nella definizione e si fanno prove su piccola scala prima del lancio.",
        "Si sperimenta sempre prima di investire (prototipi, prove pilota), con criteri chiari per decidere se proseguire."
      ],
      "check": null,
      "na": false
    },
    {
      "id": "INN-5.2",
      "area": "INN",
      "sub": "INN-5",
      "theme": "Lancio sul mercato",
      "text": "Come portate sul mercato una novità?",
      "levels": [
        "La si mette a listino e si informa la rete di vendita.",
        "Con qualche azione di comunicazione al momento del lancio.",
        "Con un piano di lancio: obiettivi, formazione della rete di vendita e comunicazione dedicata.",
        "Con un lancio pianificato insieme a commerciale e marketing, seguendo le vendite nei primi mesi per correggere in fretta."
      ],
      "check": null,
      "na": false
    },
    {
      "id": "INN-6.1",
      "area": "INN",
      "sub": "INN-6",
      "theme": "Collaborazioni per innovare",
      "text": "Con chi collaborate per innovare?",
      "levels": [
        "Finora con nessuno.",
        "Occasionalmente con fornitori o consulenti.",
        "In modo stabile con almeno un soggetto (università, centri di ricerca, startup, clienti).",
        "Con una rete di partner con cui abbiamo progetti ricorrenti e accordi chiari sulla proprietà dei risultati."
      ],
      "check": null,
      "na": false
    },
    {
      "id": "INN-6.2",
      "area": "INN",
      "sub": "INN-6",
      "theme": "Ecosistema e filiera",
      "text": "Quanto partecipate a iniziative di innovazione del territorio o della filiera (poli, competence center, programmi per startup)?",
      "levels": [
        "Non le conosciamo ancora.",
        "Le conosciamo, ma non partecipiamo.",
        "Partecipiamo ad alcune iniziative con un referente interno.",
        "Partecipiamo attivamente, con progetti comuni e accesso a competenze e strutture che da soli non avremmo."
      ],
      "check": null,
      "na": false
    },
    {
      "id": "INN-7.1",
      "area": "INN",
      "sub": "INN-7",
      "theme": "Incentivi e finanza agevolata",
      "text": "Quanto sfruttate incentivi e finanziamenti per l'innovazione (crediti d'imposta, bandi, programmi nazionali ed europei)?",
      "levels": [
        "Finora non li abbiamo usati.",
        "Li usiamo quando un consulente ce li propone.",
        "Monitoriamo le opportunità e le usiamo per i progetti principali, con la documentazione in ordine.",
        "Pianifichiamo i progetti tenendo conto degli incentivi e prepariamo la documentazione tecnica durante il progetto."
      ],
      "check": null,
      "na": false
    },
    {
      "id": "INN-7.2",
      "area": "INN",
      "sub": "INN-7",
      "theme": "Proprietà intellettuale",
      "text": "Come proteggete il valore che create (marchi, brevetti, segreti industriali, software)?",
      "levels": [
        "Non abbiamo ancora affrontato il tema.",
        "Abbiamo registrato il marchio.",
        "Valutiamo la protezione per le innovazioni principali e abbiamo accordi di riservatezza con collaboratori e partner.",
        "Gestiamo il patrimonio intellettuale come un insieme, seguiamo i depositi dei concorrenti e valutiamo le agevolazioni fiscali (patent box)."
      ],
      "check": null,
      "na": false
    },
    {
      "id": "INN-8.1",
      "area": "INN",
      "sub": "INN-8",
      "theme": "Competenze e cultura",
      "text": "Quanto l'organizzazione sostiene chi propone e prova cose nuove?",
      "levels": [
        "Le novità sono viste soprattutto come un rischio.",
        "Le idee sono ben accolte, ma manca il tempo per lavorarci.",
        "Ci sono tempo e risorse dedicate, e persone con competenze specifiche.",
        "Sperimentare è incoraggiato e riconosciuto, e dagli errori si ricavano lezioni condivise."
      ],
      "check": null,
      "na": false
    },
    {
      "id": "INN-8.2",
      "area": "INN",
      "sub": "INN-8",
      "theme": "Risultati dell'innovazione",
      "text": "Misurate i risultati dell'innovazione?",
      "levels": [
        "I risultati dell'innovazione non vengono misurati.",
        "Si ha un'idea dei prodotti nuovi che vanno bene.",
        "Si misura la quota di fatturato da prodotti o servizi introdotti negli ultimi tre anni.",
        "Ci sono indicatori con obiettivi, di risultato e di processo (quota di fatturato nuovo, ritorno dei progetti, tempi)."
      ],
      "check": {
        "text": "Conoscete la quota di fatturato da prodotti o servizi lanciati negli ultimi tre anni?",
        "options": [
          "Sì",
          "No"
        ],
        "flag": {
          "minLevel": 3,
          "answers": [
            "No"
          ]
        }
      },
      "na": false
    },
    {
      "id": "INN-8.3",
      "area": "INN",
      "sub": "INN-8",
      "theme": "Innovazione di processo e di modello",
      "text": "Quanto innovate anche nel modo di lavorare e di guadagnare, oltre che nei prodotti?",
      "levels": [
        "L'innovazione riguarda i prodotti.",
        "C'è qualche miglioramento dei processi, senza ripensare il modello.",
        "Ci sono progetti dedicati a processi e servizi (per esempio servizi aggiuntivi, nuove modalità di vendita).",
        "Valutiamo con regolarità nuovi modelli (servizi, abbonamenti, piattaforme, nuovi canali) e li sperimentiamo con criteri chiari."
      ],
      "check": null,
      "na": false
    }
  ],
  "SOS": [
    {
      "id": "SOS-1.1",
      "area": "SOS",
      "sub": "SOS-1",
      "theme": "Temi rilevanti",
      "text": "Avete individuato i temi di sostenibilità più rilevanti per l'azienda e per i suoi interlocutori?",
      "levels": [
        "I temi rilevanti non sono stati ancora individuati.",
        "Si individuano in modo informale, in base alle richieste ricevute.",
        "Un'analisi dei temi rilevanti considera impatti e rischi per l'azienda.",
        "Un'analisi aggiornata coinvolge clienti, dipendenti, banche e filiera e orienta la strategia."
      ],
      "check": null,
      "na": false
    },
    {
      "id": "SOS-1.2",
      "area": "SOS",
      "sub": "SOS-1",
      "theme": "Rischi e opportunità",
      "text": "Quanto considerate i rischi e le opportunità legati a clima, energia e nuove regole nella strategia?",
      "levels": [
        "Finora non li abbiamo considerati.",
        "Li consideriamo quando ci toccano direttamente (costi dell'energia, richieste dei clienti).",
        "Rischi e opportunità principali sono individuati e discussi in direzione.",
        "Sono valutati con scenari e tradotti nel piano in obiettivi e investimenti, anche su nuovi prodotti o servizi."
      ],
      "check": null,
      "na": false
    },
    {
      "id": "SOS-2.1",
      "area": "SOS",
      "sub": "SOS-2",
      "theme": "Governo della sostenibilità",
      "text": "Chi si occupa di sostenibilità e con quali obiettivi?",
      "levels": [
        "Per ora nessuno in particolare.",
        "Una persona se ne occupa accanto ad altri incarichi.",
        "C'è un responsabile, con obiettivi scritti e risorse dedicate.",
        "Gli obiettivi sono approvati da chi guida l'azienda, inseriti nel piano e collegati agli incentivi dei responsabili."
      ],
      "check": null,
      "na": false
    },
    {
      "id": "SOS-2.2",
      "area": "SOS",
      "sub": "SOS-2",
      "theme": "Consapevolezza e coinvolgimento",
      "text": "Quanto le persone dell'azienda conoscono e partecipano agli obiettivi di sostenibilità?",
      "levels": [
        "Il tema non è ancora entrato nella comunicazione interna.",
        "Ci sono comunicazioni occasionali.",
        "Formazione e comunicazione sono periodiche, con alcune iniziative a cui le persone partecipano.",
        "Gli obiettivi sono conosciuti da tutti e le proposte delle persone vengono raccolte e realizzate."
      ],
      "check": null,
      "na": false
    },
    {
      "id": "SOS-3.1",
      "area": "SOS",
      "sub": "SOS-3",
      "theme": "Energia",
      "text": "Come gestite i consumi di energia?",
      "levels": [
        "Conosciamo il costo in bolletta.",
        "Conosciamo i consumi complessivi annui.",
        "Misuriamo i consumi per area o impianto e abbiamo realizzato interventi di efficienza.",
        "Abbiamo un piano energetico con obiettivi, misure continue dei consumi e una quota di energia rinnovabile."
      ],
      "check": {
        "text": "Avete fatto una diagnosi energetica negli ultimi 4 anni?",
        "options": [
          "Sì",
          "No"
        ],
        "flag": {
          "minLevel": 3,
          "answers": [
            "No"
          ]
        }
      },
      "na": false
    },
    {
      "id": "SOS-3.2",
      "area": "SOS",
      "sub": "SOS-3",
      "theme": "Emissioni",
      "text": "Quanto conoscete le emissioni di gas serra dell'azienda?",
      "levels": [
        "Non le abbiamo ancora calcolate.",
        "Ne abbiamo una stima approssimativa.",
        "Calcoliamo ogni anno le emissioni dirette e da energia acquistata.",
        "Calcoliamo anche le principali emissioni della catena del valore e abbiamo obiettivi di riduzione con un piano d'azione."
      ],
      "check": null,
      "na": false
    },
    {
      "id": "SOS-4.1",
      "area": "SOS",
      "sub": "SOS-4",
      "theme": "Risorse e rifiuti",
      "text": "Come gestite materiali, acqua e rifiuti?",
      "levels": [
        "Rispettiamo gli obblighi di legge.",
        "Facciamo la raccolta differenziata e qualche recupero.",
        "Misuriamo consumi e rifiuti e abbiamo obiettivi di riduzione e recupero.",
        "Progettiamo prodotti e processi per ridurre gli sprechi e recuperare materiali, anche con i fornitori."
      ],
      "check": null,
      "na": true
    },
    {
      "id": "SOS-4.2",
      "area": "SOS",
      "sub": "SOS-4",
      "theme": "Prodotti e imballaggi",
      "text": "Quanto la progettazione di prodotti, servizi e imballaggi tiene conto dell'impatto ambientale?",
      "levels": [
        "Per nulla.",
        "Solo quando lo chiede un cliente.",
        "Per i nuovi prodotti e per gli imballaggi principali si considerano criteri ambientali.",
        "L'impatto si valuta lungo il ciclo di vita, con obiettivi (materiali riciclati, riparabilità, imballaggi) comunicati ai clienti."
      ],
      "check": null,
      "na": true
    },
    {
      "id": "SOS-5.1",
      "area": "SOS",
      "sub": "SOS-5",
      "theme": "Benessere e welfare",
      "text": "Quanto la sostenibilità sociale verso le persone è gestita (salute, conciliazione, welfare)?",
      "levels": [
        "Si applica il contratto.",
        "Ci sono iniziative isolate di welfare o conciliazione.",
        "Ci sono politiche scritte su conciliazione e welfare, e si raccolgono i dati.",
        "Ci sono obiettivi e indicatori sociali, rendicontati, e l'effetto delle azioni si verifica nel tempo."
      ],
      "check": null,
      "na": false
    },
    {
      "id": "SOS-5.2",
      "area": "SOS",
      "sub": "SOS-5",
      "theme": "Equità e pari opportunità",
      "text": "Come presidiate equità retributiva e pari opportunità?",
      "levels": [
        "Il tema non è stato ancora affrontato.",
        "Vi prestiamo attenzione, senza dati né regole scritte.",
        "Raccogliamo i dati (per esempio differenze retributive e accesso alla formazione) e abbiamo regole su selezione e crescita.",
        "Seguiamo nel tempo obiettivi e indicatori di equità e ne comunichiamo i risultati, anche con la certificazione della parità di genere."
      ],
      "check": null,
      "na": false
    },
    {
      "id": "SOS-6.1",
      "area": "SOS",
      "sub": "SOS-6",
      "theme": "Etica e condotta",
      "text": "Come sono presidiate etica e condotta d'impresa (codice etico, anticorruzione, segnalazioni, modello 231)?",
      "levels": [
        "Non ci sono strumenti specifici.",
        "Esiste un codice etico, ancora poco conosciuto in azienda.",
        "Il codice etico è diffuso, il canale per le segnalazioni è attivo e abbiamo valutato l'adozione del modello 231.",
        "Il modello organizzativo è adottato e aggiornato, con un organismo di vigilanza e formazione periodica."
      ],
      "check": null,
      "na": false
    },
    {
      "id": "SOS-6.2",
      "area": "SOS",
      "sub": "SOS-6",
      "theme": "Conformità ambientale e normativa",
      "text": "Come tenete sotto controllo autorizzazioni, adempimenti ambientali e nuove regole che vi riguardano?",
      "levels": [
        "Se ne occupa il consulente, in vista delle scadenze.",
        "Abbiamo un elenco delle scadenze principali.",
        "C'è uno scadenzario completo, con responsabili e una verifica periodica degli adempimenti.",
        "C'è un sistema di gestione, anche certificato (per esempio ISO 14001), e ci prepariamo in anticipo alle nuove regole."
      ],
      "check": null,
      "na": false
    },
    {
      "id": "SOS-7.1",
      "area": "SOS",
      "sub": "SOS-7",
      "theme": "Filiera",
      "text": "Quanto considerate la sostenibilità nella scelta e gestione dei fornitori?",
      "levels": [
        "Per nulla.",
        "Chiediamo certificazioni solo in casi particolari.",
        "La qualifica dei fornitori principali comprende criteri ambientali e sociali.",
        "La filiera si valuta periodicamente, con obiettivi e piani di miglioramento condivisi con i fornitori principali."
      ],
      "check": null,
      "na": false
    },
    {
      "id": "SOS-7.2",
      "area": "SOS",
      "sub": "SOS-7",
      "theme": "Territorio e comunità",
      "text": "Che rapporto ha l'azienda con il territorio e la comunità?",
      "levels": [
        "Non ci sono iniziative specifiche.",
        "Ci sono sponsorizzazioni o donazioni occasionali.",
        "Ci sono iniziative programmate e coerenti con l'attività, insieme a partner locali.",
        "C'è una strategia di impatto sul territorio, con obiettivi e risultati comunicati."
      ],
      "check": null,
      "na": false
    },
    {
      "id": "SOS-8.1",
      "area": "SOS",
      "sub": "SOS-8",
      "theme": "Rendicontazione",
      "text": "Come comunicate le informazioni di sostenibilità a clienti, banche e investitori?",
      "levels": [
        "Rispondiamo ai questionari quando arrivano, raccogliendo i dati ogni volta.",
        "Abbiamo raccolto alcuni dati per rispondere alle richieste principali.",
        "Raccogliamo i dati ogni anno secondo lo standard volontario europeo per le PMI (VSME) e ne ricaviamo un documento di sintesi.",
        "Pubblichiamo un rendiconto annuale con dati verificati e obiettivi, che usiamo anche con banche e clienti."
      ],
      "check": {
        "text": "Avete un documento con i dati di sostenibilità dell'ultimo anno?",
        "options": [
          "Sì",
          "No"
        ],
        "flag": {
          "minLevel": 3,
          "answers": [
            "No"
          ]
        }
      },
      "na": false
    },
    {
      "id": "SOS-8.2",
      "area": "SOS",
      "sub": "SOS-8",
      "theme": "Valutazioni e rating",
      "text": "Come affrontate valutazioni di sostenibilità richieste da clienti o banche (questionari, rating, piattaforme)?",
      "levels": [
        "Rispondiamo quando ci vengono richieste, senza conoscere il risultato.",
        "Rispondiamo, senza sapere come migliorare il punteggio.",
        "Conosciamo i criteri delle valutazioni principali e abbiamo un piano per migliorare.",
        "Seguiamo i punteggi nel tempo, li usiamo come leva commerciale e finanziaria e li colleghiamo agli obiettivi."
      ],
      "check": null,
      "na": false
    }
  ]
};

export const ROADMAP_HORIZONS = ["Primi 3 mesi", "Da 3 a 6 mesi", "Da 6 a 12 mesi"];
