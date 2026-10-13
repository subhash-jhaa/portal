import { randomBytes, randomUUID, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { mkdir, readFile, writeFile, rename } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { z } from "zod";
import {
  currentUserSchema,
  type CurrentUser,
  type RegistrationInput,
} from "@/lib/types/auth";
const deriveKey = promisify(scrypt);
const storedAccountSchema = currentUserSchema
  .extend({
    role: z.literal("employee"),
    salt: z.string().regex(/^[a-f0-9]{32}$/),
    passwordHash: z.string().regex(/^[a-f0-9]{128}$/),
    createdAt: z.string().datetime(),
  })
  .strict();
type StoredAccount = z.infer<typeof storedAccountSchema>;
let mutations = Promise.resolve();
function filePath() {
  return resolve(
    process.env.MOCK_AUTH_DATA_DIR || ".mock-data",
    "accounts.json",
  );
}
async function accounts(): Promise<StoredAccount[]> {
  try {
    return z
      .array(storedAccountSchema)
      .parse(JSON.parse(await readFile(filePath(), "utf8")));
  } catch (error) {
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "ENOENT"
    )
      return [];
    throw error;
  }
}
export class DuplicateAccountError extends Error {}
function userOf(account: StoredAccount): CurrentUser {
  return {
    id: account.id,
    name: account.name,
    email: account.email,
    role: account.role,
  };
}
// Return only directory-safe identity metadata; password material stays in this module.
export async function listRegisteredAccounts() {
  return (await accounts()).map((account) => ({
    user: userOf(account),
    createdAt: account.createdAt,
  }));
}
export async function findRegisteredAccount(id: string) {
  return (await accounts()).find((account) => account.id === id);
}
export async function authenticateRegisteredAccount(
  email: string,
  password: string,
) {
  const account = (await accounts()).find((account) => account.email === email);
  if (!account) return null;
  const actual = (await deriveKey(password, account.salt, 64)) as Buffer;
  return timingSafeEqual(actual, Buffer.from(account.passwordHash, "hex"))
    ? userOf(account)
    : null;
}
export async function createRegisteredAccount(input: RegistrationInput) {
  let created: CurrentUser | undefined;
  // One mock server owns this file. Serialize read/check/write to avoid duplicate-email races.
  const mutation = mutations.then(async () => {
    const records = await accounts();
    if (records.some((account) => account.email === input.email))
      throw new DuplicateAccountError();
    const salt = randomBytes(16).toString("hex");
    const hash = (await deriveKey(input.password, salt, 64)) as Buffer;
    const account: StoredAccount = {
      id: "GR-" + randomUUID(),
      name: input.name,
      email: input.email,
      role: "employee",
      salt,
      passwordHash: hash.toString("hex"),
      createdAt: new Date().toISOString(),
    };
    const path = filePath();
    await mkdir(dirname(path), { recursive: true });
    await writeFile(
      path + ".tmp",
      JSON.stringify([...records, account], null, 2),
      { mode: 0o600 },
    );
    await rename(path + ".tmp", path);
    created = userOf(account);
  });
  mutations = mutation.catch(() => {});
  await mutation;
  return created!;
}
