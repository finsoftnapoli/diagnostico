import type { MetadataRoute } from "next";
import { AREA_PAGES } from "@/config/ambiti";
import { siteUrl } from "@/config/site";

// Pagine pubbliche da indicizzare; le aree personali e riservate sono escluse (vedi robots.ts).
export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteUrl();
  const page = (path: string, priority: number, changeFrequency: "weekly" | "monthly" | "yearly" = "monthly") => ({
    url: `${base}${path}`,
    changeFrequency,
    priority,
  });
  return [
    page("/", 1, "weekly"),
    page("/diagnostico", 0.9),
    page("/ambiti", 0.8),
    ...AREA_PAGES.map((p) => page(`/ambiti/${p.slug}`, 0.7)),
    page("/metodo", 0.6),
    page("/privacy", 0.2, "yearly"),
    page("/termini", 0.2, "yearly"),
  ];
}
