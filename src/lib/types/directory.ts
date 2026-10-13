import { z } from "zod";
import { employeeSchema } from "./employee";
export const colleagueSchema = employeeSchema.omit({
  emergencyContact: true,
  accountEnd: true,
});
export const directorySchema = z.object({
  items: z.array(colleagueSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  pageSize: z.number().int().positive(),
  totalPages: z.number().int().positive(),
  departments: z.array(z.string()),
});
export type Colleague = z.infer<typeof colleagueSchema>;
export function directoryParams(params: Pick<URLSearchParams, "get">) {
  const raw = Number(params.get("page") || 1);
  return {
    q: (params.get("q") || "").trim().slice(0, 100),
    department: (params.get("department") || "").slice(0, 80),
    page: Number.isSafeInteger(raw) && raw > 0 ? Math.min(raw, 10000) : 1,
  };
}
export type DirectoryParams = ReturnType<typeof directoryParams>;
