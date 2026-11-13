// Generato da scripts/genera_domande.py (banca delle domande v0.5). Non modificare a mano:
// cambiare scripts/content.py e rigenerare.
import type { Area, Question, Choice, ProfileField } from "./types";

export const QUESTIONNAIRE_VERSION = "0.5";

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
    "description": "Consapevolezza e gestione degli impatti ambientali e sociali, anche rispetto alle richieste di clienti, banche e filiera"
  }
];

export const QUESTIONS: Question[] = [
  {
    "id": "STR-1",
    "area": "STR",
    "theme": "Direzione strategica",
    "text": "Come definite oggi gli obiettivi dell'azienda per i prossimi anni?",
    "levels": [
      "Non ci sono obiettivi espliciti oltre l'andamento dell'anno: le scelte si fanno quando si presentano.",
      "Chi guida l'azienda ha in mente dove vuole arrivare, ma non è scritto né tradotto in obiettivi per i responsabili.",
      "Esiste un piano pluriennale scritto, con pochi obiettivi misurabili condivisi con i responsabili.",
      "Il piano si rivede almeno una volta l'anno e i progressi sugli obiettivi si verificano con regolarità insieme ai responsabili."
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
    "text": "Come si prendono oggi le decisioni in azienda?",
    "levels": [
      "Quasi tutte le decisioni, anche operative, passano da chi guida l'azienda.",
      "Alcune decisioni operative sono delegate, ma i confini non sono chiari e spesso si torna da chi guida l'azienda.",
      "Ogni area ha un responsabile con un'autonomia definita; chi guida l'azienda interviene solo sulle decisioni rilevanti.",
      "Le deleghe hanno limiti scritti, anche di spesa, e i responsabili decidono insieme in riunioni regolari di cui resta traccia."
    ],
    "check": {
      "text": "Se chi guida l'azienda si assentasse per un mese, l'attività ordinaria proseguirebbe senza interruzioni?",
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
    "sizeNote": "€2-10M: il livello 4 può essere una riunione settimanale di chi guida l'azienda con 2-3 responsabili, senza comitato formale"
  },
  {
    "id": "STR-3",
    "area": "STR",
    "theme": "Continuità dell'impresa",
    "text": "Come è preparata oggi l'azienda a un cambio di chi la guida o di una persona chiave?",
    "levels": [
      "Il tema non è stato ancora affrontato.",
      "Se ne è parlato tra i soci, senza decisioni né documenti.",
      "Per i ruoli chiave è stabilito chi subentra, e le regole tra i soci sono scritte.",
      "La successione ha tempi e tappe definiti, le regole tra i soci si aggiornano e c'è una voce esterna indipendente (un consigliere o un comitato consultivo)."
    ],
    "check": {
      "text": "Esistono regole scritte tra i soci (patto parasociale, statuto con clausole specifiche o accordo di famiglia)?",
      "options": [
        "Sì",
        "No",
        "C'è un solo socio"
      ],
      "flag": {
        "minLevel": 3,
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
    "text": "Come pianificate oggi i risultati economici dell'anno?",
    "levels": [
      "Non c'è un budget: si guarda il bilancio a fine anno.",
      "C'è un budget annuale di massima su fatturato e costi, raramente confrontato con i consuntivi.",
      "Il budget annuale è approvato e confrontato almeno ogni trimestre con i consuntivi, analizzando gli scostamenti.",
      "Il budget discende dal piano pluriennale e le previsioni si aggiornano durante l'anno, anche con scenari alternativi."
    ],
    "check": {
      "text": "Ogni quanto disponete di una situazione economica infrannuale affidabile?",
      "options": [
        "Solo a fine anno",
        "Ogni sei mesi",
        "Ogni trimestre",
        "Ogni mese"
      ],
      "flag": {
        "minLevel": 3,
        "answers": [
          "Solo a fine anno",
          "Ogni sei mesi"
        ]
      }
    },
    "sizeNote": "€2-10M: un confronto trimestrale è sufficiente per il livello 3"
  },
  {
    "id": "FIN-2",
    "area": "FIN",
    "theme": "Gestione della liquidità",
    "text": "Come prevedete e gestite oggi la liquidità?",
    "levels": [
      "Non c'è una previsione: la liquidità si gestisce quando emerge il bisogno.",
      "Si fanno previsioni occasionali, soprattutto prima di pagamenti importanti.",
      "C'è una previsione periodica, almeno mensile e a 3-6 mesi, con un responsabile.",
      "La previsione si aggiorna ogni settimana, si confronta con quanto è accaduto e si usa per decidere e nel rapporto con le banche."
    ],
    "check": {
      "text": "Conoscete oggi il fabbisogno di cassa delle prossime 13 settimane?",
      "options": [
        "Sì, con i numeri",
        "A grandi linee",
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
    "text": "Come misurate oggi i margini dell'azienda?",
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
    "text": "Come conoscete oggi i vostri clienti e ciò che vi distingue dalla concorrenza?",
    "levels": [
      "I clienti arrivano soprattutto per conoscenza o passaparola; non abbiamo definito a chi rivolgerci né perché sceglierci.",
      "Si conoscono i clienti principali e i loro motivi d'acquisto, senza analisi strutturate.",
      "Abbiamo definito i gruppi di clienti prioritari e che cosa offriamo di distintivo a ciascuno; la concorrenza si analizza periodicamente.",
      "I clienti sono segmentati per valore e potenziale, l'offerta è differenziata e si raccolgono regolarmente i loro giudizi."
    ],
    "check": {
      "text": "Quanto pesano i primi 5 clienti sul fatturato?",
      "options": [
        "Meno del 20%",
        "20-39%",
        "40-59%",
        "60% o più",
        "Non lo sappiamo"
      ],
      "flag": null
    },
    "sizeNote": null
  },
  {
    "id": "MKT-2",
    "area": "MKT",
    "theme": "Processo commerciale",
    "text": "Come è organizzata oggi l'attività commerciale?",
    "levels": [
      "Le vendite passano da chi guida l'azienda o da pochi venditori; trattative e contatti non sono registrati.",
      "Ci sono obiettivi di fatturato per venditore; le opportunità sono seguite su agende o fogli personali.",
      "Le opportunità sono registrate in uno strumento condiviso (CRM), ci sono obiettivi per venditore e riunioni commerciali regolari.",
      "Le trattative sono gestite per fasi e se ne ricavano previsioni di vendita e tassi di successo; gli incentivi sono legati agli obiettivi."
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
    "text": "Come si decidono oggi i prezzi?",
    "levels": [
      "I prezzi si decidono caso per caso, senza una regola scritta.",
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
    "text": "Come sono definiti oggi ruoli e responsabilità?",
    "levels": [
      "I ruoli non sono scritti: ciascuno fa ciò che serve al momento.",
      "Esiste un organigramma, ma non è aggiornato e le responsabilità si sovrappongono.",
      "L'organigramma è aggiornato, i ruoli chiave hanno mansioni scritte e responsabilità chiare.",
      "La struttura si rivede quando cambia la strategia, i ruoli hanno obiettivi misurabili e per ogni ruolo chiave c'è un sostituto."
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
    "text": "Come trovate e fate crescere oggi le persone?",
    "levels": [
      "Si assume quando serve, tramite conoscenze; la formazione è solo quella obbligatoria.",
      "Si usano annunci o agenzie; la formazione è occasionale, su richiesta.",
      "I fabbisogni di personale sono pianificati, selezione e inserimento seguono un processo definito, c'è un piano di formazione annuale.",
      "Le competenze che serviranno sono pianificate a partire dal piano aziendale, ci sono percorsi di crescita e si misurano uscite e clima."
    ],
    "check": {
      "text": "Qual è stato il turnover volontario nell'ultimo anno?",
      "options": [
        "Meno del 5%",
        "5-9%",
        "10-19%",
        "20% o più",
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
    "text": "Come si definiscono oggi gli obiettivi delle persone e come se ne valutano i risultati?",
    "levels": [
      "Non ci sono obiettivi individuali né valutazioni.",
      "La valutazione è informale, fatta da chi guida l'azienda; i premi sono discrezionali.",
      "I responsabili hanno obiettivi annuali e un colloquio di valutazione; alcuni ruoli hanno una parte variabile.",
      "Gli obiettivi discendono dal piano, i colloqui sono regolari, la parte variabile è trasparente e la valutazione guida crescita e successione."
    ],
    "check": {
      "text": "Quale quota dei dipendenti ha un colloquio di valutazione almeno annuale?",
      "options": [
        "Nessuno",
        "Meno della metà",
        "Metà o più, non tutti",
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
    "theme": "Pianificazione del lavoro",
    "text": "Come pianificate oggi la produzione o l'erogazione dei servizi?",
    "levels": [
      "Si lavora sulle urgenze: carichi di lavoro e, dove ci sono, scorte si gestiscono a vista.",
      "C'è una pianificazione di breve periodo su fogli di calcolo; carichi e scorte si rivedono quando nascono problemi.",
      "Una pianificazione regolare collega le vendite previste alla capacità disponibile (persone, impianti) e agli acquisti.",
      "Vendite, produzione o erogazione e amministrazione si allineano ogni mese sui volumi previsti; puntualità e uso della capacità si misurano."
    ],
    "check": {
      "text": "Che quota degli ordini viene consegnata nei tempi promessi?",
      "options": [
        "Meno del 70%",
        "70-84%",
        "85-94%",
        "95% o più",
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
    "text": "Come gestite oggi processi e qualità?",
    "levels": [
      "I processi non sono documentati; i problemi si risolvono quando emergono.",
      "Alcune procedure sono scritte; i problemi di qualità si gestiscono caso per caso.",
      "I processi principali sono documentati, ci sono indicatori di qualità ed efficienza e si analizzano le cause dei problemi ricorrenti.",
      "Il miglioramento continuo è strutturato, con obiettivi, progetti e revisioni periodiche, e coinvolge il personale."
    ],
    "check": {
      "text": "Misurate con regolarità almeno un indicatore di qualità (reclami, scarti, rilavorazioni, errori)?",
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
    "id": "OPS-3",
    "area": "OPS",
    "theme": "Acquisti e fornitori",
    "text": "Come gestite oggi acquisti e fornitori?",
    "levels": [
      "Si acquista quando serve, dai fornitori abituali, senza confronti.",
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
    "text": "Come sono organizzati oggi i vostri sistemi informatici?",
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
    "text": "Come usate oggi i dati per gestire l'azienda?",
    "levels": [
      "I numeri si chiedono al commercialista o si estraggono a mano quando servono.",
      "Ci sono report periodici preparati a mano, spesso in ritardo o non coerenti tra loro.",
      "Un cruscotto con gli indicatori chiave è aggiornato con regolarità e usato nelle riunioni di direzione.",
      "I dati sono affidabili e tempestivi in tutte le aree e si usano anche per prevedere, con strumenti di analisi o intelligenza artificiale dove utile."
    ],
    "check": {
      "text": "Entro quanti giorni dalla fine del mese avete i dati principali?",
      "options": [
        "Più di 30",
        "16-30",
        "5-15",
        "Meno di 5"
      ],
      "flag": {
        "minLevel": 3,
        "answers": [
          "Più di 30"
        ]
      }
    },
    "sizeNote": null
  },
  {
    "id": "DIG-3",
    "area": "DIG",
    "theme": "Sicurezza informatica",
    "text": "Come proteggete oggi dati e sistemi?",
    "levels": [
      "Nessuna misura specifica oltre l'antivirus.",
      "Backup e password sono gestiti, ma non in modo sistematico.",
      "I backup sono regolari e verificati, gli accessi controllati e il personale ha una formazione di base.",
      "C'è un responsabile della sicurezza informatica, i ripristini si provano periodicamente e c'è una procedura scritta in caso di attacco."
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
    "text": "Come nascono e si sviluppano oggi nuovi prodotti o servizi?",
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
        "5-14%",
        "15-29%",
        "30% o più",
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
    "theme": "Tecnologie e intelligenza artificiale",
    "text": "Come valutate e adottate oggi nuove tecnologie, compresa l'intelligenza artificiale?",
    "levels": [
      "Le nuove tecnologie si adottano quando lo impongono clienti, fornitori o norme.",
      "Qualcuno in azienda prova nuovi strumenti di propria iniziativa, senza un indirizzo comune.",
      "Abbiamo individuato dove le nuove tecnologie possono migliorare prodotti o processi e avviato almeno un progetto con un responsabile.",
      "C'è un programma con priorità, budget e regole d'uso; i risultati si misurano e le soluzioni che funzionano si estendono."
    ],
    "check": {
      "text": "Nell'ultimo anno avete introdotto uno strumento di intelligenza artificiale in un processo di lavoro?",
      "options": [
        "Sì, in uso",
        "In prova",
        "No"
      ],
      "flag": {
        "minLevel": 3,
        "answers": [
          "No"
        ]
      }
    },
    "sizeNote": "€2-10M: per il livello 3 basta un progetto avviato, con un responsabile e un obiettivo"
  },
  {
    "id": "INN-3",
    "area": "INN",
    "theme": "Cultura della sperimentazione",
    "text": "Come vengono accolti oggi nuove idee e tentativi in azienda?",
    "levels": [
      "Le idee nuove restano a chi le ha: non c'è un momento né un modo per proporle.",
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
    "text": "Come affrontate oggi i temi di sostenibilità ambientale e sociale?",
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
    "theme": "Energia, risorse ed emissioni",
    "text": "Come misurate e gestite oggi consumi ed emissioni?",
    "levels": [
      "Consumi di energia e materiali non si misurano.",
      "I consumi energetici si conoscono dalle bollette, senza analisi.",
      "Consumi ed emissioni principali sono misurati e seguiti nel tempo; sono stati avviati interventi di efficienza.",
      "C'è un calcolo delle emissioni con obiettivi di riduzione, e i risultati si verificano ogni anno."
    ],
    "check": {
      "text": "Avete calcolato le vostre emissioni di gas serra almeno una volta?",
      "options": [
        "Sì",
        "No",
        "Non lo so"
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
    "text": "Come rispondete oggi alle richieste di informazioni sulla sostenibilità da clienti, banche o filiera?",
    "levels": [
      "Non abbiamo ancora risposto a richieste di questo tipo.",
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
  },
  {
    "code": "OB-11",
    "label": "Ridurre i costi e aumentare l'efficienza",
    "primary": "OPS",
    "secondary": [
      "FIN",
      "DIG"
    ]
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
    "label": "Decisioni tutte su chi guida l'azienda",
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
  },
  {
    "code": "CR-13",
    "label": "Clienti che pagano in ritardo",
    "primary": "FIN",
    "secondary": [
      "MKT"
    ]
  },
  {
    "code": "CR-14",
    "label": "Dipendenza da pochi fornitori",
    "primary": "OPS",
    "secondary": [
      "STR"
    ]
  },
  {
    "code": "CR-15",
    "label": "Crescita che l'organizzazione fatica a reggere",
    "primary": "PER",
    "secondary": [
      "STR",
      "OPS"
    ]
  }
];

export const PROFILE_FIELDS: ProfileField[] = [
  {
    "id": "PR-10",
    "label": "Partita IVA",
    "type": "text",
    "options": null,
    "required": true,
    "purpose": "Verifica dell'azienda e collegamento ai dati pubblici e ai bilanci"
  },
  {
    "id": "PR-11",
    "label": "Ragione sociale",
    "type": "text",
    "options": null,
    "required": true,
    "purpose": "Identificazione dell'azienda e arricchimento con dati pubblici"
  },
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
      "Meno di €1M",
      "€1-2M",
      "€2-5M",
      "€5-10M",
      "€10-25M",
      "€25-50M",
      "€50-100M",
      "€100M e oltre"
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
      "10-29%",
      "30-50%",
      "Più del 50%"
    ],
    "required": true,
    "purpose": "Contesto del report"
  },
  {
    "id": "PR-07",
    "label": "Assetto di controllo",
    "type": "select",
    "options": [
      "Controllo familiare, gestione familiare",
      "Controllo familiare, con manager esterni alla famiglia",
      "Controllo di soci non familiari (fondi, manager, soci finanziari)",
      "Controllata da un gruppo industriale o estero"
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
