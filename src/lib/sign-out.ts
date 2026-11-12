"use client";
// Uscita dall'area personale: chiude la sessione e, se la bozza nel browser è già salvata nel database,
// la rimuove (su un computer condiviso non restano le risposte dell'azienda).
import { clearDraft, loadDraft } from "./draft";
import { supabaseBrowser } from "./supabase/browser";

export async function signOut() {
  await supabaseBrowser().auth.signOut();
  if (loadDraft()?.savedId) clearDraft();
}
