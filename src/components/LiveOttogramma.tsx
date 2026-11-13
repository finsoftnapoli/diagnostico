"use client";

import { useEffect, useRef, useState } from "react";
import { AREA_SHORT } from "@/lib/areaIcons";
import type { AreaCode } from "@/lib/types";

/** Valori che raggiungono il bersaglio con una breve animazione. */
function useTween(target: number[], ms = 450): number[] {
  const [val, setVal] = useState(target);
  const from = useRef(target);
  const key = target.join(",");
  useEffect(() => {
    // con le animazioni ridotte si arriva al bersaglio al primo fotogramma
    const dur = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ? 0 : ms;
    const start = performance.now();
    const a = from.current;
    let raf = 0;
    const tick = (now: number) => {
      const t = dur ? Math.min(1, (now - start) / dur) : 1;
      const e = 1 - (1 - t) ** 3;
      const cur = target.map((v, i) => (a[i] ?? 0) + (v - (a[i] ?? 0)) * e);
      from.current = cur;
      setVal(cur);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- il bersaglio è riassunto in `key`
  }, [key, ms]);
  return val;
}

/**
 * L'Ottogramma che si disegna mentre si risponde: un vertice per ambito, alla distanza del livello medio
 * delle risposte date finora: il primo anello è il livello «Informale», il bordo «Gestito e migliorato».
 */
/** Un vertice: l'ambito del diagnostico oppure, con `label`, il sotto-ambito di un approfondimento. */
export interface LiveVertex {
  code: string;
  label?: string;
  /** Livello medio delle risposte date finora (1-4), null se nessuna. */
  level: number | null;
  done: boolean;
}

export default function LiveOttogramma({
  areas,
  active,
  size = 300,
  labels = true,
}: {
  areas: LiveVertex[];
  active?: string | null;
  size?: number;
  labels?: boolean;
}) {
  const n = areas.length;
  // `size` è il diametro del grafico; le etichette stanno nei margini, più larghi ai lati
  const padX = labels ? 82 : 6;
  const padY = labels ? 24 : 6;
  const R = size / 2;
  const w = size + padX * 2;
  const h = size + padY * 2;
  const cx = w / 2;
  const cy = h / 2;
  const values = useTween(areas.map((a) => (a.level === null ? 0 : a.level / 4)));
  const pt = (i: number, f: number) => {
    const ang = (-90 + (360 / n) * i) * (Math.PI / 180);
    return [cx + Math.cos(ang) * R * f, cy + Math.sin(ang) * R * f] as const;
  };
  const ring = (f: number) => areas.map((_, i) => pt(i, f).join(",")).join(" ");
  const started = areas.some((a) => a.level !== null);
  const done = areas.filter((a) => a.done).length;

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      width="100%"
      style={{ maxWidth: w }}
      role="img"
      aria-label={`Ottogramma in costruzione: ${done} vertici su ${n} completati`}
    >
      {[0.25, 0.5, 0.75, 1].map((f) => (
        <polygon key={f} points={ring(f)} fill={f === 1 ? "var(--white)" : "none"} stroke="var(--line)" strokeWidth={1} />
      ))}
      {areas.map((a, i) => {
        const [x, y] = pt(i, 1);
        return <line key={a.code} x1={cx} y1={cy} x2={x} y2={y} stroke="var(--line)" strokeWidth={1} />;
      })}
      {started && (
        <polygon
          points={values.map((v, i) => pt(i, v).join(",")).join(" ")}
          fill="var(--navy)"
          fillOpacity={0.16}
          stroke="var(--navy)"
          strokeWidth={2}
          strokeLinejoin="round"
        />
      )}
      {areas.map((a, i) => {
        if (a.level === null) return null;
        const [x, y] = pt(i, values[i]);
        return (
          <circle
            key={a.code}
            cx={x}
            cy={y}
            r={a.code === active ? 5 : 3.5}
            fill={a.done ? "var(--navy)" : "var(--white)"}
            stroke="var(--navy)"
            strokeWidth={2}
          />
        );
      })}
      {labels &&
        areas.map((a, i) => {
          const [x, y] = pt(i, 1.1);
          const anchor = Math.abs(x - cx) < 6 ? "middle" : x > cx ? "start" : "end";
          const on = a.code === active;
          // le etichette lunghe (i sotto-ambiti degli approfondimenti) vanno su due righe
          const text = a.label ?? AREA_SHORT[a.code as AreaCode];
          const words = text.split(" ");
          const cut = Math.ceil(words.length / 2);
          const lines = text.length > 13 && words.length > 1 ? [words.slice(0, cut).join(" "), words.slice(cut).join(" ")] : [text];
          return (
            <text
              key={a.code}
              x={x}
              y={y + 4 - (lines.length - 1) * 6}
              textAnchor={anchor}
              fontSize={11}
              fontWeight={on ? 700 : a.done ? 600 : 400}
              fill={on ? "var(--navy)" : a.done ? "var(--ink)" : "var(--muted)"}
            >
              {lines.map((l, k) => (
                <tspan key={k} x={x} dy={k === 0 ? 0 : 12}>
                  {l}
                </tspan>
              ))}
            </text>
          );
        })}
    </svg>
  );
}
