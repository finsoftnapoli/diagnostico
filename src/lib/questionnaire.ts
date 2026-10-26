// Generato da scripts/genera_domande.py (banca delle domande v0.2). Non modificare a mano:
// cambiare scripts/content.py e rigenerare.
import type { Area, Question, Choice, ProfileField } from "./types";

export const QUESTIONNAIRE_VERSION = "0.2";

export const AREAS: Area[] = [
  {
    "code": "STR",
    "name": "Strategia e governance",
    "description": "Chiarezza della direzione, modo in cui si decide, solidità della governance e continuità dell'impresa"
  },
  {
    "code": "FIN",
    "name": "Finanza e controllo",
    "description": "Capacità di pianificare, controllare margini e liquidità, gestire la struttura finanziaria"
  },
  {
    "code": "MKT",
    "name": "Marketing e vendite",
    "description": "Conoscenza dei clienti, posizionamento, efficacia del processo commerciale e politica dei prezzi"
  },
  {
    "code": "PER",
    "name": "Persone e organizzazione",
    "description": "Chiarezza di ruoli e struttura, capacità di attrarre, sviluppare e motivare le persone"
  },
  {
    "code": "OPS",
    "name": "Operations e supply chain",
    "description": "Capacità di pianificare, produrre o erogare, controllare la qualità e gestire acquisti e fornitori"
  },
  {
    "code": "DIG",
    "name": "Digitale e dati",
    "description": "Adeguatezza dei sistemi, qualità e uso dei dati per decidere, sicurezza informatica"
  },
  {
    "code": "INN",
    "name": "Innovazione",
    "description": "Capacità di generare, selezionare e portare sul mercato novità di prodotto, servizio o processo"
  },
  {
    "code": "SOS",
    "name": "Sostenibilità",
    "description": "Consapevolezza e gestione dei temi ambientali, sociali e di governance, anche rispetto alle richieste di clienti e banche"
  }
];

export const QUESTIONS: Question[] = [
  {
    "id": "STR-1",
    "area": "STR",
    "theme": "Direzione strategica",
    "text": "Quale situazione descrive meglio il modo in cui l'azienda definisce i propri obiettivi per i prossimi anni?",
    "levels": [
      "Non ci sono obiettivi espliciti oltre l'andamento dell'anno: le scelte si fanno quando si presentano.",
      "Il titolare ha una visione chiara, ma non è scritta né tradotta in obiettivi per i responsabili.",
      "Esiste un piano pluriennale scritto, con pochi obiettivi misurabili condivisi con i responsabili.",
      "Il piano viene rivisto almeno una volta l'anno, gli obiettivi arrivano fino ai responsabili e i progressi sono verificati con regolarità."
    ],
    "check": {
      "text": "Esiste un piano strategico o industriale scritto, aggiornato negli ultimi 24 mesi?",
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
    "sizeNote": null
  },
  {
    "id": "STR-2",
    "area": "STR",
    "theme": "Decisioni e delega",
    "text": "Come vengono prese le decisioni in azienda?",
    "levels": [
      "Quasi tutte le decisioni, anche operative, passano dal titolare.",
      "Alcune decisioni operative sono delegate, ma i confini non sono chiari e spesso si torna al titolare.",
      "Deleghe e responsabilità sono definite per area; il titolare interviene sulle decisioni rilevanti.",
      "La direzione si riunisce con regolarità su un ordine del giorno, le decisioni sono documentate e le deleghe hanno limiti chiari, anche di spesa."
    ],
    "check": {
      "text": "Con che frequenza si riunisce la direzione con un ordine del giorno?",
      "options": [
        "Mai",
        "Occasionalmente",
        "Mensilmente",
        "Settimanalmente"
      ],
      "flag": {
        "minLevel": 4,
        "answers": [
          "Mai",
          "Occasionalmente"
        ]
      }
    },
    "sizeNote": "€2-10M: il livello 4 può essere una riunione settimanale del titolare con 2-3 responsabili, senza comitato formale"
  },
  {
    "id": "STR-3",
    "area": "STR",
    "theme": "Governance e continuità",
    "text": "Come è gestita la continuità dell'impresa (successione, regole tra soci, rischi principali)?",
    "levels": [
      "Il tema non è mai stato affrontato; gli organi societari esistono solo sulla carta.",
      "Se ne parla tra soci o in famiglia, ma senza decisioni né documenti.",
      "Esistono un piano di continuità per i ruoli chiave e una mappa dei rischi principali, rivisti di recente.",
      "La successione è pianificata con tempi e ruoli, le regole tra soci sono formalizzate, i rischi sono monitorati periodicamente e c'è almeno una voce esterna indipendente (consigliere o advisory board)."
    ],
    "check": {
      "text": "È presente almeno un consigliere esterno o indipendente, o un advisory board?",
      "options": [
        "Sì",
        "No"
      ],
      "flag": {
        "minLevel": 4,
        "answers": [
          "No"
        ]
      }
    },
    "sizeNote": "€50-100M: attendersi un consiglio con almeno un indipendente per il livello 4"
  },
  {
    "id": "FIN-1",
    "area": "FIN",
    "theme": "Pianificazione e budget",
    "text": "Quale situazione descrive meglio la pianificazione economica dell'azienda?",
    "levels": [
      "Non c'è un budget: si guarda il bilancio a fine anno.",
      "C'è un budget annuale di massima su fatturato e costi, raramente confrontato con i consuntivi.",
      "Il budget annuale è approvato e confrontato almeno ogni trimestre con i consuntivi, analizzando gli scostamenti.",
      "Il budget è collegato al piano, le previsioni vengono aggiornate durante l'anno e si usano scenari per decidere."
    ],
    "check": {
      "text": "Ogni quanto disponete di una situazione economica infrannuale affidabile?",
      "options": [
        "Annuale",
        "Semestrale",
        "Trimestrale",
        "Mensile"
      ],
      "flag": {
        "minLevel": 3,
        "answers": [
          "Annuale",
          "Semestrale"
        ]
      }
    },
    "sizeNote": "€2-10M: un confronto trimestrale è sufficiente per il livello 3"
  },
  {
    "id": "FIN-2",
    "area": "FIN",
    "theme": "Gestione della liquidità",
    "text": "Come prevedete e gestite la liquidità?",
    "levels": [
      "Non c'è una previsione: la liquidità si gestisce quando emerge il bisogno.",
      "Si fanno previsioni occasionali, soprattutto prima di pagamenti importanti.",
      "C'è una previsione periodica, almeno mensile e a 3-6 mesi, con un responsabile.",
      "La previsione è aggiornata di continuo, confrontata con il consuntivo, collegata a incassi e pagamenti e usata anche nel dialogo con le banche."
    ],
    "check": {
      "text": "Conoscete oggi il fabbisogno di cassa delle prossime 13 settimane?",
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
    "sizeNote": null
  },
  {
    "id": "FIN-3",
    "area": "FIN",
    "theme": "Marginalità e controllo di gestione",
    "text": "Quanto conoscete i margini dell'azienda?",
    "levels": [
      "Si conosce solo il risultato complessivo dell'azienda.",
      "I margini per prodotto o cliente si stimano occasionalmente, su fogli di calcolo.",
      "I margini per prodotto, cliente o commessa sono calcolati con regolarità e con un metodo condiviso.",
      "La marginalità è analizzata ogni mese e usata per decidere prezzi, mix e scelte commerciali, con indicatori condivisi con i responsabili."
    ],
    "check": {
      "text": "Conoscete la marginalità dei vostri 10 clienti principali?",
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
    "sizeNote": null
  },
  {
    "id": "MKT-1",
    "area": "MKT",
    "theme": "Clienti e posizionamento",
    "text": "Quanto conoscete i vostri clienti e cosa vi distingue dalla concorrenza?",
    "levels": [
      "Si vende a chi arriva: non ci sono segmenti di clienti né una proposta di valore definita.",
      "Si conoscono i clienti principali e i loro motivi d'acquisto, senza analisi strutturate.",
      "I segmenti prioritari sono definiti, con una proposta di valore per ciascuno e un'analisi periodica della concorrenza.",
      "I clienti sono segmentati per valore e potenziale, l'offerta è differenziata e si raccolgono regolarmente i loro giudizi."
    ],
    "check": {
      "text": "Quanto pesano i primi 5 clienti sul fatturato?",
      "options": [
        "Meno del 20%",
        "20-40%",
        "40-60%",
        "Oltre 60%"
      ],
      "flag": null
    },
    "sizeNote": null
  },
  {
    "id": "MKT-2",
    "area": "MKT",
    "theme": "Processo commerciale",
    "text": "Come è organizzata l'attività commerciale?",
    "levels": [
      "Le vendite dipendono dal titolare e da pochi venditori, senza obiettivi né registrazione delle opportunità.",
      "Ci sono obiettivi di fatturato per venditore; le opportunità sono seguite su agende o fogli personali.",
      "Le opportunità sono registrate in uno strumento condiviso (CRM), ci sono obiettivi per venditore e riunioni commerciali regolari.",
      "Le opportunità sono gestite per fasi, con previsioni di vendita, analisi delle conversioni e dei motivi di perdita, e incentivi legati agli obiettivi."
    ],
    "check": {
      "text": "Le opportunità commerciali sono registrate in uno strumento condiviso?",
      "options": [
        "Tutte",
        "Una parte",
        "Nessuna"
      ],
      "flag": {
        "minLevel": 3,
        "answers": [
          "Nessuna"
        ]
      }
    },
    "sizeNote": null
  },
  {
    "id": "MKT-3",
    "area": "MKT",
    "theme": "Prezzi",
    "text": "Come vengono decisi i prezzi?",
    "levels": [
      "Costo più margine o adeguamento alla concorrenza, caso per caso.",
      "C'è un listino, ma gli sconti sono decisi dai venditori senza regole.",
      "C'è una politica di prezzo con regole di sconto e una verifica periodica rispetto a costi e concorrenza.",
      "I prezzi riflettono il valore per ciascun segmento, gli sconti sono monitorati e gli aggiornamenti seguono rapidamente i costi."
    ],
    "check": {
      "text": "Negli ultimi 12 mesi avete rivisto i prezzi in modo strutturato?",
      "options": [
        "Sì",
        "No"
      ],
      "flag": {
        "minLevel": 4,
        "answers": [
          "No"
        ]
      }
    },
    "sizeNote": null
  },
  {
    "id": "PER-1",
    "area": "PER",
    "theme": "Struttura e ruoli",
    "text": "Quanto sono chiari ruoli e responsabilità?",
    "levels": [
      "I ruoli non sono definiti: chi c'è fa quello che serve.",
      "Esiste un organigramma, ma non è aggiornato e le responsabilità si sovrappongono.",
      "L'organigramma è aggiornato, i ruoli chiave hanno mansioni scritte e responsabilità chiare.",
      "La struttura viene rivista quando cambia la strategia, i ruoli hanno obiettivi misurabili e nessun ruolo chiave è senza sostituto."
    ],
    "check": {
      "text": "Esiste un organigramma aggiornato negli ultimi 12 mesi?",
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
    "sizeNote": null
  },
  {
    "id": "PER-2",
    "area": "PER",
    "theme": "Selezione e sviluppo",
    "text": "Come trovate e fate crescere le persone?",
    "levels": [
      "Si assume quando serve, tramite conoscenze; la formazione è solo quella obbligatoria.",
      "Si usano annunci o agenzie; la formazione è occasionale, su richiesta.",
      "I fabbisogni di personale sono pianificati, selezione e inserimento seguono un processo definito, c'è un piano di formazione annuale.",
      "Le competenze necessarie sono pianificate in base al piano, ci sono percorsi di crescita e si monitorano turnover e clima."
    ],
    "check": {
      "text": "Qual è stato il turnover volontario nell'ultimo anno?",
      "options": [
        "Meno del 5%",
        "5-10%",
        "10-20%",
        "Oltre 20%",
        "Non lo sappiamo"
      ],
      "flag": {
        "minLevel": 4,
        "answers": [
          "Non lo sappiamo"
        ]
      }
    },
    "sizeNote": null
  },
  {
    "id": "PER-3",
    "area": "PER",
    "theme": "Obiettivi e valutazione",
    "text": "Come vengono definiti gli obiettivi e valutate le prestazioni?",
    "levels": [
      "Non ci sono obiettivi individuali né valutazioni.",
      "La valutazione è informale, da parte del titolare; i premi sono discrezionali.",
      "I responsabili hanno obiettivi annuali e un colloquio di valutazione; alcuni ruoli hanno una parte variabile.",
      "Gli obiettivi discendono dal piano, i colloqui sono regolari, la parte variabile è trasparente e la valutazione guida crescita e successione."
    ],
    "check": {
      "text": "Quale quota dei dipendenti ha un colloquio di valutazione almeno annuale?",
      "options": [
        "Nessuno",
        "Solo i responsabili",
        "Oltre metà",
        "Tutti"
      ],
      "flag": {
        "minLevel": 3,
        "answers": [
          "Nessuno"
        ]
      }
    },
    "sizeNote": null
  },
  {
    "id": "OPS-1",
    "area": "OPS",
    "theme": "Pianificazione e scorte",
    "text": "Come pianificate produzione o erogazione dei servizi?",
    "levels": [
      "Si lavora sull'urgenza; capacità e scorte sono gestite a vista.",
      "C'è una pianificazione di breve su fogli di calcolo; le scorte si rivedono quando ci sono problemi.",
      "Una pianificazione regolare collega vendite previste, capacità e acquisti; i livelli di scorta sono definiti.",
      "Vendite, operations e finanza si allineano ogni mese; puntualità del servizio e rotazione delle scorte sono monitorate."
    ],
    "check": {
      "text": "Che quota degli ordini viene consegnata nei tempi promessi?",
      "options": [
        "Meno del 70%",
        "70-85%",
        "85-95%",
        "Oltre 95%",
        "Non lo misuriamo"
      ],
      "flag": {
        "minLevel": 3,
        "answers": [
          "Non lo misuriamo"
        ]
      }
    },
    "sizeNote": "Aziende di servizi: leggere 'scorte' come capacità delle persone"
  },
  {
    "id": "OPS-2",
    "area": "OPS",
    "theme": "Processi e qualità",
    "text": "Come gestite processi e qualità?",
    "levels": [
      "I processi non sono documentati; i problemi si risolvono quando emergono.",
      "Alcune procedure sono scritte; i problemi di qualità si gestiscono caso per caso.",
      "I processi principali sono documentati, ci sono indicatori di qualità ed efficienza e si analizzano le cause dei problemi ricorrenti.",
      "Il miglioramento continuo è strutturato, con obiettivi, progetti e revisioni periodiche, e coinvolge il personale."
    ],
    "check": {
      "text": "Avete una certificazione del sistema qualità (per esempio ISO 9001)?",
      "options": [
        "Sì",
        "No"
      ],
      "flag": null
    },
    "sizeNote": null
  },
  {
    "id": "OPS-3",
    "area": "OPS",
    "theme": "Acquisti e fornitori",
    "text": "Come gestite acquisti e fornitori?",
    "levels": [
      "Si acquista per urgenza, dai fornitori storici, senza confronti.",
      "Si confrontano i prezzi sugli acquisti principali; i fornitori non vengono valutati.",
      "I fornitori principali sono valutati su prezzo, qualità e puntualità; ci sono alternative per le forniture critiche.",
      "Ci sono strategie per categoria d'acquisto, contratti e prestazioni monitorati e piani di riserva per i rischi di fornitura."
    ],
    "check": {
      "text": "Per le forniture critiche avete almeno un fornitore alternativo qualificato?",
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
    "sizeNote": null
  },
  {
    "id": "DIG-1",
    "area": "DIG",
    "theme": "Sistemi gestionali",
    "text": "Quale situazione descrive meglio i vostri sistemi informatici?",
    "levels": [
      "Contabilità esterna e fogli di calcolo; i dati si ricopiano a mano.",
      "Un gestionale copre contabilità e fatturazione; il resto è su strumenti separati.",
      "Un gestionale copre le funzioni principali, con alcune integrazioni (CRM, magazzino, e-commerce).",
      "I sistemi sono integrati con un'unica fonte dei dati, i processi ripetitivi sono automatizzati e c'è un piano di evoluzione."
    ],
    "check": {
      "text": "Usate un gestionale integrato (ERP) per più funzioni aziendali?",
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
    "sizeNote": null
  },
  {
    "id": "DIG-2",
    "area": "DIG",
    "theme": "Dati e reporting",
    "text": "Come usate i dati per gestire l'azienda?",
    "levels": [
      "I numeri si chiedono al commercialista o si estraggono a mano quando servono.",
      "Ci sono report periodici preparati a mano, spesso in ritardo o non coerenti tra loro.",
      "Un cruscotto con gli indicatori chiave è aggiornato con regolarità e usato nelle riunioni di direzione.",
      "I dati sono affidabili e tempestivi in tutte le aree e si usano anche per prevedere, con strumenti di analisi o intelligenza artificiale dove utile."
    ],
    "check": {
      "text": "Entro quanti giorni dalla fine del mese avete i dati principali?",
      "options": [
        "Oltre 30",
        "15-30",
        "5-15",
        "Meno di 5"
      ],
      "flag": {
        "minLevel": 3,
        "answers": [
          "Oltre 30"
        ]
      }
    },
    "sizeNote": null
  },
  {
    "id": "DIG-3",
    "area": "DIG",
    "theme": "Sicurezza informatica",
    "text": "Come proteggete dati e sistemi?",
    "levels": [
      "Nessuna misura specifica oltre l'antivirus.",
      "Backup e password sono gestiti, ma non in modo sistematico.",
      "I backup sono regolari e verificati, gli accessi controllati e il personale ha una formazione di base.",
      "C'è un piano di sicurezza con un responsabile, prove periodiche di ripristino, procedure in caso di attacco e verifiche esterne."
    ],
    "check": {
      "text": "Avete provato a ripristinare i backup negli ultimi 12 mesi?",
      "options": [
        "Sì",
        "No",
        "Non lo so"
      ],
      "flag": {
        "minLevel": 3,
        "answers": [
          "No"
        ]
      }
    },
    "sizeNote": null
  },
  {
    "id": "INN-1",
    "area": "INN",
    "theme": "Nuovi prodotti e servizi",
    "text": "Come nascono e si sviluppano nuovi prodotti o servizi?",
    "levels": [
      "Le novità nascono dalle richieste di singoli clienti, senza un processo.",
      "Le idee si raccolgono in modo informale; i progetti partono senza criteri di selezione.",
      "C'è un processo con fasi, criteri di selezione e un budget dedicato.",
      "Le iniziative sono gestite come un portafoglio, con clienti e partner coinvolti e risultati misurati."
    ],
    "check": {
      "text": "Che quota del fatturato viene da prodotti o servizi introdotti negli ultimi 3 anni?",
      "options": [
        "Meno del 5%",
        "5-15%",
        "15-30%",
        "Oltre 30%",
        "Non lo sappiamo"
      ],
      "flag": {
        "minLevel": 4,
        "answers": [
          "Non lo sappiamo"
        ]
      }
    },
    "sizeNote": null
  },
  {
    "id": "INN-2",
    "area": "INN",
    "theme": "Collaborazioni esterne",
    "text": "Quanto collaborate con soggetti esterni per innovare (università, centri di ricerca, startup, fornitori, bandi)?",
    "levels": [
      "Nessuna collaborazione.",
      "Collaborazioni occasionali, legate a singole occasioni.",
      "Alcune collaborazioni attive e uso degli incentivi pubblici per progetti di innovazione.",
      "Una rete stabile di partner, partecipazione regolare a bandi e progetti, ricerca sistematica di tecnologie e soluzioni."
    ],
    "check": {
      "text": "Negli ultimi 3 anni avete usato incentivi per progetti di innovazione o digitalizzazione?",
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
    "sizeNote": null
  },
  {
    "id": "INN-3",
    "area": "INN",
    "theme": "Cultura della sperimentazione",
    "text": "Come vengono accolte nuove idee e tentativi in azienda?",
    "levels": [
      "Gli errori si evitano o si sanzionano; le nuove idee sono scoraggiate.",
      "Le idee sono benvenute, ma raramente si traducono in prove concrete.",
      "Tempo e risorse sono dedicati a sperimentare su progetti selezionati, e le lezioni vengono condivise.",
      "Si sperimenta con regolarità con piccole prove, si impara dagli insuccessi e le idee migliori vengono riconosciute."
    ],
    "check": {
      "text": "Nell'ultimo anno avete avviato almeno una prova o un progetto pilota nato da un'idea interna?",
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
    "sizeNote": null
  },
  {
    "id": "SOS-1",
    "area": "SOS",
    "theme": "Priorità e obiettivi di sostenibilità",
    "text": "Come affrontate i temi di sostenibilità ambientale, sociale e di governance?",
    "levels": [
      "Il tema non è stato affrontato.",
      "Ci sono iniziative isolate (per esempio di risparmio energetico), senza obiettivi.",
      "Le priorità sono individuate in base a settore e clienti, con alcuni obiettivi misurabili e un responsabile.",
      "La sostenibilità è integrata nel piano, con obiettivi e indicatori monitorati e un rendiconto condiviso con clienti e banche."
    ],
    "check": {
      "text": "Avete un responsabile, anche non a tempo pieno, per i temi di sostenibilità?",
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
    "sizeNote": null
  },
  {
    "id": "SOS-2",
    "area": "SOS",
    "theme": "Energia ed emissioni",
    "text": "Quanto conoscete e gestite consumi ed emissioni?",
    "levels": [
      "Consumi ed emissioni non vengono misurati.",
      "I consumi energetici si conoscono dalle bollette, senza analisi.",
      "Consumi ed emissioni principali sono misurati e seguiti nel tempo; sono stati avviati interventi di efficienza.",
      "C'è un bilancio delle emissioni con obiettivi di riduzione, e i fornitori sono valutati anche su criteri ambientali."
    ],
    "check": {
      "text": "Avete calcolato le vostre emissioni di gas serra almeno una volta?",
      "options": [
        "Sì",
        "No"
      ],
      "flag": {
        "minLevel": 4,
        "answers": [
          "No"
        ]
      }
    },
    "sizeNote": null
  },
  {
    "id": "SOS-3",
    "area": "SOS",
    "theme": "Richieste di clienti, banche e filiera",
    "text": "Come rispondete alle richieste di informazioni sulla sostenibilità da parte di clienti, banche o filiera?",
    "levels": [
      "Quando arrivano, ci trovano impreparati.",
      "Rispondiamo caso per caso, raccogliendo i dati al momento.",
      "I dati e i documenti principali sono raccolti e aggiornati, pronti per le richieste.",
      "Abbiamo un profilo di sostenibilità strutturato e verificato, che usiamo anche come vantaggio commerciale e nel rapporto con le banche."
    ],
    "check": {
      "text": "Negli ultimi 12 mesi avete ricevuto richieste di informazioni sulla sostenibilità da clienti o banche?",
      "options": [
        "Sì",
        "No"
      ],
      "flag": null
    },
    "sizeNote": null
  }
];

export const OBJECTIVES: Choice[] = [
  {
    "code": "OB-01",
    "label": "Crescere nei mercati attuali",
    "primary": "MKT",
    "secondary": [
      "STR"
    ]
  },
  {
    "code": "OB-02",
    "label": "Entrare in nuovi mercati o all'estero",
    "primary": "STR",
    "secondary": [
      "MKT",
      "FIN"
    ]
  },
  {
    "code": "OB-03",
    "label": "Lanciare nuovi prodotti o servizi",
    "primary": "INN",
    "secondary": [
      "MKT"
    ]
  },
  {
    "code": "OB-04",
    "label": "Migliorare la marginalità",
    "primary": "FIN",
    "secondary": [
      "OPS",
      "MKT"
    ]
  },
  {
    "code": "OB-05",
    "label": "Rafforzare la struttura finanziaria e l'accesso al credito",
    "primary": "FIN",
    "secondary": [
      "STR"
    ]
  },
  {
    "code": "OB-06",
    "label": "Strutturare l'organizzazione e delegare",
    "primary": "PER",
    "secondary": [
      "STR"
    ]
  },
  {
    "code": "OB-07",
    "label": "Gestire il passaggio generazionale o l'ingresso di manager esterni",
    "primary": "STR",
    "secondary": [
      "PER"
    ]
  },
  {
    "code": "OB-08",
    "label": "Preparare acquisizioni, apertura del capitale o cessione",
    "primary": "STR",
    "secondary": [
      "FIN"
    ]
  },
  {
    "code": "OB-09",
    "label": "Digitalizzare processi e dati",
    "primary": "DIG",
    "secondary": [
      "OPS"
    ]
  },
  {
    "code": "OB-10",
    "label": "Rispondere ai requisiti di sostenibilità di clienti, banche e filiera",
    "primary": "SOS",
    "secondary": []
  }
];

export const ISSUES: Choice[] = [
  {
    "code": "CR-01",
    "label": "Margini in calo",
    "primary": "FIN",
    "secondary": [
      "MKT",
      "OPS"
    ]
  },
  {
    "code": "CR-02",
    "label": "Tensioni di liquidità",
    "primary": "FIN",
    "secondary": []
  },
  {
    "code": "CR-03",
    "label": "Dipendenza da pochi clienti",
    "primary": "MKT",
    "secondary": [
      "STR"
    ]
  },
  {
    "code": "CR-04",
    "label": "Difficoltà a trovare o trattenere persone",
    "primary": "PER",
    "secondary": []
  },
  {
    "code": "CR-05",
    "label": "Decisioni tutte sul titolare",
    "primary": "STR",
    "secondary": [
      "PER"
    ]
  },
  {
    "code": "CR-06",
    "label": "Numeri non disponibili in tempo o poco affidabili",
    "primary": "FIN",
    "secondary": [
      "DIG"
    ]
  },
  {
    "code": "CR-07",
    "label": "Ritardi, errori o inefficienze nei processi",
    "primary": "OPS",
    "secondary": [
      "DIG"
    ]
  },
  {
    "code": "CR-08",
    "label": "Pressione sui prezzi da parte della concorrenza",
    "primary": "MKT",
    "secondary": [
      "INN"
    ]
  },
  {
    "code": "CR-09",
    "label": "Vendite poco prevedibili",
    "primary": "MKT",
    "secondary": []
  },
  {
    "code": "CR-10",
    "label": "Aumento dei costi di energia e materie prime",
    "primary": "OPS",
    "secondary": [
      "SOS",
      "FIN"
    ]
  },
  {
    "code": "CR-11",
    "label": "Sistemi informatici inadeguati o rischi informatici",
    "primary": "DIG",
    "secondary": []
  },
  {
    "code": "CR-12",
    "label": "Prodotti o servizi poco differenziati o in declino",
    "primary": "INN",
    "secondary": [
      "MKT"
    ]
  }
];

export const PROFILE_FIELDS: ProfileField[] = [
  {
    "id": "PR-01",
    "label": "Settore di attività",
    "type": "select",
    "options": [
      "Agricoltura, allevamento e pesca",
      "Industria alimentare e delle bevande",
      "Tessile, abbigliamento e moda",
      "Legno, carta, arredo",
      "Chimica, farmaceutica, gomma e plastica",
      "Metalli e prodotti in metallo",
      "Macchinari e apparecchiature",
      "Elettronica ed elettrotecnica",
      "Mezzi di trasporto e componenti",
      "Altra manifattura",
      "Energia, acqua e rifiuti",
      "Costruzioni e impiantistica",
      "Commercio all'ingrosso",
      "Commercio al dettaglio",
      "Trasporti e logistica",
      "Alloggio e ristorazione",
      "Informatica e telecomunicazioni",
      "Servizi professionali e consulenza",
      "Altri servizi alle imprese",
      "Sanità e assistenza",
      "Altro"
    ],
    "required": true,
    "purpose": "Segmentazione del benchmark"
  },
  {
    "id": "PR-02",
    "label": "Fatturato dell'ultimo esercizio",
    "type": "select",
    "options": [
      "€2-5M",
      "€5-10M",
      "€10-25M",
      "€25-50M",
      "€50-100M",
      "Fuori da queste fasce"
    ],
    "required": true,
    "purpose": "Benchmark e adattamento dei livelli alla fascia"
  },
  {
    "id": "PR-03",
    "label": "Numero di addetti",
    "type": "select",
    "options": [
      "Meno di 10",
      "10-19",
      "20-49",
      "50-99",
      "100-249",
      "250 e oltre"
    ],
    "required": true,
    "purpose": "Benchmark (le statistiche ufficiali sono per addetti)"
  },
  {
    "id": "PR-04",
    "label": "Regione della sede principale",
    "type": "select",
    "options": [
      "Abruzzo",
      "Basilicata",
      "Calabria",
      "Campania",
      "Emilia-Romagna",
      "Friuli-Venezia Giulia",
      "Lazio",
      "Liguria",
      "Lombardia",
      "Marche",
      "Molise",
      "Piemonte",
      "Puglia",
      "Sardegna",
      "Sicilia",
      "Toscana",
      "Trentino-Alto Adige",
      "Umbria",
      "Valle d'Aosta",
      "Veneto"
    ],
    "required": true,
    "purpose": "Benchmark per macroarea"
  },
  {
    "id": "PR-05",
    "label": "Clienti prevalenti",
    "type": "select",
    "options": [
      "Imprese",
      "Consumatori",
      "Pubblica amministrazione",
      "Misto"
    ],
    "required": true,
    "purpose": "Contesto del report"
  },
  {
    "id": "PR-06",
    "label": "Quota di fatturato all'estero",
    "type": "select",
    "options": [
      "Nessuna",
      "Meno del 10%",
      "10-30%",
      "30-50%",
      "Oltre 50%"
    ],
    "required": true,
    "purpose": "Contesto del report"
  },
  {
    "id": "PR-07",
    "label": "Assetto di controllo",
    "type": "select",
    "options": [
      "Familiare con gestione familiare",
      "Familiare con manager esterni",
      "Non familiare",
      "Parte di un gruppo"
    ],
    "required": true,
    "purpose": "Contesto e lettura dell'ambito Strategia e governance"
  },
  {
    "id": "PR-08",
    "label": "Ruolo di chi compila",
    "type": "select",
    "options": [
      "Titolare o amministratore delegato",
      "Direttore generale",
      "Responsabile amministrazione e finanza",
      "Altro responsabile"
    ],
    "required": true,
    "purpose": "Lettura delle risposte e futura modalità con più compilatori"
  },
  {
    "id": "PR-09",
    "label": "Anno di fondazione",
    "type": "number",
    "options": null,
    "required": false,
    "purpose": "Contesto del report"
  },
  {
    "id": "PR-10",
    "label": "Partita IVA",
    "type": "text",
    "options": null,
    "required": false,
    "purpose": "Collegamento ai bilanci nella versione a pagamento; da trattare secondo il parere privacy"
  }
];

/** Azienda di esempio del foglio Esempio_priorita, usata nei test. */
export const EXAMPLE = {
  "levels": {
    "STR-1": 2,
    "STR-2": 1,
    "STR-3": 1,
    "FIN-1": 2,
    "FIN-2": 1,
    "FIN-3": 2,
    "MKT-1": 2,
    "MKT-2": 2,
    "MKT-3": 2,
    "PER-1": 2,
    "PER-2": 2,
    "PER-3": 1,
    "OPS-1": 3,
    "OPS-2": 3,
    "OPS-3": 2,
    "DIG-1": 2,
    "DIG-2": 1,
    "DIG-3": 2,
    "INN-1": 2,
    "INN-2": 1,
    "INN-3": 2,
    "SOS-1": 1,
    "SOS-2": 2,
    "SOS-3": 2
  },
  "importance": {
    "STR": 3,
    "FIN": 3,
    "MKT": 2,
    "PER": 3,
    "OPS": 2,
    "DIG": 2,
    "INN": 1,
    "SOS": 1
  },
  "objectives": [
    "OB-04",
    "OB-06",
    "OB-07"
  ],
  "issues": [
    "CR-02",
    "CR-05",
    "CR-06"
  ],
  "textAreas": [
    "STR",
    "FIN",
    "PER"
  ]
} as const;
