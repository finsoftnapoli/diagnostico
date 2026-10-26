import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

describe("cookie umano", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("senza chiavi il controllo è disattivato", async () => {
    vi.stubEnv("TURNSTILE_SECRET_KEY", "");
    const { isHuman } = await import("./human");
    expect(isHuman(new Request("https://x.it"))).toBe(true);
  });

  it("accetta solo cookie firmati e non scaduti", async () => {
    vi.stubEnv("TURNSTILE_SECRET_KEY", "segreto-di-prova");
    const { isHuman, issueHumanCookie } = await import("./human");
    const c = issueHumanCookie();
    expect(isHuman(new Request("https://x.it", { headers: { cookie: `umano=${c.value}` } }))).toBe(true);
    expect(isHuman(new Request("https://x.it", { headers: { cookie: `umano=${c.value}x` } }))).toBe(false);
    expect(isHuman(new Request("https://x.it", { headers: { cookie: "umano=1.abc" } }))).toBe(false);
    expect(isHuman(new Request("https://x.it"))).toBe(false);
  });
});
