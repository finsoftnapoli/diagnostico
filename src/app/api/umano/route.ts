// Riceve il token di Cloudflare Turnstile, lo verifica e rilascia il cookie "umano".
import { NextResponse } from "next/server";
import { HUMAN_COOKIE, issueHumanCookie, isTurnstileConfigured, verifyTurnstile } from "@/lib/human";

export async function POST(request: Request) {
  if (!isTurnstileConfigured()) return NextResponse.json({ ok: true });
  const { token } = (await request.json().catch(() => ({}))) as { token?: string };
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
  if (!token || !(await verifyTurnstile(token, ip))) return NextResponse.json({ ok: false }, { status: 403 });
  const c = issueHumanCookie();
  const res = NextResponse.json({ ok: true });
  res.cookies.set(HUMAN_COOKIE, c.value, { httpOnly: true, secure: true, sameSite: "lax", maxAge: c.maxAge, path: "/" });
  return res;
}
