// Messaggi leggibili per gli errori del servizio di accesso con codice via email.

/** Secondi da attendere se il servizio ha rifiutato una richiesta troppo ravvicinata. */
export function otpWaitSeconds(message: string): number | null {
  const m = message.match(/after (\d+) seconds?/i);
  return m ? Number(m[1]) : null;
}

export function otpSendError(message: string): { error: string; wait?: number } {
  const wait = otpWaitSeconds(message);
  if (wait !== null) return { error: `Abbiamo appena inviato un'email: può richiederne un'altra tra ${wait} secondi.`, wait };
  if (/rate limit|too many/i.test(message)) return { error: "Troppe richieste in poco tempo: riprovi tra qualche minuto." };
  if (/signups? not allowed|not found|user/i.test(message))
    return { error: "Non troviamo un accesso con questa email: se non ha ancora completato un diagnostico, inizi da lì." };
  return { error: "Non siamo riusciti a inviare l'email. Riprovi tra un minuto." };
}
