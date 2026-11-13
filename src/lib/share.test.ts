import { describe, expect, it } from "vitest";
import { actionKey, isActionKey } from "./action-key";
import { hashShareToken, isShareToken, newShareToken, shareExpiry, shareState } from "./share";

describe("condivisione del report", () => {
  it("genera link non indovinabili e ne conserva solo l'impronta", () => {
    const a = newShareToken();
    const b = newShareToken();
    expect(a).not.toBe(b);
    expect(isShareToken(a)).toBe(true);
    expect(hashShareToken(a)).toHaveLength(64);
    expect(hashShareToken(a)).not.toContain(a);
  });
  it("rifiuta valori che non sono un link", () => {
    expect(isShareToken("abc")).toBe(false);
    expect(isShareToken("../../etc/passwd-000000000000000000")).toBe(false);
  });
  it("ammette solo le durate previste", () => {
    const from = new Date("2026-11-13T10:00:00Z");
    expect(shareExpiry(7, from).toISOString()).toBe("2026-11-20T10:00:00.000Z");
    expect(shareExpiry(9999, from).toISOString()).toBe("2026-12-13T10:00:00.000Z");
  });
  it("riconosce link scaduti e revocati", () => {
    const now = new Date("2026-11-13T10:00:00Z");
    expect(shareState({ expires_at: "2026-11-14T00:00:00Z", revoked_at: null }, now)).toBe("attivo");
    expect(shareState({ expires_at: "2026-11-12T00:00:00Z", revoked_at: null }, now)).toBe("scaduto");
    expect(shareState({ expires_at: "2026-11-14T00:00:00Z", revoked_at: "2026-11-13T09:00:00Z" }, now)).toBe("revocato");
  });
  it("dà alla stessa azione sempre la stessa chiave", () => {
    expect(actionKey("  Fissare un incontro mensile ")).toBe(actionKey("fissare un incontro mensile"));
    expect(actionKey("a")).not.toBe(actionKey("b"));
    expect(isActionKey(actionKey("Fissare un incontro"))).toBe(true);
  });
});
