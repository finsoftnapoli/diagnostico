import type { Metadata } from "next";
import { InviteClient } from "@/components/ClientOnly";

export const metadata: Metadata = { title: "Invito", robots: { index: false, follow: false } };

export default function InvitoPage() {
  return <InviteClient />;
}
