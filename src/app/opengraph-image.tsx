import { ImageResponse } from "next/og";
import { BRAND } from "@/config/brand";

// Anteprima per social e app di messaggistica: generata al momento della build.
export const alt = `${BRAND.name} · diagnostico aziendale gratuito per PMI`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Vertici di un ottagono regolare di raggio r (per lo schema del radar). */
function octagon(cx: number, cy: number, r: number[]) {
  return r
    .map((rr, i) => {
      const a = -Math.PI / 2 + (i * Math.PI) / 4;
      return `${cx + rr * Math.cos(a)},${cy + rr * Math.sin(a)}`;
    })
    .join(" ");
}

export default function Image() {
  const full = Array(8).fill(190);
  const profile = [120, 150, 95, 165, 130, 80, 140, 110];
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: "#0a2a4a", color: "white", padding: 72 }}>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", width: 660 }}>
          <div style={{ fontSize: 30, opacity: 0.75 }}>{BRAND.name}</div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 64, fontWeight: 700, lineHeight: 1.1 }}>Diagnostico aziendale gratuito per PMI</div>
            <div style={{ marginTop: 24, fontSize: 30, opacity: 0.85, lineHeight: 1.3 }}>
              {`8 ambiti di gestione, l'${BRAND.reportName} e le tre priorità su cui intervenire`}
            </div>
          </div>
          <div style={{ fontSize: 24, opacity: 0.7 }}>{`Un servizio di ${BRAND.ownerLegal}`}</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", flex: 1 }}>
          <svg width="420" height="420" viewBox="0 0 420 420">
            <polygon points={octagon(210, 210, full)} fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="2" />
            <polygon points={octagon(210, 210, full.map((x) => x * 0.5))} fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="2" />
            <polygon points={octagon(210, 210, profile)} fill="rgba(255,255,255,0.22)" stroke="white" strokeWidth="4" />
          </svg>
        </div>
      </div>
    ),
    size,
  );
}
