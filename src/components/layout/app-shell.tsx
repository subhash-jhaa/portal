"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  UserRound,
  UsersRound,
  FolderOpen,
  ReceiptIndianRupee,
  Layers,
  Menu,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./theme-toggle";
import { Brand } from "@/components/features/employee/ui/primitives";
import { useCurrentUser } from "@/components/providers/auth-provider";
const links = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/directory", label: "Directory", icon: UsersRound },
  { href: "/profile", label: "My profile", icon: UserRound },
  { href: "/documents", label: "My Documents", icon: FolderOpen },
  { href: "/payslip", label: "Payslips", icon: ReceiptIndianRupee },
];
export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { user, role, logout, loggingOut, logoutError } = useCurrentUser();
  return (
    <div className="min-h-screen bg-background">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:z-50 focus:bg-card focus:p-4"
      >
        Skip to content
      </a>
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col border-r bg-card p-5 lg:flex">
        <Link href="/dashboard">
          <Brand />
        </Link>
        <nav aria-label="Main navigation" className="mt-10 space-y-2">
          {links.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              aria-current={pathname === href ? "page" : undefined}
              className={
                "flex items-center gap-3 rounded-xl p-3 text-sm font-medium " +
                (pathname === href
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-muted")
              }
            >
              <Icon className="size-4" aria-hidden="true" />
              {label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto space-y-4">
          <div className="rounded-xl bg-accent p-4 text-accent-foreground">
            <p className="font-medium">{user.name}</p>
            <p className="mt-2 text-xs">{user.id}</p>
          </div>
          <Link
            href="/designs"
            className="flex items-center gap-2 text-sm text-primary"
          >
            <Layers className="size-4" />
            Design review gallery
          </Link>
          <p
            className="text-xs capitalize text-muted-foreground"
            data-testid="current-role"
          >
            {role}
          </p>
          <Button
            variant="outline"
            onClick={() => void logout()}
            disabled={loggingOut}
          >
            {loggingOut ? "Signing out…" : "Sign out"}
          </Button>
          {logoutError && (
            <p role="alert" className="text-sm text-destructive">
              {logoutError}
            </p>
          )}
        </div>
      </aside>
      <div className="lg:pl-60">
        <header className="flex items-center justify-between border-b bg-card px-5 py-5 sm:px-8">
          <div className="flex items-center gap-3">
            <Button
              className="lg:hidden"
              variant="outline"
              size="icon"
              aria-label={open ? "Close navigation" : "Open navigation"}
              aria-expanded={open}
              aria-controls="mobile-navigation"
              onClick={() => setOpen(!open)}
            >
              {open ? <X /> : <Menu />}
            </Button>
            <p className="text-sm text-muted-foreground">
              People portal /{" "}
              <span className="font-medium text-foreground">
                {links.find((link) => link.href === pathname)?.label ||
                  "Workspace"}
              </span>
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              className="lg:hidden"
              variant="outline"
              onClick={() => void logout()}
              disabled={loggingOut}
            >
              Sign out
            </Button>
            <ThemeToggle />
          </div>
        </header>
        {open && (
          <nav
            id="mobile-navigation"
            aria-label="Mobile navigation"
            className="flex flex-wrap gap-3 border-b bg-card p-4 lg:hidden"
          >
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-lg p-3 text-sm hover:bg-muted"
              >
                {link.label}
              </Link>
            ))}
            <Link href="/designs" className="p-3 text-sm text-primary">
              Design review
            </Link>
            <p className="p-3 text-xs capitalize" data-testid="mobile-role">
              {role}
            </p>
          </nav>
        )}
        <main id="main" className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:p-10">
          {logoutError && (
            <p role="alert" className="mb-4 text-sm text-destructive">
              {logoutError}
            </p>
          )}
          {children}
        </main>
      </div>
    </div>
  );
}
