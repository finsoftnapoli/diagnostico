"use client";

import { useEffect } from "react";
import { reportClientError, track } from "@/lib/track";

/** Registra la visita di una pagina del percorso e gli errori non gestiti del browser. */
export default function Observer({ page }: { page?: string }) {
  useEffect(() => {
    if (page) track(page);
    const onError = (e: ErrorEvent) => reportClientError(e.message || "Errore", e.error instanceof Error ? e.error.stack : undefined);
    const onRejection = (e: PromiseRejectionEvent) =>
      reportClientError(
        e.reason instanceof Error ? e.reason.message : String(e.reason),
        e.reason instanceof Error ? e.reason.stack : undefined,
      );
    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onRejection);
    return () => {
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onRejection);
    };
  }, [page]);
  return null;
}
