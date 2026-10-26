// Fattura elettronica B2B in formato FatturaPA (versione FPR12): costruzione del file XML.
// I dati del cedente (Finsoft) si impostano nelle variabili d'ambiente, non nel codice.
import type { Billing } from "./billing";

export interface Seller {
  denominazione: string;
  vat: string;
  taxCode: string;
  address: string;
  cap: string;
  city: string;
  province: string;
  regime: string; // RF01 ordinario
  rea?: { ufficio: string; numero: string; capitale?: string; socioUnico?: "SU" | "SM" };
}

export interface InvoiceLine {
  description: string;
  netCents: number;
}

export interface InvoiceInput {
  seller: Seller;
  buyer: Billing;
  number: string;
  date: string; // AAAA-MM-GG
  progressivo: string; // fino a 10 caratteri alfanumerici, unico per trasmittente
  lines: InvoiceLine[];
  vatRate: number;
  payment: "stripe" | "bonifico";
  causale?: string;
}

const PLACEHOLDER = /\[|da completare/i;

/** Dati del cedente dalle variabili d'ambiente; null se incompleti. */
export function sellerFromEnv(env: Record<string, string | undefined> = process.env): Seller | null {
  const s: Seller = {
    denominazione: env.SELLER_DENOMINAZIONE ?? "Finsoft S.r.l.",
    vat: (env.SELLER_VAT ?? "").replace(/^IT/i, ""),
    taxCode: env.SELLER_TAX_CODE ?? env.SELLER_VAT ?? "",
    address: env.SELLER_ADDRESS ?? "",
    cap: env.SELLER_CAP ?? "",
    city: env.SELLER_CITY ?? "",
    province: (env.SELLER_PROVINCE ?? "").toUpperCase(),
    regime: env.SELLER_REGIME ?? "RF01",
    rea:
      env.SELLER_REA_UFFICIO && env.SELLER_REA_NUMERO
        ? {
            ufficio: env.SELLER_REA_UFFICIO.toUpperCase(),
            numero: env.SELLER_REA_NUMERO,
            capitale: env.SELLER_CAPITALE,
            socioUnico: env.SELLER_SOCIO_UNICO === "SU" ? "SU" : env.SELLER_SOCIO_UNICO === "SM" ? "SM" : undefined,
          }
        : undefined,
  };
  const ok =
    /^\d{11}$/.test(s.vat) && s.address && /^\d{5}$/.test(s.cap) && s.city && /^[A-Z]{2}$/.test(s.province) && !PLACEHOLDER.test(s.address);
  return ok ? s : null;
}

const esc = (v: string) =>
  v.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" })[c]!);
/** Testi FatturaPA: solo caratteri latini di base, lunghezza massima. */
const txt = (v: string, max: number) =>
  esc(
    v
      .normalize("NFKD")
      .replace(/[’‘]/g, "'")
      .replace(/[“”]/g, '"')
      .replace(/[–—]/g, "-")
      .replace(/€/g, "EUR")
      .replace(/[^\x20-\x7EÀ-ÿ]/g, "")
      .trim()
      .slice(0, max),
  );
const amount = (cents: number) => (cents / 100).toFixed(2);

export function invoiceTotals(lines: InvoiceLine[], vatRate: number) {
  const net = lines.reduce((s, l) => s + l.netCents, 0);
  const vat = Math.round((net * vatRate) / 100);
  return { net, vat, total: net + vat };
}

export function buildFatturaPA(i: InvoiceInput): string {
  const { net, vat, total } = invoiceTotals(i.lines, i.vatRate);
  const b = i.buyer;
  const destinatario = b.sdi_code ?? "0000000";
  const rate = i.vatRate.toFixed(2);
  const rea = i.seller.rea;
  return `<?xml version="1.0" encoding="UTF-8"?>
<p:FatturaElettronica versione="FPR12" xmlns:ds="http://www.w3.org/2000/09/xmldsig#" xmlns:p="http://ivaservizi.agenziaentrate.gov.it/docs/xsd/fatture/v1.2" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://ivaservizi.agenziaentrate.gov.it/docs/xsd/fatture/v1.2 http://www.fatturapa.gov.it/export/fatturazione/sdi/fatturapa/v1.2/Schema_del_file_xml_FatturaPA_versione_1.2.xsd">
  <FatturaElettronicaHeader>
    <DatiTrasmissione>
      <IdTrasmittente><IdPaese>IT</IdPaese><IdCodice>${esc(i.seller.taxCode)}</IdCodice></IdTrasmittente>
      <ProgressivoInvio>${esc(i.progressivo)}</ProgressivoInvio>
      <FormatoTrasmissione>FPR12</FormatoTrasmissione>
      <CodiceDestinatario>${esc(destinatario)}</CodiceDestinatario>${
        destinatario === "0000000" && b.pec ? `\n      <PECDestinatario>${esc(b.pec)}</PECDestinatario>` : ""
      }
    </DatiTrasmissione>
    <CedentePrestatore>
      <DatiAnagrafici>
        <IdFiscaleIVA><IdPaese>IT</IdPaese><IdCodice>${esc(i.seller.vat)}</IdCodice></IdFiscaleIVA>
        <CodiceFiscale>${esc(i.seller.taxCode)}</CodiceFiscale>
        <Anagrafica><Denominazione>${txt(i.seller.denominazione, 80)}</Denominazione></Anagrafica>
        <RegimeFiscale>${esc(i.seller.regime)}</RegimeFiscale>
      </DatiAnagrafici>
      <Sede>
        <Indirizzo>${txt(i.seller.address, 60)}</Indirizzo>
        <CAP>${esc(i.seller.cap)}</CAP>
        <Comune>${txt(i.seller.city, 60)}</Comune>
        <Provincia>${esc(i.seller.province)}</Provincia>
        <Nazione>IT</Nazione>
      </Sede>${
        rea
          ? `
      <IscrizioneREA>
        <Ufficio>${esc(rea.ufficio)}</Ufficio>
        <NumeroREA>${esc(rea.numero)}</NumeroREA>${rea.capitale ? `\n        <CapitaleSociale>${esc(Number(rea.capitale).toFixed(2))}</CapitaleSociale>` : ""}${
          rea.socioUnico ? `\n        <SocioUnico>${rea.socioUnico}</SocioUnico>` : ""
        }
        <StatoLiquidazione>LN</StatoLiquidazione>
      </IscrizioneREA>`
          : ""
      }
    </CedentePrestatore>
    <CessionarioCommittente>
      <DatiAnagrafici>
        <IdFiscaleIVA><IdPaese>IT</IdPaese><IdCodice>${esc(b.vat_number)}</IdCodice></IdFiscaleIVA>${
          b.tax_code ? `\n        <CodiceFiscale>${esc(b.tax_code)}</CodiceFiscale>` : ""
        }
        <Anagrafica><Denominazione>${txt(b.denominazione, 80)}</Denominazione></Anagrafica>
      </DatiAnagrafici>
      <Sede>
        <Indirizzo>${txt(b.address, 60)}</Indirizzo>
        <CAP>${esc(b.cap)}</CAP>
        <Comune>${txt(b.city, 60)}</Comune>
        <Provincia>${esc(b.province)}</Provincia>
        <Nazione>IT</Nazione>
      </Sede>
    </CessionarioCommittente>
  </FatturaElettronicaHeader>
  <FatturaElettronicaBody>
    <DatiGenerali>
      <DatiGeneraliDocumento>
        <TipoDocumento>TD01</TipoDocumento>
        <Divisa>EUR</Divisa>
        <Data>${esc(i.date)}</Data>
        <Numero>${esc(i.number)}</Numero>
        <ImportoTotaleDocumento>${amount(total)}</ImportoTotaleDocumento>${
          i.causale ? `\n        <Causale>${txt(i.causale, 200)}</Causale>` : ""
        }
      </DatiGeneraliDocumento>
    </DatiGenerali>
    <DatiBeniServizi>
${i.lines
  .map(
    (l, n) => `      <DettaglioLinee>
        <NumeroLinea>${n + 1}</NumeroLinea>
        <Descrizione>${txt(l.description, 1000)}</Descrizione>
        <PrezzoUnitario>${amount(l.netCents)}</PrezzoUnitario>
        <PrezzoTotale>${amount(l.netCents)}</PrezzoTotale>
        <AliquotaIVA>${rate}</AliquotaIVA>
      </DettaglioLinee>`,
  )
  .join("\n")}
      <DatiRiepilogo>
        <AliquotaIVA>${rate}</AliquotaIVA>
        <ImponibileImporto>${amount(net)}</ImponibileImporto>
        <Imposta>${amount(vat)}</Imposta>
        <EsigibilitaIVA>I</EsigibilitaIVA>
      </DatiRiepilogo>
    </DatiBeniServizi>
    <DatiPagamento>
      <CondizioniPagamento>TP02</CondizioniPagamento>
      <DettaglioPagamento>
        <ModalitaPagamento>${i.payment === "stripe" ? "MP08" : "MP05"}</ModalitaPagamento>
        <ImportoPagamento>${amount(total)}</ImportoPagamento>
      </DettaglioPagamento>
    </DatiPagamento>
  </FatturaElettronicaBody>
</p:FatturaElettronica>
`;
}

/** Numero di fattura nel sezionale del servizio, per esempio "12/DIA". */
export const invoiceNumber = (seq: number, series: string) => `${seq}/${series}`;
/** Progressivo di invio univoco: anno a due cifre e numero in base 36. */
export const progressivoInvio = (year: number, seq: number) => `D${String(year % 100).padStart(2, "0")}${seq.toString(36).toUpperCase()}`.slice(0, 10);
/** Nome del file secondo le regole SdI: IT + partita IVA del trasmittente + progressivo. */
export const invoiceFileName = (taxCode: string, progressivo: string) => `IT${taxCode}_${progressivo.slice(-5).padStart(5, "0")}.xml`;
