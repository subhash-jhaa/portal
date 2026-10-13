import type { EmployeeDocument } from "@/lib/types/document";
export function employeeDocuments(ownerId: string): EmployeeDocument[] {
  return [
    {
      id: "doc-" + ownerId + "-employment",
      name: "Employment confirmation.pdf",
      category: "Employment",
      type: "PDF",
      sizeBytes: 184 * 1024,
      updatedAt: "2026-10-03",
    },
    {
      id: "doc-" + ownerId + "-policy",
      name: "Benefits handbook.pdf",
      category: "Policies",
      type: "PDF",
      sizeBytes: 1258291,
      updatedAt: "2026-10-08",
    },
    {
      id: "doc-" + ownerId + "-training",
      name: "Training certificate.pdf",
      category: "Learning",
      type: "PDF",
      sizeBytes: 420 * 1024,
      updatedAt: "2026-10-10",
    },
  ].sort((a, b) =>
    b.updatedAt.localeCompare(a.updatedAt),
  ) as EmployeeDocument[];
}
