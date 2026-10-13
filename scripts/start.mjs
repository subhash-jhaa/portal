import { cpSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

// Mirror Docker's standalone layout when running the production build locally.
const root = process.cwd();
const standalone = resolve(root, ".next/standalone");
const server = resolve(standalone, "server.js");
if (!existsSync(server)) throw new Error("Run npm run build before npm start.");
cpSync(resolve(root, "public"), resolve(standalone, "public"), {
  recursive: true,
});
cpSync(resolve(root, ".next/static"), resolve(standalone, ".next/static"), {
  recursive: true,
});
process.env.HOSTNAME ||= "0.0.0.0";
await import(pathToFileURL(server).href);
