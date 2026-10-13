import { Suspense } from "react";
import { DirectoryPage } from "@/components/features/employee/directory-page";
export default function Page() {
  return (
    <Suspense fallback={<p role="status">Loading directory…</p>}>
      <DirectoryPage />
    </Suspense>
  );
}
