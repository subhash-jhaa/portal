import { it, expect } from "vitest";
import { setupMockBackend } from "./helpers/mock-backend";
import { getDirectory, getColleague } from "../src/lib/api/directory";
import { updateEmployeeContact } from "../src/lib/api/employee";
import { contactInputSchema } from "../src/lib/types/employee";
import { directoryParams } from "../src/lib/types/directory";
setupMockBackend();
it("paginates at least forty colleagues without private fields", async () => {
  const first = await getDirectory({ q: "", department: "", page: 1 }),
    second = await getDirectory({ q: "", department: "", page: 2 });
  expect(first.total).toBeGreaterThanOrEqual(42);
  expect(first.items).toHaveLength(10);
  expect(
    second.items.some((item) =>
      first.items.some((other) => other.id === item.id),
    ),
  ).toBe(false);
  expect(
    first.items.every(
      (item) => !("accountEnd" in item) && !("emergencyContact" in item),
    ),
  ).toBe(true);
});
it("searches, filters, handles no results and clamps pages", async () => {
  const search = await getDirectory({
    q: "Aditi Sharma",
    department: "Engineering",
    page: 1,
  });
  expect(search.items.map((item) => item.name)).toEqual(["Aditi Sharma"]);
  expect(
    (await getDirectory({ q: "unmatchedxyz", department: "", page: 1 })).total,
  ).toBe(0);
  const last = await getDirectory({ q: "", department: "", page: 999 });
  expect(last.page).toBe(last.totalPages);
});
it("serves read-only public profiles and reflects own edits in directory", async () => {
  await updateEmployeeContact({
    email: "directory.edit@example.com",
    phone: "+91 90000 02222",
    emergencyContact: "Meera, +91 90000 03333",
  });
  const own = await getColleague("GR-1042");
  expect(own.email).toBe("directory.edit@example.com");
  expect(own).not.toHaveProperty("emergencyContact");
  await expect(getColleague("GR-missing")).rejects.toMatchObject({
    status: 404,
  });
});
it("rejects invalid phone formats and HR-managed fields", () => {
  expect(
    contactInputSchema.safeParse({
      email: "valid@example.com",
      phone: "abcdefghi",
    }).success,
  ).toBe(false);
  expect(
    contactInputSchema.safeParse({
      email: "valid@example.com",
      phone: "+91 (90000) 02222",
    }).success,
  ).toBe(true);
  expect(
    contactInputSchema.safeParse({
      email: "valid@example.com",
      phone: "",
      department: "Finance",
    }).success,
  ).toBe(false);
  expect(directoryParams(new URLSearchParams("page=-1")).page).toBe(1);
});
it("returns an actionable service error", async () => {
  await expect(
    getDirectory({ q: "", department: "", page: 1 }, undefined, "error"),
  ).rejects.toMatchObject({ status: 503 });
});
