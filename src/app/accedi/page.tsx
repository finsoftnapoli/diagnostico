import type { Metadata } from "next";
import { LoginClient } from "@/components/ClientOnly";

export const metadata: Metadata = { title: "Accedi", robots: { index: false, follow: false } };

export default function AccediPage() {
  return <LoginClient />;
}
