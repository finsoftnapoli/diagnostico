import type { MetadataRoute } from "next";

// Le pagine personali e riservate non vanno indicizzate.
export default function robots(): MetadataRoute.Robots {
  return { rules: { userAgent: "*", allow: "/", disallow: ["/area", "/admin", "/api", "/accedi", "/auth", "/invito", "/risultati"] } };
}
