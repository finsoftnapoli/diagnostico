// Controlli sul report prima dell'approvazione: cosa manca, cosa è fuori misura, cosa rischia di confondere il cliente.
import type { FieldSpec } from "./narrative-spec";

export interface ReviewIssue {
  level: "errore" | "attenzione";
  /** Ancora della sezione nell'editor. */
  anchor: string;
  where: string;
  message: string;
}

type Obj = Record<string, unknown>;

export const words = (s: string) => (s.trim() ? s.trim().split(/\s+/).length : 0);

const PATTERNS: { re: RegExp; message: string }[] = [
  {
    re: /\b\d{1,3}\s*(?:su 100|\/100|contro (?:un riferimento di )?\d{1,3}|punti)\b/gi,
    message: "cita punteggi come numeri: controlla che accanto ci sia il loro significato in pratiche concrete",
  },
  { re: /\b(?:garantisc\w*|certamente|sicuramente|senza dubbio)\b/gi, message: "contiene promesse o certezze: il report è orientativo" },
  {
    re: /\b(?:intelligenza artificiale|modello linguistico|ChatGPT|Claude|generat[oa] automaticamente|in quanto IA)\b/gi,
    message: "parla di AI o di generazione automatica: verifica che si riferisca all'attività del cliente e non al report",
  },
  { re: /\[[^\]]*\]|\bTODO\b|\bXX+\b|\?\?\?/g, message: "contiene un segnaposto da completare" },
];

/** Problemi del report rispetto allo schema dei campi e alle priorità attese. */
export function reviewChecks(
  spec: FieldSpec[],
  value: Obj,
  opts: { expected?: Record<string, string[]>; labels?: Record<string, string>; prefix?: string; where?: string } = {},
): ReviewIssue[] {
  const out: ReviewIssue[] = [];
  const prefix = opts.prefix ?? "";
  for (const f of spec) {
    if (f.type === "fixed") continue;
    const anchor = `${prefix}${f.key}`;
    const where = opts.where ? `${opts.where} · ${f.label}` : f.label.replace(/ \(un[oa] per riga\)$/, "");
    if (f.type === "text") {
      const text = String(value[f.key] ?? "");
      const n = words(text);
      if (!n) out.push({ level: "errore", anchor, where, message: "è vuoto" });
      else if (f.words && n < f.words[0])
        out.push({ level: "attenzione", anchor, where, message: `è breve (${n} parole, di solito almeno ${f.words[0]})` });
      else if (f.words && n > f.words[1] * 1.3)
        out.push({ level: "attenzione", anchor, where, message: `è lungo (${n} parole, di solito fino a ${f.words[1]})` });
      for (const p of PATTERNS) {
        const hits = text.match(p.re);
        if (hits) out.push({ level: "attenzione", anchor, where, message: `${p.message} («${hits[0]}»)` });
      }
    } else if (f.type === "list") {
      const items = ((value[f.key] as string[]) ?? []).map((x) => x.trim()).filter(Boolean);
      if (!items.length) out.push({ level: "errore", anchor, where, message: "non ha voci" });
      else if (f.items && items.length < f.items[0])
        out.push({ level: "attenzione", anchor, where, message: `ha ${items.length} voci (di solito almeno ${f.items[0]})` });
      for (const p of PATTERNS) {
        const hit = items.join("\n").match(p.re);
        if (hit) out.push({ level: "attenzione", anchor, where, message: `${p.message} («${hit[0]}»)` });
      }
    } else {
      const items = (value[f.key] as Obj[]) ?? [];
      if (!items.length) out.push({ level: "errore", anchor, where, message: "non ha elementi" });
      const expected = opts.expected?.[f.key];
      if (expected) {
        const have = items.map((it) => String(it[f.itemTitle] ?? ""));
        const name = (c: string) => opts.labels?.[c] ?? c;
        const missing = expected.filter((c) => !have.includes(c));
        const extra = have.filter((c) => !expected.includes(c));
        if (missing.length)
          out.push({
            level: "attenzione",
            anchor,
            where,
            message: `manca ${missing.map(name).join(", ")}, che il diagnostico indica come priorità`,
          });
        if (extra.length)
          out.push({
            level: "attenzione",
            anchor,
            where,
            message: `include ${extra.map(name).join(", ")}, che non è tra le priorità calcolate: tienilo solo se è voluto`,
          });
      }
      items.forEach((it, i) => {
        const title = opts.labels?.[String(it[f.itemTitle])] ?? String(it[f.itemTitle] ?? i + 1);
        out.push(...reviewChecks(f.fields, it, { prefix: `${anchor}-${i}-`, where: title }));
      });
    }
  }
  return out;
}
