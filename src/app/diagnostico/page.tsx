import type { Metadata } from "next";
import { WizardClient as Wizard } from "@/components/ClientOnly";

export const metadata: Metadata = { title: "Diagnostico" };

export default function DiagnosticoPage() {
  return <Wizard />;
}
