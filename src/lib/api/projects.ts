import { apiRequest } from "./client";
import {
  projectSchema,
  projectsResponseSchema,
  createProjectSchema,
  type CreateProjectInput,
} from "@/lib/types/project";
export const getProjects = (signal?: AbortSignal) =>
  apiRequest("/projects", projectsResponseSchema, { signal });
export const getProject = (id: string, signal?: AbortSignal) =>
  apiRequest("/projects/" + encodeURIComponent(id), projectSchema, { signal });
export const createProject = (input: CreateProjectInput) =>
  apiRequest("/projects", projectSchema, {
    method: "POST",
    body: createProjectSchema.parse(input),
  });
