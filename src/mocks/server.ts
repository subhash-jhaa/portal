import { setupServer } from "msw/node";
import { authBackendHandlers } from "./handlers/auth-backend";
const state = globalThis as typeof globalThis & {
  growmerMockServer?: ReturnType<typeof setupServer>;
};
export async function startServerMocks() {
  if (!state.growmerMockServer) {
    const server = setupServer(...authBackendHandlers);
    server.listen({ onUnhandledFrame: "bypass" });
    state.growmerMockServer = server;
    console.info("Growmer mock backend enabled (demo users only)");
  }
}
