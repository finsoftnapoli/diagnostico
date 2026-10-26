// Unico punto in cui si definiscono nome e dati del servizio.
// Quando il nome sarà deciso basta cambiare questi valori.
export const BRAND = {
  name: "Diagnostico d'impresa", // nome provvisorio
  /** Nome del report e del grafico a radar: segno distintivo del servizio. */
  reportName: "Ottogramma",
  tagline: "Il profilo di gestione della tua azienda, con un report approfondito dai nostri analisti",
  owner: "Finsoft",
  ownerLegal: "Finsoft S.r.l.",
  ownerAddress: "[sede legale da completare]",
  ownerVat: "[partita IVA da completare]",
  ownerPec: "[PEC da completare]",
  contactEmail: "info@finsoft.biz", // provvisorio: poi la casella del dominio del servizio
  questionnaireVersion: "0.4",
  /** Versione dell'informativa: registrata con ogni consenso. Cambiarla a ogni modifica sostanziale. */
  privacyVersion: "bozza-2026-10-26",
  /** Versione delle condizioni di vendita: registrata con ogni ordine. */
  termsVersion: "bozza-2026-10-26",
} as const;
