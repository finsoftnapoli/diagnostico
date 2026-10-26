// Legge visura camerale o bilancio (PDF) con Claude e restituisce i dati per precompilare il profilo.
// Il file non viene salvato: si elabora in memoria e si scarta.
import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { isHuman } from "@/lib/human";
import {
  BILANCIO_SCHEMA,
  financialsFrom,
  profileFrom,
  PROMPTS,
  VISURA_SCHEMA,
  type BilancioData,
  type DocKind,
  type VisuraData,
} from "@/lib/documents";

export const maxDuration = 60;

const MAX_BYTES = 4 * 1024 * 1024; // limite delle funzioni Vercel: circa 4,5 MB per richiesta
const MODEL = "claude-sonnet-5-5";

export async function POST(request: Request) {
  if (!process.env.ANTHROPIC_API_KEY)
    return NextResponse.json({ error: "Lettura dei documenti non ancora attiva" }, { status: 503 });

  if (!isHuman(request)) return NextResponse.json({ error: "Verifica di sicurezza scaduta: ricarica la pagina" }, { status: 403 });
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "Richiesta non valida" }, { status: 400 });
  }
  const kind = form.get("tipo") as DocKind;
  const file = form.get("file");
  if (kind !== "visura" && kind !== "bilancio") return NextResponse.json({ error: "Tipo di documento non valido" }, { status: 400 });
  if (!(file instanceof File)) return NextResponse.json({ error: "Nessun file ricevuto" }, { status: 400 });
  if (file.size > MAX_BYTES) return NextResponse.json({ error: "Il file supera i 4 MB" }, { status: 413 });
  const bytes = Buffer.from(await file.arrayBuffer());
  if (bytes.subarray(0, 5).toString() !== "%PDF-") return NextResponse.json({ error: "Il file deve essere un PDF" }, { status: 415 });

  try {
    const client = new Anthropic();
    const msg = await client.messages.create({
      model: MODEL,
      max_tokens: 2000,
      output_config: {
        effort: "low",
        format: { type: "json_schema", schema: kind === "visura" ? VISURA_SCHEMA : BILANCIO_SCHEMA },
      },
      messages: [
        {
          role: "user",
          content: [
            { type: "document", source: { type: "base64", media_type: "application/pdf", data: bytes.toString("base64") } },
            { type: "text", text: PROMPTS[kind] },
          ],
        },
      ],
    } as Anthropic.MessageCreateParamsNonStreaming);
    if (msg.stop_reason === "refusal" || msg.stop_reason === "max_tokens") throw new Error(`stop_reason ${msg.stop_reason}`);
    const text = msg.content.find((b) => b.type === "text");
    if (!text || text.type !== "text") throw new Error("risposta senza testo");
    const data = JSON.parse(text.text) as VisuraData | BilancioData;
    const profile = profileFrom(kind, data);
    const financials = kind === "bilancio" ? financialsFrom(data as BilancioData) : undefined;
    const found = Object.keys(profile).length + (financials ? Object.values(financials).filter((v) => v !== null).length : 0);
    if (!found) return NextResponse.json({ error: "Non siamo riusciti a leggere dati utili: il documento è una scansione?" }, { status: 422 });
    return NextResponse.json({ kind, profile, financials });
  } catch (err) {
    console.error("Lettura documento non riuscita:", err instanceof Error ? err.message : err);
    return NextResponse.json({ error: "Non siamo riusciti a leggere il documento. Riprova o compila i campi a mano." }, { status: 502 });
  }
}
