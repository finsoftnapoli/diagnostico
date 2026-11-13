// Errori visti dal browser di un utente: finiscono nel registro consultabile dall'area staff.
import { NextResponse } from "next/server";
import { logError, sameOrigin } from "@/lib/observe";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export async function POST(request: Request) {
  if (!sameOrigin(request) || !isSupabaseConfigured()) return new NextResponse(null, { status: 204 });
  const body = (await request.json().catch(() => ({}))) as { message?: unknown; path?: unknown; detail?: unknown };
  if (typeof body.message !== "string" || !body.message.trim()) return new NextResponse(null, { status: 204 });
  await logError(
    "client",
    body.message,
    typeof body.path === "string" ? body.path : null,
    typeof body.detail === "string" ? body.detail : null,
  );
  return new NextResponse(null, { status: 204 });
}
