// Verifica la partita IVA sull'archivio europeo VIES e restituisce ragione sociale e sede, se disponibili.
import { NextResponse, type NextRequest } from "next/server";
import { isValidItalianVat, normalizeVat } from "@/lib/vat";

export async function GET(request: NextRequest) {
  const n = normalizeVat(request.nextUrl.searchParams.get("n") ?? "");
  if (!isValidItalianVat(n)) return NextResponse.json({ valid: false, reason: "formato" });
  try {
    const res = await fetch(`https://ec.europa.eu/taxation_customs/vies/rest-api/ms/IT/vat/${n}`, {
      signal: AbortSignal.timeout(5000),
      headers: { accept: "application/json" },
    });
    if (!res.ok) return NextResponse.json({ valid: true, checked: false });
    const j = (await res.json()) as { isValid?: boolean; name?: string; address?: string };
    const clean = (s?: string) => (s && s !== "---" ? s.replace(/\s+/g, " ").trim() : null);
    return NextResponse.json({ valid: !!j.isValid, checked: true, name: clean(j.name), address: clean(j.address) });
  } catch {
    // VIES non raggiungibile: si accetta il controllo formale
    return NextResponse.json({ valid: true, checked: false });
  }
}
