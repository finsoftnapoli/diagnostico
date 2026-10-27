// Indirizzo pubblico del sito, usato per link canonici, sitemap e anteprime social.
// In produzione si imposta PUBLIC_SITE_URL (per esempio https://www.dominio.it); su Vercel, in mancanza,
// si usa il dominio di produzione del progetto.
export function siteUrl(): string {
  const explicit = process.env.PUBLIC_SITE_URL?.replace(/\/$/, "");
  if (explicit) return explicit;
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (vercel) return `https://${vercel}`;
  return "http://localhost:3000";
}
