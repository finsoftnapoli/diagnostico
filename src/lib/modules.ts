// Generato da scripts/genera_moduli.py (moduli di approfondimento v0.2). Non modificare a mano:
// cambiare scripts/moduli_content.py e rigenerare.
import type { AreaCode } from "./types";

export const MODULE_VERSION = "0.2";

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
        "La direzione è nella testa del titolare e cambia con le occasioni.",
        "Il vertice ha una visione chiara, ma i responsabili la conoscono solo a grandi linee.",
        "Visione e scelte di fondo (mercati, prodotti, dimensione) sono scritte e presentate ai responsabili.",
        "La direzione è scritta, condivisa e usata come criterio esplicito per dire sì o no a opportunità e investimenti."
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
        "Si cerca di fare un po' tutto, come i concorrenti.",
        "Il vantaggio è intuito dal vertice, ma non guida le scelte quotidiane.",
        "Il posizionamento è esplicito e orienta offerta, prezzi e investimenti principali.",
        "Il posizionamento è verificato con dati di mercato e clienti, difeso con investimenti mirati e rivisto quando il mercato cambia."
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
        "Su intuito ed esperienza, senza analisi strutturate.",
        "Su qualche dato raccolto di volta in volta (andamento vendite, richieste dei clienti).",
        "Su analisi preparate prima di decidere: mercato, concorrenti, numeri attesi e rischi.",
        "Su analisi sistematiche aggiornate con regolarità, con scenari alternativi e verifica a posteriori dei risultati."
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
        "Le informazioni arrivano per caso, da clienti o fornitori.",
        "Qualcuno segue fiere e notizie di settore, senza condividerle in modo ordinato.",
        "Raccolta periodica di informazioni su mercato e concorrenti, discussa in direzione almeno una volta l'anno.",
        "Osservatorio continuo con fonti definite, indicatori di mercato e segnali deboli che alimentano la revisione della strategia."
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
        "Piano pluriennale scritto, con obiettivi economici e iniziative, aggiornato ogni anno.",
        "Piano aggiornato ogni anno con il gruppo di direzione, con verifica dei risultati dell'anno precedente e scenari alternativi."
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
        "Con un cruscotto di indicatori economici, di mercato, operativi e sulle persone, con obiettivi e responsabili per ciascuno."
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
        "Riunioni periodiche con ordine del giorno, numeri aggiornati e decisioni verbalizzate.",
        "Riunioni a cadenza fissa e diversa per livello (operativo, mensile, strategico), con verifica sistematica delle azioni decise."
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
      "text": "Quanto il vertice è coinvolto nelle decisioni operative quotidiane?",
      "levels": [
        "Quasi tutte le decisioni, anche minori, passano dal titolare o dall'amministratore.",
        "I responsabili decidono su questioni minori, ma ogni eccezione risale al vertice.",
        "Limiti di autonomia chiari per area (spesa, prezzi, personale) e rispettati.",
        "Il vertice si concentra su strategia e sviluppo; le deleghe sono formalizzate e verificate con i risultati."
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
        "Include competenze esterne o indipendenti, ha un calendario annuale dei temi e valuta periodicamente il proprio funzionamento."
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
        "Hanno un flusso informativo definito (contenuti, tempi, responsabili) e incontri periodici con chi gestisce le aree chiave."
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
        "Patti parasociali o regole scritte su ruoli, ingressi in azienda, dividendi e uscita dei soci.",
        "Regole scritte e aggiornate, con sedi di confronto distinte tra soci, famiglia e gestione dell'impresa."
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
        "Non se ne è mai parlato in modo esplicito.",
        "Se ne parla, ma non ci sono un piano né dei tempi.",
        "C'è un piano con le persone individuate, i tempi e un percorso di preparazione.",
        "Il piano è in corso, con passaggi graduali di responsabilità, sostituti pronti per i ruoli chiave e verifiche periodiche."
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
        "Il vertice conosce i rischi principali, ma non c'è un elenco né delle contromisure.",
        "Esiste una mappa dei rischi principali con probabilità, impatto e azioni di mitigazione.",
        "La mappa è aggiornata almeno una volta l'anno, collegata a indicatori di allerta e discussa dall'organo amministrativo."
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
        "Non è un tema che abbiamo affrontato.",
        "Ne siamo consapevoli, ma ci affidiamo al commercialista per gli adempimenti.",
        "Abbiamo strumenti di previsione (cassa a 12 mesi, indicatori) e qualcuno che li verifica con regolarità.",
        "Assetti documentati, indicatori di allerta monitorati e discussi periodicamente dall'organo amministrativo, con azioni definite in caso di soglie superate."
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
        "Le polizze si rinnovano come negli anni precedenti; i contratti si firmano senza revisione.",
        "Si rivedono le polizze quando c'è un sinistro o cambia il broker.",
        "Revisione periodica delle coperture rispetto ai rischi principali e controllo legale dei contratti importanti.",
        "Programma assicurativo costruito sulla mappa dei rischi, con massimali verificati e contratti standard aggiornati per clienti e fornitori."
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
        "Non ci abbiamo mai pensato.",
        "Valutiamo le occasioni che ci vengono proposte, caso per caso.",
        "Abbiamo criteri chiari su cosa cercare e ci facciamo assistere nelle valutazioni.",
        "Le operazioni straordinarie fanno parte della strategia, con un elenco di obiettivi monitorati e un metodo per integrare le aziende acquisite."
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
        "Collaborazioni occasionali, legate a singole commesse.",
        "Alcune alleanze stabili con obiettivi e accordi scritti.",
        "Alleanze scelte in base alla strategia, con obiettivi condivisi, regole di governo e verifica periodica dei risultati."
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
        "Budget economico completo, preparato con i responsabili prima dell'inizio dell'anno.",
        "Budget economico, patrimoniale e di cassa, con ipotesi esplicite, aggiornato con previsioni infrannuali (forecast)."
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
        "No.",
        "Solo quando lo chiede una banca o un bando.",
        "Sì, con conto economico, stato patrimoniale e flussi di cassa, aggiornato ogni anno.",
        "Sì, integrato con il piano strategico, con scenari e sensibilità sulle ipotesi principali e usato nelle decisioni di investimento e finanziamento."
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
        "Solo il bilancio annuale.",
        "Situazioni contabili trimestrali o semestrali, spesso in ritardo.",
        "Conto economico mensile entro 20-30 giorni, confrontato con il budget.",
        "Cruscotto mensile entro 10-15 giorni con indicatori economici, finanziari e operativi e commento sugli scostamenti."
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
        "Ce ne accorgiamo a fine anno.",
        "Si commentano gli scostamenti più evidenti, senza azioni definite.",
        "Gli scostamenti rilevanti sono analizzati con i responsabili e portano ad azioni correttive.",
        "Analisi sistematica per causa (volumi, prezzi, mix, efficienza), azioni con responsabili e verifica nel mese successivo."
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
        "Solo la contabilità generale: non si distinguono reparti, linee o commesse.",
        "Qualche ripartizione fatta a mano a fine anno.",
        "Centri di costo e di ricavo definiti, con attribuzione mensile dei costi diretti.",
        "Contabilità analitica integrata nel gestionale, con criteri di ripartizione dei costi comuni condivisi e stabili."
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
        "Margine di contribuzione calcolato con regolarità per prodotto, cliente o commessa.",
        "Margini calcolati e confrontati con il preventivo, usati per decidere prezzi, mix e clienti su cui investire."
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
        "Con costi standard aggiornati periodicamente e confronto sistematico tra costo preventivato ed effettivo."
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
        "Prospetto di cassa a 3-6 mesi aggiornato almeno una volta al mese.",
        "Previsione settimanale a breve e mensile a 12 mesi, con scenari e confronto sistematico tra previsto ed effettivo."
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
        "Pagamenti decisi giorno per giorno, conti gestiti separatamente.",
        "Un calendario dei pagamenti principali, con qualche controllo sui saldi.",
        "Calendario dei pagamenti, autorizzazioni definite e visione unica dei saldi di tutti i conti.",
        "Tesoreria accentrata con regole su pagamenti, eccedenze di liquidità e coperture dei rischi (tassi, cambi, materie prime) dove servono."
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
        "Si sollecita quando la cassa è in difficoltà.",
        "L'amministrazione sollecita i ritardi, senza regole condivise con il commerciale.",
        "Condizioni di pagamento definite, scadenzario controllato ogni settimana, solleciti a fasi e fido per i clienti principali.",
        "Valutazione del rischio cliente prima della vendita, obiettivi di giorni di incasso per area e strumenti come anticipi o assicurazione dei crediti."
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
        "Più banche, ma senza un quadro d'insieme di linee, costi e scadenze.",
        "Quadro aggiornato di affidamenti, costi e scadenze; Centrale Rischi controllata; informazioni periodiche alle banche.",
        "Struttura finanziaria pianificata (breve e medio termine coerenti con gli impieghi), rating seguito e banche informate con regolarità sui piani."
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
        "Non sappiamo come ci valutano banche e Fondo di garanzia.",
        "Ne abbiamo un'idea dai colloqui con le banche.",
        "Seguiamo gli indicatori su cui siamo valutati (rating, Fondo di garanzia) e conosciamo alternative come leasing, garanzie pubbliche e finanza agevolata.",
        "Lavoriamo sugli indicatori per migliorare il merito di credito e usiamo un mix di fonti (anche minibond, factoring, capitale) coerente con il piano."
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
        "Processo strutturato con soglie di approvazione e verifica a posteriori dei risultati rispetto alle attese."
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
        "Politica scritta su dividendi e patrimonializzazione, collegata al piano e al livello di indebitamento desiderato."
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
        "Le chiusure si fanno a fine anno con il commercialista; i controlli dipendono dalle persone.",
        "Chiusure periodiche non regolari; poche procedure scritte.",
        "Chiusure mensili con calendario, riconciliazioni di banche, clienti e fornitori, deleghe di spesa definite.",
        "Procedure scritte, controlli verificati periodicamente (anche da revisore o sindaco), con evidenza delle verifiche svolte."
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
        "Pianifichiamo con anticipo le imposte e l'uso delle agevolazioni (crediti d'imposta, super ammortamenti, patent box).",
        "Pianificazione fiscale integrata con budget e investimenti, con controllo dei rischi fiscali e documentazione in ordine."
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
        "Una funzione con un responsabile che partecipa alle decisioni di direzione, competenze di controllo di gestione e strumenti adeguati."
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
        "Si serve chi arriva, senza distinzioni.",
        "Si distinguono i clienti grandi da quelli piccoli.",
        "Segmenti definiti per esigenze, settore o canale, con fatturato e margine per segmento.",
        "Segmenti prioritari scelti in base ad attrattività e capacità di servirli, con offerte e azioni commerciali dedicate."
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
        "Non lo sappiamo con precisione.",
        "Lo sappiamo a grandi linee, ma ognuno in azienda lo racconta in modo diverso.",
        "La proposta di valore è definita per segmento e verificata con alcuni clienti.",
        "È verificata con regolarità (interviste, analisi delle gare vinte e perse) e guida offerta, prezzi e comunicazione."
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
        "L'offerta cresce per aggiunta; raramente si elimina qualcosa.",
        "Si eliminano prodotti o servizi in modo occasionale.",
        "Revisione periodica dell'offerta per vendite e margini, con decisioni su cosa sviluppare o eliminare.",
        "Portafoglio gestito con un ruolo chiaro per ciascuna linea, introduzioni ed eliminazioni programmate e obiettivi per linea."
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
        "Sito, materiali e presenza alle fiere, senza un piano né una misura dei risultati.",
        "Piano annuale di comunicazione con messaggi coerenti, budget e responsabile.",
        "Comunicazione integrata sui diversi canali, con obiettivi misurati (notorietà, contatti generati) e risultati usati per ricalibrare il piano."
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
        "Il sito è una vetrina poco aggiornata; i social non sono curati.",
        "Sito aggiornato e qualche pubblicazione sui social, senza obiettivi.",
        "Sito e canali online aggiornati con regolarità, con contenuti utili ai clienti e misura delle visite.",
        "Presenza digitale progettata per generare contatti, con contenuti pianificati, posizionamento nei motori di ricerca e conversioni misurate."
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
        "Il marketing produce materiali; le vendite li usano poco.",
        "Obiettivi comuni, criteri condivisi per passare i contatti alle vendite e riunioni periodiche.",
        "Processo unico dal primo contatto alla vendita, con indicatori condivisi e riscontro delle vendite sulla qualità dei contatti."
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
        "Ognuno segue i propri clienti come preferisce; le informazioni restano ai singoli.",
        "Fogli di calcolo o note personali, condivisi solo in parte.",
        "Fasi della vendita definite e trattative registrate in un CRM usato da tutto il commerciale.",
        "CRM con previsioni di vendita affidabili, tassi di conversione per fase e analisi periodica delle trattative in corso."
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
        "Modelli di offerta, ma tempi e seguito dipendono dal singolo venditore.",
        "Modelli e regole definiti, tempi di risposta misurati e richiamo sistematico delle offerte aperte.",
        "Configurazione delle offerte con regole e prezzi preimpostati, tempi di risposta brevi e analisi delle offerte vinte e perse."
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
        "Ognuno lavora in autonomia; gli incentivi dipendono solo dal fatturato.",
        "Ci sono obiettivi di fatturato annuali, con poche verifiche intermedie.",
        "Obiettivi per cliente o zona, riunioni commerciali periodiche e incentivi che includono il margine.",
        "Ruoli distinti (sviluppo e gestione clienti), affiancamento e formazione, incentivi su margine e obiettivi strategici."
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
        "Zone e canali definiti in base al potenziale, con piani di visita per i clienti principali.",
        "Copertura progettata sul potenziale, con canali diversi per segmento (diretto, agenti, distributori, digitale, estero) e obiettivi per canale."
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
        "Listino definito, ma sconti frequenti e non tracciati.",
        "Regole di sconto per livello di autorizzazione e analisi periodica dei prezzi effettivi.",
        "Prezzi basati sul valore per il cliente e sui costi, con analisi della dispersione degli sconti e revisioni periodiche dei listini."
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
        "Li subiamo: aumentare i prezzi è difficile e si rinvia.",
        "Aumentiamo quando i margini sono già scesi, con trattative caso per caso.",
        "Revisioni periodiche dei listini e clausole di adeguamento nei contratti principali.",
        "Monitoraggio continuo di costi e prezzi di mercato, clausole di indicizzazione e comunicazione degli aumenti preparata per segmento."
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
        "Il titolare o un venditore li segue personalmente, senza un piano.",
        "Responsabile dedicato e piano annuale per ciascun cliente principale.",
        "Piani condivisi con i clienti principali, incontri periodici di verifica e misura di quota e redditività per cliente."
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
        "Lo capiamo dai reclami.",
        "Chiediamo un parere ai clienti in modo occasionale.",
        "Indagine di soddisfazione periodica e gestione strutturata dei reclami.",
        "Indicatori di soddisfazione e di abbandono seguiti nel tempo, con azioni di miglioramento verificate."
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
        "Servizio organizzato con tempi di risposta definiti e richieste registrate.",
        "Servizio gestito come fonte di valore, con livelli di servizio misurati, offerte dedicate e informazioni usate per migliorare i prodotti."
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
        "Non c'è un organigramma; i ruoli si sovrappongono.",
        "Organigramma esistente ma non aggiornato o non rispecchia la realtà.",
        "Organigramma aggiornato e descrizioni dei ruoli principali con responsabilità e riporti.",
        "Organizzazione rivista con regolarità in base alla strategia, con ruoli, responsabilità e indicatori per ciascuna posizione chiave."
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
        "Ognuno lavora per conto suo; i problemi emergono tra un ufficio e l'altro.",
        "Ci si coordina tramite il titolare, che fa da collegamento.",
        "Momenti di coordinamento periodici e responsabilità chiare sui passaggi tra funzioni.",
        "Processi principali disegnati da un capo all'altro, con responsabili e indicatori comuni tra le funzioni coinvolte."
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
        "Si assume quando qualcuno lascia o quando il lavoro non si regge più.",
        "Si stimano le assunzioni dell'anno insieme al budget.",
        "Piano annuale di organico e competenze collegato agli obiettivi.",
        "Piano pluriennale delle competenze critiche, con analisi dei rischi (uscite, pensionamenti) e azioni anticipate."
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
        "Se ne occupano il consulente del lavoro e il titolare.",
        "Una persona interna gestisce gli aspetti amministrativi.",
        "Funzione o referente dedicato con regolamenti interni, dati del personale aggiornati e indicatori di base.",
        "Funzione che partecipa alle decisioni di direzione, con indicatori su costo, produttività, assenze e uscite discussi regolarmente."
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
        "Profili scritti, più colloqui con criteri di valutazione condivisi, canali diversi.",
        "Processo strutturato con prove pratiche, tempi misurati e verifica della qualità delle assunzioni nel tempo."
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
        "Facciamo molta fatica e non sappiamo bene perché.",
        "Attraiamo per i ruoli generici, molto meno per quelli specializzati.",
        "Curiamo la presentazione come datore di lavoro (sito, annunci, scuole e università) e misuriamo le candidature.",
        "Abbiamo una proposta chiara per chi lavora con noi, rapporti stabili con scuole e università e tempi di copertura delle posizioni misurati."
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
        "Affiancamento a un collega, senza un programma.",
        "Programma di inserimento con referente, formazione iniziale e verifica a fine prova.",
        "Percorso di inserimento strutturato e misurato (permanenza a 12 mesi, opinione dei nuovi assunti) e migliorato nel tempo."
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
        "Solo la formazione obbligatoria.",
        "Corsi su richiesta o su proposta di fornitori.",
        "Piano annuale della formazione basato sulle competenze necessarie, anche con fondi interprofessionali.",
        "Percorsi di sviluppo per ruolo e per persone a potenziale, con verifica dell'efficacia della formazione."
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
        "Obiettivi informali e giudizi del responsabile, non condivisi.",
        "Obiettivi annuali scritti per i ruoli chiave e colloquio di valutazione almeno annuale.",
        "Obiettivi collegati alla strategia per tutti i ruoli, colloqui periodici e valutazione usata per sviluppo e riconoscimenti."
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
        "Se ne parla solo quando c'è un problema serio.",
        "Il riscontro dipende dal singolo responsabile; le prestazioni insufficienti si tollerano a lungo.",
        "Momenti periodici di riscontro e percorsi definiti per chi non raggiunge gli obiettivi.",
        "Riscontro continuo come pratica di tutti i responsabili, piani di miglioramento con tempi e decisioni conseguenti."
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
        "Aumenti e premi decisi dal vertice senza criteri dichiarati.",
        "Criteri per livello e ruolo, confronto con il mercato, premi legati a risultati.",
        "Politica retributiva scritta, premi di risultato collegati agli obiettivi e verifica periodica di equità interna."
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
        "Non ce ne occupiamo oltre al contratto.",
        "Qualche iniziativa isolata (buoni, flessibilità concessa caso per caso).",
        "Piano di welfare e regole su orari e lavoro da remoto dove possibile, comunicati a tutti.",
        "Welfare e flessibilità costruiti sulle esigenze rilevate, usati anche per attrarre e trattenere, con utilizzo e gradimento misurati."
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
        "Non sappiamo con precisione quali persone siano insostituibili.",
        "Lo sappiamo, ma non ci sono sostituti né piani per trattenerle.",
        "Ruoli chiave individuati, con sostituti indicati e azioni per trattenere le persone importanti.",
        "Piano di successione per i ruoli chiave e percorsi per le persone a potenziale, rivisti ogni anno."
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
        "Si diventa responsabili per anzianità o competenza tecnica, senza preparazione.",
        "Qualche corso occasionale per i responsabili.",
        "Percorso di sviluppo per i responsabili su guida dei collaboratori, delega e gestione dei conflitti.",
        "Modello condiviso di comportamenti attesi dai responsabili, percorsi dedicati e valutazione anche da parte dei collaboratori."
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
        "Indagine periodica di clima e momenti di ascolto strutturati.",
        "Indagine periodica con piano di azione condiviso, indicatori (assenze, uscite volontarie) seguiti nel tempo."
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
        "Le informazioni circolano a voce e in modo disomogeneo.",
        "Comunicazioni occasionali del vertice, soprattutto nei momenti difficili.",
        "Incontri periodici con tutto il personale su risultati e obiettivi, strumenti di comunicazione interna definiti.",
        "Comunicazione regolare a due direzioni: informazioni condivise per livello e canali per raccogliere domande e proposte, con riscontro."
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
        "Per abitudine: si continua come si è sempre fatto.",
        "Si valuta quando c'è un problema di capacità o di costo.",
        "Le scelte principali sono valutate con un confronto di costi, qualità e controllo.",
        "Criteri definiti e collegati alla strategia (competenze distintive, rischi, costi totali), con revisione periodica delle scelte."
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
        "Ci accorgiamo dei limiti quando non riusciamo a evadere gli ordini.",
        "Conosciamo a grandi linee la capacità dei reparti principali.",
        "Capacità misurata per reparto o squadra, con un piano di adeguamento collegato alle previsioni.",
        "Capacità e configurazione delle sedi pianificate sul medio periodo, con scenari di domanda e investimenti programmati."
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
        "Riunione mensile tra vendite, operations e acquisti su previsioni, capacità e scorte.",
        "Processo strutturato di pianificazione integrata, con previsioni misurate per accuratezza e decisioni condivise su capacità e scorte."
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
        "Programma settimanale fatto a mano, spesso stravolto.",
        "Programma basato su capacità, priorità e materiali disponibili, rispettato nella maggior parte dei casi.",
        "Programmazione supportata dal gestionale, con misura del rispetto dei piani e analisi delle cause degli scostamenti."
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
        "Indicatori di produttività o utilizzo misurati con regolarità per reparto o squadra.",
        "Indicatori di efficienza complessiva (per esempio OEE o ore produttive su ore disponibili) con obiettivi e analisi delle perdite."
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
        "Ognuno lavora a modo suo; molto dipende dall'esperienza delle persone.",
        "Istruzioni scritte per alcune attività, poco aggiornate.",
        "Istruzioni e standard per le attività principali, posti di lavoro ordinati e verificati.",
        "Standard aggiornati con chi lavora, visibili sul posto di lavoro, verificati con regolarità e usati come base per migliorare."
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
        "Controlli a fine processo, non registrati in modo sistematico.",
        "Controlli definiti lungo il processo, non conformità registrate e analizzate.",
        "Qualità progettata nei processi, indicatori (scarti, resi, reclami) con obiettivi e analisi sistematica delle cause."
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
        "Non lo conosciamo.",
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
        "Categorie di acquisto analizzate per spesa e rischio, con fornitori alternativi e accordi quadro.",
        "Strategia per categoria, negoziazioni pianificate, costo totale di acquisto considerato e risparmi misurati."
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
        "Si ricordano i problemi avuti con i fornitori.",
        "Valutazione periodica dei fornitori principali su qualità, tempi e prezzo.",
        "Valutazione strutturata con piani di miglioramento condivisi e criteri anche ambientali e sociali."
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
        "Non ci abbiamo pensato finché non è successo.",
        "Conosciamo i fornitori critici, ma non abbiamo alternative pronte.",
        "Fornitori critici individuati, con alternative qualificate o scorte di sicurezza per i materiali principali.",
        "Rischio di fornitura monitorato con indicatori, piani di continuità per i materiali critici e contratti che ripartiscono i rischi."
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
        "Le scorte si controllano a vista; gli inventari a fine anno.",
        "Giacenze nel gestionale, ma spesso non affidabili.",
        "Giacenze affidabili e livelli di scorta definiti per gli articoli principali.",
        "Scorte gestite per classe di articolo con obiettivi di rotazione e livello di servizio, articoli obsoleti seguiti e smaltiti."
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
        "Trasportatori abituali, senza controllo di costi e puntualità.",
        "Consegne programmate, trasportatori scelti con criteri e costi per spedizione controllati.",
        "Logistica misurata per costo, puntualità e danni, con ottimizzazione dei carichi e dei giri e accordi con livelli di servizio."
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
        "Manutenzione programmata solo per gli impianti principali.",
        "Piano di manutenzione preventiva registrato, fermi e guasti misurati.",
        "Manutenzione basata sui dati (condizioni, frequenza dei guasti), con obiettivi di disponibilità e costo."
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
        "Ci si limita agli adempimenti, gestiti da un consulente.",
        "Adempimenti in ordine, con attenzione ai temi principali.",
        "Valutazione dei rischi aggiornata, formazione regolare, infortuni e quasi incidenti registrati e analizzati.",
        "Sistema di gestione strutturato (anche certificato), indicatori seguiti, coinvolgimento attivo dei lavoratori e miglioramento continuo."
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
        "Quando c'è un problema grave.",
        "Su iniziativa di singole persone, senza un metodo.",
        "Progetti di miglioramento periodici con un metodo (per esempio lean) e risultati misurati.",
        "Il miglioramento è parte del lavoro quotidiano: suggerimenti raccolti, gruppi di lavoro, risultati condivisi e riconosciuti."
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
        "Qualche indicatore calcolato a mano, saltuariamente.",
        "Indicatori principali (puntualità, produttività, qualità, scorte) aggiornati ogni mese e discussi.",
        "Cruscotto con obiettivi per ciascun indicatore, visibile anche nei reparti, aggiornato in automatico e usato nelle riunioni quotidiane o settimanali."
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
        "Il vertice decide caso per caso, senza un piano.",
        "Piano pluriennale degli investimenti digitali collegato alle priorità aziendali, con budget.",
        "Piano rivisto ogni anno, con progetti valutati per benefici attesi e risultati verificati dopo la realizzazione."
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
        "Se ne occupa chi ha più dimestichezza, a tempo perso.",
        "Un fornitore esterno interviene a chiamata.",
        "Responsabile interno o fornitore con contratto e livelli di servizio definiti.",
        "Responsabile che partecipa alle scelte di direzione, fornitori gestiti e valutati, inventario di sistemi e licenze aggiornato."
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
        "Contabilità informatizzata; il resto su fogli di calcolo e carta.",
        "Gestionale per amministrazione e ordini; produzione, magazzino o commesse gestite a parte.",
        "Gestionale integrato che copre i processi principali, con poche doppie registrazioni.",
        "Sistemi integrati tra loro (gestionale, CRM, produzione, e-commerce) con dati inseriti una sola volta e scambi automatici con clienti e fornitori."
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
        "Apparati vecchi, rallentamenti e fermi frequenti.",
        "Funziona, ma senza un piano di rinnovo né una visione d'insieme.",
        "Infrastruttura aggiornata con un piano di rinnovo, servizi principali in cloud o in sede sotto controllo.",
        "Infrastruttura progettata per crescita e continuità, con costi e prestazioni monitorati e scelte cloud valutate per costo, sicurezza e dipendenza dai fornitori."
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
        "Ci sono spesso dati doppi o incoerenti tra uffici.",
        "Le anagrafiche principali sono abbastanza pulite, ma senza regole.",
        "Responsabili delle anagrafiche e regole di codifica definite.",
        "Dati governati con definizioni comuni degli indicatori, controlli periodici di qualità e accessi regolati."
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
        "Cartelle condivise, con regole poco rispettate.",
        "Archivio digitale con struttura e permessi definiti, versioni sotto controllo.",
        "Gestione documentale integrata con i processi, ricerca rapida, conservazione a norma e accessi tracciati."
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
        "Ognuno prepara i propri fogli di calcolo quando serve.",
        "Report periodici estratti a mano dal gestionale.",
        "Cruscotti aggiornati automaticamente per le aree principali.",
        "Cruscotti integrati per direzione e responsabili, con indicatori definiti in modo univoco e usati nelle riunioni."
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
        "Si decide soprattutto a esperienza.",
        "I dati si guardano a posteriori per confermare le decisioni.",
        "I responsabili consultano con regolarità dati e indicatori prima di decidere.",
        "I responsabili sanno analizzare i dati in autonomia e le decisioni importanti sono accompagnate da numeri e ipotesi verificabili."
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
        "Qualche automazione isolata.",
        "Processi principali digitalizzati con flussi di approvazione.",
        "Automazione estesa con misura dei tempi risparmiati e revisione periodica dei processi."
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
        "Flussi digitali da un capo all'altro, collegati al gestionale, con tempi misurati e colli di bottiglia eliminati."
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
        "Sito vetrina ed email.",
        "CRM in uso e almeno un canale digitale per ordini, preventivi o assistenza.",
        "Esperienza digitale completa per il cliente (portale, ordini, documenti, assistenza) misurata e migliorata."
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
        "Telefono, email e documenti reinseriti a mano.",
        "Ordini inviati dal gestionale, conferme e documenti gestiti a mano.",
        "Scambi digitali con i fornitori principali (portali, documenti strutturati).",
        "Scambi integrati con i sistemi dei fornitori principali, con stato degli ordini visibile e controlli automatici."
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
        "Alcuni casi d'uso definiti (previsioni, testi, assistenza) con risultati verificati.",
        "Iniziative strutturate con priorità, dati preparati, competenze interne e misura dei benefici."
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
        "No: ognuno usa gli strumenti che preferisce.",
        "Indicazioni verbali di prudenza.",
        "Regole scritte su strumenti ammessi e dati che non si possono inserire, comunicate a tutti.",
        "Regole scritte, formazione, strumenti aziendali con contratti adeguati e verifica della conformità alle norme europee."
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
        "Antivirus e poco altro.",
        "Antivirus, firewall e salvataggi dei dati, senza verifiche.",
        "Accessi con doppia verifica, aggiornamenti regolari, salvataggi separati e provati.",
        "Monitoraggio continuo, verifiche periodiche di vulnerabilità e misure in linea con la normativa (per esempio NIS2, se applicabile)."
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
        "Non ci abbiamo pensato.",
        "Sappiamo a chi telefonare in caso di problemi.",
        "Formazione periodica del personale (per esempio sulle email truffa) e procedura di risposta agli incidenti.",
        "Piano di continuità provato, simulazioni, eventuale assicurazione e ruoli chiari in caso di attacco."
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
        "Ci siamo limitati a qualche informativa.",
        "Adempimenti di base fatti con un consulente, poco aggiornati.",
        "Registro dei trattamenti, nomine e informative aggiornati, responsabile interno o esterno definito.",
        "Protezione dei dati integrata nei processi e nei progetti, verifiche periodiche e gestione documentata delle richieste e degli incidenti."
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
        "Il vertice ha idee sulle direzioni, non messe per iscritto.",
        "Priorità di innovazione scritte, collegate alla strategia.",
        "Strategia dell'innovazione con obiettivi misurabili, mix di progetti incrementali e di rottura, rivista ogni anno."
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
        "Nessuna risorsa dedicata: si fa nei ritagli di tempo.",
        "Qualche spesa decisa caso per caso.",
        "Budget annuale e persone con tempo dedicato all'innovazione.",
        "Investimento programmato e misurato (per esempio in percentuale del fatturato), con persone e competenze dedicate e risorse protette dalle urgenze."
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
        "Dal titolare o da qualche persona particolarmente intraprendente.",
        "Dalle richieste dei clienti, raccolte in modo informale.",
        "Canali definiti per raccogliere idee da persone, clienti e fornitori, con valutazione periodica.",
        "Processo continuo che coinvolge tutta l'azienda e dà riscontro a chi propone."
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
        "Osservazione strutturata con fonti, partner e momenti di valutazione dell'impatto sul nostro modello di business."
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
        "Si parte con quello che sembra promettente, senza criteri.",
        "Il vertice sceglie, ma i progetti si accumulano e pochi si chiudono.",
        "Criteri di selezione chiari (valore, fattibilità, coerenza) e un elenco unico di progetti con priorità.",
        "Portafoglio gestito con momenti di decisione per proseguire o fermare, risorse assegnate e risultati confrontati con le attese."
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
        "No: si procede se l'idea convince.",
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
        "Per tentativi, senza fasi definite.",
        "Con alcune fasi, ma tempi e costi spesso sfuggono.",
        "Processo con fasi, responsabili, prototipi e verifiche prima del lancio.",
        "Processo strutturato e misurato (tempi di sviluppo, successo dei lanci), con il coinvolgimento di funzioni diverse fin dall'inizio."
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
        "Non li misuriamo; i ritardi sono la regola.",
        "Li misuriamo a fine progetto, spesso con ritardi importanti.",
        "Tempi e costi pianificati e seguiti; la maggior parte dei progetti li rispetta.",
        "Tempi di sviluppo misurati e in riduzione, con metodi per accelerare (sviluppi in parallelo, rilasci progressivi)."
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
        "Si presenta il prodotto finito.",
        "Si raccoglie il parere di qualche cliente a fine sviluppo.",
        "Clienti coinvolti già nella definizione e prove su piccola scala prima del lancio.",
        "Sperimentazione sistematica (prototipi, prove pilota, test) con criteri chiari per decidere se proseguire."
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
        "Qualche azione di comunicazione al lancio.",
        "Piano di lancio con obiettivi, formazione della rete di vendita e comunicazione dedicata.",
        "Lancio pianificato con commerciale e marketing, obiettivi di vendita seguiti nei primi mesi e correzioni rapide."
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
        "Con nessuno.",
        "Occasionalmente con fornitori o consulenti.",
        "Collaborazioni stabili con almeno un soggetto (università, centri di ricerca, startup, clienti).",
        "Rete di collaborazioni gestita con obiettivi, accordi chiari sulla proprietà dei risultati e progetti comuni ricorrenti."
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
        "Non le conosciamo.",
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
        "Non li conosciamo o non li usiamo.",
        "Li usiamo quando un consulente ce li propone.",
        "Monitoriamo le opportunità e le usiamo per i progetti principali, con la documentazione in ordine.",
        "Pianifichiamo i progetti tenendo conto degli incentivi, con un presidio stabile e la documentazione tecnica preparata durante il progetto."
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
        "Non ce ne occupiamo.",
        "Abbiamo registrato il marchio.",
        "Valutiamo la protezione per le innovazioni principali e abbiamo accordi di riservatezza con collaboratori e partner.",
        "Gestione strutturata del patrimonio intellettuale, con monitoraggio dei concorrenti ed eventuale uso fiscale (patent box)."
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
        "Le novità sono viste come rischi; gli errori si evitano.",
        "Le idee sono ben accolte, ma manca il tempo per lavorarci.",
        "Tempo e risorse dedicate, con persone che hanno competenze specifiche.",
        "Sperimentare è incoraggiato e riconosciuto, gli errori diventano apprendimento condiviso."
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
        "No.",
        "Si ha un'idea dei prodotti nuovi che vanno bene.",
        "Si misura la quota di fatturato da prodotti o servizi introdotti negli ultimi tre anni.",
        "Indicatori di risultato e di processo (quota di fatturato nuovo, ritorno dei progetti, tempi) con obiettivi."
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
        "L'innovazione riguarda solo i prodotti, quando c'è.",
        "Qualche miglioramento dei processi, senza ripensare il modello.",
        "Progetti dedicati a processi e servizi (per esempio servizi aggiuntivi, nuove modalità di vendita).",
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
        "No.",
        "In modo informale, in base alle richieste ricevute.",
        "Sì, con un'analisi dei temi rilevanti che considera impatti e rischi.",
        "Sì, con un'analisi aggiornata che coinvolge clienti, dipendenti, banche e filiera e orienta la strategia."
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
        "Non li consideriamo.",
        "Li consideriamo quando ci toccano direttamente (costi dell'energia, richieste dei clienti).",
        "Rischi e opportunità principali sono individuati e discussi in direzione.",
        "Sono valutati con scenari, integrati nel piano e trasformati in obiettivi e investimenti (anche nuovi prodotti o servizi)."
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
        "Nessuno in particolare.",
        "Una persona se ne occupa a margine di altro.",
        "Responsabile indicato, obiettivi scritti e risorse dedicate.",
        "Obiettivi approvati dal vertice, inseriti nel piano e collegati agli incentivi dei responsabili."
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
        "Non se ne parla.",
        "Comunicazioni occasionali.",
        "Formazione e comunicazione periodica, con alcune iniziative partecipate.",
        "Obiettivi conosciuti da tutti, proposte delle persone raccolte e realizzate, risultati comunicati."
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
        "Conosciamo solo il costo in bolletta.",
        "Conosciamo i consumi complessivi annui.",
        "Consumi misurati per area o impianto, con interventi di efficienza realizzati.",
        "Piano energetico con obiettivi, misure continue, quota di energia rinnovabile e valutazione degli investimenti (anche con incentivi)."
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
        "Non le abbiamo mai calcolate.",
        "Ne abbiamo una stima approssimativa.",
        "Calcoliamo ogni anno le emissioni dirette e da energia acquistata.",
        "Calcoliamo anche le emissioni della catena del valore principali, con obiettivi di riduzione e piano d'azione."
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
        "Ci limitiamo agli obblighi.",
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
        "Criteri ambientali considerati per i nuovi prodotti e per gli imballaggi principali.",
        "Impatto valutato lungo il ciclo di vita, con obiettivi (materiali riciclati, riparabilità, imballaggi) e risultati comunicati ai clienti."
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
        "Politiche scritte su conciliazione e welfare, con dati raccolti.",
        "Obiettivi e indicatori sociali monitorati e rendicontati, con azioni verificate nel tempo."
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
        "Non è un tema affrontato.",
        "Ne siamo attenti, senza dati né regole.",
        "Raccogliamo i dati (per esempio differenze retributive e accesso alla formazione) e abbiamo regole su selezione e crescita.",
        "Obiettivi e indicatori di equità seguiti nel tempo, eventuale certificazione della parità di genere e risultati comunicati."
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
        "Esiste un codice etico, poco conosciuto.",
        "Codice etico diffuso, canale per le segnalazioni attivo, valutazione dell'opportunità del modello 231.",
        "Modello organizzativo adottato e aggiornato, organismo di vigilanza, formazione periodica e controlli."
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
        "Ci pensa il consulente, quando c'è una scadenza.",
        "Abbiamo un elenco delle scadenze principali.",
        "Scadenzario completo con responsabili e verifica periodica degli adempimenti.",
        "Sistema di gestione (anche certificato, per esempio ISO 14001) con controlli periodici e anticipo delle nuove regole."
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
        "Criteri ambientali e sociali nella qualifica dei fornitori principali.",
        "Valutazione periodica della filiera con obiettivi condivisi e piani di miglioramento con i fornitori principali."
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
        "Nessuna iniziativa specifica.",
        "Sponsorizzazioni o donazioni occasionali.",
        "Iniziative coerenti con l'attività e programmate, con partner locali.",
        "Strategia di impatto sul territorio con obiettivi e risultati comunicati."
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
        "Rispondiamo ai questionari quando arrivano, con fatica.",
        "Abbiamo raccolto alcuni dati per rispondere alle richieste principali.",
        "Raccolta annuale dei dati secondo uno standard semplificato (per esempio VSME) con un documento di sintesi.",
        "Rendicontazione annuale strutturata, con dati verificati, obiettivi e confronto nel tempo, usata anche con banche e clienti."
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
        "Le subiamo, con risultati che non conosciamo o non governiamo.",
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
