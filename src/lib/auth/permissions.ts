import type { CurrentUser } from "@/lib/types/auth";

export function canViewWorkforce(user: Pick<CurrentUser, "role">) {
  return user.role === "admin";
}
