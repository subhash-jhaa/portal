import { http, HttpResponse, delay } from "msw";
import { config } from "@/lib/config";
import { createProjectSchema, type Project } from "@/lib/types/project";
import { initialProjects } from "../fixtures/projects";
let projects: Project[] = structuredClone(initialProjects);
export function resetProjects() {
  projects = structuredClone(initialProjects);
}
const base = config.apiBaseUrl.replace(/\/$/, "");
export const projectHandlers = [
  http.get(base + "/projects", async () => {
    await delay(250);
    return HttpResponse.json({ items: projects, total: projects.length });
  }),
  http.get(base + "/projects/:id", async ({ params }) => {
    const project = projects.find((p) => p.id === params.id);
    return project
      ? HttpResponse.json(project)
      : HttpResponse.json(
          { error: { code: "NOT_FOUND", message: "Project not found." } },
          { status: 404 },
        );
  }),
  http.post(base + "/projects", async ({ request }) => {
    await delay(250);
    const parsed = createProjectSchema.safeParse(
      await request.json().catch(() => null),
    );
    if (!parsed.success)
      return HttpResponse.json(
        {
          error: {
            code: "VALIDATION_ERROR",
            message: parsed.error.issues[0].message,
          },
        },
        { status: 422 },
      );
    const project: Project = {
      ...parsed.data,
      id: crypto.randomUUID(),
      status: "planning",
      createdAt: new Date().toISOString(),
    };
    projects.unshift(project);
    return HttpResponse.json(project, { status: 201 });
  }),
];
