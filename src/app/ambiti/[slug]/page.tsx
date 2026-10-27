import { ArrowRight, Check } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import JsonLd from "@/components/JsonLd";
import { AREA_PAGES, areaPageBySlug } from "@/config/ambiti";
import { BRAND } from "@/config/brand";
import { euro, PRODUCTS } from "@/config/offers";
import { siteUrl } from "@/config/site";
import { AreaIcon } from "@/lib/areaIcons";
import { MODULE_SUBAREAS } from "@/lib/modules";
import { AREAS, QUESTIONS } from "@/lib/questionnaire";

export function generateStaticParams() {
  return AREA_PAGES.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/ambiti/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const p = areaPageBySlug(slug);
  if (!p) return {};
  return {
    title: p.seoTitle,
    description: p.seoDescription,
    alternates: { canonical: `/ambiti/${p.slug}` },
    openGraph: { title: p.seoTitle, description: p.seoDescription, url: `/ambiti/${p.slug}`, images: ["/opengraph-image"] },
  };
}

export default async function AreaLandingPage({ params }: PageProps<"/ambiti/[slug]">) {
  const { slug } = await params;
  const p = areaPageBySlug(slug);
  if (!p) notFound();
  const area = AREAS.find((a) => a.code === p.code)!;
  const themes = QUESTIONS.filter((q) => q.area === p.code);
  const subs = MODULE_SUBAREAS[p.code];
  const url = siteUrl();
  return (
    <div>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: BRAND.name, item: `${url}/` },
            { "@type": "ListItem", position: 2, name: "Gli 8 ambiti", item: `${url}/ambiti` },
            { "@type": "ListItem", position: 3, name: area.name, item: `${url}/ambiti/${p.slug}` },
          ],
        }}
      />
      <section className="bg-navy text-white">
        <div className="mx-auto max-w-5xl px-4 py-14">
          <nav aria-label="Percorso" className="text-sm text-white/70">
            <Link href="/" className="hover:underline">
              {BRAND.name}
            </Link>{" "}
            ›{" "}
            <Link href="/ambiti" className="hover:underline">
              Gli 8 ambiti
            </Link>
          </nav>
          <div className="mt-5 flex items-start gap-4">
            <span className="shrink-0 size-12 rounded-xl bg-white/10 flex items-center justify-center">
              <AreaIcon code={p.code} className="size-6" />
            </span>
            <h1 className="text-3xl sm:text-4xl font-semibold leading-tight">{p.seoTitle}</h1>
          </div>
          <p className="mt-6 text-lg text-white/85 max-w-3xl leading-relaxed">{p.intro}</p>
          <Link href="/diagnostico" className="mt-8 inline-flex items-center gap-2 bg-white text-navy font-semibold px-6 py-3 rounded-lg hover:bg-paper">
            Inizia il diagnostico gratuito <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-14 grid gap-10 md:grid-cols-2">
        <div>
          <h2 className="text-xl font-semibold text-navy">Cosa misura il diagnostico gratuito</h2>
          <p className="mt-2 text-sm text-muted">
            Tre temi su {area.name.toLowerCase()}, insieme agli altri sette ambiti, nel profilo complessivo della tua azienda.
          </p>
          <ul className="mt-4 space-y-3">
            {themes.map((q) => (
              <li key={q.id} className="rounded-xl border border-line p-4">
                <p className="font-semibold">{q.theme}</p>
                <p className="mt-1 text-sm text-muted">{q.text}</p>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="text-xl font-semibold text-navy">Quando conviene approfondire</h2>
          <ul className="mt-4 space-y-2">
            {p.signals.map((s) => (
              <li key={s} className="flex gap-2">
                <Check className="size-4 mt-1 shrink-0 text-navy" aria-hidden /> {s}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="bg-paper">
        <div className="mx-auto max-w-5xl px-4 py-14">
          <h2 className="text-xl font-semibold text-navy">L&apos;approfondimento: gli 8 sotto-ambiti</h2>
          <p className="mt-2 text-muted max-w-3xl">
            Dopo il diagnostico puoi acquistare l&apos;approfondimento dell&apos;ambito: un {BRAND.reportName} dedicato, con 2-3 domande per sotto-ambito,
            punteggi subito e un report con piano di lavoro a 3, 6 e 12 mesi e indicatori da seguire. {euro(PRODUCTS.modulo.price)} + IVA.
          </p>
          <ol className="mt-6 grid gap-3 sm:grid-cols-2">
            {subs.map((s, i) => (
              <li key={s.code} className="bg-white border border-line rounded-xl p-4 flex gap-3">
                <span className="shrink-0 size-7 rounded-full bg-navy text-white text-xs font-semibold flex items-center justify-center">{i + 1}</span>
                <span>
                  <span className="block font-semibold">{s.name}</span>
                  <span className="block text-sm text-muted">{s.description}</span>
                </span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-14">
        <h2 className="text-xl font-semibold text-navy">Gli altri ambiti</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {AREA_PAGES.filter((x) => x.slug !== p.slug).map((x) => (
            <Link key={x.slug} href={`/ambiti/${x.slug}`} className="inline-flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full border border-line hover:border-navy-soft">
              <AreaIcon code={x.code} className="size-3.5" /> {AREAS.find((a) => a.code === x.code)?.name}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
