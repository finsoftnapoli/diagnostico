import "server-only";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { SUPABASE_PUBLIC_KEY, SUPABASE_URL } from "./env";

/** Client con la sessione dell'utente: rispetta le regole di accesso del database. */
export async function supabaseServer() {
  const store = await cookies();
  return createServerClient(SUPABASE_URL, SUPABASE_PUBLIC_KEY, {
    cookies: {
      getAll: () => store.getAll(),
      setAll: (list) => {
        try {
          list.forEach(({ name, value, options }) => store.set(name, value, options));
        } catch {
          // chiamato da una pagina: i cookie li aggiorna il proxy
        }
      },
    },
  });
}

/** Client con la chiave di servizio: scavalca le regole di accesso. Solo nel server, solo dopo aver verificato l'utente. */
export function supabaseService() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!SUPABASE_URL || !key) throw new Error("Supabase non configurato: mancano le variabili d'ambiente");
  return createClient(SUPABASE_URL, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

/** Restituisce l'utente collegato e se fa parte dello staff Finsoft. */
export async function currentUser() {
  const sb = await supabaseServer();
  const { data } = await sb.auth.getUser();
  const user = data.user;
  if (!user) return { user: null, isStaff: false };
  const { data: staff } = await supabaseService().from("staff").select("user_id").eq("user_id", user.id).maybeSingle();
  return { user, isStaff: !!staff };
}
