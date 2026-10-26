"use client";

import { Download } from "lucide-react";

/** Scarica il report in PDF con la stampa del browser (impaginazione dedicata in globals.css). */
export default function PrintButton({ label = "Scarica in PDF" }: { label?: string }) {
  return (
    <button
      onClick={() => window.print()}
      className="no-print inline-flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg border border-line hover:bg-paper"
    >
      <Download className="size-4" aria-hidden /> {label}
    </button>
  );
}
