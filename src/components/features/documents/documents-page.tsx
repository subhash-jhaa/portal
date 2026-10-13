"use client";
import { getEmployeeDocuments } from "@/lib/api/documents";
import { useResource } from "@/components/features/employee/use-resource";
import { DocumentsScreen } from "./documents-screen";
export function DocumentsPage() {
  const resource = useResource(getEmployeeDocuments, "documents");
  return (
    <DocumentsScreen
      items={resource.data?.items || []}
      state={
        resource.loading
          ? "loading"
          : resource.error
            ? "error"
            : resource.data?.items.length
              ? "normal"
              : "empty"
      }
      error={resource.error}
      onRetry={resource.retry}
    />
  );
}
