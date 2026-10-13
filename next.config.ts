import type { NextConfig } from "next";
const nextConfig: NextConfig = {
  output: "standalone",
  turbopack: {
    rules: { "*.css": { loaders: ["@tailwindcss/turbopack"], as: "*.css" } },
    // The module is loaded only in a browser effect. Resolve its browser entry
    // explicitly because MSW excludes this export under the node condition.
    resolveAlias: { "msw/browser": "./node_modules/msw/lib/browser/index.js" },
  },
};
export default nextConfig;
