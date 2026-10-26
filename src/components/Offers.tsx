"use client";

import { ArrowRight, Check, Layers, Package, UserRound } from "lucide-react";
import Link from "next/link";
import { BRAND } from "@/config/brand";
import { euro, PRODUCTS } from "@/config/offers";
import { AREA_SHORT, AreaIcon } from "@/lib/areaIcons";
import type { AreaCode } from "@/lib/types";

/** Servizi a pagamento presentati nel report: si acquistano dall'area personale. */
export default function Offers({ assessmentId, priorities }: { assessmentId?: string; priorities: { code: AreaCode; name: string }[] }) {
  // senza compilazione salvata (servizio senza database) si scrive allo staff
  const href = assessmentId ? "/area/servizi" : `mailto:${BRAND.contactEmail}?subject=${encodeURIComponent("Servizi di approfondimento")}`;
  const cards = [
    { p: PRODUCTS.modulo, icon: Layers, unit: "per ambito", cta: "Scegli gli ambiti", anchor: "" },
    { p: PRODUCTS.consulenza, icon: UserRound, unit: "un'ora da remoto", cta: "Prenota", anchor: "#consulenza" },
    { p: PRODUCTS.bundle, icon: Package, unit: "8 ambiti e 2 ore di consulenza", cta: "Scopri il percorso", anchor: "" },
  ];
  return (
    <section className="mt-14">
      <h2 className="text-2xl font-semibold text-navy">Vai più a fondo</h2>
      <p className="mt-1 text-sm text-muted max-w-3xl">
        Il diagnostico mostra dove intervenire. Per trasformarlo in un piano puoi approfondire un ambito alla volta o confrontarti con un nostro
        consulente senior.
      </p>
      <div className="mt-6 grid gap-4 lg:grid-cols-3 items-stretch">
        {cards.map(({ p, icon: Icon, unit, cta, anchor }) => {
          const featured = p.sku === "bundle";
          return (
            <div key={p.sku} className={`rounded-xl border p-5 flex flex-col ${featured ? "border-navy bg-navy/5" : "border-line"}`}>
              <div className="flex items-center gap-2 text-navy">
                <Icon className="size-5" aria-hidden strokeWidth={1.75} />
                <h3 className="font-semibold">{p.name}</h3>
              </div>
              <p className="mt-2 text-sm">
                <span className="text-2xl font-semibold text-navy">{euro(p.price)}</span>
                <span className="text-muted"> + IVA · {unit}</span>
              </p>
              <ul className="mt-3 space-y-1.5 text-sm flex-1">
                {p.bullets.map((b) => (
                  <li key={b} className="flex gap-2">
                    <Check className="size-4 mt-0.5 shrink-0 text-navy" aria-hidden /> {b}
                  </li>
                ))}
              </ul>
              {p.sku === "modulo" && priorities.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {priorities.map((x) => (
                    <span key={x.code} className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full border border-navy text-navy" title="Tra le tue priorità">
                      <AreaIcon code={x.code} className="size-3.5" /> {AREA_SHORT[x.code]}
                    </span>
                  ))}
                </div>
              )}
              <Link
                href={href.startsWith("mailto:") ? href : `${href}${anchor}`}
                className={`mt-4 inline-flex items-center justify-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-lg ${
                  featured ? "bg-navy text-white hover:bg-navy-soft" : "border border-navy text-navy hover:bg-navy/5"
                }`}
              >
                {cta} <ArrowRight className="size-4" aria-hidden />
              </Link>
            </div>
          );
        })}
      </div>
      <p className="mt-3 text-xs text-muted">
        Prezzi IVA esclusa, riservati a imprese con partita IVA. Pagamento online con carta; fattura elettronica emessa a ogni acquisto.
      </p>
    </section>
  );
}
