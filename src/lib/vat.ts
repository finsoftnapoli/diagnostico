/** Normalizza una partita IVA italiana (toglie spazi e prefisso IT). */
export function normalizeVat(v: string): string {
  return v.replace(/\s|\./g, "").replace(/^IT/i, "");
}

/** Controllo formale della partita IVA italiana: 11 cifre con cifra di controllo. */
export function isValidItalianVat(v: string): boolean {
  const n = normalizeVat(v);
  if (!/^\d{11}$/.test(n) || n === "00000000000") return false;
  let sum = 0;
  for (let i = 0; i < 10; i++) {
    const d = Number(n[i]);
    if (i % 2 === 0) sum += d;
    else sum += d * 2 > 9 ? d * 2 - 9 : d * 2;
  }
  return (10 - (sum % 10)) % 10 === Number(n[10]);
}
