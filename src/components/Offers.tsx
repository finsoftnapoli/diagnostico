"use client";

import { ArrowRight, Check, Layers, UserRound } from "lucide-react";
import { useState } from "react";
import { BRAND } from "@/config/brand";
import { DEEP_DIVE, euro, EXPERT } from "@/config/offers";
import { AREA_SHORT, AreaIcon } from "@/lib/areaIcons";
import { AREAS } from "@/lib/questionnaire";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import type { AreaCode } from "@/lib/types";

type Kind = "approfondimento_ambito" | "approfondimento_priorita" | "consulenza";

/** Offerte a pagamento nel report: approfondimenti per ambito, pacchetto priorità, consulenza. */
export default function Offers({ assessmentId, priorities }: { assessmentId?: string; priorities: { code: AreaCode; name: string }[] }) {
  const [done, setDone] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState<string | null>(null);

  async function request(key: string, kind: Kind, area?: AreaCode) {
    if (done.has(key)) return;
    setBusy(key);
    const enabled = isSupabaseConfigured() && assessmentId;
    if (enabled) {
      const res = await fetch("/api/interessi", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ assessmentId, kind, area }),
      });
      if (!res.ok) {
        setBusy(null);
        return;
      }
    } else {
      const subject = kind === "consulenza" ? "Sessione con un esperto" : "Approfondimento diagnostico";
      window.location.assign(`mailto:${BRAND.contactEmail}?subject=${encodeURIComponent(subject)}`);
    }
    setDone((d) => new Set(d).add(key));
    setBusy(null);
  }

  const btn = { busy, done, request };

  return (
    <section className="mt-14">
      <h2 className="text-2xl font-semibold text-navy">Vai più a fondo</h2>
      <p className="mt-1 text-sm text-muted max-w-3xl">
        Il diagnostico mostra dove intervenire. Per trasformarlo in un piano, puoi approfondire un singolo ambito o
        confrontarti con un nostro esperto.
      </p>
      <div className="mt-6 grid gap-4 lg:grid-cols-2 items-start">
        {/* Consulenza */}
        <div className="rounded-xl border border-navy bg-navy/5 p-5">
          <div className="flex items-center gap-2 text-navy">
            <UserRound className="size-5" aria-hidden strokeWidth={1.75} />
            <h3 className="font-semibold">Sessione con un esperto</h3>
          </div>
          <p className="mt-2 text-sm">
            <span className="text-2xl font-semibold text-navy">{euro(EXPERT.price)}</span>
            <span className="text-muted"> · {EXPERT.durationMin} minuti</span>
          </p>
          <ul className="mt-3 space-y-1.5 text-sm">
            {EXPERT.bullets.map((b) => (
              <li key={b} className="flex gap-2">
                <Check className="size-4 mt-0.5 shrink-0 text-navy" aria-hidden /> {b}
              </li>
            ))}
          </ul>
          <div className="mt-4">
            <Btn {...btn} k="consulenza" kind="consulenza">
              Richiedi la sessione
            </Btn>
          </div>
        </div>

        {/* Approfondimenti per ambito */}
        <div className="rounded-xl border border-line p-5">
          <div className="flex items-center gap-2 text-navy">
            <Layers className="size-5" aria-hidden strokeWidth={1.75} />
            <h3 className="font-semibold">Approfondimento per ambito</h3>
          </div>
          <p className="mt-2 text-sm">
            <span className="text-2xl font-semibold text-navy">{euro(DEEP_DIVE.priceEach)}</span>
            <span className="text-muted"> per ambito · {euro(DEEP_DIVE.pricePriorities)} per le 3 priorità</span>
          </p>
          <ul className="mt-3 space-y-1.5 text-sm">
            {DEEP_DIVE.bullets.map((b) => (
              <li key={b} className="flex gap-2">
                <Check className="size-4 mt-0.5 shrink-0 text-navy" aria-hidden /> {b}
              </li>
            ))}
          </ul>
          <>
              <p className="mt-4 text-xs uppercase tracking-wide text-muted">Scegli l&apos;ambito da approfondire</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {[
                  ...priorities,
                  ...AREAS.filter((a) => !priorities.some((p) => p.code === a.code)).map((a) => ({ code: a.code, name: a.name })),
                ].map((p) => (
                  <button
                    key={p.code}
                    onClick={() => request(`a-${p.code}`, "approfondimento_ambito", p.code)}
                    disabled={busy === `a-${p.code}` || done.has(`a-${p.code}`)}
                    className={`inline-flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full border ${
                      done.has(`a-${p.code}`)
                        ? "bg-navy text-white border-navy"
                        : priorities.some((x) => x.code === p.code)
                          ? "border-navy text-navy hover:bg-navy/5"
                          : "border-line hover:border-navy-soft"
                    }`}
                    title={priorities.some((x) => x.code === p.code) ? "Tra le tue priorità" : undefined}
                  >
                    {done.has(`a-${p.code}`) ? <Check className="size-3.5" aria-hidden /> : <AreaIcon code={p.code} className="size-3.5" />}
                    {AREA_SHORT[p.code]}
                  </button>
                ))}
              </div>
              {priorities.length > 0 && (
                <p className="mt-2 text-xs text-muted">In evidenza le tue tre priorità.</p>
              )}
          </>
          <div className="mt-4">
            <Btn {...btn} k="priorita" kind="approfondimento_priorita">
              Richiedi le 3 priorità
            </Btn>
          </div>
        </div>
      </div>
      <p className="mt-3 text-xs text-muted">
        Prezzi IVA esclusa. Ti ricontattiamo per concordare i dettagli prima di qualsiasi pagamento.
      </p>
    </section>
  );
}

function Btn({
  k,
  kind,
  area,
  children,
  busy,
  done,
  request,
}: {
  k: string;
  kind: Kind;
  area?: AreaCode;
  children: React.ReactNode;
  busy: string | null;
  done: Set<string>;
  request: (key: string, kind: Kind, area?: AreaCode) => void;
}) {
  return (
    <button
      onClick={() => request(k, kind, area)}
      disabled={busy === k || done.has(k)}
      className={`inline-flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-lg ${
        done.has(k) ? "bg-navy/10 text-navy" : "bg-navy text-white hover:bg-navy-soft"
      }`}
    >
      {done.has(k) ? (
        <>
          <Check className="size-4" aria-hidden /> Richiesta inviata
        </>
      ) : (
        <>
          {children} <ArrowRight className="size-4" aria-hidden />
        </>
      )}
    </button>
  );
}
