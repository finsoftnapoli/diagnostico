// Report del diagnostico impaginato in PDF (A4), generato sul server con @react-pdf/renderer.
import path from "node:path";
import { Circle, Document, Font, Line, Link, Page, Polygon, StyleSheet, Svg, Text, View } from "@react-pdf/renderer";
import { LEVEL_NAMES } from "@/lib/insights";
import { LEVEL_DESCRIPTIONS } from "@/lib/score-meaning";
import type { PdfArea, ReportPdfData } from "./report-data";

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

const C = {
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
const LEVEL_COLORS = [C.accent, C.amber, C.navySoft, C.navy];
const levelColor = (score: number | null) => (score === null ? C.line : LEVEL_COLORS[score < 25 ? 0 : score < 50 ? 1 : score < 75 ? 2 : 3]);

/** Il font del PDF copre l'alfabeto latino: i pochi simboli fuori set si sostituiscono. */
const t = (s: string | null | undefined) =>
  (s ?? "")
    .replace(/[→⇒➔]/g, "›")
    .replace(/≥/g, "almeno ")
    .replace(/≤/g, "al massimo ")
    .replace(/≈/g, "circa ")
    .replace(/[‐‑]/g, "-")
    .replace(/[^\u0000-ɏ -⁯€™↑↓−]/g, "");

const s = StyleSheet.create({
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

function Paragraphs({ text }: { text: string }) {
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

function Bullets({ items, marker = "•" }: { items: string[]; marker?: string | ((i: number) => string) }) {
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

function Chip({ label, color }: { label: string; color: string }) {
  return (
    <View style={{ backgroundColor: color, borderRadius: 8, paddingVertical: 2.5, paddingHorizontal: 6 }}>
      <Text style={{ fontSize: 7, fontWeight: 600, color: C.white, lineHeight: 1.1 }}>{label}</Text>
    </View>
  );
}

function Bar({ value, marker, color, height = 6 }: { value: number | null; marker?: number | null; color: string; height?: number }) {
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

function Dots({ level }: { level: number }) {
  return (
    <View style={{ flexDirection: "row", gap: 1.5 }}>
      {[1, 2, 3, 4].map((k) => (
        <View key={k} style={{ width: 4, height: 8, borderRadius: 1, backgroundColor: k <= level ? C.navy : C.line }} />
      ))}
    </View>
  );
}

/** Ottogramma: profilo a radar sugli 8 ambiti, con il riferimento tratteggiato. */
function Radar({ areas, size = 250 }: { areas: PdfArea[]; size?: number }) {
  const cx = size / 2;
  const cy = size / 2;
  const R = size * 0.29;
  const pt = (i: number, v: number) => {
    const a = (-90 + i * 45) * (Math.PI / 180);
    return [cx + Math.cos(a) * R * (v / 100), cy + Math.sin(a) * R * (v / 100)] as const;
  };
  const poly = (vals: number[]) => vals.map((v, i) => pt(i, v).join(",")).join(" ");
  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {[25, 50, 75, 100].map((g) => (
        <Polygon key={g} points={poly(areas.map(() => g))} stroke={C.line} strokeWidth={0.6} fill={g === 100 ? C.white : "none"} />
      ))}
      {areas.map((_, i) => {
        const [x, y] = pt(i, 100);
        return <Line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke={C.line} strokeWidth={0.6} />;
      })}
      <Polygon points={poly(areas.map((a) => a.ref))} stroke={C.muted} strokeWidth={0.9} strokeDasharray="3,2" fill="none" />
      <Polygon points={poly(areas.map((a) => a.score ?? 0))} stroke={C.navy} strokeWidth={1.4} fill={C.navy} fillOpacity={0.15} />
      {areas.map((a, i) => {
        const [x, y] = pt(i, a.score ?? 0);
        return <Circle key={a.code} cx={x} cy={y} r={2.2} fill={a.priority ? C.accent : C.navy} />;
      })}
      {areas.map((a, i) => {
        const [x, y] = pt(i, 118);
        const anchor = Math.abs(x - cx) < 4 ? "middle" : x > cx ? "start" : "end";
        return (
          <Text
            key={a.code}
            x={x}
            y={y + 3}
            textAnchor={anchor}
            style={{ fontSize: 7.5, fontFamily: "Inter" }}
            fill={a.priority ? C.accent : C.ink}
          >
            {a.short}
          </Text>
        );
      })}
    </Svg>
  );
}

function Header({ d }: { d: ReportPdfData }) {
  return (
    <View fixed style={s.header}>
      <Text>
        {t(d.brand)} · {t(d.reportName)}
      </Text>
      <Text>{t(d.company)}</Text>
    </View>
  );
}

function Footer({ d }: { d: ReportPdfData }) {
  return (
    <View fixed style={s.footer}>
      <Text>
        {t(d.brand)} è un servizio di {t(end(d.owner))} Autovalutazione orientativa: non è una consulenza né un rating.
      </Text>
      <Text render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
    </View>
  );
}

function Cover({ d }: { d: ReportPdfData }) {
  const gap = d.overall === null ? null : d.overall - d.reference;
  return (
    <Page size="A4" style={{ fontFamily: "Inter", fontSize: 9.5, color: C.ink }}>
      <View style={{ backgroundColor: C.navy, paddingHorizontal: 48, paddingTop: 54, paddingBottom: 36, color: C.white }}>
        <Text style={{ fontSize: 9, fontWeight: 600, color: "#c9d4e3" }}>
          {t(d.brand)} · {t(d.owner)}
        </Text>
        <Text style={{ marginTop: 36, fontSize: 8, letterSpacing: 2, color: "#c9d4e3", textTransform: "uppercase" }}>
          {t(d.reportName)} · Report di diagnostico gestionale
        </Text>
        <Text style={{ marginTop: 8, fontSize: 28, fontWeight: 700, lineHeight: 1.15 }}>{t(d.company)}</Text>
        <Text style={{ marginTop: 10, fontSize: 9.5, color: "#c9d4e3" }}>{t([d.date, ...d.meta].join(" · "))}</Text>
      </View>
      <View style={{ paddingHorizontal: 48, paddingTop: 26, flexDirection: "row", gap: 18 }}>
        <View style={{ width: 200 }}>
          <Text style={s.eyebrow}>Punteggio complessivo</Text>
          <View style={{ flexDirection: "row", alignItems: "flex-end", marginTop: 4 }}>
            <Text style={{ fontSize: 44, fontWeight: 700, color: C.navy, lineHeight: 1 }}>{d.overall ?? "—"}</Text>
            <Text style={{ fontSize: 12, color: C.muted, marginLeft: 3, marginBottom: 5 }}>/100</Text>
          </View>
          <View style={{ flexDirection: "row", marginTop: 6 }}>
            <Chip label={d.overallLevel} color={levelColor(d.overall)} />
          </View>
          <Text style={{ marginTop: 8, fontSize: 9 }}>{t(cap(d.overallEquivalent))}.</Text>
          <View style={[s.paper, { marginTop: 14 }]}>
            <Text style={s.eyebrow}>{t(d.referenceLabel)}</Text>
            <Text style={{ fontSize: 18, fontWeight: 700, color: C.navySoft, marginTop: 2 }}>{d.reference}/100</Text>
            {gap !== null && (
              <Text style={s.small}>
                {Math.abs(gap) < 5
                  ? "In linea con il riferimento"
                  : gap > 0
                    ? `Sopra il riferimento di ${gap} punti`
                    : `Sotto il riferimento di ${-gap} punti`}
              </Text>
            )}
          </View>
          <Text style={[s.small, { marginTop: 6 }]}>
            Linea continua: la vostra azienda. Tratteggio: il riferimento. In rosso le tre priorità.
          </Text>
        </View>
        <View style={{ flex: 1, alignItems: "center" }}>
          <Radar areas={d.areas} size={280} />
        </View>
      </View>
      <View style={{ paddingHorizontal: 48, marginTop: 6 }}>
        <Text style={s.h3}>In sintesi</Text>
        <Bullets items={d.summary} marker="›" />
        {d.narrative.priorities.length > 0 && (
          <View style={{ flexDirection: "row", gap: 6, marginTop: 10 }}>
            {d.narrative.priorities.map((p, i) => (
              <View
                key={p.area}
                style={{ flex: 1, borderLeftWidth: 2.5, borderLeftColor: C.accent, backgroundColor: C.paper, padding: 8, borderRadius: 3 }}
              >
                <Text style={s.eyebrow}>
                  Priorità {i + 1} · {t(d.areas.find((a) => a.code === p.area)?.short ?? p.area)}
                </Text>
                <Text style={{ fontWeight: 600, color: C.navy, fontSize: 9, marginTop: 2 }}>{t(p.title)}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
      <View fixed style={[s.footer, { left: 48, right: 48 }]}>
        <Text>
          {t(d.brand)} è un servizio di {t(end(d.owner))} Autovalutazione orientativa: non è una consulenza né un rating.
        </Text>
        <Text render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
      </View>
    </Page>
  );
}

const cap = (x: string) => x.charAt(0).toUpperCase() + x.slice(1);
/** Fine frase senza punto doppio dopo "S.r.l." */
const end = (x: string) => (x.endsWith(".") ? x : `${x}.`);

function HowToRead({ d }: { d: ReportPdfData }) {
  return (
    <View>
      <Text style={s.h1}>Come leggere questo report</Text>
      <Text style={s.p}>
        Per ciascuno dei 24 temi del diagnostico avete scelto la situazione più vicina a quella di oggi, tra quattro livelli di maturità. I
        punteggi da 0 a 100 riassumono quanto le pratiche dell&apos;azienda sono avanti lungo questa scala: 0 vuol dire che tutte sono al
        primo livello, 100 che tutte sono al più avanzato.
      </Text>
      <View style={{ flexDirection: "row", gap: 6, marginTop: 4, marginBottom: 10 }}>
        {LEVEL_NAMES.map((n, i) => (
          <View
            key={n}
            style={{ flex: 1, borderTopWidth: 3, borderTopColor: LEVEL_COLORS[i], backgroundColor: C.paper, padding: 8, borderRadius: 4 }}
          >
            <Text style={{ fontSize: 7, color: C.muted }}>Livello {i + 1}</Text>
            <Text style={{ fontWeight: 600, color: C.navy, marginBottom: 3 }}>{n}</Text>
            <Text style={{ fontSize: 8, color: C.ink }}>{LEVEL_DESCRIPTIONS[i]}</Text>
          </View>
        ))}
      </View>
      <Text style={s.h3}>Il vostro punteggio in parole</Text>
      {d.reading.map((x, i) => (
        <Text key={i} style={s.p}>
          {t(x)}
        </Text>
      ))}
      <Text style={[s.small, { marginTop: 2 }]}>{t(d.referenceNote)}</Text>
    </View>
  );
}

function Profile({ d }: { d: ReportPdfData }) {
  return (
    <View>
      <Text style={s.h2} minPresenceAhead={80}>
        Il profilo per ambito
      </Text>
      <Text style={[s.small, { marginBottom: 8 }]}>
        La barra mostra il punteggio dell&apos;ambito; la tacca verticale il riferimento della vostra fascia.
      </Text>
      {d.areas.map((a) => (
        <View key={a.code} wrap={false} style={{ borderBottomWidth: 0.5, borderBottomColor: C.line, paddingVertical: 7 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Text style={{ width: 150, fontWeight: 600, color: C.navy }}>{t(a.name)}</Text>
            <View style={{ flex: 1 }}>
              <Bar value={a.score} marker={a.ref} color={levelColor(a.score)} />
            </View>
            <Text style={{ width: 22, textAlign: "right", fontWeight: 700 }}>{a.score ?? "—"}</Text>
            <View style={{ width: 76, flexDirection: "row", justifyContent: "flex-end" }}>
              <Chip label={a.level} color={levelColor(a.score)} />
            </View>
          </View>
          <Text style={[s.small, { marginTop: 3, marginLeft: 158 }]}>
            {a.priority ? `Priorità ${a.priority}. ` : ""}
            {t(a.reading)}
          </Text>
        </View>
      ))}
    </View>
  );
}

function Priorities({ d }: { d: ReportPdfData }) {
  return (
    <View>
      <Text style={s.h1}>Le priorità e da dove partire</Text>
      <Text style={[s.p, s.muted]}>
        Gli ambiti in cui il divario dal livello più alto e il legame con le vostre ambizioni e sfide sono maggiori, con l&apos;analisi dei
        nostri esperti e le azioni suggerite.
      </Text>
      {d.narrative.priorities.map((p, i) => {
        const area = d.areas.find((a) => a.code === p.area);
        const steps = d.nextSteps[p.area] ?? [];
        return (
          <View key={p.area} style={{ marginTop: 10 }} break={i > 0}>
            <View style={{ backgroundColor: C.navy, borderRadius: 6, padding: 12, color: C.white }} wrap={false}>
              <Text style={{ fontSize: 7.5, letterSpacing: 1.2, color: "#c9d4e3", textTransform: "uppercase" }}>
                Priorità {i + 1} · {t(area?.name ?? p.area)}
              </Text>
              <Text style={{ fontSize: 14, fontWeight: 700, marginTop: 3 }}>{t(p.title)}</Text>
              {area && <Text style={{ fontSize: 8.5, color: "#c9d4e3", marginTop: 4 }}>{t(area.reading)}</Text>}
            </View>
            <Text style={s.h3}>Perché conta per voi</Text>
            <Paragraphs text={p.diagnosis} />
            <Text style={s.h3}>Le azioni suggerite</Text>
            <Bullets items={p.actions} marker={(k) => `${k + 1}.`} />
            {steps.length > 0 && (
              <View style={{ marginTop: 8 }}>
                <Text style={s.h3}>Da dove partire</Text>
                {steps.map((st) => (
                  <View key={st.id} style={[s.card, { flexDirection: "row", gap: 10 }]} wrap={false}>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontWeight: 600, marginBottom: 3 }}>{t(st.theme)}</Text>
                      <Text style={s.eyebrow}>Oggi · {LEVEL_NAMES[st.level - 1]}</Text>
                      <Text style={{ fontSize: 8.5 }}>{t(st.current)}</Text>
                    </View>
                    {st.next && (
                      <View style={{ flex: 1, backgroundColor: C.paper, borderRadius: 4, padding: 6 }}>
                        <Text style={[s.eyebrow, { color: C.navySoft }]}>Passo successivo · {LEVEL_NAMES[st.level]}</Text>
                        <Text style={{ fontSize: 8.5 }}>{t(st.next)}</Text>
                      </View>
                    )}
                  </View>
                ))}
              </View>
            )}
          </View>
        );
      })}
    </View>
  );
}

function ThemeDetail({ d }: { d: ReportPdfData }) {
  return (
    <View>
      <Text style={s.h1}>Dettaglio per ambito e tema</Text>
      <Text style={[s.p, s.muted]}>Per ogni tema, la situazione che avete indicato come più vicina a quella di oggi.</Text>
      {d.areas.map((a) => (
        <View key={a.code} style={{ marginTop: 8 }} wrap={false}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <Text style={{ fontWeight: 700, color: C.navy, fontSize: 10.5 }}>{t(a.name)}</Text>
            <Text style={{ color: C.muted }}>{a.score ?? "—"}/100</Text>
            <Chip label={a.level} color={levelColor(a.score)} />
          </View>
          {a.themes.map((th) => (
            <View key={th.id} style={{ flexDirection: "row", gap: 8, paddingVertical: 3, borderTopWidth: 0.5, borderTopColor: C.line }}>
              <Text style={{ width: 130, fontWeight: 600 }}>{t(th.theme)}</Text>
              <View style={{ paddingTop: 2 }}>
                <Dots level={th.level} />
              </View>
              <Text style={{ flex: 1, fontSize: 8.5 }}>{t(th.current)}</Text>
            </View>
          ))}
        </View>
      ))}
    </View>
  );
}

export default function ReportPdf({ d, siteUrl }: { d: ReportPdfData; siteUrl: string }) {
  const n = d.narrative;
  return (
    <Document title={`${d.reportName} · ${d.company}`} author={d.owner} subject="Report di diagnostico gestionale" language="it">
      <Cover d={d} />

      <Page size="A4" style={s.page}>
        <Header d={d} />
        <HowToRead d={d} />
        <View break>
          <Text style={s.eyebrow}>Analisi dei nostri esperti</Text>
          <Text style={s.h1}>Sintesi per la direzione</Text>
          {d.sources.length > 0 && <Text style={[s.small, { marginBottom: 6 }]}>Tiene conto anche di: {t(d.sources.join(", "))}.</Text>}
          <Paragraphs text={n.executiveSummary} />
          <Text style={s.h2} minPresenceAhead={60}>
            Lettura d&apos;insieme
          </Text>
          <Paragraphs text={n.crossCutting} />
        </View>
        <View break>
          <Profile d={d} />
        </View>
        <View break>
          <Priorities d={d} />
        </View>
        <View break>
          <Text style={s.h1}>Interventi rapidi</Text>
          <Text style={[s.p, s.muted]}>Azioni a basso costo da avviare nelle prossime settimane.</Text>
          {n.quickWins.map((q, i) => (
            <View key={i} style={[s.card, { flexDirection: "row", gap: 8 }]} wrap={false}>
              <View style={{ width: 10, height: 10, borderWidth: 1, borderColor: C.navy, borderRadius: 2, marginTop: 1.5 }} />
              <Text style={{ flex: 1 }}>{t(q)}</Text>
            </View>
          ))}

          {d.readiness.length > 0 && (
            <View>
              <Text style={s.h2} minPresenceAhead={80}>
                Quanto l&apos;azienda è pronta per le sue ambizioni
              </Text>
              {d.readiness.map((x) => (
                <View key={x.label} style={[s.card]} wrap={false}>
                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                    <Text style={{ fontWeight: 600, flex: 1 }}>{t(x.label)}</Text>
                    <Chip
                      label={x.verdict}
                      color={x.verdict === "base solida" ? C.navy : x.verdict === "da rafforzare" ? C.amber : C.accent}
                    />
                  </View>
                  <Text style={s.small}>Ambiti coinvolti: {t(x.areas)}.</Text>
                  {x.weakest && <Text style={{ fontSize: 8.5, marginTop: 2 }}>Il punto più debole: {t(x.weakest)}</Text>}
                </View>
              ))}
            </View>
          )}

          {d.issues.length > 0 && (
            <View>
              <Text style={s.h2} minPresenceAhead={80}>
                Le sfide: dove possono nascere
              </Text>
              {d.issues.map((x) => (
                <View key={x.label} style={{ marginBottom: 6 }} wrap={false}>
                  <Text style={{ fontWeight: 600, marginBottom: 2 }}>{t(x.label)}</Text>
                  <Bullets items={x.causes} />
                </View>
              ))}
            </View>
          )}
        </View>

        {d.numbers && (
          <View break>
            <Text style={s.h1}>I numeri dell&apos;ultimo bilancio{d.numbers.year ? ` (${d.numbers.year})` : ""}</Text>
            <Text style={[s.p, s.muted]}>
              Dati letti dal bilancio caricato. Le soglie di lettura sono generali e vanno adattate al settore.
            </Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
              {d.numbers.tiles.map(([label, value, sub]) => (
                <View key={label} style={{ width: "32%", borderWidth: 0.75, borderColor: C.line, borderRadius: 6, padding: 8 }}>
                  <Text style={s.eyebrow}>{label}</Text>
                  <Text style={{ fontSize: 13, fontWeight: 700, color: C.navy, marginTop: 2 }}>{t(value)}</Text>
                  {sub ? <Text style={s.small}>{t(sub)}</Text> : null}
                </View>
              ))}
            </View>
            {d.numbers.notes.length > 0 && (
              <View style={{ marginTop: 8 }}>
                <Bullets items={d.numbers.notes} marker="›" />
              </View>
            )}
          </View>
        )}

        <View break>
          <ThemeDetail d={d} />
        </View>

        <View break>
          <Text style={s.h1}>Il prossimo passo</Text>
          <Paragraphs text={n.closing} />
          <View style={{ flexDirection: "row", gap: 8, marginTop: 10 }} wrap={false}>
            <View style={[s.paper, { flex: 1 }]}>
              <Text style={{ fontWeight: 700, color: C.navy }}>Approfondimento per ambito</Text>
              <Text style={{ fontSize: 8.5, marginTop: 3 }}>
                L&apos;{d.reportName} dell&apos;ambito: 8 sotto-ambiti esaminati nel dettaglio, con un piano di lavoro a 3, 6 e 12 mesi e
                gli indicatori da seguire.
              </Text>
            </View>
            <View style={[s.paper, { flex: 1 }]}>
              <Text style={{ fontWeight: 700, color: C.navy }}>Consulenza con un esperto senior</Text>
              <Text style={{ fontSize: 8.5, marginTop: 3 }}>
                Un&apos;ora in videochiamata per trasformare le priorità in un piano, con tempi e responsabili.
              </Text>
            </View>
          </View>
          <Link src={`${siteUrl}/area/servizi`} style={{ marginTop: 8, color: C.navySoft, fontWeight: 600 }}>
            Scopri i servizi nella vostra area personale ›
          </Link>
          <Text style={[s.small, { marginTop: 24 }]}>
            Autovalutazione orientativa basata sulle risposte fornite ed elaborata con la metodologia proprietaria di {t(d.owner)} e non è
            una consulenza né un rating. Le risposte sono usate anche, in forma anonima e aggregata, per confronti tra aziende e finalità di
            ricerca.
          </Text>
        </View>
        <Footer d={d} />
      </Page>
    </Document>
  );
}
