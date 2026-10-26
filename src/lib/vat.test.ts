import { describe, expect, it } from "vitest";
import { isValidItalianVat, normalizeVat } from "./vat";

describe("partita IVA", () => {
  it("accetta partite IVA formalmente corrette", () => {
    expect(isValidItalianVat("00743110157")).toBe(true); // esempio noto con cifra di controllo corretta
    expect(isValidItalianVat("IT 00743110157")).toBe(true);
  });
  it("rifiuta numeri errati", () => {
    expect(isValidItalianVat("00743110158")).toBe(false);
    expect(isValidItalianVat("1234567890")).toBe(false);
    expect(isValidItalianVat("00000000000")).toBe(false);
  });
  it("normalizza", () => expect(normalizeVat("IT 007.431.101 57")).toBe("00743110157"));
});
