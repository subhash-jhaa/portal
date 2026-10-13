"use client";
import { useState } from "react";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ContactForm } from "../contact-form";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { employee as fixtureEmployee } from "@/lib/design/fixtures";
import type { Employee, ContactInput } from "@/lib/types/employee";
import type { DisplayState, Option } from "@/lib/design/types";
import { DataState, Heading, Panel } from "./primitives";
export function ProfileScreen({
  state,
  option,
  onState,
  employeeData = fixtureEmployee,
  onSave,
}: {
  employeeData?: Employee;
  onSave?: (input: ContactInput) => Promise<void>;
  state: DisplayState;
  option: Option;
  onState: (state: DisplayState) => void;
}) {
  const employee = employeeData;
  const [previewContact, setPreviewContact] = useState<ContactInput | null>(
    null,
  );
  const [editing, setEditing] = useState(false);
  const { email, phone, emergencyContact } = previewContact ?? employee;
  if (state === "loading" || state === "error")
    return (
      <>
        <Heading
          eyebrow="Personal details"
          title="My profile"
          copy="Review your information and keep your contact details current."
        />
        <DataState
          state={state}
          title="profile"
          empty="Profile not available"
          onRetry={() => onState("normal")}
        />
      </>
    );
  return (
    <>
      <Heading
        eyebrow="Personal details"
        title="My profile"
        copy="Your employment identity and contact information, organized in one place."
      />
      <div
        className={
          "grid gap-6 " +
          (option === "selected" ? "lg:grid-cols-[.65fr_1.35fr]" : "")
        }
      >
        <Panel>
          <div
            className={
              "flex gap-5 " +
              (option === "selected"
                ? "flex-col items-center text-center"
                : "flex-wrap items-center")
            }
          >
            <span className="grid size-20 place-items-center rounded-2xl bg-accent text-2xl font-semibold text-accent-foreground">
              {employee.initials}
            </span>
            <div>
              <h2 className="text-xl font-semibold">{employee.name}</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                {employee.role}
              </p>
              <Badge variant="secondary" className="mt-3">
                Active employee
              </Badge>
            </div>
          </div>
          <dl className="grid gap-4 border-t pt-5 text-sm">
            {[
              ["Employee ID", employee.id],
              ["Department", employee.department],
              ["Manager", employee.manager],
              ["Joined", employee.joined],
            ].map(([label, value]) => (
              <div key={label}>
                <dt className="text-xs text-muted-foreground">{label}</dt>
                <dd className="mt-1 font-medium">{value}</dd>
              </div>
            ))}
          </dl>
          <p className="text-xs leading-5 text-muted-foreground">
            Employment fields are managed by HR.
          </p>
        </Panel>
        <Panel>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold">Contact information</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Review the details used to reach you.
              </p>
            </div>
            {!editing && (
              <Button variant="outline" onClick={() => setEditing(true)}>
                <Pencil className="size-4" />
                {onSave ? "Edit contact details" : "Edit preview"}
              </Button>
            )}
          </div>
          {editing ? (
            <ContactForm
              values={{
                email,
                phone,
                emergencyContact: emergencyContact || "",
              }}
              preview={!onSave}
              onCancel={() => setEditing(false)}
              onSave={async (input) => {
                if (onSave) await onSave(input);
                else setPreviewContact(input);
                setEditing(false);
                if (onSave) toast.success("Contact details saved.");
                else
                  toast.info(
                    "Preview updated locally. Nothing was saved to a server.",
                  );
              }}
            />
          ) : (
            <dl className="grid gap-6 sm:grid-cols-2">
              {[
                ["Work email", email],
                ["Phone", state === "empty" || !phone ? "Not provided" : phone],
                ["Location", employee.location],
                ["Emergency contact", emergencyContact || "Not provided"],
              ].map(([label, value]) => (
                <div key={label}>
                  <dt className="text-xs text-muted-foreground">{label}</dt>
                  <dd className="mt-2 break-words text-sm font-medium">
                    {value}
                  </dd>
                </div>
              ))}
            </dl>
          )}
          {state === "empty" && (
            <div role="status" className="rounded-xl bg-muted p-4 text-sm">
              {onSave
                ? "Some contact details are missing. Use Edit contact details to update your profile."
                : "Some contact details are missing. Use Edit preview to explore the form; contact HR to update actual records."}
            </div>
          )}
          <div className="border-t pt-5">
            <h3 className="text-sm font-semibold">Payroll account</h3>
            <p className="mt-3 rounded-xl bg-muted p-4 text-sm">
              {employee.accountEnd
                ? "Account ending " + employee.accountEnd
                : "Account not provided"}{" "}
              · Fictional example
            </p>
          </div>
        </Panel>
      </div>
    </>
  );
}
