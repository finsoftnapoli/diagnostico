// Prepara il caricamento diretto di un documento (PDF, o XBRL per il bilancio) nell'archivio privato (evita il limite di dimensione delle funzioni).
// Durante la compilazione: visura o bilancio, con la verifica anti-bot.
// Dall'area personale: qualsiasi tipo, per un'azienda di cui l'utente fa parte.
import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { isDocKind } from "@/lib/documents";
import { isHuman } from "@/lib/human";
import { supabaseServer, supabaseService } from "@/lib/supabase/server";
import { companyOfMember } from "@/lib/supabase/membership";

const MAX_DOC_BYTES = 20 * 1024 * 1024;

export async function POST(request: Request) {
  const { tipo, size, companyId, formato } = (await request.json().catch(() => ({}))) as {
    tipo?: string;
    size?: number;
    companyId?: string;
    formato?: string;
  };
  if (!isDocKind(tipo)) return NextResponse.json({ error: "Tipo di documento non valido" }, { status: 400 });
  // il formato XBRL è previsto solo per il bilancio
  const ext = formato === "xbrl" ? "xbrl" : "pdf";
  if (ext === "xbrl" && tipo !== "bilancio")
    return NextResponse.json({ error: "Il formato XBRL vale solo per il bilancio" }, { status: 400 });
  if (typeof size !== "number" || size <= 0 || size > MAX_DOC_BYTES)
    return NextResponse.json({ error: "Il file deve essere al massimo di 20 MB" }, { status: 413 });

  const day = new Date().toISOString().slice(0, 10);
  let path: string;
  if (companyId) {
    const { data: auth } = await (await supabaseServer()).auth.getUser();
    if (!auth.user) return NextResponse.json({ error: "Accesso richiesto" }, { status: 401 });
    if (!(await companyOfMember(auth.user.id, companyId))) return NextResponse.json({ error: "Azienda non trovata" }, { status: 404 });
    path = `aziende/${companyId}/${day}/${randomUUID()}-${tipo}.${ext}`;
  } else {
    if (!isHuman(request)) return NextResponse.json({ error: "Verifica di sicurezza scaduta: ricarica la pagina" }, { status: 403 });
    if (tipo !== "visura" && tipo !== "bilancio") return NextResponse.json({ error: "Tipo di documento non valido" }, { status: 400 });
    path = `in-attesa/${day}/${randomUUID()}-${tipo}.${ext}`;
  }

  const { data, error } = await supabaseService().storage.from("documenti").createSignedUploadUrl(path);
  if (error || !data) {
    console.error("Preparazione caricamento non riuscita:", error?.message);
    return NextResponse.json({ error: "Caricamento non disponibile, riprova tra poco" }, { status: 500 });
  }
  return NextResponse.json({ path: data.path, token: data.token });
}
