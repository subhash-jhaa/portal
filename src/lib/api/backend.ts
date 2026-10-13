import http from "node:http";
import https from "node:https";
import { mockAuthEnabled } from "@/lib/auth/token";
import { ApiError } from "./errors";
export async function backendRequest(
  path: string,
  options: {
    method?: string;
    token?: string;
    body?: unknown;
    signal?: AbortSignal;
  } = {},
) {
  if (mockAuthEnabled())
    await (await import("@/mocks/server")).startServerMocks();
  const base = mockAuthEnabled()
    ? "http://growmer.mock.internal/api"
    : process.env.BACKEND_API_URL;
  if (!base)
    throw new Error("BACKEND_API_URL is required when auth mocks are disabled");
  const url = new URL(base.replace(/\/$/, "") + path);
  if (!["http:", "https:"].includes(url.protocol))
    throw new Error("Backend API must use HTTP or HTTPS");
  const headers: Record<string, string> = {
    Accept: "application/json",
    "Accept-Encoding": "identity",
  };
  if (options.token) headers.Authorization = "Bearer " + options.token;
  const body =
    options.body === undefined ? undefined : JSON.stringify(options.body);
  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
    headers["Content-Length"] = String(Buffer.byteLength(body));
  }
  const signal = options.signal
    ? AbortSignal.any([options.signal, AbortSignal.timeout(15000)])
    : AbortSignal.timeout(15000);
  try {
    // Node transport keeps upstream MSW independent of Next's per-route fetch wrapping.
    // Redirects are never followed, so credentials cannot be forwarded to another host.
    return await new Promise<Response>((resolve, reject) => {
      const request = (url.protocol === "https:" ? https : http).request(
        url,
        { method: options.method || "GET", headers, signal },
        (incoming) => {
          const chunks: Buffer[] = [];
          let size = 0;
          incoming.on("data", (chunk: Buffer) => {
            size += chunk.length;
            if (size > 1024 * 1024) {
              request.destroy(
                new Error("Backend response exceeds one megabyte"),
              );
              return;
            }
            chunks.push(chunk);
          });
          incoming.on("error", reject);
          incoming.on("end", () => {
            const responseHeaders = new Headers();
            for (const [key, value] of Object.entries(incoming.headers))
              if (value !== undefined)
                responseHeaders.set(
                  key,
                  Array.isArray(value) ? value.join(", ") : value,
                );
            const status = incoming.statusCode || 502;
            resolve(
              new Response(
                status === 204 || status === 304 ? null : Buffer.concat(chunks),
                { status, headers: responseHeaders },
              ),
            );
          });
        },
      );
      request.on("error", reject);
      request.end(body);
    });
  } catch {
    throw new ApiError(
      "The sign-in or employee service is unavailable. Please retry.",
      503,
      "SERVICE_UNAVAILABLE",
    );
  }
}
