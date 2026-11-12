// Dalla sigla della provincia alla regione, per compilare la sede a partire dall'indirizzo pubblico della partita IVA.
const REGIONS: Record<string, string[]> = {
  Abruzzo: ["AQ", "CH", "PE", "TE"],
  Basilicata: ["MT", "PZ"],
  Calabria: ["CZ", "CS", "KR", "RC", "VV"],
  Campania: ["AV", "BN", "CE", "NA", "SA"],
  "Emilia-Romagna": ["BO", "FE", "FC", "MO", "PR", "PC", "RA", "RE", "RN"],
  "Friuli-Venezia Giulia": ["GO", "PN", "TS", "UD"],
  Lazio: ["FR", "LT", "RI", "RM", "VT"],
  Liguria: ["GE", "IM", "SP", "SV"],
  Lombardia: ["BG", "BS", "CO", "CR", "LC", "LO", "MN", "MI", "MB", "PV", "SO", "VA"],
  Marche: ["AN", "AP", "FM", "MC", "PU"],
  Molise: ["CB", "IS"],
  Piemonte: ["AL", "AT", "BI", "CN", "NO", "TO", "VB", "VC"],
  Puglia: ["BA", "BT", "BR", "FG", "LE", "TA"],
  Sardegna: ["CA", "NU", "OR", "SS", "SU", "CI", "VS", "OT", "OG"],
  Sicilia: ["AG", "CL", "CT", "EN", "ME", "PA", "RG", "SR", "TP"],
  Toscana: ["AR", "FI", "GR", "LI", "LU", "MS", "PI", "PT", "PO", "SI"],
  "Trentino-Alto Adige": ["BZ", "TN"],
  Umbria: ["PG", "TR"],
  "Valle d'Aosta": ["AO"],
  Veneto: ["BL", "PD", "RO", "TV", "VE", "VR", "VI"],
};

const BY_PROVINCE = new Map(Object.entries(REGIONS).flatMap(([region, codes]) => codes.map((c) => [c, region] as const)));

/** Regione ricavata da un indirizzo che termina con CAP, comune e sigla della provincia. */
export function regionFromAddress(address: string | null | undefined): string | null {
  const m = address?.toUpperCase().match(/\b\d{5}\b[^\d]*\b([A-Z]{2})\s*$/);
  return (m && BY_PROVINCE.get(m[1])) || null;
}
