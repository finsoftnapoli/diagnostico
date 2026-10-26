import "server-only";

// Invio delle fatture ad Aruba Fatturazione Elettronica (servizio con accesso API): Aruba firma il file
// e lo trasmette al Sistema di Interscambio. Credenziali nelle variabili d'ambiente di Vercel.
// ARUBA_ENV=demo usa l'ambiente di prova di Aruba, che non trasmette nulla allo SdI.

const HOSTS = {
  demo: { auth: "https://demoauth.fatturazioneelettronica.aruba.it", ws: "https://demows.fatturazioneelettronica.aruba.it" },
  prod: { auth: "https://auth.fatturazioneelettronica.aruba.it", ws: "https://ws.fatturazioneelettronica.aruba.it" },
};

export const isArubaConfigured = () => !!(process.env.ARUBA_USERNAME && process.env.ARUBA_PASSWORD);
const hosts = () => (process.env.ARUBA_ENV === "prod" ? HOSTS.prod : HOSTS.demo);

async function token(): Promise<string> {
  const res = await fetch(`${hosts().auth}/auth/signin`, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded;charset=UTF-8" },
    body: new URLSearchParams({ grant_type: "password", username: process.env.ARUBA_USERNAME!, password: process.env.ARUBA_PASSWORD! }),
    signal: AbortSignal.timeout(15000),
  });
  const j = (await res.json().catch(() => ({}))) as { access_token?: string; error_description?: string };
  if (!res.ok || !j.access_token) throw new Error(`Accesso ad Aruba non riuscito: ${j.error_description ?? res.status}`);
  return j.access_token;
}

/** Carica una fattura (XML non firmato). Restituisce il nome del file assegnato da Aruba. */
export async function uploadInvoice(xml: string): Promise<string> {
  const t = await token();
  const res = await fetch(`${hosts().ws}/services/invoice/upload`, {
    method: "POST",
    headers: { accept: "application/json", authorization: `Bearer ${t}`, "content-type": "application/json;charset=UTF-8" },
    body: JSON.stringify({ dataFile: Buffer.from(xml, "utf8").toString("base64"), credential: "", domain: "" }),
    signal: AbortSignal.timeout(30000),
  });
  const j = (await res.json().catch(() => ({}))) as { errorCode?: string; errorDescription?: string; uploadFileName?: string };
  if (!res.ok || j.errorCode !== "0000") throw new Error(`Aruba ${j.errorCode ?? res.status}: ${j.errorDescription ?? "invio non riuscito"}`);
  return j.uploadFileName ?? "";
}
