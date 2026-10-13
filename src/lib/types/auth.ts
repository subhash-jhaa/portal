import { z } from "zod";
export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .email("Enter a valid work email")
    .max(254)
    .transform((value) => value.toLowerCase()),
  password: z
    .string()
    .min(1, "Enter your password")
    .max(128, "Password is too long"),
});
export const currentUserSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  email: z.email(),
  role: z.enum(["employee", "admin"]),
});
export const authResponseSchema = z.object({ user: currentUserSchema });
export const successSchema = z.object({ ok: z.literal(true) });
export const tokenResponseSchema = z.object({
  access_token: z.string().min(1),
  token_type: z.literal("Bearer"),
  expires_in: z.number().int().positive(),
});
export type LoginInput = z.input<typeof loginSchema>;
export type CurrentUser = z.infer<typeof currentUserSchema>;

export const registrationSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Enter your full name (at least 2 characters)")
      .max(80, "Name is too long"),
    email: loginSchema.shape.email,
    password: z
      .string()
      .min(8, "Use at least 8 characters")
      .max(128, "Password is too long"),
  })
  .strict();
export const registrationFormSchema = registrationSchema
  .extend({ confirmPassword: z.string().min(1, "Confirm your password") })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
export type RegistrationInput = z.input<typeof registrationSchema>;
export type RegistrationFormInput = z.input<typeof registrationFormSchema>;
