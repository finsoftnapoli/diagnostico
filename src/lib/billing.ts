// Dati di fatturazione dell'azienda cliente (fattura elettronica B2B): controllo e normalizzazione.
import { isValidItalianVat, normalizeVat } from "./vat";

export interface Billing {
  denominazione: string;
  vat_number: string;
  tax_code: string | null;
  address: string;
  cap: string;
  city: string;
  province: string;
  sdi_code: string | null;
  pec: string | null;
}

export const EMPTY_BILLING: Billing = {
  denominazione: "",
  vat_number: "",
  tax_code: null,
  address: "",
  cap: "",
  city: "",
  province: "",
  sdi_code: null,
  pec: null,
};

const clean = (v: unknown, max: number) => (typeof v === "string" ? v.replace(/\s+/g, " ").trim().slice(0, max) : "");

/** Restituisce i dati normalizzati oppure l'elenco degli errori, campo per campo. */
export function validateBilling(input: unknown): { ok: true; billing: Billing } | { ok: false; errors: Record<string, string> } {
  const i = (input && typeof input === "object" ? input : {}) as Record<string, unknown>;
  const errors: Record<string, string> = {};
  const denominazione = clean(i.denominazione, 160);
  const vat = normalizeVat(clean(i.vat_number, 20));
  const tax = clean(i.tax_code, 16).toUpperCase().replace(/\s/g, "");
  const address = clean(i.address, 160);
  const cap = clean(i.cap, 5);
  const city = clean(i.city, 80);
  const province = clean(i.province, 2).toUpperCase();
  const sdi = clean(i.sdi_code, 7).toUpperCase();
  const pec = clean(i.pec, 200).toLowerCase();

  if (denominazione.length < 2) errors.denominazione = "Indica la ragione sociale";
  if (!isValidItalianVat(vat)) errors.vat_number = "Partita IVA non valida";
  if (tax && !/^([0-9]{11}|[A-Z0-9]{16})$/.test(tax)) errors.tax_code = "Codice fiscale non valido";
  if (address.length < 3) errors.address = "Indica l'indirizzo della sede";
  if (!/^[0-9]{5}$/.test(cap)) errors.cap = "CAP di 5 cifre";
  if (city.length < 2) errors.city = "Indica il comune";
  if (!/^[A-Z]{2}$/.test(province)) errors.province = "Sigla di 2 lettere";
  if (sdi && !/^[A-Z0-9]{7}$/.test(sdi)) errors.sdi_code = "Il codice destinatario ha 7 caratteri";
  if (pec && !/^\S+@\S+\.\S+$/.test(pec)) errors.pec = "PEC non valida";
  if (Object.keys(errors).length) return { ok: false, errors };
  return {
    ok: true,
    billing: {
      denominazione,
      vat_number: vat,
      tax_code: tax || null,
      address,
      cap,
      city,
      province,
      sdi_code: sdi || null,
      pec: pec || null,
    },
  };
}
