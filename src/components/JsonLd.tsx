/** Dati strutturati per i motori di ricerca (schema.org in formato JSON-LD). */
export default function JsonLd({ data }: { data: Record<string, unknown> | Record<string, unknown>[] }) {
  return (
    <script
      type="application/ld+json"
      // il contenuto è generato dal codice, non dall'utente; "<" è neutralizzato per sicurezza
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
