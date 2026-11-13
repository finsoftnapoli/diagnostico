import Observer from "@/components/Observer";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import AccountMenu from "@/components/AccountMenu";
import MainNav from "@/components/MainNav";
import HeaderAction from "@/components/HeaderAction";
import { BRAND } from "@/config/brand";
import { siteUrl } from "@/config/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: { default: `Diagnostico aziendale gratuito per PMI · ${BRAND.name}`, template: `%s · ${BRAND.name}` },
  description: BRAND.tagline,
  applicationName: BRAND.name,
  openGraph: { type: "website", locale: "it_IT", siteName: BRAND.name },
  twitter: { card: "summary_large_image" },
  formatDetection: { telephone: false },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="it" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <header className="border-b border-line">
          <div className="mx-auto max-w-5xl px-4 h-14 flex items-center justify-between">
            <Link href="/" className="font-semibold tracking-tight text-navy">
              {BRAND.name}
            </Link>
            <nav aria-label="Principale" className="flex items-center gap-5 text-sm">
              <Suspense fallback={null}>
                <MainNav />
              </Suspense>
              <Suspense fallback={null}>
                <HeaderAction />
              </Suspense>
              <Suspense fallback={null}>
                <AccountMenu />
              </Suspense>
            </nav>
          </div>
        </header>
        <Observer />
        <main className="flex-1">{children}</main>
        <footer className="border-t border-line text-sm text-muted">
          <div className="mx-auto max-w-5xl px-4 py-6 flex flex-wrap gap-x-6 gap-y-2 justify-between">
            <span>Un servizio di {BRAND.owner}. Autovalutazione orientativa: non è una consulenza né un rating.</span>
            <span className="flex flex-wrap gap-x-4 gap-y-1">
              <Link href="/ambiti" className="hover:underline">
                Gli 8 ambiti
              </Link>
              <Link href="/metodo" className="hover:underline">
                Metodo
              </Link>
              <Link href="/area" className="hover:underline">
                Area personale
              </Link>
              <Link href="/privacy" className="hover:underline">
                Informativa privacy
              </Link>
              <Link href="/termini" className="hover:underline">
                Condizioni di vendita
              </Link>
              <a href={`mailto:${BRAND.contactEmail}`} className="hover:underline">
                Contatti
              </a>
            </span>
          </div>
        </footer>
      </body>
    </html>
  );
}
