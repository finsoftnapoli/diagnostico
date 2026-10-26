"use client";

import { PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart, ResponsiveContainer } from "recharts";
import type { AreaResult } from "@/lib/scoring";

const SHORT: Record<string, string> = {
  STR: "Strategia",
  FIN: "Finanza",
  MKT: "Vendite",
  PER: "Persone",
  OPS: "Operations",
  DIG: "Digitale",
  INN: "Innovazione",
  SOS: "Sostenibilità",
};

export default function RadarProfile({ areas }: { areas: AreaResult[] }) {
  const data = areas.map((a) => ({ area: SHORT[a.code] ?? a.name, score: a.score ?? 0, priority: a.isPriority }));
  return (
    <div className="w-full aspect-square max-w-[520px] mx-auto">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data} outerRadius="66%" margin={{ top: 8, right: 36, bottom: 8, left: 36 }}>
          <PolarGrid stroke="#d9dee5" />
          <PolarAngleAxis
            dataKey="area"
            tick={({ x, y, payload, textAnchor, index }) => (
              <text
                x={x}
                y={y}
                textAnchor={textAnchor}
                dominantBaseline="central"
                fontSize={12}
                fontWeight={data[index]?.priority ? 700 : 400}
                fill={data[index]?.priority ? "#0a2a4a" : "#5b6573"}
              >
                {payload.value}
              </text>
            )}
          />
          <PolarRadiusAxis domain={[0, 100]} tickCount={5} tick={{ fontSize: 10, fill: "#8a93a0" }} axisLine={false} angle={67.5} />
          <Radar dataKey="score" stroke="#0a2a4a" strokeWidth={2} fill="#0a2a4a" fillOpacity={0.18} dot={{ r: 3, fill: "#0a2a4a" }} isAnimationActive={false} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
