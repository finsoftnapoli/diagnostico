"use client";

import { Legend, PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart, ResponsiveContainer } from "recharts";
import { AREA_SHORT, AreaIcon } from "@/lib/areaIcons";
import { AREAS } from "@/lib/questionnaire";
import { averageScores, misalignments, type MemberResult } from "@/lib/team";

const COLORS = ["#0a2a4a", "#3d6a9e", "#7fa3c9", "#5b6573", "#9aa5b4", "#1e4470"];

/** Vista dell'amministratore: profili dei colleghi sovrapposti, media e disallineamenti. */
export default function TeamView({ members }: { members: MemberResult[] }) {
  const avg = averageScores(members);
  const data = AREAS.map((a) => {
    const row: Record<string, string | number> = { area: AREA_SHORT[a.code], media: avg[a.code] };
    members.forEach((m, i) => (row[`m${i}`] = m.scores[a.code] ?? 0));
    return row;
  });
  const gaps = misalignments(members);
  return (
    <div className="grid gap-8 lg:grid-cols-[1.1fr_1fr] items-start">
      <div className="w-full aspect-square max-w-[520px] mx-auto">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={data} outerRadius="62%" margin={{ top: 8, right: 36, bottom: 8, left: 36 }}>
            <PolarGrid stroke="#d9dee5" />
            <PolarAngleAxis dataKey="area" tick={{ fontSize: 12, fill: "#5b6573" }} />
            <PolarRadiusAxis domain={[0, 100]} tickCount={5} tick={{ fontSize: 10, fill: "#8a93a0" }} axisLine={false} angle={67.5} />
            {members.map((m, i) => (
              <Radar
                key={m.id}
                name={m.label}
                dataKey={`m${i}`}
                stroke={COLORS[i % COLORS.length]}
                strokeWidth={1.5}
                fill="none"
                dot={{ r: 2, fill: COLORS[i % COLORS.length] }}
                isAnimationActive={false}
              />
            ))}
            <Radar name="Media" dataKey="media" stroke="#c8102e" strokeWidth={2} strokeDasharray="5 4" fill="none" dot={false} isAnimationActive={false} />
            <Legend iconType="plainline" wrapperStyle={{ fontSize: 12 }} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
      <div>
        <h3 className="font-semibold text-navy">Dove il management non è allineato</h3>
        {members.length < 2 ? (
          <p className="mt-2 text-sm text-muted">Il confronto compare quando almeno un collega ha completato il diagnostico.</p>
        ) : gaps.length === 0 ? (
          <p className="mt-2 text-sm text-muted">Le risposte sono allineate: su nessun tema distano più di un livello.</p>
        ) : (
          <ul className="mt-3 space-y-3">
            {gaps.map((g) => (
              <li key={g.questionId} className="rounded-lg border border-line p-3 text-sm">
                <p className="font-medium flex items-center gap-2">
                  <AreaIcon code={g.area} className="size-4 text-navy" /> {g.theme}
                  <span className="text-muted font-normal">· livelli da {g.min} a {g.max}</span>
                </p>
                <p className="mt-1 text-muted">{g.byMember.map((b) => `${b.label}: ${b.level}`).join(" · ")}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
