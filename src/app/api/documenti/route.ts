// Legge visura camerale o bilancio (PDF già caricato nell'archivio) con Claude e restituisce i dati
// per precompilare il profilo. Il file resta nell'archivio privato; nel database solo dati dell'azienda.
import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import {
  BILANCIO_SCHEMA,
  financialsFrom,
  governanceFrom,
  peopleFrom,
  profileFrom,
  PROMPTS,
  VISURA_SCHEMA,
  type BilancioData,
  type DocKind,
  type VisuraData,
} from "@/lib/documents";
import { isHuman } from "@/lib/human";
import { supabaseService } from "@/lib/supabase/server";

export const maxDuration = 60;
const MODEL = "claude-sonnet-5-5";

export async function POST(request: Request) {
  if (!process.env.ANTHROPIC_API_KEY)
    return NextResponse.json({ error: "Lettura dei documenti non ancora attiva" }, { status: 503 });
  if (!isHuman(request)) return NextResponse.json({ error: "Verifica di sicurezza scaduta: ricarica la pagina" }, { status: 403 });

  const { tipo, path } = (await request.json().catch(() => ({}))) as { tipo?: DocKind; path?: string };
  if (tipo !== "visura" && tipo !== "bilancio") return NextResponse.json({ error: "Tipo di documento non valido" }, { status: 400 });
  if (!path || !/^in-attesa\/\d{4}-\d{2}-\d{2}\/[0-9a-f-]{36}-(visura|bilancio)\.pdf$/.test(path))
    return NextResponse.json({ error: "Documento non valido" }, { status: 400 });

  const db = supabaseService();
  const { data: blob, error: dlError } = await db.storage.from("documenti").download(path);
  if (dlError || !blob) return NextResponse.json({ error: "Documento non trovato, ricaricalo" }, { status: 404 });
  const bytes = Buffer.from(await blob.arrayBuffer());
  if (bytes.subarray(0, 5).toString() !== "%PDF-") {
    await db.storage.from("documenti").remove([path]);
    return NextResponse.json({ error: "Il file deve essere un PDF" }, { status: 415 });
  }

  try {
    const client = new Anthropic();
    const msg = await client.messages.create({
      model: MODEL,
      max_tokens: 3000,
      output_config: {
        effort: "low",
        format: { type: "json_schema", schema: tipo === "visura" ? VISURA_SCHEMA : BILANCIO_SCHEMA },
      },
      messages: [
        {
          role: "user",
          content: [
            { type: "document", source: { type: "base64", media_type: "application/pdf", data: bytes.toString("base64") } },
            { type: "text", text: PROMPTS[tipo] },
          ],
        },
      ],
    } as Anthropic.MessageCreateParamsNonStreaming);
    if (msg.stop_reason === "refusal" || msg.stop_reason === "max_tokens") throw new Error(`stop_reason ${msg.stop_reason}`);
    const text = msg.content.find((b) => b.type === "text");
    if (!text || text.type !== "text") throw new Error("risposta senza testo");
    const data = JSON.parse(text.text) as VisuraData | BilancioData;

    const profile = profileFrom(tipo, data);
    const financials = tipo === "bilancio" ? financialsFrom(data as BilancioData) : undefined;
    const governance = tipo === "visura" ? governanceFrom(data as VisuraData) : undefined;
    const people = tipo === "visura" ? peopleFrom(data as VisuraData) : undefined;
    const found = Object.keys(profile).length + (financials ? Object.values(financials).filter((v) => v !== null).length : 0);
    if (!found) return NextResponse.json({ error: "Non siamo riusciti a leggere dati utili: il documento è una scansione?" }, { status: 422 });

    // nel database: solo dati dell'azienda, mai i nomi delle persone
    const { data: doc, error } = await db
      .from("documents")
      .insert({ kind: tipo, storage_path: path, size_bytes: bytes.length, extracted: { profile, financials, governance } })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return NextResponse.json({ documentId: doc.id, kind: tipo, profile, financials, governance, people });
  } catch (err) {
    console.error("Lettura documento non riuscita:", err instanceof Error ? err.message : err);
    return NextResponse.json({ error: "Non siamo riusciti a leggere il documento. Riprova o compila i campi a mano." }, { status: 502 });
  }
}
