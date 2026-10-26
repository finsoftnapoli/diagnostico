"use client";

import { useEffect, useRef, useState } from "react";

// Controllo "persona e non bot" con Cloudflare Turnstile: di solito invisibile,
// chiede un clic solo se il traffico sembra sospetto. Senza chiave configurata non fa nulla.
const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";
export const isHumanCheckEnabled = () => SITE_KEY !== "";

declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement, opts: Record<string, unknown>) => string;
      remove: (id: string) => void;
    };
  }
}

export default function HumanCheck({ onVerified }: { onVerified: () => void }) {
  const box = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<"waiting" | "ok" | "error">("waiting");

  useEffect(() => {
    if (!SITE_KEY) return;
    let widgetId: string | null = null;
    const render = () => {
      if (!box.current || !window.turnstile || widgetId) return;
      widgetId = window.turnstile.render(box.current, {
        sitekey: SITE_KEY,
        language: "it",
        appearance: "interaction-only",
        callback: async (token: string) => {
          const res = await fetch("/api/umano", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ token }),
          });
          if (res.ok) {
            setState("ok");
            onVerified();
          } else setState("error");
        },
        "error-callback": () => setState("error"),
      });
    };
    if (window.turnstile) render();
    else {
      const s = document.createElement("script");
      s.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
      s.async = true;
      s.onload = render;
      document.head.appendChild(s);
    }
    return () => {
      if (widgetId && window.turnstile) window.turnstile.remove(widgetId);
    };
  }, [onVerified]);

  if (!SITE_KEY) return null;
  return (
    <div className="mt-6">
      <div ref={box} />
      {state === "waiting" && <p className="text-xs text-muted">Verifica di sicurezza in corso…</p>}
      {state === "error" && (
        <p className="text-xs text-accent">Non siamo riusciti a completare la verifica di sicurezza: ricarica la pagina.</p>
      )}
    </div>
  );
}
