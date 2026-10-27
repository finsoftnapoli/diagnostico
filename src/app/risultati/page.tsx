import type { Metadata } from "next";
import { ResultsClient as ResultsView } from "@/components/ClientOnly";

export const metadata: Metadata = { title: "Risultati", robots: { index: false, follow: false } };

export default function RisultatiPage() {
  return <ResultsView />;
}
