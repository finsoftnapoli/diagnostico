export type AreaCode = "STR" | "FIN" | "MKT" | "PER" | "OPS" | "DIG" | "INN" | "SOS";

export interface Area {
  code: AreaCode;
  name: string;
  description: string;
}

export interface Question {
  id: string;
  area: AreaCode;
  theme: string;
  text: string;
  /** Descrizioni dei 4 livelli, dal più basso al più alto. */
  levels: [string, string, string, string] | string[];
  check: {
    text: string;
    options: string[];
    /** Regola di "possibile sovrastima": livello >= minLevel e risposta tra answers. */
    flag: { minLevel: number; answers: string[] } | null;
  };
  sizeNote: string | null;
}

/** Obiettivo o criticità, con ambito principale e ambiti secondari. */
export interface Choice {
  code: string;
  label: string;
  primary: AreaCode;
  secondary: AreaCode[];
}

export interface ProfileField {
  id: string;
  label: string;
  type: "select" | "number" | "text";
  options: string[] | null;
  required: boolean;
  purpose: string;
}

/** Tutto ciò che un compilatore inserisce. */
export interface Responses {
  profile: Record<string, string>;
  objectives: string[]; // fino a 3 codici, in ordine di importanza
  objectivesText: string;
  issues: string[]; // fino a 3 codici, in ordine di importanza
  issuesText: string;
  /** Ambiti a cui l'utente collega i testi liberi (proposti dall'AI dalla fase 2, confermati dall'utente). */
  objectivesTextAreas: AreaCode[];
  issuesTextAreas: AreaCode[];
  /** Unione dei due elenchi precedenti: è quella usata dal motore. */
  textAreas: AreaCode[];
  levels: Record<string, number>; // id domanda -> livello 1-4
  checks: Record<string, string>; // id domanda -> risposta di controllo
  importance: Partial<Record<AreaCode, number>>; // 1-3
  consents: { service: boolean; benchmark: boolean; marketing: boolean };
}
