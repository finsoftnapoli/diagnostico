// Formati accettati per i documenti caricati: PDF per tutti, XBRL (file del Registro Imprese) per il bilancio.
export const MAX_DOC_MB = 20;

export const acceptFor = (kind: string) => (kind === "bilancio" ? "application/pdf,.pdf,.xbrl,.xml" : "application/pdf,.pdf");

export type DocFormat = { formato: "pdf" | "xbrl"; contentType: string };

/** Formato del file scelto, o il messaggio da mostrare se non è accettato. */
export function docFormat(file: { name: string; type: string; size: number }, kind: string): DocFormat | { error: string } {
  const name = file.name.toLowerCase();
  const isPdf = file.type === "application/pdf" || name.endsWith(".pdf");
  const isXml = /\.(xbrl|xml)$/.test(name) || /xml/.test(file.type);
  if (file.size > MAX_DOC_MB * 1024 * 1024) return { error: `Il file supera i ${MAX_DOC_MB} MB: prova con una versione più leggera.` };
  if (isPdf) return { formato: "pdf", contentType: "application/pdf" };
  if (isXml && kind === "bilancio") return { formato: "xbrl", contentType: "application/xml" };
  if (isXml) return { error: "Il formato XBRL vale solo per il bilancio: per questo documento carica il PDF." };
  return { error: kind === "bilancio" ? "Il file deve essere un PDF o un XBRL." : "Il file deve essere un PDF." };
}

/**
 * Il file con il tipo giusto: il caricamento nell'archivio usa il tipo assegnato dal browser, che per i file XBRL
 * è vuoto (l'archivio li rifiuterebbe come file generici).
 */
export const withType = (file: File, type: string): Blob => (file.type === type ? file : new Blob([file], { type }));
