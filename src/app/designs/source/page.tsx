import Link from "next/link";
import { GrowmerPortal } from "@/components/features/designs/v0-source";
export default function OriginalDesignPage() {
  return (
    <>
      <div className="border-b bg-card p-4 text-sm">
        <Link href="/designs" className="text-primary underline">
          Back to reviewed designs
        </Link>
        <span className="ml-4">
          Original v0 generation · Unreviewed behavior · Fictional data
        </span>
      </div>
      <GrowmerPortal />
    </>
  );
}
