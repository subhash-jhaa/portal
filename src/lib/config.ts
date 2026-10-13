export const config = {
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || "/api",
  mocksEnabled: process.env.NEXT_PUBLIC_ENABLE_MOCKS === "true",
};
