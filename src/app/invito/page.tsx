import type { Metadata } from "next";
import { InviteClient } from "@/components/ClientOnly";

export const metadata: Metadata = { title: "Invito" };

export default function InvitoPage() {
  return <InviteClient />;
}
