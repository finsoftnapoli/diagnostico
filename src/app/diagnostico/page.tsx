import type { Metadata } from "next";
import { WizardClient as Wizard } from "@/components/ClientOnly";

export const metadata: Metadata = {
  title: "Inizia il diagnostico aziendale gratuito",
  description:
    "24 domande sugli 8 ambiti di gestione della tua azienda, con salvataggio automatico. Al termine l'Ottogramma con il confronto con aziende simili.",
  alternates: { canonical: "/diagnostico" },
};

export default function DiagnosticoPage() {
  return <Wizard />;
}
