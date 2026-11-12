// Elementi comuni dei PDF impaginati sul server (report del diagnostico e report dei moduli).
import path from "node:path";
import { Circle, Font, Line, Polygon, StyleSheet, Svg, Text, View } from "@react-pdf/renderer";

const FONTS = path.join(process.cwd(), "src/pdf/fonts");
Font.register({
  family: "Inter",
  fonts: [
    { src: path.join(FONTS, "inter-latin-400-normal.woff") },
    { src: path.join(FONTS, "inter-latin-400-italic.woff"), fontStyle: "italic" },
    { src: path.join(FONTS, "inter-latin-600-normal.woff"), fontWeight: 600 },
    { src: path.join(FONTS, "inter-latin-700-normal.woff"), fontWeight: 700 },
  ],
});
Font.registerHyphenationCallback((w) => [w]);

export const C = {
  navy: "#0a2a4a",
  navySoft: "#1e4470",
  ink: "#1a2433",
  muted: "#5b6573",
  line: "#d9dee5",
  paper: "#f5f7fa",
  accent: "#c8102e",
  amber: "#d99a2b",
  amberBg: "#f9eeda",
  white: "#ffffff",
};
export const LEVEL_COLORS = [C.accent, C.amber, C.navySoft, C.navy];
export const levelColor = (score: number | null) =>
  score === null ? C.line : LEVEL_COLORS[score < 25 ? 0 : score < 50 ? 1 : score < 75 ? 2 : 3];

/** Il font del PDF copre l'alfabeto latino: i pochi simboli fuori set si sostituiscono. */
export const t = (s: string | null | undefined) =>
  (s ?? "")
    .replace(/[→⇒➔]/g, "›")
    .replace(/≥/g, "almeno ")
    .replace(/≤/g, "al massimo ")
    .replace(/≈/g, "circa ")
    .replace(/[‐‑]/g, "-")
    .replace(/[^\u0000-ɏ -⁯€™↑↓−]/g, "");

export const s = StyleSheet.create({
  page: { fontFamily: "Inter", fontSize: 9.5, color: C.ink, paddingTop: 64, paddingBottom: 56, paddingHorizontal: 48, lineHeight: 1.45 },
  header: {
    position: "absolute",
    top: 24,
    left: 48,
    right: 48,
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 7.5,
    color: C.muted,
    borderBottomWidth: 0.5,
    borderBottomColor: C.line,
    paddingBottom: 6,
  },
  footer: {
    position: "absolute",
    bottom: 24,
    left: 48,
    right: 48,
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 7,
    color: C.muted,
  },
  h1: { fontSize: 18, fontWeight: 700, color: C.navy, marginBottom: 6 },
  h2: { fontSize: 13, fontWeight: 700, color: C.navy, marginTop: 18, marginBottom: 6 },
  h3: { fontSize: 10.5, fontWeight: 600, color: C.navy, marginTop: 10, marginBottom: 3 },
  eyebrow: { fontSize: 7, fontWeight: 600, letterSpacing: 1.2, color: C.muted, textTransform: "uppercase" },
  p: { marginBottom: 6 },
  muted: { color: C.muted },
  small: { fontSize: 8, color: C.muted },
  card: { borderWidth: 0.75, borderColor: C.line, borderRadius: 6, padding: 12, marginBottom: 8 },
  paper: { backgroundColor: C.paper, borderRadius: 6, padding: 12, marginBottom: 8 },
  row: { flexDirection: "row" },
  bulletRow: { flexDirection: "row", marginBottom: 3 },
  bullet: { width: 12, color: C.navySoft },
});

export function Paragraphs({ text }: { text: string }) {
  return (
    <>
      {t(text)
        .split(/\n\n+/)
        .filter(Boolean)
        .map((p, i) => (
          <Text key={i} style={s.p}>
            {p}
          </Text>
        ))}
    </>
  );
}

export function Bullets({ items, marker = "•" }: { items: string[]; marker?: string | ((i: number) => string) }) {
  return (
    <View>
      {items.map((x, i) => (
        <View key={i} style={s.bulletRow} wrap={false}>
          <Text style={s.bullet}>{typeof marker === "function" ? marker(i) : marker}</Text>
          <Text style={{ flex: 1 }}>{t(x)}</Text>
        </View>
      ))}
    </View>
  );
}

export function Chip({ label, color }: { label: string; color: string }) {
  return (
    <View style={{ backgroundColor: color, borderRadius: 8, paddingVertical: 2.5, paddingHorizontal: 6 }}>
      <Text style={{ fontSize: 7, fontWeight: 600, color: C.white, lineHeight: 1.1 }}>{label}</Text>
    </View>
  );
}

export function Bar({
  value,
  marker,
  color,
  height = 6,
}: {
  value: number | null;
  marker?: number | null;
  color: string;
  height?: number;
}) {
  return (
    <View style={{ height: height + 6, justifyContent: "center", position: "relative" }}>
      <View style={{ height, backgroundColor: C.paper, borderRadius: height / 2 }}>
        {value !== null && <View style={{ width: `${Math.max(value, 2)}%`, height, backgroundColor: color, borderRadius: height / 2 }} />}
      </View>
      {marker !== null && marker !== undefined && (
        <View
          style={{ position: "absolute", left: `${marker}%`, top: 0, width: 1, height: height + 6, backgroundColor: C.ink, opacity: 0.6 }}
        />
      )}
    </View>
  );
}

export function Dots({ level }: { level: number }) {
  return (
    <View style={{ flexDirection: "row", gap: 1.5 }}>
      {[1, 2, 3, 4].map((k) => (
        <View key={k} style={{ width: 4, height: 8, borderRadius: 1, backgroundColor: k <= level ? C.navy : C.line }} />
      ))}
    </View>
  );
}

export interface RadarItem {
  key: string;
  label: string;
  score: number | null;
  ref: number | null;
  highlight?: boolean;
}

/** Etichetta del radar su una o due righe. */
function labelLines(label: string, max = 13): string[] {
  const words = label.split(" ");
  if (label.length <= max || words.length < 2) return [label];
  let best = 1;
  let bestDiff = Infinity;
  for (let k = 1; k < words.length; k++) {
    const diff = Math.abs(words.slice(0, k).join(" ").length - words.slice(k).join(" ").length);
    if (diff < bestDiff) [best, bestDiff] = [k, diff];
  }
  return [words.slice(0, best).join(" "), words.slice(best).join(" ")];
}

/** Ottogramma: profilo a radar su 8 assi, con il riferimento tratteggiato. Più largo che alto, per le etichette. */
export function Radar({ items, size = 250 }: { items: RadarItem[]; size?: number }) {
  const width = size * 1.12;
  const cx = width / 2;
  const cy = size / 2;
  const R = size * 0.3;
  const step = 360 / items.length;
  const pt = (i: number, v: number) => {
    const a = (-90 + i * step) * (Math.PI / 180);
    // il primo anello è il livello «Informale» (0 punti): anche i profili bassi hanno una forma
    const f = (v + 100 / 3) / (400 / 3);
    return [cx + Math.cos(a) * R * f, cy + Math.sin(a) * R * f] as const;
  };
  const poly = (vals: number[]) => vals.map((v, i) => pt(i, v).join(",")).join(" ");
  const hasRef = items.some((a) => a.ref !== null);
  return (
    <Svg width={width} height={size} viewBox={`0 0 ${width} ${size}`}>
      {[0, 100 / 3, 200 / 3, 100].map((g) => (
        <Polygon key={g} points={poly(items.map(() => g))} stroke={C.line} strokeWidth={0.6} fill={g === 100 ? C.white : "none"} />
      ))}
      {items.map((_, i) => {
        const [x, y] = pt(i, 100);
        return <Line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke={C.line} strokeWidth={0.6} />;
      })}
      {hasRef && (
        <Polygon points={poly(items.map((a) => a.ref ?? 0))} stroke={C.muted} strokeWidth={0.9} strokeDasharray="3,2" fill="none" />
      )}
      <Polygon points={poly(items.map((a) => a.score ?? 0))} stroke={C.navy} strokeWidth={1.4} fill={C.navy} fillOpacity={0.15} />
      {items.map((a, i) => {
        const [x, y] = pt(i, a.score ?? 0);
        return <Circle key={a.key} cx={x} cy={y} r={2.2} fill={a.highlight ? C.accent : C.navy} />;
      })}
      {items.map((a, i) => {
        const [x, y] = pt(i, 116);
        const anchor = Math.abs(x - cx) < 4 ? "middle" : x > cx ? "start" : "end";
        const lines = labelLines(t(a.label));
        const top = y < cy - 4;
        const y0 = y + 3 - (lines.length > 1 ? (top ? 9 : Math.abs(y - cy) < 4 ? 4.5 : 0) : 0);
        return lines.map((l, k) => (
          <Text
            key={`${a.key}-${k}`}
            x={x}
            y={y0 + k * 9}
            textAnchor={anchor}
            style={{ fontSize: 7.5, fontFamily: "Inter", fontWeight: a.highlight ? 600 : 400 }}
            fill={a.highlight ? C.accent : C.ink}
          >
            {l}
          </Text>
        ));
      })}
    </Svg>
  );
}

export const cap = (x: string) => x.charAt(0).toUpperCase() + x.slice(1);
/** Fine frase senza punto doppio dopo "S.r.l." */
export const end = (x: string) => (x.endsWith(".") ? x : `${x}.`);

/** Intestazione ripetuta su ogni pagina interna. */
export function Header({ left, right }: { left: string; right: string }) {
  return (
    <View fixed style={s.header}>
      <Text>{t(left)}</Text>
      <Text>{t(right)}</Text>
    </View>
  );
}

/** Piede ripetuto su ogni pagina, con il numero di pagina. */
export function Footer({ brand, owner }: { brand: string; owner: string }) {
  return (
    <View fixed style={s.footer}>
      <Text>
        {t(brand)} è un servizio di {t(end(owner))} Autovalutazione orientativa: non è una consulenza né un rating.
      </Text>
      <PageNumber />
    </View>
  );
}

/**
 * Numero di pagina. Si genera un testo nuovo a ogni impaginazione: un testo dinamico riusato tra una pagina e l'altra
 * ricalcola ogni volta l'interlinea ereditata e la moltiplica, fino a far fallire la generazione nei documenti lunghi.
 */
export function PageNumber() {
  // il totale delle pagine arriva anche alle View dinamiche, ma i tipi della libreria non lo dichiarano
  return (
    <View
      render={(p) => (
        <Text style={{ fontSize: 7, lineHeight: 1.2 }}>{`${p.pageNumber} / ${(p as { totalPages?: number }).totalPages ?? ""}`}</Text>
      )}
    />
  );
}
