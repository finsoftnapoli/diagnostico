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
    </div>
  );
}
