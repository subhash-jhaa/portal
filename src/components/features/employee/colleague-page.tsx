"use client";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useCurrentUser } from "@/components/providers/auth-provider";
import { getColleague } from "@/lib/api/directory";
import { Button } from "@/components/ui/button";
import { Heading, Panel, DataState } from "./ui/primitives";
export function ColleaguePage({ id }: { id: string }) {
  const { user } = useCurrentUser();
  const query = useQuery({
    queryKey: ["employee", user.id, "colleague", id],
    queryFn: ({ signal }) => getColleague(id, signal),
  });
  if (query.isPending)
    return (
      <DataState
        state="loading"
        title="profile"
        empty="Profile not available"
        onRetry={() => void query.refetch()}
      />
    );
  if (query.isError)
    return (
      <>
        <Heading
          eyebrow="Directory"
          title="Profile unavailable"
          copy={query.error.message}
        />
        <Button onClick={() => void query.refetch()}>Try again</Button>
        <Link className="ml-4 text-primary" href="/directory">
          Back to directory
        </Link>
      </>
    );
  const employee = query.data;
  return (
    <>
      <Link
        href="/directory"
        className="mb-6 inline-block text-sm text-primary"
      >
        ← Back to directory
      </Link>
      <Heading eyebrow="Directory" title={employee.name} copy={employee.role} />
      <Panel>
        <div className="flex items-center gap-4">
          <span
            aria-label={"Photo placeholder for " + employee.name}
            className="grid size-20 place-items-center rounded-2xl bg-accent text-2xl font-semibold text-accent-foreground"
          >
            {employee.initials}
          </span>
          <div>
            <h2 className="text-lg font-semibold">
              Employment and contact details
            </h2>
            <p className="text-sm text-muted-foreground">
              Directory profiles are read-only.
            </p>
          </div>
        </div>
        <dl className="grid gap-6 sm:grid-cols-2">
          {[
            ["Employee ID", employee.id],
            ["Department", employee.department],
            ["Role", employee.role],
            ["Manager", employee.manager],
            ["Location", employee.location],
            ["Joined", employee.joined],
            ["Work email", employee.email],
            ["Phone", employee.phone || "Not provided"],
          ].map(([label, value]) => (
            <div key={label}>
              <dt className="text-xs text-muted-foreground">{label}</dt>
              <dd className="mt-2 break-words text-sm font-medium">{value}</dd>
            </div>
          ))}
        </dl>
        {user.id === id && (
          <Link href="/profile" className="text-sm text-primary">
            Edit your contact details in My profile
          </Link>
        )}
      </Panel>
    </>
  );
}
