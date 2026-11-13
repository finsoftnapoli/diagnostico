"use client";

import { useEffect } from "react";
import { BRAND } from "@/config/brand";
import { reportClientError } from "@/lib/track";

export default function Error({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  useEffect(() => {
    reportClientError(error.message || "Errore di pagina", error.digest ? `digest ${error.digest}` : error.stack);
  }, [error]);
  return (
    <div className="mx-auto max-w-3xl px-4 py-20">
      <h1 className="text-3xl font-semibold text-navy">Qualcosa non ha funzionato</h1>
      <p className="mt-3 text-muted">
        Riprovate tra qualche istante. Le risposte del questionario restano salvate nel browser. Se il problema continua, scriveteci a{" "}
        <a className="underline" href={`mailto:${BRAND.contactEmail}`}>
          {BRAND.contactEmail}
        </a>
        .
      </p>
      <button onClick={() => retry()} className="mt-8 bg-navy text-white font-semibold px-5 py-2.5 rounded-lg">
        Riprova
      </button>
    </div>
  );
}
