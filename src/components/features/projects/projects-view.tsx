"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  FolderKanban,
  Search,
  Timer,
  TrendingUp,
} from "lucide-react";
import { getProjects } from "@/lib/api/projects";
import type { Project } from "@/lib/types/project";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
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
export function ProjectsView({ overview = false }: { overview?: boolean }) {
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
  const metrics = [
    {
      label: "Total projects",
      value: projects.length,
      icon: FolderKanban,
      caption: "Across your workspace",
    },
    {
      label: "Active",
      value: projects.filter((p) => p.status === "active").length,
      icon: TrendingUp,
      caption: "Moving forward",
    },
    {
      label: "Planning",
      value: projects.filter((p) => p.status === "planning").length,
      icon: Timer,
      caption: "Ready for the next step",
    },
    {
      label: "Completed",
      value: projects.filter((p) => p.status === "completed").length,
      icon: CheckCircle2,
      caption: "Delivered by your teams",
    },
  ];
  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-[.18em] text-primary">
            Your workspace, connected
          </p>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            {overview ? "A clear view of what’s next." : "Projects"}
          </h1>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            {overview
              ? "Keep your initiatives organized and your teams moving forward."
              : "Plan, track, and build your next initiative in one place."}
          </p>
        </div>
        <CreateProjectDialog onCreated={reload} />
      </div>
      {overview && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {metrics.map(({ label, value, icon: Icon, caption }) => (
            <Card key={label} className="shadow-none">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">{label}</p>
                  <Icon className="size-4 text-primary" />
                </div>
                {loading ? (
                  <Skeleton className="my-3 h-9 w-14" />
                ) : (
                  <p className="my-3 text-3xl font-semibold">
                    {error ? "—" : String(value).padStart(2, "0")}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">{caption}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      <Card className="overflow-hidden shadow-none">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b p-6">
          <div>
            <h2 className="font-semibold">
              {overview ? "Workspace projects" : "All projects"}
            </h2>
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
          {overview && (
            <Link
              href="/projects"
              className="flex items-center gap-2 font-medium text-primary"
            >
              View all projects
              <ArrowRight className="size-3" />
            </Link>
          )}
        </div>
      </Card>
      {overview && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-primary/15 bg-primary/5 p-6">
          <div>
            <h2 className="text-sm font-semibold">
              A foundation for your next chapter
            </h2>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              Shared components and one consistent API layer keep your workspace
              ready to grow.
            </p>
          </div>
          <Badge variant="outline">Frontend · Task 01</Badge>
        </div>
      )}
    </div>
  );
}
