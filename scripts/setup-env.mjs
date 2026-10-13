import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { randomBytes } from "node:crypto";
if (!existsSync(".env")) {
  writeFileSync(
    ".env",
    readFileSync(".env.example", "utf8").replace(
      "replace-with-a-random-secret-at-least-32-bytes",
      randomBytes(48).toString("base64url"),
    ),
  );
  console.info("Created ignored .env with a random mock signing key.");
} else console.info(".env already exists; preserved existing configuration.");
