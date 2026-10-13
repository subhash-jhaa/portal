import { ArrowRight, FileText, UserRound, WalletCards } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  employee as fixtureEmployee,
  payroll as fixturePayroll,
  money,
} from "@/lib/design/fixtures";
import type { Employee, Payslip } from "@/lib/types/employee";
import type { DisplayState, Option, Screen } from "@/lib/design/types";
import { DataState, Heading, Panel } from "./primitives";
export function DashboardScreen({
  state,
  option,
  onState,
  employeeData = fixtureEmployee,
  payrollData = fixturePayroll,
  onScreen,
  profileActionCount = 1,
  announcement = "Please review your contact information before the next payroll cycle.",
}: {
  employeeData?: Employee;
  payrollData?: Payslip;
  state: DisplayState;
  option: Option;
  onState: (state: DisplayState) => void;
  onScreen: (screen: Screen) => void;
  profileActionCount?: number;
  announcement?: string;
}) {
  const employee = employeeData;
  const payroll = payrollData;
  const gross = payroll.earnings.reduce(
    (total, item) => total + item.amount,
    0,
  );
  const deductions = payroll.deductions.reduce(
    (total, item) => total + item.amount,
    0,
  );
  const net = gross - deductions;

  if (state !== "normal")
    return (
      <>
        <Heading
          eyebrow="Employee workspace"
          title="Your overview"
          copy="A shared home for your work essentials."
        />
        <DataState
          state={state}
          title="dashboard"
          empty="Your workspace is getting ready"
          onRetry={() => onState("normal")}
        />
      </>
    );
  const actions = (
    <Panel>
      <h2 className="text-lg font-semibold">Quick actions</h2>
      <Button
        variant="outline"
        className="w-full justify-start"
        onClick={() => onScreen("profile")}
      >
        <UserRound className="size-4" />
        Review profile
      </Button>
      <Button
        variant="outline"
        className="w-full justify-start"
        onClick={() => onScreen("payslip")}
      >
        <FileText className="size-4" />
        Review payslip
      </Button>
      <p className="text-xs leading-5 text-muted-foreground">
        {profileActionCount
          ? "Your profile is missing an emergency contact. HR can help you update it."
          : "Your profile is up to date."}
      </p>
    </Panel>
  );
  const salary = (
    <Panel>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">{payroll.period} payslip</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Your latest payroll statement is ready.
          </p>
        </div>
        <Badge>Paid</Badge>
      </div>
      <div className="grid gap-5 border-y py-5 sm:grid-cols-3">
        {[
          ["Gross earnings", gross],
          ["Deductions", deductions],
          ["Net pay", net],
        ].map(([label, value]) => (
          <div key={String(label)}>
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="mt-2 text-xl font-semibold tabular-nums">
              {money(Number(value))}
            </p>
          </div>
        ))}
      </div>
      <Button onClick={() => onScreen("payslip")}>
        View payslip
        <ArrowRight className="size-4" />
      </Button>
    </Panel>
  );
  return (
    <>
      <Heading
        eyebrow="Employee workspace"
        title={"Welcome, " + employee.name.split(" ")[0]}
        copy="A clear view of your work essentials and what needs your attention."
      />
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        {[
          {
            label: "Net pay · " + payroll.period,
            value: money(net),
            note: "Paid " + payroll.paid,
            icon: WalletCards,
          },
          {
            label: "Employee",
            value: employee.id,
            note: employee.role,
            icon: UserRound,
          },
          {
            label: "Profile action",
            value:
              profileActionCount +
              (profileActionCount === 1
                ? " detail missing"
                : " details missing"),
            note: "Review emergency contact",
            icon: FileText,
          },
        ].map(({ label, value, note, icon: Icon }) => (
          <Panel key={label}>
            <Icon className="size-5 text-primary" aria-hidden="true" />
            <div>
              <p className="text-sm text-muted-foreground">{label}</p>
              <p className="mt-2 text-2xl font-semibold">{value}</p>
              <p className="mt-2 text-xs text-muted-foreground">{note}</p>
            </div>
          </Panel>
        ))}
      </div>
      <div
        className={
          "grid gap-6 " +
          (option === "selected"
            ? "lg:grid-cols-[1.4fr_.8fr]"
            : "lg:grid-cols-[.8fr_1.4fr]")
        }
      >
        {option === "selected" ? (
          <>
            {salary}
            {actions}
          </>
        ) : (
          <>
            {actions}
            {salary}
          </>
        )}
      </div>
      <div className="mt-6 rounded-2xl border bg-accent p-6 text-accent-foreground">
        <h2 className="font-semibold">From your people team</h2>
        <p className="mt-2 text-sm leading-6">{announcement}</p>
      </div>
    </>
  );
}
