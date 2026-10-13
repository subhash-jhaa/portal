import Link from "next/link";
export default function NotFound() {
  return (
    <main className="mx-auto max-w-xl p-12">
      <h1 className="text-3xl font-semibold">Page not found</h1>
      <p className="my-4 text-muted-foreground">
        This page is not part of the workspace.
      </p>
      <Link href="/" className="text-primary underline">
        Return to overview
      </Link>
    </main>
  );
}
