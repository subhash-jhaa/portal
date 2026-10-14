import { z } from "zod";
import { colleagueSchema } from "./directory";

export const workforceOverviewSchema = z.object({
  totalEmployees: z.number().int().nonnegative(),
  unassignedEmployees: z.number().int().nonnegative(),
  departments: z.array(
    z.object({ name: z.string(), count: z.number().int().positive() }),
  ),
  recentJoiners: z.array(colleagueSchema),
});
export type WorkforceOverview = z.infer<typeof workforceOverviewSchema>;
