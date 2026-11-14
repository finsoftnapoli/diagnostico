// Report del diagnostico impaginato in PDF (A4), generato sul server con @react-pdf/renderer.
import { Document, Link, Page, Text, View } from "@react-pdf/renderer";
import { LEVEL_NAMES } from "@/lib/insights";
import { LEVEL_DESCRIPTIONS } from "@/lib/score-meaning";
import {
  Bar,
  Bullets,
  C,
  cap,
  Chip,
  Dots,
  Footer as BaseFooter,
  Header as BaseHeader,
  LEVEL_COLORS,
  levelColor,
  Paragraphs,
  Radar,
  s,
  t,
} from "./kit";
import type { ReportPdfData } from "./report-data";

const Header = ({ d }: { d: ReportPdfData }) => <BaseHeader left={`${d.brand} · ${d.reportName}`} right={d.company} />;
const Footer = ({ d }: { d: ReportPdfData }) => <BaseFooter brand={d.brand} owner={d.owner} />;

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
          <Radar
            items={d.areas.map((a) => ({ key: a.code, label: a.short, score: a.score, ref: a.ref, highlight: !!a.priority }))}
            size={280}
          />
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
      <Footer d={d} />
    </Page>
  );
}

function HowToRead({ d }: { d: ReportPdfData }) {
  return (
    <View>
      <Text style={s.h1}>Come leggere questo report</Text>
      <Text style={s.p}>
        Per ciascuno dei 24 temi del diagnostico ha scelto la situazione più vicina a quella di oggi, tra quattro livelli di maturità. I
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
      <Text style={s.h2}>Il profilo per ambito</Text>
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
        Gli ambiti in cui il divario dal livello più alto e il legame con le vostre ambizioni e sfide sono maggiori, con l&apos;analisi e le
        azioni suggerite.
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
      <Text style={[s.p, s.muted]}>Per ogni tema, la situazione che ha indicato come più vicina a quella di oggi.</Text>
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
          <Text style={s.eyebrow}>{d.reviewed ? "Analisi rivista da un nostro esperto" : "Analisi"}</Text>
          <Text style={s.h1}>Sintesi per la direzione</Text>
          {d.sources.length > 0 && <Text style={[s.small, { marginBottom: 6 }]}>Tiene conto anche di: {t(d.sources.join(", "))}.</Text>}
          <Paragraphs text={n.executiveSummary} />
          <Text style={s.h2}>Lettura d&apos;insieme</Text>
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
              <Text style={s.h2}>Quanto l&apos;azienda è pronta per le sue ambizioni</Text>
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
              <Text style={s.h2}>Le sfide: dove possono nascere</Text>
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
          <View wrap={false}>
            <Text style={[s.h1, { marginTop: 22 }]}>I numeri dell&apos;ultimo bilancio{d.numbers.year ? ` (${d.numbers.year})` : ""}</Text>
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
            Scopra i servizi nella Sua area personale ›
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
