import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import HeaderAction from "@/components/HeaderAction";
import { BRAND } from "@/config/brand";
import "./globals.css";

export const metadata: Metadata = {
  title: BRAND.name,
  description: BRAND.tagline,
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
            <Suspense fallback={null}>
              <HeaderAction />
            </Suspense>
          </div>
        </header>
        <main className="flex-1">{children}</main>
        <footer className="border-t border-line text-sm text-muted">
          <div className="mx-auto max-w-5xl px-4 py-6 flex flex-wrap gap-x-6 gap-y-2 justify-between">
            <span>
              Un servizio di {BRAND.owner}. Autovalutazione orientativa: non è una consulenza né un rating.
            </span>
            <span className="flex gap-4">
              <Link href="/area" className="hover:underline">
                Area personale
              </Link>
              <Link href="/privacy" className="hover:underline">
                Informativa privacy
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
