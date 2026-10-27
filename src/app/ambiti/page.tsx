import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { AREA_PAGES } from "@/config/ambiti";
import { BRAND } from "@/config/brand";
import { AreaIcon } from "@/lib/areaIcons";
import { MODULE_SUBAREAS } from "@/lib/modules";
import { AREAS } from "@/lib/questionnaire";

const TITLE = "Gli 8 ambiti del diagnostico aziendale";
const DESCRIPTION = `Strategia e governance, finanza e controllo, marketing e vendite, persone, operations, digitale, innovazione e sostenibilità: cosa misura l'${BRAND.reportName} in ciascun ambito.`;

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/ambiti" },
  openGraph: { title: TITLE, description: DESCRIPTION, url: "/ambiti", images: ["/opengraph-image"] },
};

export default function AreasPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <h1 className="text-3xl sm:text-4xl font-semibold text-navy">{TITLE}</h1>
      <p className="mt-3 text-muted max-w-3xl leading-relaxed">
        Il diagnostico gratuito valuta la gestione dell&apos;azienda su 8 ambiti, con tre temi ciascuno. Per ogni ambito è disponibile un
        approfondimento con 8 sotto-ambiti: lo stesso {BRAND.reportName}, a un livello di dettaglio maggiore.
      </p>
      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        {AREA_PAGES.map((p) => {
          const a = AREAS.find((x) => x.code === p.code)!;
          return (
            <Link key={p.slug} href={`/ambiti/${p.slug}`} className="group rounded-xl border border-line p-5 hover:border-navy-soft">
              <span className="flex items-center gap-3">
                <span className="size-10 rounded-xl bg-navy text-white flex items-center justify-center">
                  <AreaIcon code={p.code} className="size-5" />
                </span>
                <span className="font-semibold text-navy text-lg group-hover:underline">{a.name}</span>
              </span>
              <span className="mt-3 block text-sm text-muted">{a.description}</span>
              <span className="mt-3 block text-xs text-muted">
                Sotto-ambiti: {MODULE_SUBAREAS[p.code].map((s) => s.name).join(" · ")}
              </span>
            </Link>
          );
        })}
      </div>
      <Link href="/diagnostico" className="mt-10 inline-flex items-center gap-2 bg-navy text-white font-semibold px-6 py-3 rounded-lg hover:bg-navy-soft">
        Inizia il diagnostico gratuito <ArrowRight className="size-4" aria-hidden />
      </Link>
    </div>
  );
}
