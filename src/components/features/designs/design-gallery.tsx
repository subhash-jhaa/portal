"use client";
import Link from "next/link";
import { useState } from "react";
import {
  FolderOpen,
  Home,
  Menu,
  ReceiptIndianRupee,
  UserRound,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import {
  screenLabels,
  selections,
  type Screen,
  type DisplayState,
  type Option,
} from "@/lib/design/types";
import { employee } from "@/lib/design/fixtures";
import { Brand } from "@/components/features/employee/ui/primitives";
import { LoginScreen } from "@/components/features/employee/ui/login-screen";
import { DashboardScreen } from "@/components/features/employee/ui/dashboard-screen";
import { ProfileScreen } from "@/components/features/employee/ui/profile-screen";
import { PayslipScreen } from "@/components/features/employee/ui/payslip-screen";
import { DocumentsScreen } from "@/components/features/documents/documents-screen";
import { employeeDocuments } from "@/mocks/fixtures/documents";
const documentPreview = employeeDocuments("GR-1042");
const screens: Screen[] = [
  "login",
  "dashboard",
  "profile",
  "payslip",
  "documents",
];
const icons = {
  documents: FolderOpen,
  login: UserRound,
  dashboard: Home,
  profile: UserRound,
  payslip: ReceiptIndianRupee,
};
export function DesignGallery() {
  const [screen, setScreen] = useState<Screen>("dashboard");
  const [state, setState] = useState<DisplayState>("normal");
  const [option, setOption] = useState<Option>("selected");
  const [mobileOpen, setMobileOpen] = useState(false);
  function selectScreen(next: Screen) {
    setScreen(next);
    setState("normal");
    setOption("selected");
    setMobileOpen(false);
  }
  const props = { state, option, onState: setState };
  return (
    <div className="min-h-screen bg-background">
      <a
        href="#design-content"
        className="sr-only focus:not-sr-only focus:block focus:bg-card focus:p-3"
      >
        Skip to content
      </a>
      <div className="border-b bg-card px-5 py-4 sm:px-8">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold">
              Task 2 · Reviewed v0 designs
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Fictional data · Visual prototypes · No authentication or payroll
              persistence
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-sm text-primary underline-offset-4 hover:underline"
            >
              Task 1 workspace
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </div>
      <div className="mx-auto flex max-w-screen-2xl">
        <aside className="hidden w-60 shrink-0 border-r bg-card px-5 py-8 lg:block">
          <Brand />
          <nav aria-label="Design screens" className="mt-10 space-y-2">
            {screens.map((id) => {
              const Icon = icons[id];
              return (
                <Button
                  key={id}
                  variant={screen === id ? "secondary" : "ghost"}
                  className="w-full justify-start"
                  aria-current={screen === id ? "page" : undefined}
                  onClick={() => selectScreen(id)}
                >
                  <Icon className="size-4" />
                  {screenLabels[id]}
                </Button>
              );
            })}
          </nav>
          <div className="mt-12 rounded-xl bg-accent p-4 text-accent-foreground">
            <p className="font-medium">{employee.name}</p>
            <p className="mt-1 text-xs">{employee.id} · Fictional employee</p>
          </div>
        </aside>
        <div className="min-w-0 flex-1">
          <header className="flex items-center justify-between border-b bg-card px-5 py-4 lg:hidden">
            <Brand />
            <Button
              variant="outline"
              size="icon"
              aria-label={
                mobileOpen
                  ? "Close design navigation"
                  : "Open design navigation"
              }
              aria-expanded={mobileOpen}
              aria-controls="design-mobile-nav"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X /> : <Menu />}
            </Button>
          </header>
          {mobileOpen && (
            <nav
              id="design-mobile-nav"
              aria-label="Mobile design screens"
              className="flex flex-wrap gap-2 border-b bg-card p-4 lg:hidden"
            >
              {screens.map((id) => (
                <Button
                  key={id}
                  variant="outline"
                  onClick={() => selectScreen(id)}
                >
                  {screenLabels[id]}
                </Button>
              ))}
            </nav>
          )}
          <main id="design-content" className="px-5 py-8 sm:px-8 lg:px-10">
            <section
              aria-label="Design preview controls"
              className="mb-8 space-y-4 rounded-xl border bg-card p-4"
            >
              <div className="flex flex-wrap items-end gap-4">
                <label className="flex flex-col gap-2 text-xs font-medium">
                  Screen
                  <select
                    aria-label="Preview screen"
                    className="h-10 rounded-lg border bg-background px-3 text-sm"
                    value={screen}
                    onChange={(e) => selectScreen(e.target.value as Screen)}
                  >
                    {screens.map((id) => (
                      <option key={id} value={id}>
                        {screenLabels[id]}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="flex flex-col gap-2 text-xs font-medium">
                  Direction
                  <select
                    aria-label="Design direction"
                    className="h-10 max-w-full rounded-lg border bg-background px-3 text-sm"
                    value={option}
                    onChange={(e) => setOption(e.target.value as Option)}
                  >
                    <option value="selected">
                      {selections[screen].selected} · Selected
                    </option>
                    <option value="alternative">
                      {selections[screen].alternative}
                    </option>
                  </select>
                </label>
                <label className="flex flex-col gap-2 text-xs font-medium">
                  State
                  <select
                    aria-label="Preview state"
                    className="h-10 rounded-lg border bg-background px-3 text-sm"
                    value={state}
                    onChange={(e) => setState(e.target.value as DisplayState)}
                  >
                    <option value="normal">Normal</option>
                    <option value="loading">Loading</option>
                    <option value="empty">Empty</option>
                    <option value="error">Error</option>
                  </select>
                </label>
                <Badge variant="outline">Review candidate</Badge>
              </div>
              <p className="text-xs leading-5 text-muted-foreground">
                {selections[screen].reason}
              </p>
            </section>
            <section
              aria-label={screenLabels[screen] + " design"}
              key={screen + ":" + state + ":" + option}
            >
              {screen === "documents" ? (
                <DocumentsScreen
                  items={documentPreview}
                  state={state}
                  option={option}
                  onRetry={() => setState("normal")}
                />
              ) : screen === "login" ? (
                <LoginScreen {...props} />
              ) : screen === "dashboard" ? (
                <DashboardScreen {...props} onScreen={selectScreen} />
              ) : screen === "profile" ? (
                <ProfileScreen {...props} />
              ) : (
                <PayslipScreen {...props} />
              )}
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}
