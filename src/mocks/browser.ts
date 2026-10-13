import { setupWorker } from "msw/browser";
import { projectHandlers } from "./handlers/projects";
export const worker = setupWorker(...projectHandlers);
let startup: ReturnType<typeof worker.start> | undefined;
export function startMocks() {
  startup ??= worker.start({ onUnhandledFrame: "bypass" });
  return startup;
}
