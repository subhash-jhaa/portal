export type Screen =
  "login" | "dashboard" | "profile" | "payslip" | "documents";
export type DisplayState = "normal" | "loading" | "empty" | "error";
export type Option = "selected" | "alternative";
export const screenLabels: Record<Screen, string> = {
  documents: "Documents",
  login: "Login",
  dashboard: "Dashboard",
  profile: "Profile",
  payslip: "Payslip",
};
export const selections: Record<
  Screen,
  { selected: string; alternative: string; reason: string }
> = {
  documents: {
    selected: "Compact table",
    alternative: "File cards",
    reason:
      "The table makes file metadata easy to compare; selected layout uses cards on mobile for readable labels.",
  },
  login: {
    selected: "Split welcome",
    alternative: "Focused card",
    reason:
      "A focused form with brand context; the brand panel disappears on mobile.",
  },
  dashboard: {
    selected: "Salary first",
    alternative: "Actions first",
    reason:
      "Makes the latest payroll summary and View payslip the clearest next action.",
  },
  profile: {
    selected: "Identity sidebar",
    alternative: "Stacked details",
    reason:
      "Separates stable employment identity from editable contact details.",
  },
  payslip: {
    selected: "Statement",
    alternative: "History sidebar",
    reason:
      "A readable statement keeps earnings, deductions, and net pay together.",
  },
};
