import { z } from "zod";
export const employeeSchema = z.object({
  name: z.string(),
  initials: z.string(),
  id: z.string(),
  role: z.string(),
  department: z.string(),
  manager: z.string(),
  location: z.string(),
  email: z.email(),
  phone: z.string(),
  joined: z.string(),
  emergencyContact: z.string().optional(),
  accountEnd: z.string().optional(),
});
const itemSchema = z.object({
  label: z.string(),
  amount: z.number().nonnegative(),
});
export const payslipSchema = z.object({
  period: z.string(),
  paid: z.string(),
  account: z.string(),
  earnings: z.array(itemSchema),
  deductions: z.array(itemSchema),
});
export const dashboardSchema = z.object({
  employee: employeeSchema,
  latestPayslip: payslipSchema.nullable(),
  profileActionCount: z.number().int().nonnegative(),
  announcement: z.string(),
});
export const payslipResponseSchema = z.object({
  employee: employeeSchema,
  payslip: payslipSchema.nullable(),
});
export const contactInputSchema = z.strictObject({
  emergencyContact: z.string().trim().max(120).optional(),
  email: z.email(),
  phone: z
    .string()
    .trim()
    .max(40)
    .refine(
      (value) =>
        value.length === 0 ||
        (/^\+?[0-9 ()-]+$/.test(value) &&
          value.replace(/\D/g, "").length >= 7 &&
          value.replace(/\D/g, "").length <= 15),
      "Enter a valid phone number",
    ),
});
export type Employee = z.infer<typeof employeeSchema>;
export type Payslip = z.infer<typeof payslipSchema>;
export type ContactInput = z.infer<typeof contactInputSchema>;
