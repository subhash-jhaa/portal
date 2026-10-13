import type { Project } from "@/lib/types/project";
export const initialProjects: Project[] = [
  {
    id: "p1",
    name: "Customer portal",
    description: "A shared home for customers, requests, and updates.",
    status: "active",
    owner: "Product team",
    createdAt: "2026-10-01T09:00:00.000Z",
  },
  {
    id: "p2",
    name: "Operations workspace",
    description: "Bring everyday workflows into one place.",
    status: "planning",
    owner: "Operations",
    createdAt: "2026-10-04T09:00:00.000Z",
  },
  {
    id: "p3",
    name: "Design system",
    description: "Reusable foundations for every future screen.",
    status: "active",
    owner: "Design team",
    createdAt: "2026-10-06T09:00:00.000Z",
  },
  {
    id: "p4",
    name: "Reporting migration",
    description: "A consistent source for reporting and insights.",
    status: "completed",
    owner: "Engineering",
    createdAt: "2026-09-20T09:00:00.000Z",
  },
];
