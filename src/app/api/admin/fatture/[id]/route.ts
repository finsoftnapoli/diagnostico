// Scarica il file XML di una fattura (per caricarlo a mano su Aruba o archiviarlo).
import { xmlFileName } from "@/lib/commerce";
import { currentUser, supabaseService } from "@/lib/supabase/server";

export async function GET(_request: Request, ctx: RouteContext<"/api/admin/fatture/[id]">) {
  const { id } = await ctx.params;
  const { user, isStaff } = await currentUser();
  if (!user || !isStaff) return new Response("Riservato allo staff", { status: 403 });
  const { data } = await supabaseService().from("invoices").select("number, xml").eq("id", id).maybeSingle();
  if (!data?.xml) return new Response("Fattura senza file XML", { status: 404 });
  return new Response(data.xml as string, {
    headers: {
      "content-type": "application/xml; charset=utf-8",
      "content-disposition": `attachment; filename="${xmlFileName(data.number as string)}"`,
    },
  });
}
