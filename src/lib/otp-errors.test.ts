import { describe, expect, it } from "vitest";
import { otpSendError, otpWaitSeconds } from "./otp-errors";

describe("errori dell'accesso con codice", () => {
  it("riconosce l'attesa richiesta tra due invii", () => {
    expect(otpWaitSeconds("For security purposes, you can only request this after 42 seconds.")).toBe(42);
    expect(otpSendError("For security purposes, you can only request this after 42 seconds.")).toEqual({
      error: "Abbiamo appena inviato un'email: può richiederne un'altra tra 42 secondi.",
      wait: 42,
    });
  });
  it("distingue troppe richieste ed email sconosciuta", () => {
    expect(otpSendError("email rate limit exceeded").error).toMatch(/Troppe richieste/);
    expect(otpSendError("Signups not allowed for otp").error).toMatch(/Non troviamo un accesso/);
  });
});
