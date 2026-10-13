"use client";
import { useState } from "react";
import { Download, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  employee as fixtureEmployee,
  payroll as fixturePayroll,
  money,
} from "@/lib/design/fixtures";
import type { Employee, Payslip } from "@/lib/types/employee";
import type { DisplayState, Option } from "@/lib/design/types";
import { DataState, Heading, Panel } from "./primitives";
export function PayslipScreen({
  state,
  option,
  onState,
  periodValue,
  onPeriodChange,
  employeeData = fixtureEmployee,
  payrollData = fixturePayroll,
}: {
  employeeData?: Employee;
  payrollData?: Payslip;
  state: DisplayState;
  option: Option;
  onState: (state: DisplayState) => void;
  periodValue?: string;
  onPeriodChange?: (period: string) => void;
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

  const [localPeriod, setLocalPeriod] = useState("September 2026");
  const period = periodValue ?? localPeriod;
  const setPeriod = onPeriodChange ?? setLocalPeriod;
  const effectiveState =
    state === "normal" && period !== payroll.period ? "empty" : state;
  const statement = (
    <Panel>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-xl font-semibold">{payroll.period}</h2>
            <Badge>Paid</Badge>
          </div>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            {employee.name} · {employee.id}
            <br />
            Paid {payroll.paid}
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Net pay</p>
          <p className="mt-2 text-3xl font-semibold tabular-nums text-primary">
            {money(net)}
          </p>
        </div>
      </div>
      <div className="grid gap-6 border-y py-6 md:grid-cols-2">
        {[
          {
            title: "Earnings",
            items: payroll.earnings,
            total: gross,
            totalLabel: "Gross earnings",
          },
          {
            title: "Deductions",
            items: payroll.deductions,
            total: deductions,
            totalLabel: "Total deductions",
          },
        ].map((section) => (
          <div key={section.title}>
            <h3 className="mb-3 font-semibold">{section.title}</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Component</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {section.items.map((item) => (
                  <TableRow key={item.label}>
                    <TableCell className="whitespace-normal">
                      {item.label}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {money(item.amount)}
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell className="font-semibold">
                    {section.totalLabel}
                  </TableCell>
                  <TableCell className="text-right font-semibold tabular-nums">
                    {money(section.total)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl bg-accent p-5 text-accent-foreground">
        <div>
          <h3 className="font-semibold">Amount credited</h3>
          <p className="mt-2 text-xs">Account {payroll.account}</p>
        </div>
        <p className="text-2xl font-semibold tabular-nums">{money(net)}</p>
      </div>
      <p className="text-xs leading-5 text-muted-foreground">
        Illustrative payroll data. This preview is not a payroll or tax
        calculation.
      </p>
    </Panel>
  );
  return (
    <>
      <Heading
        eyebrow="Payroll"
        title="Your payslips"
        copy="A clear breakdown of your monthly earnings and deductions."
      />
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <label className="flex items-center gap-3 text-sm">
          Period
          <select
            aria-label="Pay period"
            className="h-10 rounded-lg border bg-card px-3"
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
          >
            <option>September 2026</option>
            <option>August 2026</option>
          </select>
        </label>
        <Button variant="outline" disabled aria-describedby="download-note">
          <Download className="size-4" />
          Download PDF
        </Button>
      </div>
      <p id="download-note" className="mb-6 text-xs text-muted-foreground">
        PDF export is a future feature. This button is a design placeholder.
      </p>
      {effectiveState !== "normal" ? (
        <DataState
          state={effectiveState}
          title="payslip"
          empty="No payslip for this period"
          onRetry={() => {
            setPeriod(payroll.period);
            onState("normal");
          }}
        />
      ) : (
        <div
          className={
            "grid gap-6 " +
            (option === "alternative" ? "lg:grid-cols-[220px_1fr]" : "")
          }
        >
          {option === "alternative" && (
            <Panel>
              <h2 className="font-semibold">History</h2>
              <Button
                variant="outline"
                className="h-auto justify-start whitespace-normal py-3"
                onClick={() => setPeriod(payroll.period)}
              >
                <FileText className="size-4 shrink-0" />
                September 2026
              </Button>
              <Button
                variant="ghost"
                className="justify-start"
                onClick={() => setPeriod("August 2026")}
              >
                August 2026
              </Button>
            </Panel>
          )}
          {statement}
        </div>
      )}
    </>
  );
}
