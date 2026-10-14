"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useCurrentUser } from "@/components/providers/auth-provider";
import { getDirectory } from "@/lib/api/directory";
import { directoryParams } from "@/lib/types/directory";
import type { MockScenario } from "@/lib/api/employee";
import { config } from "@/lib/config";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Heading, Panel } from "./ui/primitives";
export function DirectoryPage() {
  const router = useRouter();
  const search = useSearchParams();
  const { user } = useCurrentUser();
  const params = directoryParams(search);
  const [draft, setDraft] = useState(params.q);
  const [lastQ, setLastQ] = useState(params.q);
  if (lastQ !== params.q) {
    setLastQ(params.q);
    setDraft(params.q);
  }
  const raw = config.mocksEnabled ? search.get("demoState") : null;
  const scenario: MockScenario = [
    "loading",
    "empty",
    "error",
    "expired",
  ].includes(raw || "")
    ? (raw as MockScenario)
    : "normal";
  const query = useQuery({
    queryKey: ["employee", user.id, "directory", params, scenario],
    queryFn: ({ signal }) => getDirectory(params, signal, scenario),
  });
  function navigate(changes: Record<string, string>, replace = false) {
    const next = new URLSearchParams(search.toString());
    for (const [key, value] of Object.entries(changes)) {
      if (value) next.set(key, value);
      else next.delete(key);
    }
    const url = "/directory" + (next.size ? "?" + next : "");
    if (replace) router.replace(url, { scroll: false });
    else router.push(url, { scroll: false });
  }
  useEffect(() => {
    if (draft.trim().slice(0, 100) === params.q) return;
    const timer = setTimeout(() => {
      const next = new URLSearchParams(search.toString());
      if (draft.trim()) next.set("q", draft.trim().slice(0, 100));
      else next.delete("q");
      next.delete("page");
      router.push("/directory" + (next.size ? "?" + next : ""), {
        scroll: false,
      });
    }, 350);
    return () => clearTimeout(timer);
  }, [draft, params.q, search, router]);
  const data = query.data;
  useEffect(() => {
    if (!data) return;
    const next = new URLSearchParams(search.toString());
    if (next.has("page") || data.page !== 1)
      next.set("page", String(data.page));
    if (next.toString() === search.toString()) return;
    router.replace("/directory" + (next.size ? "?" + next : ""), {
      scroll: false,
    });
  }, [data, search, router]);
  return (
    <>
      <Heading
        eyebrow="People"
        title="Employee directory"
        copy="Find a colleague by name, department, role or location."
      />
      <Panel>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="directory-search"
              className="mb-2 block text-sm font-medium"
            >
              Search employees
            </label>
            <Input
              id="directory-search"
              value={draft}
              maxLength={100}
              placeholder="Name, role or location"
              onChange={(event) => setDraft(event.target.value)}
            />
          </div>
          <div>
            <label
              htmlFor="directory-department"
              className="mb-2 block text-sm font-medium"
            >
              Department
            </label>
            <select
              id="directory-department"
              className="h-10 w-full rounded-md border bg-background px-3 text-sm"
              value={params.department}
              onChange={(event) =>
                navigate({ department: event.target.value, page: "" })
              }
            >
              <option value="">All departments</option>
              {[
                ...new Set([
                  ...(data?.departments || []),
                  ...(params.department ? [params.department] : []),
                ]),
              ].map((department) => (
                <option key={department}>{department}</option>
              ))}
            </select>
          </div>
        </div>
        {query.isPending ? (
          <div
            aria-label="Loading employees"
            role="status"
            className="space-y-4"
          >
            {Array.from({ length: 5 }, (_, index) => (
              <Skeleton key={index} className="h-12 w-full" />
            ))}
          </div>
        ) : query.isError ? (
          <div role="alert" className="space-y-4">
            <p>{query.error.message}</p>
            <Button
              onClick={() =>
                scenario === "normal"
                  ? void query.refetch()
                  : navigate({ demoState: "" }, true)
              }
            >
              Try again
            </Button>
          </div>
        ) : data && data.items.length === 0 ? (
          <div role="status" className="space-y-4 py-8">
            <h2 className="text-lg font-semibold">No employees found</h2>
            <p className="text-sm text-muted-foreground">
              Try another name or department.
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setDraft("");
                navigate({ q: "", department: "", page: "", demoState: "" });
              }}
            >
              Clear filters
            </Button>
          </div>
        ) : (
          data && (
            <>
              <p role="status" className="text-sm text-muted-foreground">
                {data.total} employees · Page {data.page} of {data.totalPages}
                {query.isFetching ? " · Refreshing…" : ""}
              </p>
              <Table>
                <TableHeader>
                  <TableRow>
                    {["Name", "Department", "Role", "Location"].map((label) => (
                      <TableHead key={label}>{label}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.items.map((employee) => (
                    <TableRow key={employee.id}>
                      <TableCell>
                        <Link
                          className="font-medium text-primary underline-offset-4 hover:underline"
                          href={"/directory/" + employee.id}
                        >
                          {employee.name}
                        </Link>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {employee.id}
                        </p>
                      </TableCell>
                      <TableCell>{employee.department}</TableCell>
                      <TableCell>{employee.role}</TableCell>
                      <TableCell>{employee.location}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <nav
                aria-label="Directory pagination"
                className="flex flex-wrap items-center justify-between gap-3"
              >
                <Button
                  variant="outline"
                  disabled={data.page <= 1 || query.isFetching}
                  onClick={() => navigate({ page: String(data.page - 1) })}
                >
                  Previous
                </Button>
                <span className="text-sm">
                  Showing {(data.page - 1) * data.pageSize + 1}–
                  {Math.min(data.page * data.pageSize, data.total)} of{" "}
                  {data.total}
                </span>
                <Button
                  variant="outline"
                  disabled={data.page >= data.totalPages || query.isFetching}
                  onClick={() => navigate({ page: String(data.page + 1) })}
                >
                  Next
                </Button>
              </nav>
            </>
          )
        )}
      </Panel>
    </>
  );
}
