import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  // i PDF dei report si impaginano sul server con questa libreria e i font del progetto
  serverExternalPackages: ["@react-pdf/renderer"],
  outputFileTracingIncludes: { "/api/report/[id]/pdf": ["./src/pdf/fonts/**"], "/api/moduli/[id]/pdf": ["./src/pdf/fonts/**"] },
  partialPrefetching: true,
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
