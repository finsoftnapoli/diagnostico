import { CheckCircle2, Eye, ShieldAlert } from "lucide-react";
import type { ReportUsage } from "@/lib/report-access";
import type { ReleaseVerdict } from "@/lib/release-checks";

const when = (iso: string | null) =>
  iso ? new Date(iso).toLocaleString("it-IT", { dateStyle: "short", timeStyle: "short", timeZone: "Europe/Rome" }) : "";

/** Per lo staff: esito dei controlli automatici, come è stato rilasciato il report e se il cliente lo ha letto. */
export default function ReleaseInfo({
  status,
  checks,
  releasedBy,
  releasedAt,
  usage,
}: {
  status: string;
  checks: ReleaseVerdict | null;
  releasedBy: "auto" | "staff" | null;
  releasedAt: string | null;
  usage?: ReportUsage;
}) {
  const reasons = checks ? [...checks.blocking, ...(checks.secondOpinion?.issues ?? [])] : [];
  const notes = checks?.notes ?? [];
  return (
    <section className="rounded-xl border border-line bg-white p-4 text-sm">
      <h2 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-navy">
        {checks && !checks.ok ? (
          <ShieldAlert className="size-4 text-accent" aria-hidden />
        ) : (
          <CheckCircle2 className="size-4" aria-hidden />
        )}
        Controlli e invio
      </h2>
      {status === "ready" ? (
        <p>
          {releasedBy === "auto" ? "Inviato da solo dopo i controlli automatici" : "Approvato e inviato dallo staff"}
          {releasedAt ? ` il ${when(releasedAt)}` : ""}.
        </p>
      ) : status === "review" ? (
        <p>
          {checks
            ? checks.ok
              ? "Controlli superati: in attesa di approvazione."
              : "Trattenuto: non ha superato i controlli automatici."
            : "In attesa di approvazione."}
        </p>
      ) : (
        <p className="text-muted">{status === "failed" ? "Generazione non riuscita." : "Report in preparazione."}</p>
      )}
      {reasons.length > 0 && (
        <ul className="mt-2 list-disc space-y-1 pl-5">
          {reasons.map((x) => (
            <li key={x}>{x}</li>
          ))}
        </ul>
      )}
      {notes.length > 0 && (
        <details className="mt-2">
          <summary className="cursor-pointer text-muted">Note dei controlli ({notes.length})</summary>
          <ul className="mt-1 list-disc space-y-1 pl-5 text-muted">
            {notes.map((x) => (
              <li key={x}>{x}</li>
            ))}
          </ul>
        </details>
      )}
      {status === "ready" && (
        <p className="mt-3 flex items-start gap-1.5 border-t border-line pt-3">
          <Eye className="mt-0.5 size-4 shrink-0 text-navy" aria-hidden />
          <span>
            {usage?.opens
              ? `Aperto dal cliente ${usage.opens === 1 ? "una volta" : `${usage.opens} volte`}, la prima il ${when(usage.firstOpen)}${usage.opens > 1 ? `, l'ultima il ${when(usage.lastOpen)}` : ""}.`
              : "Il cliente non lo ha ancora aperto."}{" "}
            {usage?.pdfs ? `PDF scaricato ${usage.pdfs === 1 ? "una volta" : `${usage.pdfs} volte`}.` : "PDF non ancora scaricato."}
          </span>
        </p>
      )}
    </section>
  );
}
