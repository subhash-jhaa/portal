import { z } from "zod";
export const projectSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  status: z.enum(["active", "planning", "completed"]),
  owner: z.string(),
  createdAt: z.string().datetime(),
});
export const projectsResponseSchema = z.object({
  items: z.array(projectSchema),
  total: z.number().int().nonnegative(),
});
export const createProjectSchema = z.object({
  name: z.string().trim().min(3, "Use at least 3 characters").max(80),
  description: z.string().trim().max(500),
  owner: z.string().trim().min(2, "Enter an owner").max(80),
});
export type Project = z.infer<typeof projectSchema>;
export type CreateProjectInput = z.infer<typeof createProjectSchema>;
