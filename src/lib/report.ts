// Report approfondito elaborato dall'AI: struttura dei contenuti e schema per l'output strutturato.
// Il testo è scritto dall'AI a partire SOLO dai dati già calcolati dal motore e dalle risposte dell'utente;
// nessun numero viene inventato (i punteggi restano quelli deterministici del diagnostico).
import type { AreaCode } from "./types";

export interface PriorityAnalysis {
  area: AreaCode;
  title: string;
  diagnosis: string; // perché è prioritario e cosa comporta per l'azienda
  actions: string[]; // 2-4 azioni concrete
}

export interface ReportNarrative {
  executiveSummary: string; // 2-3 paragrafi
  crossCutting: string; // osservazioni trasversali: equilibrio, legami tra ambiti, ambizioni vs stato
  priorities: PriorityAnalysis[];
  quickWins: string[]; // interventi rapidi a basso costo
  closing: string; // prossimo passo suggerito
}

const AREA_ENUM = ["STR", "FIN", "MKT", "PER", "OPS", "DIG", "INN", "SOS"];

export const NARRATIVE_SCHEMA = {
  type: "object",
  properties: {
    executiveSummary: { type: "string" },
    crossCutting: { type: "string" },
    priorities: {
      type: "array",
      items: {
        type: "object",
        properties: {
          area: { type: "string", enum: AREA_ENUM },
          title: { type: "string" },
          diagnosis: { type: "string" },
          actions: { type: "array", items: { type: "string" } },
        },
        required: ["area", "title", "diagnosis", "actions"],
        additionalProperties: false,
      },
    },
    quickWins: { type: "array", items: { type: "string" } },
    closing: { type: "string" },
  },
  required: ["executiveSummary", "crossCutting", "priorities", "quickWins", "closing"],
  additionalProperties: false,
} as const;
