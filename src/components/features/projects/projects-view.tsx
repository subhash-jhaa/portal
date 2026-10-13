"use client";
import { useEffect, useState } from "react";
import { FolderKanban, Search } from "lucide-react";
import { getProjects } from "@/lib/api/projects";
import type { Project } from "@/lib/types/project";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CreateProjectDialog } from "./create-project-dialog";
export function ProjectsView() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    getProjects(controller.signal)
      .then((result) => {
        setProjects(result.items);
        setError("");
      })
      .catch((error) => {
        if (!controller.signal.aborted)
          setError(
            error instanceof Error ? error.message : "Unable to load projects",
          );
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [revision]);
  function reload() {
    setLoading(true);
    setError("");
    setRevision((value) => value + 1);
  }
  const filtered = projects.filter((project) =>
    (project.name + " " + project.owner)
      .toLowerCase()
      .includes(query.toLowerCase()),
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-[.18em] text-primary">
            Your workspace, connected
          </p>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Projects
          </h1>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            Plan, track, and build your next initiative in one place.
          </p>
        </div>
        <CreateProjectDialog onCreated={reload} />
      </div>

      <Card className="overflow-hidden shadow-none">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b p-6">
          <div>
            <h2 className="font-semibold">All projects</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              A shared view of your team’s initiatives.
            </p>
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-3 size-4 text-muted-foreground" />
            <Input
              aria-label="Search projects"
              placeholder="Search projects…"
              className="pl-9"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>
        </div>
        {loading ? (
          <div
            role="status"
            aria-label="Loading projects"
            className="space-y-5 p-6"
          >
            {[1, 2, 3].map((n) => (
              <Skeleton key={n} className="h-12 w-full" />
            ))}
          </div>
        ) : error ? (
          <div role="alert" className="space-y-4 p-8">
            <p className="text-sm text-destructive">{error}</p>
            <Button variant="outline" onClick={reload}>
              Retry
            </Button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <FolderKanban className="mx-auto mb-4 size-8 text-muted-foreground" />
            <h3 className="font-medium">
              {query ? "No matching projects" : "Your next project starts here"}
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {query
                ? "Try a different name or owner."
                : "Use New project to create your first initiative."}
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-6">Project</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead className="pr-6">Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((project) => (
                <TableRow key={project.id}>
                  <TableCell className="py-5 pl-6">
                    <p className="font-medium">{project.name}</p>
                    <p className="mt-1 max-w-sm text-xs text-muted-foreground">
                      {project.description}
                    </p>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        project.status === "active" ? "default" : "secondary"
                      }
                      className="capitalize"
                    >
                      {project.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {project.owner}
                  </TableCell>
                  <TableCell className="whitespace-nowrap pr-6 text-muted-foreground">
                    {new Intl.DateTimeFormat("en", {
                      month: "short",
                      day: "numeric",
                      timeZone: "UTC",
                    }).format(new Date(project.createdAt))}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
        <div className="flex items-center justify-between border-t px-6 py-4 text-xs text-muted-foreground">
          <span>
            {loading
              ? "Loading…"
              : error
                ? "Unavailable"
                : filtered.length + " projects"}
          </span>
        </div>
      </Card>
    </div>
  );
}
