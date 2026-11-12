import "server-only";
import type { ReleaseVerdict } from "./release-checks";
import { supabaseService } from "./supabase/server";

type Table = "assessments" | "module_assessments";
export type ReportKind = "diagnostico" | "modulo";

/**
 * Testo del report, letto dal server: agli utenti la colonna non è accessibile dal database.
 * Chi chiama ha già verificato che l'utente possa vedere la compilazione e che il report sia rilasciato (o che sia staff).
 */
export async function readReport(table: Table, id: string) {
  const db = supabaseService();
  const { data } = await db.from(table).select("report_narrative").eq("id", id).maybeSingle();
  // colonne aggiunte con il rilascio automatico: assenti finché la migrazione non è eseguita
  const { data: extra } = await db.from(table).select("report_released_by, report_released_at, report_checks").eq("id", id).maybeSingle();
  const e = (extra ?? {}) as {
    report_released_by?: string | null;
    report_released_at?: string | null;
    report_checks?: ReleaseVerdict | null;
  };
  return {
    narrative: (data?.report_narrative ?? null) as unknown,
    releasedBy: (e.report_released_by ?? null) as "auto" | "staff" | null,
    releasedAt: e.report_released_at ?? null,
    checks: e.report_checks ?? null,
  };
}

/** Registra che il cliente ha aperto o scaricato un report rilasciato. Non blocca mai la pagina. */
export async function trackReport(kind: ReportKind, id: string, userId: string, event: "open" | "pdf") {
  try {
    await supabaseService().from("report_events").insert({ kind, ref_id: id, user_id: userId, event });
  } catch {
    /* tracciamento non disponibile */
  }
}

export interface ReportUsage {
  opens: number;
  pdfs: number;
  firstOpen: string | null;
  lastOpen: string | null;
}

/** Aperture e scarichi per report, per l'area staff. */
export async function reportUsage(kind: ReportKind, ids: string[]): Promise<Map<string, ReportUsage>> {
  const out = new Map<string, ReportUsage>();
  if (!ids.length) return out;
  const { data } = await supabaseService()
    .from("report_events")
    .select("ref_id, event, created_at")
    .eq("kind", kind)
    .in("ref_id", ids)
    .order("created_at");
  for (const e of (data ?? []) as { ref_id: string; event: string; created_at: string }[]) {
    const u = out.get(e.ref_id) ?? { opens: 0, pdfs: 0, firstOpen: null, lastOpen: null };
    if (e.event === "pdf") u.pdfs++;
    else {
      u.opens++;
      u.firstOpen ??= e.created_at;
      u.lastOpen = e.created_at;
    }
    out.set(e.ref_id, u);
  }
  return out;
}
