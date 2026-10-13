"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  ArrowUpRight,
  FolderKanban,
  LayoutDashboard,
  Layers,
  Menu,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "./theme-toggle";
import { config } from "@/lib/config";
const links = [
  { href: "/", label: "Overview", icon: LayoutDashboard },
  { href: "/projects", label: "Projects", icon: FolderKanban },
];
export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  return (
    <div className="min-h-screen bg-background">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:z-50 focus:bg-background focus:p-4"
      >
        Skip to content
      </a>
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r bg-card md:flex">
        <Link
          href="/"
          className="flex h-20 items-center gap-3 px-7 text-xl font-semibold tracking-tight"
        >
          <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Layers className="size-5" />
          </span>
          growmer<span className="text-primary">.</span>
        </Link>
        <div className="px-5 pt-8">
          <p className="mb-3 px-3 text-[11px] font-semibold tracking-[.18em] text-muted-foreground">
            WORKSPACE
          </p>
          <nav aria-label="Main navigation" className="space-y-2">
            {links.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                aria-current={pathname === href ? "page" : undefined}
                className={
                  "flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium " +
                  (pathname === href
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted")
                }
              >
                <Icon className="size-4" />
                {label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="mt-auto p-5">
          <div className="rounded-xl border bg-muted/40 p-4">
            <p className="text-sm font-semibold">Built for what’s next</p>
            <p className="mt-2 text-xs leading-5 text-muted-foreground">
              One foundation. Consistent components. Room to grow.
            </p>
            <span className="mt-4 flex items-center gap-2 text-xs font-medium text-primary">
              Frontend foundation <ArrowUpRight className="size-3" />
            </span>
          </div>
          <p className="mt-5 px-2 text-xs text-muted-foreground">
            Task 01 · Architecture & UI
          </p>
        </div>
      </aside>
      <div className="md:pl-64">
        <header className="flex h-20 items-center justify-between border-b bg-card/80 px-5 sm:px-9">
          <div className="flex items-center gap-3">
            <Button
              className="md:hidden"
              variant="ghost"
              size="icon"
              aria-label={open ? "Close navigation" : "Open navigation"}
              aria-expanded={open}
              aria-controls="mobile-navigation"
              onClick={() => setOpen(!open)}
            >
              {open ? <X /> : <Menu />}
            </Button>
            <p className="text-sm text-muted-foreground">
              Workspace <span className="mx-2 text-border">/</span>
              <span className="font-medium text-foreground">
                {pathname === "/" ? "Overview" : "Projects"}
              </span>
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="hidden sm:inline-flex">
              {config.mocksEnabled ? "Demo workspace" : "Connected API"}
            </Badge>
            <ThemeToggle />
            <span
              className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary"
              aria-label="Growmer workspace"
            >
              GW
            </span>
          </div>
        </header>
        {open && (
          <nav
            id="mobile-navigation"
            aria-label="Mobile navigation"
            className="border-b bg-card p-4 md:hidden"
          >
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="block rounded-lg p-3 hover:bg-muted"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        )}
        <main
          id="main"
          className="mx-auto max-w-7xl px-5 py-9 sm:px-9 sm:py-12"
        >
          {children}
        </main>
      </div>
    </div>
  );
}
