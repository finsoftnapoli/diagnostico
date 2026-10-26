import "server-only";
import { supabaseService } from "./server";

/** Azienda di cui l'utente fa parte (amministratore o collega), oppure null. */
export async function companyOfMember(userId: string, companyId: string) {
  if (!/^[0-9a-f-]{36}$/.test(companyId)) return null;
  const { data } = await supabaseService()
    .from("company_members")
    .select("company_id, role, companies(name, vat_number)")
    .eq("user_id", userId)
    .eq("company_id", companyId)
    .maybeSingle();
  if (!data) return null;
  const c = data.companies as unknown as { name: string; vat_number: string | null } | null;
  return { id: data.company_id as string, role: data.role as string, name: c?.name ?? "", vat: c?.vat_number ?? null };
}
