import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
const root = fileURLToPath(new URL("../", import.meta.url));
const setup = spawnSync(process.execPath, ["scripts/setup-env.mjs"], {
  cwd: root,
  stdio: "inherit",
});
if (setup.error) {
  console.error(setup.error.message);
  process.exit(1);
}
if (setup.status !== 0) process.exit(setup.status ?? 1);
const result = spawnSync(
  "docker",
  ["compose", "up", "--build", "-d", "--wait"],
  { cwd: root, stdio: "inherit" },
);
if (result.error) console.error(result.error.message);
process.exit(result.status ?? 1);
