"use client";

import Link from "next/link";
import {
  Building2,
  UsersRound,
  UserRoundPlus,
  ArrowUpRight,
  ShieldCheck,
} from "lucide-react";
import { getWorkforceOverview } from "@/lib/api/admin";
import { useCurrentUser } from "@/components/providers/auth-provider";
import { useResource } from "@/components/features/employee/use-resource";
import {
  Heading,
  Panel,
  DataState,
} from "@/components/features/employee/ui/primitives";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function AdminDashboard() {
  const { user } = useCurrentUser();
  const resource = useResource(getWorkforceOverview, "admin-overview");
  const data = resource.data;
  return (
    <>
      <Heading
        eyebrow="Admin workspace"
        title={"Welcome, " + user.name.split(" ")[0]}
        copy="Your people overview. Explore the workforce, review department coverage and find colleagues."
      />
      {resource.loading || resource.error || !data ? (
        <>
          <DataState
            state={resource.loading ? "loading" : "error"}
            title="workforce overview"
            empty="No employees yet"
            onRetry={resource.retry}
            retryLabel="Try again"
          />
          {resource.error && (
            <p className="mt-4 text-sm text-destructive">{resource.error}</p>
          )}
        </>
      ) : data.totalEmployees === 0 ? (
        <DataState
          state="empty"
          title="workforce overview"
          empty="No employees yet"
          onRetry={resource.retry}
        />
      ) : (
        <div className="space-y-6" data-testid="admin-overview">
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border bg-accent p-5">
            <div className="flex items-center gap-3">
              <ShieldCheck className="size-6 text-primary" aria-hidden="true" />
              <div>
                <h2 className="font-semibold">People operations</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  An organization-wide view, with personal records kept in My
                  workspace.
                </p>
              </div>
            </div>
            <Badge>Admin access</Badge>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              {
                label: "Total employees",
                value: data.totalEmployees,
                icon: UsersRound,
                copy: "Current directory records",
              },
              {
                label: "Departments",
                value: data.departments.length,
                icon: Building2,
                copy: "Teams across your organization",
              },
              {
                label: "Awaiting assignment",
                value: data.unassignedEmployees,
                icon: UserRoundPlus,
                copy: "Employees without a department",
              },
            ].map(({ label, value, icon: Icon, copy }) => (
              <Panel key={label}>
                <Icon className="size-5 text-primary" aria-hidden="true" />
                <div>
                  <h2 className="text-sm text-muted-foreground">{label}</h2>
                  <p className="mt-2 text-3xl font-semibold tabular-nums">
                    {value}
                  </p>
                  <p className="mt-2 text-xs text-muted-foreground">{copy}</p>
                </div>
              </Panel>
            ))}
          </div>
          <div className="grid gap-6 xl:grid-cols-2">
            <Panel>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-lg font-semibold">Department overview</h2>
                <Link
                  href="/directory"
                  className="text-sm font-medium text-primary underline-offset-4 hover:underline"
                >
                  Open employee directory
                </Link>
              </div>
              <ul className="space-y-4">
                {data.departments.map((department) => (
                  <li key={department.name}>
                    <Link
                      href={
                        "/directory?department=" +
                        encodeURIComponent(department.name)
                      }
                      className="flex justify-between gap-3 rounded-sm text-sm hover:text-primary focus-visible:outline-2 focus-visible:outline-ring"
                    >
                      <span>{department.name}</span>
                      <span className="font-medium tabular-nums">
                        {department.count}
                      </span>
                    </Link>
                    <div
                      className="mt-2 h-2 overflow-hidden rounded-full bg-muted"
                      aria-hidden="true"
                    >
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{
                          width:
                            (department.count / data.totalEmployees) * 100 +
                            "%",
                        }}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            </Panel>
            <Panel>
              <h2 className="text-lg font-semibold">Recent joiners</h2>
              <p className="text-sm text-muted-foreground">
                Latest joining dates in the employee directory.
              </p>
              <ul className="divide-y">
                {data.recentJoiners.map((employee) => (
                  <li key={employee.id}>
                    <Link
                      href={"/directory/" + employee.id}
                      className="flex items-center gap-3 rounded-lg py-4 hover:bg-muted focus-visible:outline-2 focus-visible:outline-ring"
                    >
                      <span className="grid size-10 shrink-0 place-items-center rounded-full bg-accent text-sm font-medium text-accent-foreground">
                        {employee.initials}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">
                          {employee.name}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {employee.department} · {employee.joined}
                        </p>
                      </div>
                      <ArrowUpRight
                        className="size-4 shrink-0 text-muted-foreground"
                        aria-hidden="true"
                      />
                    </Link>
                  </li>
                ))}
              </ul>
            </Panel>
          </div>
          <Panel>
            <h2 className="text-lg font-semibold">My workspace</h2>
            <p className="text-sm text-muted-foreground">
              Keep your own contact details up to date and review your personal
              payslip.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/profile"
                className={buttonVariants({ variant: "outline" })}
              >
                My profile
              </Link>
              <Link
                href="/payslip"
                className={buttonVariants({ variant: "outline" })}
              >
                My payslip
              </Link>
            </div>
          </Panel>
        </div>
      )}
    </>
  );
}
