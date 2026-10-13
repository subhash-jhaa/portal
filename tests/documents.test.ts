import { it, expect } from "vitest";
import { setupMockBackend } from "./helpers/mock-backend";
import { getEmployeeDocuments } from "@/lib/api/documents";
import { backendRequest } from "@/lib/api/backend";
setupMockBackend();
it("returns typed fictional metadata sorted newest first", async () => {
  const result = await getEmployeeDocuments();
  expect(result.ownerId).toBe("GR-1042");
  expect(result.items).toHaveLength(3);
  expect(result.items.map((file) => file.updatedAt)).toEqual([
    "2026-10-10",
    "2026-10-08",
    "2026-10-03",
  ]);
  expect(
    result.items.every((file) => file.type === "PDF" && file.sizeBytes > 0),
  ).toBe(true);
  expect(result.items[0]).not.toHaveProperty("downloadUrl");
});
it("returns an empty list distinct from a service failure", async () => {
  expect((await getEmployeeDocuments(undefined, "empty")).items).toEqual([]);
  await expect(getEmployeeDocuments(undefined, "error")).rejects.toMatchObject({
    status: 503,
    code: "UNAVAILABLE",
  });
});
it("rejects unauthenticated document requests", async () => {
  expect((await backendRequest("/employee/documents")).status).toBe(401);
});
it("scopes employee and admin records to the token subject and ignores caller-selected owners", async () => {
  const results: Awaited<ReturnType<typeof getEmployeeDocuments>>[] = [];
  for (const [email, password] of [
    ["aarav.mehta@example.com", "Employee123!"],
    ["neha.kapoor@example.com", "Admin123!"],
  ]) {
    const signedIn = await backendRequest("/auth/login", {
      method: "POST",
      body: { email, password },
    });
    const token = (await signedIn.json()).access_token;
    const response = await backendRequest(
      "/employee/documents?ownerId=another-user",
      { token },
    );
    expect(response.status).toBe(200);
    results.push(await response.json());
  }
  expect(results.map((result) => result.ownerId)).toEqual([
    "GR-1042",
    "GR-1001",
  ]);
  expect(
    results[0].items.some((file: { id: string }) =>
      results[1].items.some((other: { id: string }) => other.id === file.id),
    ),
  ).toBe(false);
});
