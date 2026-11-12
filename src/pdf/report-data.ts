// Dati del report in PDF: tutto ciò che il documento mostra, già calcolato e in parole.
import { bandText, type Benchmark } from "@/config/benchmark";
import { BRAND } from "@/config/brand";
import { AREA_SHORT } from "@/lib/areaIcons";
import { financialKpis } from "@/lib/documents";
import { buildInsights, LEVEL_NAMES, levelLabel, type ThemeView } from "@/lib/insights";
import { AREAS } from "@/lib/questionnaire";
import type { ReportNarrative } from "@/lib/report";
import { areaReading, levelEquivalent, overallReading } from "@/lib/score-meaning";
import { computeResult } from "@/lib/scoring";
import type { AreaCode, Responses } from "@/lib/types";

const eur = (v: number | null | undefined) =>
  v === null || v === undefined
    ? "—"
    : Math.abs(v) >= 1_000_000
      ? `${(v / 1_000_000).toLocaleString("it-IT", { maximumFractionDigits: 1 })} mln €`
      : `${Math.round(v / 1000).toLocaleString("it-IT")} mila €`;

/** Iniziale minuscola dopo i due punti, salvo sigle (CRM, ERP…). */
const lower = (x: string) => (/^[A-ZÀ-Ý][a-zà-ÿ']/.test(x) ? x.charAt(0).toLowerCase() + x.slice(1) : x);

export interface PdfArea {
  code: AreaCode;
  name: string;
  short: string;
  score: number | null;
  ref: number;
  level: string;
  priority: number | null;
  reading: string;
  themes: ThemeView[];
}

export interface ReportPdfData {
  /** Vero se un esperto ha rivisto e approvato il report prima dell'invio. */
  reviewed: boolean;
  company: string;
  date: string;
  meta: string[];
  overall: number | null;
  overallLevel: string;
  overallEquivalent: string;
  reference: number;
  referenceLabel: string;
  referenceNote: string;
  reading: string[];
  summary: string[];
  areas: PdfArea[];
  narrative: ReportNarrative;
  nextSteps: Record<string, ThemeView[]>;
  readiness: { label: string; verdict: string; areas: string; weakest: string | null }[];
  issues: { label: string; causes: string[] }[];
  numbers: { year: number | null; tiles: [string, string, string][]; notes: string[] } | null;
  sources: string[];
  brand: string;
  owner: string;
  reportName: string;
}

export function reportPdfData(
  r: Responses,
  narrative: ReportNarrative,
  bench: Benchmark,
  completedAt: string,
  sources: string[],
  reviewed = false,
): ReportPdfData {
  const res = computeResult(r);
  const ins = buildInsights(r, res, bench);
  const band = r.profile["PR-02"];
  const k = r.financials ? financialKpis(r.financials) : null;
  const f = r.financials;
  const numbers =
    f && k
      ? {
          year: f.year ?? null,
          tiles: [
            ["Ricavi", eur(f.ricavi ?? f.valore_produzione), k.revenuePerEmployee ? `${eur(k.revenuePerEmployee)} per addetto` : ""],
            ["EBITDA", eur(f.ebitda), k.ebitdaMargin !== null ? `${k.ebitdaMargin.toLocaleString("it-IT")}% dei ricavi` : ""],
            ["Utile netto", eur(f.utile_netto), k.netMargin !== null ? `${k.netMargin.toLocaleString("it-IT")}% dei ricavi` : ""],
            [
              "Posizione finanziaria netta",
              eur(k.pfn),
              k.pfnOnEbitda !== null
                ? `${k.pfnOnEbitda.toLocaleString("it-IT")} volte l'EBITDA`
                : k.pfn !== null && k.pfn < 0
                  ? "cassa netta"
                  : "",
            ],
            [
              "Patrimonio netto",
              eur(f.patrimonio_netto),
              k.equityRatio !== null ? `${k.equityRatio.toLocaleString("it-IT")}% dell'attivo` : "",
            ],
            [
              "Giorni di incasso",
              k.dso !== null ? `${k.dso}` : "—",
              k.dio !== null && k.dio <= 365 ? `magazzino pari a ${k.dio} giorni di ricavi` : "",
            ],
          ].filter(([, v]) => v !== "—") as [string, string, string][],
          notes: k.notes,
        }
      : null;

  return {
    reviewed,
    company: r.profile["PR-11"] || "La vostra azienda",
    date: new Date(completedAt).toLocaleDateString("it-IT", { day: "numeric", month: "long", year: "numeric", timeZone: "Europe/Rome" }),
    meta: [
      r.profile["PR-01"],
      band ? `fatturato ${bandText(band)}` : null,
      r.profile["PR-03"] ? `addetti ${r.profile["PR-03"].toLowerCase()}` : null,
    ].filter((x): x is string => !!x),
    overall: ins.overall,
    overallLevel: levelLabel(ins.overall),
    overallEquivalent: ins.overall === null ? "" : levelEquivalent(ins.overall),
    reference: ins.benchmarkAvg,
    referenceLabel: bench.label,
    referenceNote: bench.note,
    reading: overallReading(
      ins.overall,
      ins.benchmarkAvg,
      ins.themes.map((t) => t.level),
    ),
    summary: ins.summary,
    areas: res.areas.map((a) => {
      const themes = ins.themes.filter((t) => t.area === a.code);
      return {
        code: a.code,
        name: a.name,
        short: AREA_SHORT[a.code],
        score: a.score,
        ref: bench.values[a.code],
        level: levelLabel(a.score),
        priority: a.isPriority ? a.rank : null,
        reading: areaReading(
          a.score,
          bench.values[a.code],
          themes.map((t) => t.level),
        ),
        themes,
      };
    }),
    narrative,
    nextSteps: Object.fromEntries(ins.nextSteps.map((n) => [n.area, n.steps])),
    readiness: ins.readiness.map((x) => ({
      label: x.label,
      verdict: x.verdict,
      areas: x.areas.map((c) => AREAS.find((a) => a.code === c)?.name ?? c).join(", "),
      weakest:
        x.weakest && x.verdict !== "base solida"
          ? `${x.weakest.theme.toLowerCase()} (${AREA_SHORT[x.weakest.area]}), ancora al livello «${LEVEL_NAMES[x.weakest.level - 1]}»: ${lower(x.weakest.current)}`
          : null,
    })),
    issues: ins.issueCauses.map((c) => ({
      label: c.label,
      causes: c.causes.map((t) => `${t.theme}, «${LEVEL_NAMES[t.level - 1]}»: ${lower(t.current)}`),
    })),
    numbers,
    sources,
    brand: BRAND.name,
    owner: BRAND.ownerLegal,
    reportName: BRAND.reportName,
  };
}
