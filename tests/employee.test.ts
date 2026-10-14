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

it("scopes dashboard and payslip records to the signed-in subject, not request IDs", async () => {
  const { backendRequest } = await import("../src/lib/api/backend");
  const { dashboardSchema, payslipResponseSchema } =
    await import("../src/lib/types/employee");
  const records = [];
  for (const [email, password, id, account, net] of [
    ["aarav.mehta@example.com", "Employee123!", "GR-1042", "4821", 65000],
    ["neha.kapoor@example.com", "Admin123!", "GR-1001", "7396", 100000],
  ] as const) {
    const login = await backendRequest("/auth/login", {
      method: "POST",
      body: { email, password },
    });
    const token = (await login.json()).access_token;
    const dashboard = dashboardSchema.parse(
      await (
        await backendRequest("/employee/dashboard?employeeId=someone-else", {
          token,
        })
      ).json(),
    );
    const payslip = payslipResponseSchema.parse(
      await (
        await backendRequest(
          "/employee/payslip?period=September%202026&employeeId=someone-else",
          { token },
        )
      ).json(),
    );
    expect(dashboard.employee.id).toBe(id);
    expect(dashboard.employee.accountEnd).toBe(account);
    expect(payslip.employee).toEqual(dashboard.employee);
    expect(payslip.payslip).toEqual(dashboard.latestPayslip);
    const payroll = payslip.payslip!;
    expect(payroll.account).toContain(account);
    expect(
      payroll.earnings.reduce((sum, item) => sum + item.amount, 0) -
        payroll.deductions.reduce((sum, item) => sum + item.amount, 0),
    ).toBe(net);
    records.push(dashboard.employee);
  }
  expect(records[0].phone).not.toBe(records[1].phone);
  expect(records[0].joined).not.toBe(records[1].joined);
});
