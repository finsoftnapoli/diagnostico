// Condivisione di un report in sola lettura: un link con scadenza, revocabile, di cui si conserva solo l'impronta.
import { createHash, randomBytes } from "node:crypto";

export type ShareScope = "sintesi" | "completo";
export const SHARE_DAYS = [7, 30, 90] as const;
export const MAX_SHARES_PER_DAY = 10;
export const MAX_ACTIVE_SHARES = 20;

export const newShareToken = () => randomBytes(24).toString("base64url");
export const hashShareToken = (token: string) => createHash("sha256").update(token).digest("hex");
export const isShareToken = (token: string) => /^[A-Za-z0-9_-]{32}$/.test(token);

export function shareExpiry(days: number, from = new Date()): Date {
  const d = (SHARE_DAYS as readonly number[]).includes(days) ? days : 30;
  return new Date(from.getTime() + d * 86_400_000);
}

export interface ShareRow {
  id: string;
  recipient_email: string | null;
  recipient_name: string | null;
  scope: ShareScope;
  expires_at: string;
  revoked_at: string | null;
  views: number;
  last_viewed_at: string | null;
  created_at: string;
}

export type ShareState = "attivo" | "scaduto" | "revocato";
export const shareState = (s: Pick<ShareRow, "expires_at" | "revoked_at">, now = new Date()): ShareState =>
  s.revoked_at ? "revocato" : new Date(s.expires_at) <= now ? "scaduto" : "attivo";
