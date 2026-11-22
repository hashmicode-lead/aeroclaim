import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // libSQL ships a native driver for local file databases; keep it out of the bundle.
  serverExternalPackages: ["@libsql/client", "libsql"],
  cacheComponents: true,
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
