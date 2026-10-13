"use client";
import { DocumentsScreen } from "@/components/features/documents/documents-screen";
export default function Loading() {
  return <DocumentsScreen items={[]} state="loading" onRetry={() => {}} />;
}
