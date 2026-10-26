// Salvataggio della bozza nel browser. Nella fase 1 completa la bozza andrà anche nel database;
// il browser resta come copia di sicurezza se la connessione cade.
import { QUESTIONNAIRE_VERSION } from "./questionnaire";
import { emptyResponses } from "./scoring";
import type { Responses } from "./types";

const KEY = "diagnostico.bozza";

export interface Draft {
  version: string;
  step: number;
  responses: Responses;
  updatedAt: string;
  completedAt?: string;
}

export function loadDraft(): Draft | null {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return null;
    const d = JSON.parse(raw) as Draft;
    if (d.version !== QUESTIONNAIRE_VERSION) return null;
    // completa eventuali campi aggiunti dopo il salvataggio
    d.responses = { ...emptyResponses(), ...d.responses };
    return d;
  } catch {
    return null;
  }
}

export function saveDraft(d: Omit<Draft, "version" | "updatedAt">): void {
  try {
    const full: Draft = { ...d, version: QUESTIONNAIRE_VERSION, updatedAt: new Date().toISOString() };
    window.localStorage.setItem(KEY, JSON.stringify(full));
  } catch {
    // archiviazione non disponibile (navigazione privata): si prosegue senza bozza
  }
}

export function clearDraft(): void {
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    /* niente da fare */
  }
}
