import { z } from "zod";
export const documentSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  category: z.enum(["Employment", "Policies", "Learning"]),
  type: z.literal("PDF"),
  sizeBytes: z.number().int().positive(),
  updatedAt: z.iso.date(),
});
export const documentsSchema = z.object({
  ownerId: z.string().min(1),
  items: z.array(documentSchema),
  total: z.number().int().nonnegative(),
});
export type EmployeeDocument = z.infer<typeof documentSchema>;
