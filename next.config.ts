import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  // i PDF dei report si impaginano sul server con questa libreria e i font del progetto
  serverExternalPackages: ["@react-pdf/renderer"],
  outputFileTracingIncludes: { "/api/report/[id]/pdf": ["./src/pdf/fonts/**"], "/api/moduli/[id]/pdf": ["./src/pdf/fonts/**"] },
  partialPrefetching: true,
  // intestazioni di sicurezza per tutte le pagine: niente inclusione in siti altrui, niente tipi indovinati, permessi del browser chiusi
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Content-Security-Policy", value: "frame-ancestors 'none'" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
