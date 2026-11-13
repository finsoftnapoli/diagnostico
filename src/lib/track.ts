// Misura del percorso dal browser: un evento per passo, una sola volta per visita, senza cookie né identificativi.
const sent = new Set<string>();

export function track(name: string, step?: string) {
  if (typeof window === "undefined") return;
  const key = `${name}:${step ?? ""}`;
  if (sent.has(key)) return;
  sent.add(key);
  const body = JSON.stringify({ name, step });
  try {
    fetch("/api/eventi", { method: "POST", headers: { "content-type": "application/json" }, body, keepalive: true }).catch(() => {});
  } catch {
    // la misura non deve mai disturbare la compilazione
  }
}

/** Segnala allo staff un errore visto nel browser. */
export function reportClientError(message: string, detail?: string) {
  if (typeof window === "undefined") return;
  const key = `err:${message}`;
  if (sent.has(key)) return;
  sent.add(key);
  try {
    fetch("/api/errori", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ message: message.slice(0, 1000), path: window.location.pathname, detail: detail?.slice(0, 4000) }),
      keepalive: true,
    }).catch(() => {});
  } catch {
    // nulla
  }
}
