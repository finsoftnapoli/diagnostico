import { FileDown } from "lucide-react";

/** Scarica il report impaginato in PDF, generato dal sito. */
export default function PdfDownload({ href, label = "Scarica il PDF" }: { href: string; label?: string }) {
  return (
    <a
      href={href}
      className="no-print inline-flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg border border-navy text-navy hover:bg-navy hover:text-white"
    >
      <FileDown className="size-4" aria-hidden /> {label}
    </a>
  );
}
