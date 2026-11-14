// Report di un modulo di approfondimento (Ottogramma dell'ambito) impaginato in PDF (A4), con lo stesso stile del report
// del diagnostico.
import { Document, Link, Page, Text, View } from "@react-pdf/renderer";
import { LEVEL_NAMES } from "@/lib/insights";
import { Bar, Bullets, C, Chip, Dots, Footer, Header, levelColor, Paragraphs, Radar, s, t } from "./kit";
import type { ModulePdfData, ModulePdfSub } from "./module-data";

function Cover({ d }: { d: ModulePdfData }) {
  const gap = d.score === null || !d.reference ? null : d.score - d.reference.value;
  return (
    <Page size="A4" style={{ fontFamily: "Inter", fontSize: 9.5, color: C.ink }}>
      <View style={{ backgroundColor: C.navy, paddingHorizontal: 48, paddingTop: 54, paddingBottom: 36, color: C.white }}>
        <Text style={{ fontSize: 9, fontWeight: 600, color: "#c9d4e3" }}>
          {t(d.brand)} · {t(d.owner)}
        </Text>
        <Text style={{ marginTop: 36, fontSize: 8, letterSpacing: 2, color: "#c9d4e3", textTransform: "uppercase" }}>
          {t(d.reportName)} dell&apos;ambito · Approfondimento
        </Text>
        <Text style={{ marginTop: 8, fontSize: 28, fontWeight: 700, lineHeight: 1.15 }}>{t(d.areaName)}</Text>
        <Text style={{ marginTop: 10, fontSize: 9.5, color: "#c9d4e3" }}>
          {t(d.company)} · {t(d.date)}
        </Text>
      </View>
      <View style={{ paddingHorizontal: 48, paddingTop: 26, flexDirection: "row", gap: 18 }}>
        <View style={{ width: 200 }}>
          <Text style={s.eyebrow}>Punteggio dell&apos;ambito</Text>
          <View style={{ flexDirection: "row", alignItems: "flex-end", marginTop: 4 }}>
            <Text style={{ fontSize: 44, fontWeight: 700, color: C.navy, lineHeight: 1 }}>{d.score ?? "—"}</Text>
            <Text style={{ fontSize: 12, color: C.muted, marginLeft: 3, marginBottom: 5 }}>/100</Text>
          </View>
          <View style={{ flexDirection: "row", marginTop: 6 }}>
            <Chip label={d.level} color={levelColor(d.score)} />
          </View>
          <View style={{ flexDirection: "row", gap: 6, marginTop: 14 }}>
            {d.diagnosticScore !== null && (
              <View style={[s.paper, { flex: 1, marginBottom: 0 }]}>
                <Text style={s.eyebrow}>Diagnostico iniziale</Text>
                <Text style={{ fontSize: 16, fontWeight: 700, color: C.navySoft, marginTop: 2 }}>{d.diagnosticScore}/100</Text>
              </View>
            )}
            {d.reference && (
              <View style={[s.paper, { flex: 1, marginBottom: 0 }]}>
                <Text style={s.eyebrow}>Riferimento</Text>
                <Text style={{ fontSize: 16, fontWeight: 700, color: C.navySoft, marginTop: 2 }}>{d.reference.value}/100</Text>
              </View>
            )}
          </View>
          {gap !== null && (
            <Text style={[s.small, { marginTop: 4 }]}>
              {Math.abs(gap) < 5
                ? "In linea con il riferimento indicativo per la fascia."
                : gap > 0
                  ? `${gap} punti sopra il riferimento indicativo per la fascia.`
                  : `${-gap} punti sotto il riferimento indicativo per la fascia.`}
            </Text>
          )}
          <Text style={[s.small, { marginTop: 8 }]}>
            Linea continua: la vostra azienda. Tratteggio: il riferimento. In rosso i due sotto-ambiti più fragili.
          </Text>
        </View>
        <View style={{ flex: 1, alignItems: "center" }}>
          <Radar
            items={d.subs.map((x) => ({ key: x.code, label: x.short, score: x.score, ref: d.reference?.value ?? null, highlight: x.weak }))}
            size={280}
          />
        </View>
      </View>
      <View style={{ paddingHorizontal: 48, marginTop: 6 }}>
        {d.reading.length > 0 && (
          <View style={[s.paper, { marginTop: 4 }]}>
            <Text style={[s.h3, { marginTop: 0 }]}>Il punteggio in parole</Text>
            {d.reading.map((x, i) => (
              <Text key={i} style={{ marginBottom: i < d.reading.length - 1 ? 4 : 0 }}>
                {t(x)}
              </Text>
            ))}
          </View>
        )}
        <Text style={s.h3}>In sintesi</Text>
        <Bullets
          marker="›"
          items={[
            ...(d.diagnosticNote ? [d.diagnosticNote] : []),
            `I sotto-ambiti più solidi: ${d.strongest.join(" e ")}.`,
            `I più fragili, da cui partire: ${d.weakest.join(" e ")}.`,
          ]}
        />
        <View style={{ flexDirection: "row", gap: 6, marginTop: 10 }}>
          {d.narrative.roadmap.map((h, i) => (
            <View
              key={h.horizon}
              style={{ flex: 1, borderLeftWidth: 2.5, borderLeftColor: C.navy, backgroundColor: C.paper, padding: 8, borderRadius: 3 }}
            >
              <Text style={s.eyebrow}>
                {i + 1} · {t(h.horizon)}
              </Text>
              <Text style={{ fontWeight: 600, color: C.navy, fontSize: 8.5, marginTop: 2 }}>{t(h.actions[0] ?? "")}</Text>
            </View>
          ))}
        </View>
      </View>
      <Footer brand={d.brand} owner={d.owner} />
    </Page>
  );
}

function Profile({ d }: { d: ModulePdfData }) {
  return (
    <View>
      <Text style={s.h2} minPresenceAhead={80}>
        Il profilo per sotto-ambito
      </Text>
      <Text style={[s.small, { marginBottom: 8 }]}>
        La barra mostra il punteggio del sotto-ambito{d.reference ? "; la tacca verticale il riferimento indicativo per la fascia" : ""}.
      </Text>
      {d.subs.map((x) => (
        <View key={x.code} wrap={false} style={{ borderBottomWidth: 0.5, borderBottomColor: C.line, paddingVertical: 7 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Text style={{ width: 150, fontWeight: 600, color: C.navy }}>
              {x.n}. {t(x.name)}
            </Text>
            <View style={{ flex: 1 }}>
              <Bar value={x.score} marker={d.reference?.value ?? null} color={levelColor(x.score)} />
            </View>
            <Text style={{ width: 22, textAlign: "right", fontWeight: 700 }}>{x.score ?? "—"}</Text>
            <View style={{ width: 76, flexDirection: "row", justifyContent: "flex-end" }}>
              <Chip label={x.level} color={levelColor(x.score)} />
            </View>
          </View>
          <Text style={[s.small, { marginTop: 3, marginLeft: 158 }]}>
            {x.weak ? "Da cui partire. " : ""}
            {t(x.reading)}
          </Text>
        </View>
      ))}
    </View>
  );
}

function SubCard({ x, reviewed }: { x: ModulePdfSub; reviewed: boolean }) {
  return (
    <View style={{ marginBottom: 14 }}>
      <View
        wrap={false}
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 10,
          backgroundColor: x.weak ? C.navy : C.paper,
          borderRadius: 6,
          paddingVertical: 9,
          paddingHorizontal: 12,
        }}
      >
        <View style={{ flex: 1 }}>
          <Text style={[s.eyebrow, { color: x.weak ? "#c9d4e3" : C.muted }]}>
            Sotto-ambito {x.n}
            {x.weak ? " · priorità" : ""}
          </Text>
          <Text style={{ fontSize: 12, fontWeight: 700, color: x.weak ? C.white : C.navy, marginTop: 1 }}>{t(x.name)}</Text>
          <Text style={{ fontSize: 8, color: x.weak ? "#c9d4e3" : C.muted, marginTop: 1 }}>{t(x.description)}</Text>
        </View>
        <View style={{ alignItems: "flex-end" }}>
          <Text style={{ fontSize: 18, fontWeight: 700, color: x.weak ? C.white : C.navy, lineHeight: 1 }}>{x.score ?? "—"}</Text>
          <View style={{ marginTop: 4 }}>
            <Chip label={x.level} color={levelColor(x.score)} />
          </View>
        </View>
      </View>
      {x.expert && (
        <View style={{ marginTop: 8 }}>
          <Text style={[s.eyebrow, { color: C.navySoft, marginBottom: 2 }]}>
            {reviewed ? "Lettura rivista da un nostro esperto" : "Lettura e interventi suggeriti"}
          </Text>
          <Paragraphs text={x.expert.diagnosis} />
          {x.expert.actions.length > 0 && <Bullets items={x.expert.actions} marker={(k) => `${k + 1}.`} />}
        </View>
      )}
      <View style={{ marginTop: 6 }}>
        {x.themes.map((th) => (
          <View key={th.id} wrap={false} style={{ borderTopWidth: 0.5, borderTopColor: C.line, paddingVertical: 5 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 3 }}>
              <Text style={{ fontWeight: 600 }}>{t(th.theme)}</Text>
              {th.level ? <Dots level={th.level} /> : <Text style={s.small}>non applicabile</Text>}
            </View>
            {(th.now || th.next) && (
              <View style={{ flexDirection: "row", gap: 8 }}>
                <View style={{ flex: 1 }}>
                  <Text style={s.eyebrow}>Oggi · {th.level ? LEVEL_NAMES[th.level - 1] : ""}</Text>
                  <Text style={{ fontSize: 8.5 }}>{t(th.now)}</Text>
                </View>
                <View style={{ flex: 1, backgroundColor: C.paper, borderRadius: 4, padding: 5 }}>
                  {th.next ? (
                    <>
                      <Text style={[s.eyebrow, { color: C.navySoft }]}>Passo successivo · {LEVEL_NAMES[th.level as number]}</Text>
                      <Text style={{ fontSize: 8.5 }}>{t(th.next)}</Text>
                    </>
                  ) : (
                    <Text style={{ fontSize: 8.5, color: C.navySoft }}>Livello più avanzato: da mantenere.</Text>
                  )}
                </View>
              </View>
            )}
            {th.flag && <Text style={{ fontSize: 8, marginTop: 4, color: C.accent }}>Da verificare: {t(th.flag)}</Text>}
          </View>
        ))}
      </View>
    </View>
  );
}

export default function ModulePdf({ d, siteUrl }: { d: ModulePdfData; siteUrl: string }) {
  const n = d.narrative;
  return (
    <Document title={`${d.reportName} · ${d.areaName} · ${d.company}`} author={d.owner} subject="Approfondimento per ambito" language="it">
      <Cover d={d} />

      <Page size="A4" style={s.page}>
        <Header left={`${d.brand} · ${d.reportName} · ${d.areaName}`} right={d.company} />
        <Text style={s.eyebrow}>{d.reviewed ? "Analisi rivista da un nostro esperto" : "Analisi"}</Text>
        <Text style={s.h1}>Sintesi</Text>
        <Paragraphs text={n.summary} />
        <Profile d={d} />

        <View break>
          <Text style={s.h1}>Sotto-ambito per sotto-ambito</Text>
          <Text style={[s.p, s.muted]}>
            Per ogni tema, la situazione che ha indicato come più vicina a quella di oggi e il passo che porta al livello successivo.
          </Text>
          {d.subs.map((x) => (
            <SubCard key={x.code} x={x} reviewed={d.reviewed} />
          ))}
        </View>

        <View break>
          <Text style={s.h1}>Piano di lavoro</Text>
          <Text style={[s.p, s.muted]}>Gli interventi in sequenza: prima le basi, poi il resto.</Text>
          <View style={{ flexDirection: "row", gap: 8, marginTop: 4 }}>
            {n.roadmap.map((h, i) => (
              <View key={h.horizon} style={[s.card, { flex: 1 }]} wrap={false}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 6 }}>
                  <View
                    style={{
                      width: 16,
                      height: 16,
                      borderRadius: 8,
                      backgroundColor: C.navy,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Text style={{ color: C.white, fontSize: 8, fontWeight: 700, lineHeight: 1 }}>{i + 1}</Text>
                  </View>
                  <Text style={{ fontWeight: 700, color: C.navy }}>{t(h.horizon)}</Text>
                </View>
                {h.actions.map((a, k) => (
                  <View key={k} style={{ flexDirection: "row", gap: 6, marginBottom: 4 }}>
                    <View style={{ width: 8, height: 8, borderWidth: 1, borderColor: C.navy, borderRadius: 1.5, marginTop: 2 }} />
                    <Text style={{ flex: 1, fontSize: 8.5 }}>{t(a)}</Text>
                  </View>
                ))}
              </View>
            ))}
          </View>

          {n.kpis.length > 0 && (
            <View wrap={false}>
              <Text style={s.h2}>Indicatori da seguire</Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
                {n.kpis.map((k) => (
                  <View key={k} style={{ width: "48.8%", backgroundColor: C.paper, borderRadius: 6, padding: 8 }}>
                    <Text style={{ fontSize: 8.5 }}>{t(k)}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          <View wrap={false} style={{ marginTop: 22, backgroundColor: C.navy, borderRadius: 6, padding: 16 }}>
            <Text style={{ fontSize: 13, fontWeight: 700, color: C.white }}>Il prossimo passo</Text>
            {n.closing ? <Text style={{ marginTop: 6, color: "#e3e9f1" }}>{t(n.closing)}</Text> : null}
            <Link
              src={`${siteUrl}/area/servizi#consulenza`}
              style={{ marginTop: 10, color: C.white, fontWeight: 600, textDecoration: "underline" }}
            >
              Prenota una consulenza con un esperto senior ›
            </Link>
          </View>
          <Text style={[s.small, { marginTop: 24 }]}>
            Autovalutazione orientativa basata sulle risposte fornite ed elaborata con la metodologia proprietaria di {t(d.owner)}: non è
            una consulenza né un rating.
          </Text>
        </View>
        <Footer brand={d.brand} owner={d.owner} />
      </Page>
    </Document>
  );
}
