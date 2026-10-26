// Prepara il caricamento diretto di un PDF nell'archivio privato (evita il limite di dimensione delle funzioni).
import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { isHuman } from "@/lib/human";
import { supabaseService } from "@/lib/supabase/server";

const MAX_DOC_BYTES = 20 * 1024 * 1024;

export async function POST(request: Request) {
  if (!isHuman(request)) return NextResponse.json({ error: "Verifica di sicurezza scaduta: ricarica la pagina" }, { status: 403 });
  const { tipo, size } = (await request.json().catch(() => ({}))) as { tipo?: string; size?: number };
  if (tipo !== "visura" && tipo !== "bilancio") return NextResponse.json({ error: "Tipo di documento non valido" }, { status: 400 });
  if (typeof size !== "number" || size <= 0 || size > MAX_DOC_BYTES)
    return NextResponse.json({ error: "Il file deve essere un PDF fino a 20 MB" }, { status: 413 });
  const path = `in-attesa/${new Date().toISOString().slice(0, 10)}/${randomUUID()}-${tipo}.pdf`;
  const { data, error } = await supabaseService().storage.from("documenti").createSignedUploadUrl(path);
  if (error || !data) {
    console.error("Preparazione caricamento non riuscita:", error?.message);
    return NextResponse.json({ error: "Caricamento non disponibile, riprova tra poco" }, { status: 500 });
  }
  return NextResponse.json({ path: data.path, token: data.token });
}
