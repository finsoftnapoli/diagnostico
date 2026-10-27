import type { MetadataRoute } from "next";
import { siteUrl } from "@/config/site";

// Le pagine personali e riservate non vanno indicizzate; le pagine pubbliche sono nella sitemap.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/area", "/admin", "/api", "/accedi", "/auth", "/invito", "/risultati"] },
    sitemap: `${siteUrl()}/sitemap.xml`,
  };
}
