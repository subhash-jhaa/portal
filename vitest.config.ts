import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";
export default defineConfig({
  resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } },
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
    env: {
      NEXT_PUBLIC_API_BASE_URL: "http://localhost:3000/api",
      AUTH_MOCKS_ENABLED: "true",
      AUTH_JWT_SECRET: "test-only-key-32-bytes-minimum-not-a-production-secret",
    },
  },
});
