// Le chiavi arrivano dalle variabili d'ambiente (Vercel o .env.local), mai dal codice.
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_PUBLIC_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

export const isSupabaseConfigured = () => SUPABASE_URL !== "" && SUPABASE_PUBLIC_KEY !== "";
