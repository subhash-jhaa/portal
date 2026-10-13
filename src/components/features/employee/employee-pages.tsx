"use client";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getEmployeeDashboard,
  getEmployeeProfile,
  getEmployeePayslip,
  updateEmployeeContact,
  type MockScenario,
} from "@/lib/api/employee";
import { useResource } from "./use-resource";
import { DashboardScreen } from "@/components/features/employee/ui/dashboard-screen";
import { ProfileScreen } from "@/components/features/employee/ui/profile-screen";
import { PayslipScreen } from "@/components/features/employee/ui/payslip-screen";
import {
  DataState,
  Heading,
} from "@/components/features/employee/ui/primitives";
function ResourceState({
  loading,
  error,
  title,
  retry,
}: {
  loading: boolean;
  error: string;
  title: string;
  retry: () => void;
}) {
  return (
    <>
      <Heading
        eyebrow="Employee portal"
        title={
          title === "dashboard"
            ? "Your overview"
            : title === "profile"
              ? "My profile"
              : "Your payslips"
        }
        copy="Your work essentials, all in one place."
      />
      <DataState
        state={loading ? "loading" : "error"}
        title={title}
        empty="No information available"
        onRetry={retry}
        retryLabel="Try again"
      />
      {error && <p className="mt-4 text-sm text-destructive">{error}</p>}
    </>
  );
}
export function DashboardPage() {
  const resource = useResource(getEmployeeDashboard, "dashboard");
  const router = useRouter();
  if (resource.loading || resource.error || !resource.data)
    return <ResourceState {...resource} title="dashboard" />;
  const data = resource.data;
  if (!data.latestPayslip)
    return (
      <DataState
        state="empty"
        title="dashboard"
        empty="Your workspace is getting ready"
        onRetry={resource.retry}
      />
    );
  return (
    <DashboardScreen
      state="normal"
      option="selected"
      employeeData={data.employee}
      payrollData={data.latestPayslip}
      announcement={data.announcement}
      profileActionCount={data.profileActionCount}
      onState={resource.retry}
      onScreen={(screen) => router.push("/" + screen)}
    />
  );
}
export function ProfilePage() {
  const client = useQueryClient();
  const mutation = useMutation({
    mutationFn: updateEmployeeContact,
    onSuccess: () => client.invalidateQueries({ queryKey: ["employee"] }),
  });
  const resource = useResource(getEmployeeProfile, "profile");
  if (resource.loading || resource.error || !resource.data)
    return <ResourceState {...resource} title="profile" />;
  return (
    <ProfileScreen
      key={resource.data.id}
      state={resource.data.phone ? "normal" : "empty"}
      option="selected"
      employeeData={resource.data}
      onState={resource.retry}
      onSave={async (input) => {
        const employee = await mutation.mutateAsync(input);
        resource.setData(employee);
      }}
    />
  );
}
export function PayslipPage() {
  const [period, setPeriod] = useState("September 2026");
  const loader = useCallback(
    (signal: AbortSignal, scenario: MockScenario) =>
      getEmployeePayslip(period, signal, scenario),
    [period],
  );
  const resource = useResource(loader, "payslip:" + period);
  if (resource.loading || resource.error || !resource.data)
    return <ResourceState {...resource} title="payslip" />;
  // Keep the period control visible for a missing record; no fake amount is rendered.
  return (
    <PayslipScreen
      state={resource.data.payslip ? "normal" : "empty"}
      option="selected"
      employeeData={resource.data.employee}
      payrollData={resource.data.payslip ?? undefined}
      periodValue={period}
      onPeriodChange={(value) => {
        setPeriod(value);
        resource.retry();
      }}
      onState={resource.retry}
    />
  );
}
