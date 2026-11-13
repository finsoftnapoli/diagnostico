import type { Metadata } from "next";
import Report from "@/components/Report";
import { BRAND } from "@/config/brand";
import { EXAMPLE_NARRATIVE, exampleResponses } from "@/lib/example-report";
import { QUESTIONNAIRE_VERSION } from "@/lib/questionnaire";

export const metadata: Metadata = {
  title: "Un report di esempio",
  description: `Come si presenta il report approfondito di ${BRAND.name}: l'${BRAND.reportName}, le priorità, le azioni da cui partire. Azienda di fantasia.`,
};

const DATE = "2026-11-02T09:00:00.000Z";

export default function ExamplePage() {
  return (
    <Report
      draft={{ version: QUESTIONNAIRE_VERSION, step: 0, responses: exampleResponses(), updatedAt: DATE, completedAt: DATE }}
      narrative={EXAMPLE_NARRATIVE}
      shared="esempio"
    />
  );
}
