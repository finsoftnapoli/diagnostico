import { createHmac } from "node:crypto";
import { describe, expect, it } from "vitest";
import { authEmail } from "./auth-email";
import { verifyStandardWebhook } from "./standard-webhook";

describe("firma delle chiamate di Supabase Auth", () => {
  const key = Buffer.from("segreto-di-prova-32-byte-esattamente!!").toString("base64");
  const secret = `v1,whsec_${key}`;
  const body = '{"user":{"email":"a@b.it"}}';
  const sign = (id: string, ts: number, b: string) =>
    `v1,${createHmac("sha256", Buffer.from(key, "base64")).update(`${id}.${ts}.${b}`).digest("base64")}`;
  const now = 1_800_000_000;

  it("accetta una firma valida e recente", () => {
    expect(verifyStandardWebhook(body, { id: "msg_1", timestamp: String(now), signature: sign("msg_1", now, body) }, secret, now)).toBe(
      true,
    );
    expect(
      verifyStandardWebhook(
        body,
        { id: "msg_1", timestamp: String(now), signature: `v1,altra v1,${sign("msg_1", now, body).slice(3)}` },
        secret,
        now,
      ),
    ).toBe(true);
  });
  it("rifiuta corpo alterato, firma mancante e richieste vecchie", () => {
    expect(
      verifyStandardWebhook(body + " ", { id: "msg_1", timestamp: String(now), signature: sign("msg_1", now, body) }, secret, now),
    ).toBe(false);
    expect(verifyStandardWebhook(body, { id: "msg_1", timestamp: String(now), signature: null }, secret, now)).toBe(false);
    expect(
      verifyStandardWebhook(body, { id: "msg_1", timestamp: String(now - 600), signature: sign("msg_1", now - 600, body) }, secret, now),
    ).toBe(false);
  });
});

describe("email di accesso", () => {
  it("mostra codice e link e adatta i testi all'azione", () => {
    const m = authEmail({ action: "magiclink", token: "123456", link: "https://x.supabase.co/auth/v1/verify?token=h&type=magiclink" });
    expect(m.subject).toBe("Il tuo codice di accesso: 123456");
    expect(m.html).toContain("123456");
    expect(m.html).toContain("Accedi con un clic");
    expect(m.text).toContain("Codice: 123456");
    expect(authEmail({ action: "signup", token: "654321", link: null }).subject).toBe("Conferma la tua email: 654321");
  });
});
