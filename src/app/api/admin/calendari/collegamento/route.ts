// Link del calendario delle prenotazioni: si attiva o si rinnova (il vecchio smette di funzionare).
import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { siteUrl } from "@/config/site";
import { currentUser, supabaseService } from "@/lib/supabase/server";

export async function POST() {
  const { user, isStaff } = await currentUser();
  if (!user || !isStaff) return NextResponse.json({ error: "Riservato allo staff" }, { status: 403 });
  const token = randomBytes(24).toString("base64url");
  const { error } = await supabaseService()
    .from("agenda_settings")
    .upsert({ key: "feed_token", value: token, updated_at: new Date().toISOString() });
  if (error) return NextResponse.json({ error: "Salvataggio non riuscito" }, { status: 500 });
  return NextResponse.json({ ok: true, url: `${siteUrl()}/api/calendario/${token}.ics` });
}
