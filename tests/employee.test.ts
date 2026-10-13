import { it, expect } from "vitest";
import { setupMockBackend } from "./helpers/mock-backend";
import {
  getEmployeeDashboard,
  getEmployeeProfile,
  getEmployeePayslip,
  updateEmployeeContact,
} from "../src/lib/api/employee";
setupMockBackend();
it("reads the employee contract and stores mock contact edits", async () => {
  expect((await getEmployeeDashboard()).employee.id).toBe("GR-1042");
  await updateEmployeeContact({
    email: "edited@example.com",
    phone: "+91 90000 02222",
  });
  expect((await getEmployeeProfile()).email).toBe("edited@example.com");
  expect((await getEmployeePayslip("September 2026")).employee.email).toBe(
    "edited@example.com",
  );
});
it("distinguishes unavailable periods from service errors", async () => {
  expect((await getEmployeePayslip("August 2026")).payslip).toBeNull();
  await expect(getEmployeeDashboard(undefined, "error")).rejects.toMatchObject({
    status: 503,
    code: "UNAVAILABLE",
  });
});
