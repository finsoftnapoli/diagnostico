"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export interface OrderRow {
  id: string;
  created_at: string;
  paid_at: string | null;
  status: string;
  payment_method: string | null;
  items: { description: string; netCents: number }[];
  total_cents: number;
  billing: { denominazione: string; vat_number: string };
  invoices: { id: string; number: string; status: string; error: string | null; issued_on: string }[] | { id: string; number: string; status: string; error: string | null; issued_on: string } | null;
}

const STATUS: Record<string, string> = { pending: "in attesa", paid: "pagato", cancelled: "annullato", refunded: "rimborsato" };
const INV: Record<string, string> = { draft: "da inviare", manual: "da caricare su Aruba", sent: "inviata", error: "errore di invio" };
const eur = (c: number) => `€${(c / 100).toLocaleString("it-IT", { minimumFractionDigits: 2 })}`;

/** Elenco ordini per lo staff, con fattura e azioni. */
export default function OrdersAdmin({ rows }: { rows: OrderRow[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  async function act(id: string, action: "paid" | "cancel" | "invoice") {
    if (action === "paid" && !confirm("Confermi di aver ricevuto il bonifico? Si attivano i servizi e si emette la fattura.")) return;
    setBusy(id + action);
    const res = await fetch(`/api/admin/ordini/${id}`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action }) });
    const j = (await res.json().catch(() => ({}))) as { error?: string };
    setBusy(null);
    setMsg(res.ok ? "Fatto." : (j.error ?? "Non riuscito"));
    router.refresh();
  }

  if (!rows.length) return <p className="mt-8 text-sm text-muted">Nessun ordine.</p>;
  return (
    <div className="mt-6 overflow-x-auto">
      {msg && <p className="mb-3 text-sm text-muted">{msg}</p>}
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left border-b border-line text-muted">
            <th className="py-2 pr-4 font-medium">Data</th>
            <th className="py-2 pr-4 font-medium">Cliente</th>
            <th className="py-2 pr-4 font-medium">Servizi</th>
            <th className="py-2 pr-4 font-medium">Totale</th>
            <th className="py-2 pr-4 font-medium">Stato</th>
            <th className="py-2 pr-4 font-medium">Fattura</th>
            <th className="py-2 font-medium"></th>
          </tr>
        </thead>
        <tbody>
          {rows.map((o) => {
            const inv = Array.isArray(o.invoices) ? o.invoices[0] : o.invoices;
            return (
              <tr key={o.id} className="border-b border-line align-top">
                <td className="py-2 pr-4 whitespace-nowrap">{new Date(o.created_at).toLocaleDateString("it-IT")}</td>
                <td className="py-2 pr-4">
                  {o.billing?.denominazione}
                  <span className="block text-muted">P.IVA {o.billing?.vat_number}</span>
                </td>
                <td className="py-2 pr-4">
                  {o.items.map((l, i) => (
                    <span key={i} className="block">
                      {l.description}
                    </span>
                  ))}
                </td>
                <td className="py-2 pr-4 tabular-nums whitespace-nowrap">{eur(o.total_cents)}</td>
                <td className="py-2 pr-4 whitespace-nowrap">
                  {STATUS[o.status] ?? o.status}
                  {o.payment_method && <span className="block text-muted">{o.payment_method === "stripe" ? "carta / Stripe" : "bonifico"}</span>}
                </td>
                <td className="py-2 pr-4">
                  {inv ? (
                    <>
                      n. {inv.number} · {INV[inv.status] ?? inv.status}
                      {inv.error && <span className="block text-xs text-accent">{inv.error}</span>}
                      <a href={`/api/admin/fatture/${inv.id}`} className="block underline text-navy-soft">
                        Scarica XML
                      </a>
                    </>
                  ) : o.status === "paid" ? (
                    <span className="text-accent">non emessa</span>
                  ) : (
                    "—"
                  )}
                </td>
                <td className="py-2 whitespace-nowrap space-y-1">
                  {o.status === "pending" && (
                    <>
                      <button onClick={() => act(o.id, "paid")} disabled={!!busy} className="block px-3 py-1 rounded-lg border border-line hover:bg-paper">
                        Bonifico ricevuto
                      </button>
                      <button onClick={() => act(o.id, "cancel")} disabled={!!busy} className="block px-3 py-1 rounded-lg border border-line hover:bg-paper">
                        Annulla
                      </button>
                    </>
                  )}
                  {o.status === "paid" && (!inv || inv.status !== "sent") && (
                    <button onClick={() => act(o.id, "invoice")} disabled={!!busy} className="block px-3 py-1 rounded-lg border border-line hover:bg-paper">
                      {inv ? "Riprova l'invio" : "Emetti fattura"}
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
