import { expect, it } from "vitest";
import { regionFromAddress } from "./province";

it("ricava la regione dall'indirizzo", () => {
  expect(regionFromAddress("VIA TOLEDO 1 80134 NAPOLI NA")).toBe("Campania");
  expect(regionFromAddress("Corso Buenos Aires 10 20124 Milano MI ")).toBe("Lombardia");
  expect(regionFromAddress("PIAZZA 1 39100 BOLZANO BZ")).toBe("Trentino-Alto Adige");
  expect(regionFromAddress("senza provincia")).toBeNull();
  expect(regionFromAddress(null)).toBeNull();
});
