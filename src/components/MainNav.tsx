"use client";

import { Menu } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/ambiti", label: "Gli 8 ambiti" },
  { href: "/metodo", label: "Metodo" },
  { href: "/area", label: "Area personale" },
];

/** Voci del menu: in riga su computer, in un menu a comparsa su telefono; nascoste durante la compilazione. */
export default function MainNav() {
  const path = usePathname();
  if (path.startsWith("/diagnostico")) return null;
  return (
    <>
      {LINKS.map((l) => (
        <Link key={l.href} href={l.href} className="hidden sm:inline text-muted hover:text-navy">
          {l.label}
        </Link>
      ))}
      <details className="sm:hidden relative order-last">
        <summary className="list-none cursor-pointer p-1.5 -mr-1.5 text-navy [&::-webkit-details-marker]:hidden" aria-label="Menu">
          <Menu className="size-5" aria-hidden />
        </summary>
        <div className="absolute right-0 top-full z-40 mt-2 w-48 rounded-xl border border-line bg-white shadow-lg py-1.5">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="block px-4 py-2.5 text-sm hover:bg-paper">
              {l.label}
            </Link>
          ))}
        </div>
      </details>
    </>
  );
}
