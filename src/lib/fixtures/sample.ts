// Dati di prova realistici per i controlli di qualità degli output cliente (test e anteprime locali).
// Non usati dal sito in produzione.
import type { ModuleNarrative } from "../module-report";
import type { ModuleResponses } from "../module-scoring";
import { MODULE_QUESTIONS, MODULE_SUBAREAS } from "../modules";
import { QUESTIONS } from "../questionnaire";
import type { ReportNarrative } from "../report";
import { emptyResponses } from "../scoring";
import type { Responses } from "../types";

/** Una micro-impresa di servizi informatici con pratiche perlopiù informali e un bilancio solido. */
export function sampleResponses(): Responses {
  const r = emptyResponses();
  const pattern = [1, 1, 3, 1, 1, 1, 2, 1, 2, 1, 2, 2, 2, 1, 1, 2, 1, 1, 2, 1, 2, 1, 2, 1];
  QUESTIONS.forEach((q, i) => {
    r.levels[q.id] = pattern[i % pattern.length];
    if (q.check) r.checks[q.id] = q.check.options[q.check.options.length - 1];
  });
  r.profile = {
    "PR-10": "05884190637",
    "PR-11": "FINSOFT S.R.L.",
    "PR-01": "Informatica e telecomunicazioni",
    "PR-02": "Meno di €1M",
    "PR-03": "Meno di 10",
    "PR-04": "Campania",
    "PR-07": "Controllo familiare, gestione familiare",
  };
  r.objectives = ["OB-03", "OB-02", "OB-09"];
  r.objectivesText =
    "Vogliamo lanciare una suite di servizi per le piccole e medie imprese basati su agenti AI, per dare accesso a metodologie avanzate di gestione a chi non può permettersi una consulenza specialistica.";
  r.issues = ["CR-09", "CR-12", "CR-05"];
  r.issuesText = "La gestione è più reattiva che preventiva: è il cliente che ci cerca, non abbiamo processi commerciali strutturati.";
  r.financials = {
    year: 2025,
    employees: null,
    ricavi: 75530,
    valore_produzione: 76340,
    ebitda: 38388,
    ebit: 37641,
    utile_netto: 27594,
    costo_personale: null,
    patrimonio_netto: 607412,
    totale_attivo: 647852,
    debiti_finanziari: null,
    disponibilita_liquide: 76148,
    crediti_commerciali: null,
    debiti_fornitori: null,
    rimanenze: 452752,
  };
  r.governance = { organo: "amministratore unico", amministratori: 1, organoControllo: false, soci: 2, quotaSocioPrincipale: 80 };
  return r;
}

export const sampleNarrative: ReportNarrative = {
  executiveSummary:
    "FINSOFT è una micro-impresa informatica a controllo familiare che oggi lavora con pratiche gestionali perlopiù informali. Su 24 temi, 13 sono ancora al livello «Informale», 10 al livello «Base» e uno solo, governance e continuità, è strutturato: le decisioni poggiano sull'esperienza del titolare più che su obiettivi, regole e strumenti condivisi.\n\nIl profilo è abbastanza omogeneo, con un'eccezione marcata: in Finanza e controllo budget, previsione di cassa e controllo dei margini sono ancora tutti informali. Il bilancio 2025 mostra invece una buona marginalità operativa, con un EBITDA vicino alla metà dei ricavi, e un patrimonio che copre quasi tutto l'attivo: una base economica solida su cui costruire.\n\nLe vostre ambizioni, lanciare una suite di servizi basati su agenti AI e aprirvi a nuovi mercati, richiedono capacità che oggi sono ancora da costruire: un processo commerciale ordinato, un metodo per sviluppare i nuovi servizi e una direzione scritta che non dipenda solo dal titolare.",
  crossCutting:
    "Il filo comune è la dipendenza dal titolare: direzione strategica, decisioni e delega, struttura e ruoli sono tutti al primo livello. In un'azienda con meno di dieci persone è naturale, ma oggi limita la capacità di lanciare un servizio nuovo mentre si gestisce l'attività corrente.\n\nC'è poi un effetto a catena tra commerciale e offerta: senza obiettivi di vendita e senza una proposta di valore per segmento, è il cliente a cercarvi e il prezzo diventa la leva principale. Infine, senza budget e previsione di cassa è difficile decidere quanto investire nella suite e verificarne i risultati.",
  priorities: [
    {
      area: "MKT",
      title: "Dare struttura al processo commerciale e al posizionamento",
      diagnosis:
        "È la priorità più legata a ciò che volete fare. Oggi le vendite dipendono dal titolare e da pochi contatti, senza obiettivi né registrazione delle opportunità, e dei clienti si conoscono solo i principali. Questo spiega perché le vendite sono poco prevedibili. Lanciare una suite di servizi e aprirsi a nuovi mercati richiede di sapere a chi vendere, con quale proposta e con quale flusso di opportunità.",
      actions: [
        "Fissare un obiettivo di fatturato trimestrale, titolare incluso, e verificarlo ogni mese.",
        "Tenere un elenco unico delle opportunità aperte, con cliente, servizio, stato e prossimo contatto, da rivedere ogni settimana.",
        "Definire 2-3 segmenti prioritari di PMI e scrivere per ciascuno una proposta di valore in poche righe.",
      ],
    },
    {
      area: "INN",
      title: "Trasformare l'idea della suite in un percorso di sviluppo con criteri",
      diagnosis:
        "Le idee si raccolgono in modo informale e i progetti partono senza criteri di selezione; non ci sono collaborazioni esterne. Per un obiettivo ambizioso come la suite serve un metodo semplice: poche fasi, criteri di passaggio scritti e qualche cliente pilota con cui verificare l'interesse prima di investire in modo diffuso.",
      actions: [
        "Definire tre fasi per ogni nuovo servizio (idea, prova con 2-3 clienti pilota, lancio) con criteri di passaggio scritti.",
        "Destinare un budget annuo esplicito allo sviluppo della suite.",
        "Scegliere un solo servizio da portare per primo alla fase pilota.",
      ],
    },
    {
      area: "STR",
      title: "Scrivere la direzione e delegare con confini chiari",
      diagnosis:
        "Non ci sono obiettivi espliciti oltre l'andamento dell'anno e quasi tutte le decisioni, anche operative, passano dal titolare. Il titolare ha già una visione, ma non è scritta né tradotta in obiettivi. Con una suite da lanciare e nuovi mercati da esplorare, liberare il suo tempo dalle decisioni ricorrenti è la condizione per tutto il resto.",
      actions: [
        "Scrivere in una o due pagine la visione a tre anni e tradurla in 3-4 obiettivi annuali.",
        "Elencare le decisioni operative ricorrenti che possono essere prese senza il titolare, con limiti chiari.",
        "Introdurre una breve riunione settimanale con le persone chiave per allineare priorità e decisioni delegate.",
      ],
    },
  ],
  quickWins: [
    "Creare un foglio condiviso delle opportunità commerciali e rivederlo ogni settimana per quindici minuti.",
    "Scrivere in una pagina la visione a tre anni e gli obiettivi dell'anno e condividerla con chi collabora con voi.",
    "Proporre il primo servizio della suite a 2-3 clienti già noti, come pilota, raccogliendo per iscritto commenti e disponibilità a pagare.",
  ],
  closing:
    "Il prossimo passo che vi suggeriamo è scegliere tre azioni da avviare nei prossimi novanta giorni: il registro delle opportunità, la visione scritta e un primo budget con la previsione di cassa. Un confronto con un nostro esperto può aiutarvi a ordinare gli interventi e ad adattarli alla vostra realtà, partendo dal progetto della suite.",
};

export function sampleModuleResponses(): ModuleResponses {
  const levels: Record<string, number> = {};
  const checks: Record<string, string> = {};
  MODULE_QUESTIONS.FIN.forEach((q, i) => {
    levels[q.id] = [2, 1, 1, 1, 2, 1, 1, 1, 1, 1, 2, 1, 1, 1, 3, 1, 2, 1][i % 18];
    if (q.check) checks[q.id] = q.check.options[0];
  });
  return { levels, checks, notes: "Stiamo valutando un finanziamento per lo sviluppo della suite." };
}

export const sampleModuleNarrative: ModuleNarrative = {
  summary:
    "In Finanza e controllo l'azienda lavora oggi con pratiche quasi tutte informali: si guarda il saldo dei conti, il bilancio arriva a fine anno e i margini si conoscono solo nel complesso. Fa eccezione la valutazione degli investimenti, dove esiste già un primo metodo.\n\nIl bilancio è solido e la redditività buona: il punto non è la salute economica, ma la capacità di decidere con i numeri, che diventa essenziale per sostenere lo sviluppo della suite e un eventuale finanziamento.",
  themes: MODULE_SUBAREAS.FIN.map((sa) => ({
    theme: sa.name,
    diagnosis: `Oggi in ${sa.name.toLowerCase()} le pratiche sono affidate all'esperienza del titolare: si interviene quando emerge un problema, senza strumenti o momenti fissi di verifica. Il passo successivo è introdurre poche regole scritte e un appuntamento periodico.`,
    actions: [
      `Definire chi si occupa di ${sa.short.toLowerCase()} e con quale cadenza.`,
      "Scrivere in una pagina le regole essenziali e condividerle.",
    ],
  })),
  roadmap: [
    {
      horizon: "Primi 3 mesi",
      actions: [
        "Preparare un budget annuale semplice di ricavi e costi.",
        "Impostare una previsione di cassa a sei mesi, aggiornata ogni mese.",
      ],
    },
    {
      horizon: "Da 3 a 6 mesi",
      actions: [
        "Introdurre una situazione trimestrale con il confronto tra budget e consuntivo.",
        "Calcolare il margine dei servizi principali.",
      ],
    },
    {
      horizon: "Da 6 a 12 mesi",
      actions: ["Preparare un piano economico-finanziario a tre anni per la suite.", "Presentare il piano alle banche di riferimento."],
    },
  ],
  kpis: [
    "Ricavi rispetto al budget, ogni mese",
    "Cassa prevista a 3 e 6 mesi",
    "Margine per servizio, ogni trimestre",
    "Giorni medi di incasso",
  ],
  closing:
    "Vi suggeriamo di partire da budget e previsione di cassa: sono la base per decidere quanto investire nella suite. Un confronto con un nostro esperto può aiutarvi a impostarli in modo semplice e adatto alla vostra dimensione.",
};
