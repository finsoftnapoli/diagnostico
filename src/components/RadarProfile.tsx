"use client";

import { LEVEL_NAMES } from "@/lib/levels";
import { Legend, PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart, ResponsiveContainer } from "recharts";
import { AREA_SHORT } from "@/lib/areaIcons";
import type { AreaResult } from "@/lib/scoring";
import type { AreaCode } from "@/lib/types";

/** Vertice generico dell'Ottogramma (per esempio i sotto-ambiti di un modulo). */
export interface RadarItem {
  label: string;
  score: number | null;
  ref?: number | null;
  highlight?: boolean;
}

export default function RadarProfile({
  areas,
  items,
  reference,
  referenceLabel,
  fontSize = 12,
  selected,
  onSelect,
}: {
  /** Vertice scelto e funzione chiamata quando si tocca il nome di un vertice: rende il grafico esplorabile. */
  selected?: number;
  onSelect?: (index: number) => void;
  areas?: AreaResult[];
  /** In alternativa agli ambiti del diagnostico: vertici con etichetta e riferimento propri. */
  items?: RadarItem[];
  reference?: Record<AreaCode, number>;
  referenceLabel?: string;
  fontSize?: number;
}) {
  const data = items
    ? items.map((i) => ({
        area: i.label,
        score: i.score ?? 0,
        ref: i.ref ?? null,
        priority: !!i.highlight,
      }))
    : (areas ?? []).map((a) => ({
        area: AREA_SHORT[a.code],
        score: a.score ?? 0,
        ref: reference?.[a.code] ?? null,
        priority: a.isPriority,
      }));
  const hasRef = items ? items.some((i) => i.ref != null) : !!reference;
  return (
    <div className="w-full aspect-[6/5] max-w-[560px] mx-auto">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data} outerRadius="76%" margin={{ top: 16, right: 36, bottom: 4, left: 36 }}>
          <PolarGrid stroke="#d9dee5" />
          <PolarAngleAxis
            dataKey="area"
            tick={({ x, y, payload, textAnchor, index }) => {
              // etichette lunghe su due righe
              const words = String(payload.value).split(" ");
              const lines =
                String(payload.value).length > 14 && words.length > 1
                  ? [words.slice(0, Math.ceil(words.length / 2)).join(" "), words.slice(Math.ceil(words.length / 2)).join(" ")]
                  : [String(payload.value)];
              return (
                <text
                  x={x}
                  y={y}
                  textAnchor={textAnchor}
                  dominantBaseline="central"
                  fontSize={fontSize}
                  fontWeight={data[index]?.priority || selected === index ? 700 : 400}
                  fill={data[index]?.priority || selected === index ? "#0a2a4a" : "#5b6573"}
                  textDecoration={selected === index ? "underline" : undefined}
                  onClick={onSelect ? () => onSelect(index) : undefined}
                  onKeyDown={onSelect ? (e) => (e.key === "Enter" || e.key === " ") && onSelect(index) : undefined}
                  tabIndex={onSelect ? 0 : undefined}
                  role={onSelect ? "button" : undefined}
                  style={onSelect ? { cursor: "pointer" } : undefined}
                >
                  {lines.map((l, i) => (
                    <tspan key={i} x={x} dy={i === 0 ? (lines.length > 1 ? -fontSize * 0.55 : 0) : fontSize * 1.1}>
                      {l}
                    </tspan>
                  ))}
                </text>
              );
            }}
          />
          {/* il primo anello è il livello «Informale» (0 punti), il bordo «Gestito e migliorato» (100): anche i profili bassi hanno una forma */}
          <PolarRadiusAxis
            domain={[-100 / 3, 100]}
            ticks={[0, 100 / 3, 200 / 3, 100] as unknown as number[]}
            tick={({ x, y, payload }) => {
              const name = LEVEL_NAMES[Math.round(Number(payload.value) / (100 / 3))]?.split(" ")[0] ?? "";
              if (!name) return <g />;
              // testo orizzontale, scuro, con alone bianco: si legge sopra la griglia e la linea di riferimento
              return (
                <text
                  x={Number(x) - 4}
                  y={y}
                  textAnchor="end"
                  dominantBaseline="central"
                  fontSize={Math.max(11, fontSize - 1)}
                  fontWeight={600}
                  fill="#3d4756"
                  stroke="#ffffff"
                  strokeWidth={3.5}
                  strokeLinejoin="round"
                  paintOrder="stroke"
                >
                  {name}
                </text>
              );
            }}
            axisLine={false}
            angle={67.5}
          />
          {hasRef && (
            <Radar
              name={referenceLabel ?? "Riferimento"}
              dataKey="ref"
              stroke="#8a93a0"
              strokeWidth={1.5}
              strokeDasharray="5 4"
              fill="none"
              dot={false}
              isAnimationActive={false}
            />
          )}
          <Radar
            name="La vostra azienda"
            dataKey="score"
            stroke="#0a2a4a"
            strokeWidth={2}
            fill="#0a2a4a"
            fillOpacity={0.16}
            dot={{ r: 3, fill: "#0a2a4a" }}
            isAnimationActive={false}
          />
          {hasRef && <Legend iconType="plainline" wrapperStyle={{ fontSize: 12, color: "#5b6573" }} />}
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
