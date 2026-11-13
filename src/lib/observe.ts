// Strumenti per osservare l'uso del servizio: eventi del percorso (senza identificativi), errori, riscontri.
import "server-only";
import { supabaseService } from "./supabase/server";

/** Passi del percorso che si possono registrare. */
export const FUNNEL = ["home", "avvio", "inizio", "risposta", "ambizioni", "sfide", "azienda", "anteprima", "codice", "salvato"] as const;
export type FunnelName = (typeof FUNNEL)[number];

/** La richiesta arriva dal sito stesso (stessa origine)? */
export function sameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  try {
    return new URL(origin).host === new URL(request.url).host;
  } catch {
    return false;
  }
}

export const deviceOf = (request: Request) => (/Mobi|Android|iPhone/i.test(request.headers.get("user-agent") ?? "") ? "mobile" : "desktop");

/** Registra un errore; lo stesso messaggio non si ripete entro dieci minuti. Non fallisce mai. */
export async function logError(source: "client" | "server", message: string, path?: string | null, detail?: string | null) {
  try {
    const db = supabaseService();
    const msg = message.slice(0, 1000);
    const since = new Date(Date.now() - 10 * 60_000).toISOString();
    const { count } = await db.from("error_log").select("id", { count: "exact", head: true }).eq("message", msg).gte("created_at", since);
    if (count) return;
    await db.from("error_log").insert({ source, message: msg, path: path?.slice(0, 300) ?? null, detail: detail?.slice(0, 4000) ?? null });
  } catch {
    // il registro degli errori non deve mai interrompere il lavoro
  }
}
