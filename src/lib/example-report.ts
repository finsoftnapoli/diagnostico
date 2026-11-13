// Report di esempio mostrato nel sito: un'azienda di fantasia, costruita sul profilo di esempio della pagina iniziale.
import { EXAMPLE } from "./questionnaire";
import type { ReportNarrative } from "./report";
import { emptyResponses } from "./scoring";
import type { Responses } from "./types";

export const EXAMPLE_COMPANY = "Officina Esempio S.r.l.";

export function exampleResponses(): Responses {
  const r = emptyResponses();
  r.levels = { ...EXAMPLE.levels };
  r.objectives = [...EXAMPLE.objectives];
  r.issues = [...EXAMPLE.issues];
  r.profile = {
    "PR-11": EXAMPLE_COMPANY,
    "PR-01": "Macchinari e apparecchiature",
    "PR-02": "€5-10M",
    "PR-03": "20-49",
    "PR-04": "Lombardia",
    "PR-07": "Controllo familiare, gestione familiare",
  };
  r.objectivesText =
    "Vogliamo recuperare margine sulle commesse e preparare l'ingresso della seconda generazione, senza che ogni decisione debba passare dal fondatore.";
  r.issuesText = "A fine mese non sappiamo con certezza quanta cassa avremo, e i conti arrivano quando ormai è tardi per intervenire.";
  return r;
}

export const EXAMPLE_NARRATIVE: ReportNarrative = {
  executiveSummary:
    "Officina Esempio è un'azienda familiare di macchinari che sa produrre bene: pianificazione del lavoro e qualità sono i due soli temi già strutturati, e l'ambito Operazioni è il più solido del profilo. Attorno a questo nucleo, però, la gestione poggia ancora sull'esperienza del fondatore più che su strumenti condivisi: su 24 temi, 7 sono al livello «Informale» e 15 al livello «Di base».\n\nI punti più fragili sono proprio quelli da cui dipendono le vostre ambizioni. Migliorare la marginalità richiede di sapere quanto rende ogni commessa, ma la liquidità si guarda sul saldo di banca e i numeri arrivano tardi. Delegare e preparare il passaggio generazionale richiede regole scritte su chi decide che cosa, ma oggi quasi tutte le decisioni passano da una sola persona e la continuità dell'impresa non è stata ancora affrontata.\n\nLa buona notizia è che i primi passi sono alla vostra portata e costano poco: una previsione di cassa a tredici settimane, un conto economico per commessa e un elenco delle decisioni delegabili cambiano il modo di guidare l'azienda già nei prossimi tre mesi.",
  crossCutting:
    "Il filo comune delle tre sfide che avete indicato è la stessa mancanza: numeri tempestivi e regole di delega. Senza numeri affidabili chi guida l'azienda non si fida a delegare; senza delega resta sommerso dalle decisioni operative e non trova il tempo per costruire gli strumenti. È un circolo che si rompe partendo dalla cassa e dai margini, perché danno a tutti una base comune su cui decidere.\n\nC'è poi uno squilibrio tra la fabbrica e il resto: i processi produttivi sono misurati e migliorati, mentre obiettivi delle persone, dati e reporting sono ancora informali. Portare negli uffici lo stesso metodo che già usate in produzione è la via più naturale, perché in azienda quella cultura esiste già.",
  priorities: [
    {
      area: "FIN",
      title: "Vedere in anticipo la cassa e il margine di ogni commessa",
      diagnosis:
        "È la priorità più legata sia alla marginalità che volete migliorare sia alle tensioni di liquidità che avete segnalato. Oggi esiste un budget annuale di massima e i margini si conoscono a grandi linee, ma la cassa si controlla sul saldo di banca: le tensioni si scoprono quando sono già arrivate.\n\nPer un'azienda che lavora su commessa, con acconti, stati di avanzamento e forniture da anticipare, una previsione di cassa a scorrimento e un margine calcolato per commessa sono gli strumenti che permettono di scegliere quali lavori accettare e a quale prezzo.",
      actions: [
        "Costruire una previsione di cassa a 13 settimane, con incassi e pagamenti attesi, da aggiornare ogni lunedì.",
        "Calcolare il margine a consuntivo delle ultime dieci commesse chiuse, confrontandolo con il preventivo.",
        "Chiudere i conti ogni mese entro il giorno 15 del mese successivo, anche in forma semplificata.",
        "Fissare con chi segue l'amministrazione un incontro mensile di mezz'ora su cassa, margini e scostamenti dal budget.",
      ],
    },
    {
      area: "STR",
      title: "Scrivere chi decide che cosa e avviare il tema della continuità",
      diagnosis:
        "Gli obiettivi dell'anno esistono, ma quasi tutte le decisioni, anche operative, passano da chi guida l'azienda, e non è ancora stato affrontato che cosa accadrebbe in sua assenza. Con un passaggio generazionale tra le ambizioni, è il punto da cui dipende tutto il resto: senza deleghe chiare, la nuova generazione entra senza un perimetro e il fondatore non riesce a liberare tempo.",
      actions: [
        "Elencare le decisioni ricorrenti (acquisti, sconti, assunzioni, investimenti) e indicare per ciascuna chi decide e fino a quale importo.",
        "Definire per iscritto chi sostituisce chi guida l'azienda in caso di assenza prolungata, con le procure necessarie.",
        "Concordare in famiglia tempi e tappe dell'ingresso della seconda generazione, a partire da un ruolo con responsabilità precise.",
      ],
    },
    {
      area: "PER",
      title: "Dare obiettivi alle persone chiave",
      diagnosis:
        "Ruoli e responsabilità sono definiti nelle linee principali, ma le persone non hanno obiettivi individuali e la valutazione è lasciata alla percezione di chi guida l'azienda. Delegare funziona solo se chi riceve la delega sa su che cosa verrà misurato: gli obiettivi sono il complemento naturale delle regole di decisione.",
      actions: [
        "Assegnare a ciascun responsabile di funzione tre obiettivi annuali misurabili, collegati al budget.",
        "Fare con ciascuno un colloquio di verifica a metà anno e uno a fine anno.",
        "Individuare le due o tre persone senza le quali un reparto si fermerebbe e pianificarne l'affiancamento.",
      ],
    },
  ],
  quickWins: [
    "Mettere in un solo foglio incassi e pagamenti attesi delle prossime quattro settimane e guardarlo ogni lunedì mattina.",
    "Stabilire una soglia di spesa sotto la quale i responsabili decidono senza chiedere.",
    "Scegliere cinque indicatori (ordini, fatturato, margine, cassa, puntualità delle consegne) e condividerli ogni mese con i responsabili.",
    "Fissare la data della prima riunione di famiglia sul passaggio generazionale.",
  ],
  closing:
    "Il passo che vi suggeriamo è partire dalla previsione di cassa e dall'elenco delle decisioni delegabili: sono due strumenti semplici, che si costruiscono in poche settimane e rendono subito più leggere le giornate di chi guida l'azienda. L'approfondimento su Finanza e controllo vi aiuta a ordinare gli interventi sui margini, tema per tema.",
};
