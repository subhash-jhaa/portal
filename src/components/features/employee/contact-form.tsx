"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { contactInputSchema, type ContactInput } from "@/lib/types/employee";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
export function ContactForm({
  values,
  onSave,
  onCancel,
  preview,
}: {
  values: ContactInput;
  onSave: (input: ContactInput) => Promise<void>;
  onCancel: () => void;
  preview: boolean;
}) {
  const [error, setError] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ContactInput>({
    resolver: zodResolver(contactInputSchema),
    defaultValues: values,
  });
  return (
    <form
      noValidate
      className="space-y-5"
      onSubmit={handleSubmit(async (input) => {
        setError("");
        try {
          await onSave(input);
        } catch (error) {
          setError(
            error instanceof Error
              ? error.message
              : "Unable to save contact details.",
          );
        }
      })}
    >
      <p className="text-sm text-muted-foreground">
        You can change your contact email, phone and emergency contact.
        Employment fields are managed by HR. Contact email changes do not change
        your sign-in email.
      </p>
      {(["email", "phone", "emergencyContact"] as const).map((field) => (
        <div key={field}>
          <label
            className="mb-2 block text-sm font-medium"
            htmlFor={"profile-" + field}
          >
            {field === "email"
              ? "Work email"
              : field === "phone"
                ? "Phone"
                : "Emergency contact"}
          </label>
          <Input
            id={"profile-" + field}
            type={
              field === "email" ? "email" : field === "phone" ? "tel" : "text"
            }
            autoComplete={
              field === "email" ? "email" : field === "phone" ? "tel" : "off"
            }
            disabled={isSubmitting}
            aria-invalid={!!errors[field]}
            aria-describedby={
              [
                errors[field] ? "error-" + field : "",
                field === "phone" ? "profile-phone-hint" : "",
              ]
                .filter(Boolean)
                .join(" ") || undefined
            }
            {...register(field)}
          />
          {errors[field] && (
            <p
              id={"error-" + field}
              role="alert"
              className="mt-2 text-sm text-destructive"
            >
              {errors[field]?.message}
            </p>
          )}
        </div>
      ))}
      <p id="profile-phone-hint" className="text-xs text-muted-foreground">
        Phone: 7–15 digits, with optional +, spaces, parentheses or hyphens.
        Leave blank if unavailable.
      </p>
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
      <div className="flex gap-3">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving…" : preview ? "Save preview" : "Save changes"}
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={isSubmitting}
          onClick={onCancel}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
