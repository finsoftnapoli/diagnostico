import { BRAND } from "@/config/brand";

export default function Privacy() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-2xl font-semibold text-navy">Informativa privacy</h1>
      <p className="mt-4 text-muted">
        Testo provvisorio: l&apos;informativa definitiva sarà generata con iubenda e rivista da un legale prima
        dell&apos;apertura al pubblico. Titolare del trattamento: {BRAND.ownerLegal}.
      </p>
      <h2 className="mt-8 font-semibold">Finalità previste</h2>
      <ul className="mt-2 list-disc pl-6 text-muted space-y-1">
        <li>Produrre il profilo e il report richiesti (necessario per il servizio).</li>
        <li>Elaborare statistiche e confronti aggregati e anonimi tra aziende (facoltativo).</li>
        <li>Inviare comunicazioni su servizi e iniziative (facoltativo).</li>
      </ul>
      <h2 className="mt-8 font-semibold">Documenti caricati</h2>
      <p className="mt-2 text-muted">
        Visura camerale e bilancio, se caricati, sono letti in modo automatico per estrarre i dati dell&apos;azienda
        (dati anagrafici e di bilancio) e poi eliminati: i file non vengono conservati. I dati di persone fisiche
        presenti nei documenti (soci, amministratori) non vengono estratti né salvati. Per la lettura usiamo il servizio
        Claude di Anthropic, che non utilizza questi dati per addestrare i propri modelli.
      </p>
      <h2 className="mt-8 font-semibold">Verifica di sicurezza</h2>
      <p className="mt-2 text-muted">
        Per proteggere il servizio da accessi automatici usiamo Cloudflare Turnstile, che verifica che chi compila sia una
        persona senza raccogliere dati per finalità pubblicitarie.
      </p>
    </div>
  );
}
