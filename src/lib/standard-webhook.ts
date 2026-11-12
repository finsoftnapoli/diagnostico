// Verifica della firma delle chiamate di Supabase Auth (formato Standard Webhooks):
// segreto "v1,whsec_<base64>", firma HMAC-SHA256 di "<id>.<timestamp>.<corpo>" in base64.
import { createHmac, timingSafeEqual } from "node:crypto";

const TOLERANCE_S = 5 * 60;

export function verifyStandardWebhook(
  body: string,
  headers: { id: string | null; timestamp: string | null; signature: string | null },
  secret: string,
  nowS = Math.floor(Date.now() / 1000),
): boolean {
  const { id, timestamp, signature } = headers;
  if (!id || !timestamp || !signature) return false;
  const ts = Number(timestamp);
  if (!Number.isFinite(ts) || Math.abs(nowS - ts) > TOLERANCE_S) return false;
  const key = Buffer.from(secret.replace(/^v1,/, "").replace(/^whsec_/, ""), "base64");
  const expected = createHmac("sha256", key).update(`${id}.${timestamp}.${body}`).digest();
  return signature.split(" ").some((part) => {
    const [version, sig] = part.split(",");
    if (version !== "v1" || !sig) return false;
    const got = Buffer.from(sig, "base64");
    return got.length === expected.length && timingSafeEqual(got, expected);
  });
}
