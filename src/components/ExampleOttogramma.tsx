"use client";

import { useEffect, useState } from "react";
import type { LiveArea } from "@/lib/flow";
import { AREAS } from "@/lib/questionnaire";
import LiveOttogramma from "./LiveOttogramma";

/** Profilo di fantasia, solo per mostrare come si presenta l'Ottogramma. */
const EXAMPLE = [2.7, 2.0, 3.0, 2.3, 1.7, 2.0, 2.3, 1.3];

/** Ottogramma di esempio per la pagina iniziale: i vertici compaiono uno dopo l'altro, come durante la compilazione. */
export default function ExampleOttogramma({ size = 300 }: { size?: number }) {
  const [shown, setShown] = useState(0);
  useEffect(() => {
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      const all = setTimeout(() => setShown(AREAS.length), 0);
      return () => clearTimeout(all);
    }
    if (shown >= AREAS.length) return;
    const t = setTimeout(() => setShown((n) => n + 1), shown === 0 ? 600 : 450);
    return () => clearTimeout(t);
  }, [shown]);
  const areas: LiveArea[] = AREAS.map((a, i) => ({
    code: a.code,
    level: i < shown ? EXAMPLE[i] : null,
    answered: i < shown ? 3 : 0,
    total: 3,
    done: i < shown,
  }));
  return <LiveOttogramma areas={areas} size={size} />;
}
