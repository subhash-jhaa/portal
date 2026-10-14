import { employee, payroll } from "@/lib/design/fixtures";
import type { Employee, Payslip } from "@/lib/types/employee";

// Personal records are selected by verified employee ID, never by role.
export const demoRecords: Record<
  string,
  { employee: Employee; payslip: Payslip } | undefined
> = {
  "GR-1042": { employee: { ...employee }, payslip: structuredClone(payroll) },
  "GR-1001": {
    employee: {
      id: "GR-1001",
      name: "Neha Kapoor",
      initials: "NK",
      email: "neha.kapoor@example.com",
      role: "People Operations Lead",
      department: "People Operations",
      manager: "Priya Rao",
      location: "Mumbai, India",
      phone: "+91 90000 05678",
      joined: "3 July 2022",
      emergencyContact: "Rohan Kapoor · +91 90000 05679",
      accountEnd: "7396",
    },
    payslip: {
      period: "September 2026",
      paid: "30 September 2026",
      account: "•••• 7396",
      earnings: [
        { label: "Basic salary", amount: 70000 },
        { label: "House rent allowance", amount: 28000 },
        { label: "Special allowance", amount: 22000 },
      ],
      deductions: [
        { label: "Provident fund", amount: 8400 },
        { label: "Professional tax", amount: 200 },
        { label: "Income tax", amount: 11400 },
      ],
    },
  },
};
