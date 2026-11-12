"use client";

import type { Responses } from "./types";
import { otpSendError } from "./otp-errors";
import { supabaseBrowser } from "./supabase/browser";

/** Salva la bozza nel server e invia l'email con il link (e il codice) per tornare a `path?<param>=<id>`. */
export async function saveDraftAndSendLink(opts: {
  email: string;
  step: number;
  responses: Responses;
  path: string;
  param: string;
}): Promise<{ id: string } | { error: string; wait?: number }> {
  const res = await fetch("/api/bozze", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email: opts.email, step: opts.step, responses: opts.responses }),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) return { error: json.error ?? "Salvataggio non riuscito" };
  const redirect = `${window.location.origin}${opts.path}?${opts.param}=${json.id}`;
  const { error } = await supabaseBrowser().auth.signInWithOtp({
    email: opts.email,
    options: { shouldCreateUser: true, emailRedirectTo: redirect },
  });
  if (error) return otpSendError(error.message);
  return { id: json.id };
}
