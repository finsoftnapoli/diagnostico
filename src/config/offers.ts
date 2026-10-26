// Offerte a pagamento presentate nel report. Prezzi IVA esclusa, da confermare.
// La vendita vera (Stripe) arriva nella fase pagamenti; per ora l'utente manifesta interesse
// e viene ricontattato. I prezzi stanno qui per cambiarli in un punto solo.

export const DEEP_DIVE = {
  /** Approfondimento di dettaglio su un singolo ambito. */
  priceEach: 149,
  /** Pacchetto con tutti gli ambiti prioritari. */
  pricePriorities: 390,
  bullets: [
    "Questionario di dettaglio sull'ambito, oltre le 3 domande del diagnostico gratuito",
    "Analisi delle pratiche rispetto alle aziende migliori della tua fascia",
    "Raccomandazioni operative con livello da raggiungere, tempi e indicatori",
  ],
} as const;

export const EXPERT = {
  /** Sessione di restituzione con un consulente. */
  price: 250,
  durationMin: 90,
  bullets: [
    "Lettura del tuo Ottogramma con un consulente esperto",
    "Validazione delle priorità e delle prime azioni, con tempi e responsabili",
    "Risposte alle tue domande sul percorso di miglioramento",
  ],
} as const;

export const euro = (v: number) => `€${v.toLocaleString("it-IT")}`;
