// Copia di sicurezza giornaliera: i dati principali esportati in un archivio privato, tenuti per 30 giorni.
// Non sostituisce le copie del fornitore del database: è una rete di sicurezza in più.
import "server-only";
import { gzipSync } from "node:zlib";
import type { supabaseService } from "./supabase/server";

type Db = ReturnType<typeof supabaseService>;

const TABLES = [
  "companies",
  "company_members",
  "assessments",
  "answers",
  "area_scores",
  "module_assessments",
  "consents",
  "invitations",
  "documents",
  "billing_profiles",
  "orders",
  "invoices",
  "invoice_counters",
  "entitlements",
  "bookings",
  "expert_slots",
  "feedback",
  "report_events",
] as const;
const KEEP_DAYS = 30;
const PAGE = 1000;

export async function runBackup(db: Db) {
  const day = new Date().toISOString().slice(0, 10);
  const done: Record<string, number> = {};
  const failed: string[] = [];
  for (const table of TABLES) {
    const rows: unknown[] = [];
    let error: string | null = null;
    for (let from = 0; ; from += PAGE) {
      const { data, error: e } = await db
        .from(table)
        .select("*")
        .range(from, from + PAGE - 1);
      if (e) {
        error = e.message;
        break;
      }
      rows.push(...(data ?? []));
      if (!data || data.length < PAGE) break;
    }
    if (error) {
      failed.push(`${table}: ${error}`);
      continue;
    }
    const body = gzipSync(Buffer.from(JSON.stringify(rows)));
    const { error: up } = await db.storage
      .from("backup")
      .upload(`${day}/${table}.json.gz`, body, { contentType: "application/gzip", upsert: true });
    if (up) failed.push(`${table}: ${up.message}`);
    else done[table] = rows.length;
  }
  // si tengono gli ultimi 30 giorni
  const { data: folders } = await db.storage.from("backup").list("", { limit: 1000 });
  const limit = new Date(Date.now() - KEEP_DAYS * 86_400_000).toISOString().slice(0, 10);
  for (const f of folders ?? []) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(f.name) || f.name >= limit) continue;
    const { data: files } = await db.storage.from("backup").list(f.name, { limit: 100 });
    if (files?.length) await db.storage.from("backup").remove(files.map((x) => `${f.name}/${x.name}`));
  }
  return { day, tables: Object.keys(done).length, rows: Object.values(done).reduce((a, b) => a + b, 0), failed };
}

/** Giorno dell'ultima copia presente nell'archivio, se c'è. */
export async function lastBackup(db: Db): Promise<string | null> {
  const { data } = await db.storage.from("backup").list("", { limit: 1000 });
  const days = (data ?? [])
    .map((f) => f.name)
    .filter((n) => /^\d{4}-\d{2}-\d{2}$/.test(n))
    .sort();
  return days.at(-1) ?? null;
}
