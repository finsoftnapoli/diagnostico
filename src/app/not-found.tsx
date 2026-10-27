import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-20">
      <p className="text-sm text-muted">Errore 404</p>
      <h1 className="mt-1 text-3xl font-semibold text-navy">Pagina non trovata</h1>
      <p className="mt-3 text-muted">Il collegamento potrebbe essere scaduto o la pagina è stata spostata.</p>
      <div className="mt-8 flex flex-wrap gap-4">
        <Link href="/" className="bg-navy text-white font-semibold px-5 py-2.5 rounded-lg">
          Vai alla pagina iniziale
        </Link>
        <Link href="/area" className="px-5 py-2.5 rounded-lg border border-line">
          Area personale
        </Link>
      </div>
    </div>
  );
}
