import { z } from "zod";
import { config } from "@/lib/config";
import { ApiError } from "./errors";
type Options = Omit<RequestInit, "body"> & { body?: unknown };
export async function apiRequest<T>(
  path: string,
  schema: z.ZodType<T>,
  options: Options = {},
): Promise<T> {
  const { body, ...init } = options;
  const headers = new Headers(init.headers);
  headers.set("Accept", "application/json");
  if (body !== undefined) headers.set("Content-Type", "application/json");
  let response: Response;
  try {
    response = await fetch(
      config.apiBaseUrl.replace(/\/$/, "") + "/" + path.replace(/^\//, ""),
      {
        ...init,
        credentials: "same-origin",
        headers,
        body: body === undefined ? undefined : JSON.stringify(body),
      },
    );
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") throw error;
    throw new ApiError(
      "Unable to reach the API. Please retry.",
      0,
      "NETWORK_ERROR",
    );
  }
  const payload: unknown =
    response.status === 204
      ? undefined
      : await response.json().catch(() => undefined);
  if (!response.ok) {
    if (
      response.status === 401 &&
      !["/auth/login", "/auth/register"].includes(path) &&
      typeof window !== "undefined"
    )
      window.dispatchEvent(new Event("growmer:session-expired"));
    const parsed = z
      .object({ error: z.object({ message: z.string(), code: z.string() }) })
      .safeParse(payload);
    throw new ApiError(
      parsed.success
        ? parsed.data.error.message
        : "Request failed. Please retry.",
      response.status,
      parsed.success ? parsed.data.error.code : "HTTP_ERROR",
    );
  }
  const parsed = schema.safeParse(payload);
  if (!parsed.success)
    throw new ApiError(
      "The API returned an unexpected response.",
      response.status,
      "INVALID_RESPONSE",
    );
  return parsed.data;
}
