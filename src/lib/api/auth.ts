import { apiRequest } from "./client";
import {
  authResponseSchema,
  successSchema,
  loginSchema,
  type LoginInput,
  registrationSchema,
  type RegistrationInput,
} from "@/lib/types/auth";
export const login = (input: LoginInput) =>
  apiRequest("/auth/login", authResponseSchema, {
    method: "POST",
    body: loginSchema.parse(input),
  });
export const logout = () =>
  apiRequest("/auth/logout", successSchema, { method: "POST", body: {} });
export const getCurrentUser = (signal?: AbortSignal) =>
  apiRequest("/auth/me", authResponseSchema, { signal });

export const registerAccount = (input: RegistrationInput) =>
  apiRequest("/auth/register", authResponseSchema, {
    method: "POST",
    body: registrationSchema.parse(input),
  });
