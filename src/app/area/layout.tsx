import type { Metadata } from "next";

// Pagine personali o riservate: fuori dai motori di ricerca.
export const metadata: Metadata = { robots: { index: false, follow: false } };

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
