import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";

// Verifica "persona e non bot" con Cloudflare Turnstile. Dopo la verifica il server rilascia
// un cookie firmato valido alcune ore; le API costose (lettura documenti, bozze) lo richiedono.
// Se le chiavi Turnstile non sono configurate, il controllo è disattivato.

export const HUMAN_COOKIE = "umano";
const TTL_SECONDS = 6 * 60 * 60;

export const isTurnstileConfigured = () => !!process.env.TURNSTILE_SECRET_KEY;

const sign = (payload: string) =>
  createHmac("sha256", process.env.TURNSTILE_SECRET_KEY ?? "").update(payload).digest("base64url");

export function issueHumanCookie(): { value: string; maxAge: number } {
  const exp = String(Math.floor(Date.now() / 1000) + TTL_SECONDS);
  return { value: `${exp}.${sign(exp)}`, maxAge: TTL_SECONDS };
}

export function isHuman(request: Request): boolean {
  if (!isTurnstileConfigured()) return true;
  const raw = request.headers.get("cookie") ?? "";
  const m = raw.match(new RegExp(`(?:^|;\\s*)${HUMAN_COOKIE}=([^;]+)`));
  if (!m) return false;
  const [exp, sig] = decodeURIComponent(m[1]).split(".");
  if (!exp || !sig || Number(exp) < Date.now() / 1000) return false;
  const expected = Buffer.from(sign(exp));
  const given = Buffer.from(sig);
  return expected.length === given.length && timingSafeEqual(expected, given);
}

export async function verifyTurnstile(token: string, ip: string | null): Promise<boolean> {
  const body = new URLSearchParams({ secret: process.env.TURNSTILE_SECRET_KEY ?? "", response: token });
  if (ip) body.set("remoteip", ip);
  try {
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body,
      signal: AbortSignal.timeout(5000),
    });
    const j = (await res.json()) as { success?: boolean };
    return j.success === true;
  } catch {
    return false;
  }
}
