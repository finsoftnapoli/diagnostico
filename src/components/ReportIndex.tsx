"use client";

import { useEffect, useState } from "react";

export interface IndexItem {
  id: string;
  label: string;
}

/** Indice del report: resta in alto mentre si scorre e segna la sezione che si sta leggendo. */
export default function ReportIndex({ items }: { items: IndexItem[] }) {
  const [active, setActive] = useState(items[0]?.id);
  const ids = items.map((i) => i.id).join(",");
  useEffect(() => {
    const els = ids
      .split(",")
      .map((id) => document.getElementById(id))
      .filter((e): e is HTMLElement => !!e);
    if (!els.length || typeof IntersectionObserver === "undefined") return;
    const seen = new Map<string, boolean>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) seen.set(e.target.id, e.isIntersecting);
        const first = els.find((el) => seen.get(el.id));
        if (first) setActive(first.id);
      },
      { rootMargin: "-80px 0px -55% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [ids]);
  if (items.length < 3) return null;
  return (
    <nav
      aria-label="Indice del report"
      className="no-print sticky top-0 z-20 -mx-4 mt-6 border-y border-line bg-white/95 px-4 backdrop-blur"
    >
      <ul className="flex gap-1 overflow-x-auto py-2 text-sm">
        {items.map((i) => (
          <li key={i.id} className="shrink-0">
            <a
              href={`#${i.id}`}
              aria-current={active === i.id ? "true" : undefined}
              className={`block rounded-full px-3 py-1.5 ${active === i.id ? "bg-navy text-white" : "text-muted hover:bg-paper hover:text-navy"}`}
            >
              {i.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
