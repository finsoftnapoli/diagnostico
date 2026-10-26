"use client";

import { Legend, PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart, ResponsiveContainer } from "recharts";
import { AREA_SHORT } from "@/lib/areaIcons";
import type { AreaResult } from "@/lib/scoring";
import type { AreaCode } from "@/lib/types";

export default function RadarProfile({
  areas,
  reference,
  referenceLabel,
}: {
  areas: AreaResult[];
  reference?: Record<AreaCode, number>;
  referenceLabel?: string;
}) {
  const data = areas.map((a) => ({
    area: AREA_SHORT[a.code],
    score: a.score ?? 0,
    ref: reference?.[a.code] ?? null,
    priority: a.isPriority,
  }));
  return (
    <div className="w-full aspect-square max-w-[540px] mx-auto">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data} outerRadius="64%" margin={{ top: 8, right: 36, bottom: 8, left: 36 }}>
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
          {reference && (
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
            name="La tua azienda"
            dataKey="score"
            stroke="#0a2a4a"
            strokeWidth={2}
            fill="#0a2a4a"
            fillOpacity={0.16}
            dot={{ r: 3, fill: "#0a2a4a" }}
            isAnimationActive={false}
          />
          {reference && <Legend iconType="plainline" wrapperStyle={{ fontSize: 12, color: "#5b6573" }} />}
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
