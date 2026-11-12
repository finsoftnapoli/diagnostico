// Mediana reale per ambito nella fascia di fatturato, solo se il campione è sufficiente.
// Se la fascia ha poche aziende si prova la macro-fascia che la contiene; sotto la soglia
// restituisce solo la numerosità e il report usa il riferimento indicativo.
import { NextResponse, type NextRequest } from "next/server";
import { realBenchmark } from "@/lib/benchmark-server";

export async function GET(request: NextRequest) {
  const r = await realBenchmark(request.nextUrl.searchParams.get("fascia") ?? "");
  return NextResponse.json(r, r.values ? { headers: { "cache-control": "public, max-age=3600" } } : undefined);
}
