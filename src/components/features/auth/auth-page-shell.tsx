import Link from "next/link";
import { Brand } from "@/components/features/employee/ui/primitives";
import { ThemeToggle } from "@/components/layout/theme-toggle";
export function AuthPageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b bg-card px-6 py-5">
        <Brand />
        <div className="flex items-center gap-4">
          <Link href="/designs" className="text-sm text-primary underline">
            Design review
          </Link>
          <ThemeToggle />
        </div>
      </header>
      <main className="px-5 py-12">{children}</main>
    </div>
  );
}
