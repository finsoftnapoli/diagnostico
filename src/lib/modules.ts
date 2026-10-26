// Generato da scripts/genera_moduli.py (moduli di approfondimento v0.1). Non modificare a mano:
// cambiare scripts/moduli_content.py e rigenerare.
import type { AreaCode } from "./types";

export const MODULE_VERSION = "0.1";

export interface ModuleQuestion {
  id: string;
  area: AreaCode;
  theme: string;
  text: string;
  levels: string[];
  check: { text: string; options: string[]; flag: { minLevel: number; answers: string[] } } | null;
  /** La domanda può non riguardare l'azienda: si può rispondere "non applicabile". */
  na: boolean;
}

export const MODULE_QUESTIONS: Record<AreaCode, ModuleQuestion[]> = {
  "STR": [
    {
      "id": "STR-A01",
      "area": "STR",
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
      "id": "STR-A02",
      "area": "STR",
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
      "id": "STR-A03",
      "area": "STR",
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
      "id": "STR-A04",
      "area": "STR",
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
      "id": "STR-A05",
      "area": "STR",
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
      "id": "STR-A06",
      "area": "STR",
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
      "id": "STR-A07",
      "area": "STR",
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
      "id": "STR-A08",
      "area": "STR",
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
      "id": "STR-A09",
      "area": "STR",
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
      "id": "STR-A10",
      "area": "STR",
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
    }
  ],
  "FIN": [
    {
      "id": "FIN-A01",
      "area": "FIN",
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
      "id": "FIN-A02",
      "area": "FIN",
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
      "id": "FIN-A03",
      "area": "FIN",
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
      "id": "FIN-A04",
      "area": "FIN",
      "theme": "Capitale circolante",
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
      "id": "FIN-A05",
      "area": "FIN",
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
      "id": "FIN-A06",
      "area": "FIN",
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
      "id": "FIN-A07",
      "area": "FIN",
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
      "id": "FIN-A08",
      "area": "FIN",
      "theme": "Banche e struttura finanziaria",
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
      "id": "FIN-A09",
      "area": "FIN",
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
      "id": "FIN-A10",
      "area": "FIN",
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
    }
  ],
  "MKT": [
    {
      "id": "MKT-A01",
      "area": "MKT",
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
      "id": "MKT-A02",
      "area": "MKT",
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
      "id": "MKT-A03",
      "area": "MKT",
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
      "id": "MKT-A04",
      "area": "MKT",
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
      "id": "MKT-A05",
      "area": "MKT",
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
      "id": "MKT-A06",
      "area": "MKT",
      "theme": "Rete di vendita",
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
      "id": "MKT-A07",
      "area": "MKT",
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
      "id": "MKT-A08",
      "area": "MKT",
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
      "id": "MKT-A09",
      "area": "MKT",
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
      "id": "MKT-A10",
      "area": "MKT",
      "theme": "Portafoglio di offerta e canali",
      "text": "Come gestite il portafoglio di prodotti o servizi e i canali di vendita (incluso l'estero e il digitale)?",
      "levels": [
        "L'offerta cresce per aggiunta; i canali sono quelli storici.",
        "Si eliminano prodotti o si aprono canali in modo occasionale.",
        "Revisione periodica dell'offerta per vendite e margini e piano per i canali principali.",
        "Portafoglio e canali gestiti con un piano: introduzioni ed eliminazioni programmate, obiettivi per canale e per mercato."
      ],
      "check": null,
      "na": false
    }
  ],
  "PER": [
    {
      "id": "PER-A01",
      "area": "PER",
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
      "id": "PER-A02",
      "area": "PER",
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
      "id": "PER-A03",
      "area": "PER",
      "theme": "Selezione",
      "text": "Come selezionate le nuove persone?",
      "levels": [
        "Con il passaparola e colloqui informali.",
        "Con annunci e colloqui, senza criteri definiti.",
        "Profili scritti, più colloqui con criteri di valutazione condivisi, canali diversi.",
        "Processo strutturato con prove pratiche, tempi misurati, attenzione alla reputazione come datore di lavoro e verifica della qualità delle assunzioni."
      ],
      "check": null,
      "na": false
    },
    {
      "id": "PER-A04",
      "area": "PER",
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
      "id": "PER-A05",
      "area": "PER",
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
      "id": "PER-A06",
      "area": "PER",
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
      "id": "PER-A07",
      "area": "PER",
      "theme": "Retribuzione e riconoscimenti",
      "text": "Come sono definite retribuzioni, premi e benefit?",
      "levels": [
        "Caso per caso, spesso in base alle richieste.",
        "Aumenti e premi decisi dal vertice senza criteri dichiarati.",
        "Criteri per livello e ruolo, confronto con il mercato, premi legati a risultati.",
        "Politica retributiva scritta, premi di risultato collegati agli obiettivi, welfare aziendale e verifica di equità interna."
      ],
      "check": null,
      "na": false
    },
    {
      "id": "PER-A08",
      "area": "PER",
      "theme": "Clima e coinvolgimento",
      "text": "Come conoscete e curate il clima e il coinvolgimento delle persone?",
      "levels": [
        "Non viene rilevato.",
        "Se ne ha un'idea dal confronto informale.",
        "Indagine periodica di clima e momenti di comunicazione interna strutturati.",
        "Indagine periodica con piano di azione condiviso, indicatori (assenze, uscite volontarie) seguiti nel tempo."
      ],
      "check": null,
      "na": false
    },
    {
      "id": "PER-A09",
      "area": "PER",
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
      "id": "PER-A10",
      "area": "PER",
      "theme": "Gestione del personale",
      "text": "Come è organizzata la gestione del personale (amministrazione, regole interne, comunicazione)?",
      "levels": [
        "Se ne occupano il consulente del lavoro e il titolare.",
        "Una persona interna gestisce gli aspetti amministrativi.",
        "Funzione o referente dedicato con regolamenti interni, dati del personale aggiornati e indicatori di base.",
        "Funzione che partecipa alle decisioni di direzione, con indicatori su costo, produttività, assenze e uscite discussi regolarmente."
      ],
      "check": null,
      "na": false
    }
  ],
  "OPS": [
    {
      "id": "OPS-A01",
      "area": "OPS",
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
      "id": "OPS-A02",
      "area": "OPS",
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
      "id": "OPS-A03",
      "area": "OPS",
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
      "id": "OPS-A04",
      "area": "OPS",
      "theme": "Qualità",
      "text": "Come garantite la qualità di prodotti o servizi?",
      "levels": [
        "Si interviene sui problemi segnalati dai clienti.",
        "Controlli a fine processo, non registrati in modo sistematico.",
        "Controlli definiti lungo il processo, non conformità registrate e analizzate, eventuale certificazione.",
        "Qualità progettata nei processi, indicatori (scarti, resi, reclami) con obiettivi e analisi sistematica delle cause."
      ],
      "check": null,
      "na": false
    },
    {
      "id": "OPS-A05",
      "area": "OPS",
      "theme": "Miglioramento continuo",
      "text": "Come nascono e si realizzano i miglioramenti dei processi?",
      "levels": [
        "Quando c'è un problema grave.",
        "Su iniziativa di singole persone, senza un metodo.",
        "Progetti di miglioramento periodici con un metodo (per esempio lean) e risultati misurati.",
        "Il miglioramento è parte del lavoro quotidiano: suggerimenti raccolti, gruppi di lavoro, risultati condivisi e premiati."
      ],
      "check": null,
      "na": false
    },
    {
      "id": "OPS-A06",
      "area": "OPS",
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
      "id": "OPS-A07",
      "area": "OPS",
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
      "id": "OPS-A08",
      "area": "OPS",
      "theme": "Magazzino e logistica",
      "text": "Come sono gestiti scorte, magazzino e consegne?",
      "levels": [
        "Le scorte si controllano a vista; gli inventari a fine anno.",
        "Giacenze nel gestionale, ma spesso non affidabili.",
        "Giacenze affidabili, livelli di scorta definiti per gli articoli principali, consegne programmate.",
        "Scorte gestite per classe di articolo con obiettivi di rotazione e servizio, logistica misurata per costo e puntualità."
      ],
      "check": null,
      "na": true
    },
    {
      "id": "OPS-A09",
      "area": "OPS",
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
      "id": "OPS-A10",
      "area": "OPS",
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
    }
  ],
  "DIG": [
    {
      "id": "DIG-A01",
      "area": "DIG",
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
      "id": "DIG-A02",
      "area": "DIG",
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
      "id": "DIG-A03",
      "area": "DIG",
      "theme": "Strumenti commerciali digitali",
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
      "id": "DIG-A04",
      "area": "DIG",
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
      "id": "DIG-A05",
      "area": "DIG",
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
      "id": "DIG-A06",
      "area": "DIG",
      "theme": "Analisi avanzate e intelligenza artificiale",
      "text": "Quanto usate analisi avanzate o intelligenza artificiale?",
      "levels": [
        "Per nulla.",
        "Qualche persona usa strumenti di intelligenza artificiale in modo personale.",
        "Alcuni casi d'uso definiti (previsioni, testi, assistenza) con regole d'uso e risultati verificati.",
        "Iniziative strutturate con priorità, dati preparati, competenze interne, regole su riservatezza e misura dei benefici."
      ],
      "check": null,
      "na": false
    },
    {
      "id": "DIG-A07",
      "area": "DIG",
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
      "id": "DIG-A08",
      "area": "DIG",
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
      "id": "DIG-A09",
      "area": "DIG",
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
      "id": "DIG-A10",
      "area": "DIG",
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
    }
  ],
  "INN": [
    {
      "id": "INN-A01",
      "area": "INN",
      "theme": "Strategia dell'innovazione",
      "text": "Quanto è definito dove e perché innovare?",
      "levels": [
        "Si innova quando un cliente lo chiede.",
        "Il vertice ha idee sulle direzioni, non messe per iscritto.",
        "Priorità di innovazione scritte, collegate alla strategia, con budget dedicato.",
        "Strategia dell'innovazione con obiettivi misurabili, mix di progetti incrementali e di rottura, rivista ogni anno."
      ],
      "check": null,
      "na": false
    },
    {
      "id": "INN-A02",
      "area": "INN",
      "theme": "Raccolta delle idee",
      "text": "Come nascono e vengono raccolte le idee?",
      "levels": [
        "Dal titolare o da qualche persona particolarmente intraprendente.",
        "Dalle richieste dei clienti, raccolte in modo informale.",
        "Canali definiti per raccogliere idee da persone, clienti e fornitori, con valutazione periodica.",
        "Processo continuo che osserva anche tecnologie e mercati, coinvolge tutta l'azienda e dà riscontro a chi propone."
      ],
      "check": null,
      "na": false
    },
    {
      "id": "INN-A03",
      "area": "INN",
      "theme": "Selezione dei progetti",
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
      "id": "INN-A04",
      "area": "INN",
      "theme": "Sviluppo di nuovi prodotti o servizi",
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
      "id": "INN-A05",
      "area": "INN",
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
      "id": "INN-A06",
      "area": "INN",
      "theme": "Collaborazioni esterne",
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
      "id": "INN-A07",
      "area": "INN",
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
      "id": "INN-A08",
      "area": "INN",
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
      "id": "INN-A09",
      "area": "INN",
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
      "id": "INN-A10",
      "area": "INN",
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
    }
  ],
  "SOS": [
    {
      "id": "SOS-A01",
      "area": "SOS",
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
      "id": "SOS-A02",
      "area": "SOS",
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
      "id": "SOS-A03",
      "area": "SOS",
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
      "id": "SOS-A04",
      "area": "SOS",
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
      "id": "SOS-A05",
      "area": "SOS",
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
      "id": "SOS-A06",
      "area": "SOS",
      "theme": "Persone e benessere",
      "text": "Quanto la sostenibilità sociale verso le persone è gestita (salute, equità, conciliazione, welfare)?",
      "levels": [
        "Si applica il contratto.",
        "Ci sono iniziative isolate di welfare o conciliazione.",
        "Politiche scritte su equità, conciliazione e welfare, con dati raccolti (per esempio differenze retributive e formazione).",
        "Obiettivi e indicatori sociali monitorati e rendicontati, eventuale certificazione (per esempio parità di genere)."
      ],
      "check": null,
      "na": false
    },
    {
      "id": "SOS-A07",
      "area": "SOS",
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
      "id": "SOS-A08",
      "area": "SOS",
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
      "id": "SOS-A09",
      "area": "SOS",
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
      "id": "SOS-A10",
      "area": "SOS",
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
    }
  ]
};

export const ROADMAP_HORIZONS = ["Primi 3 mesi", "Da 3 a 6 mesi", "Da 6 a 12 mesi"];
