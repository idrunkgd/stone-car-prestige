import "server-only";
import { randomBytes, scryptSync, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import type { Account, ClientVehicle } from "./auth-types";
import { listDocs, getDoc, putDoc } from "./db";

const COL = "accounts";
const COOKIE = "scp_session";

function hash(pw: string, salt: string) {
  return scryptSync(pw, salt, 64).toString("hex");
}

export async function getAccountByEmail(email: string): Promise<Account | null> {
  const e = email.trim().toLowerCase();
  return (await listDocs<Account>(COL)).find((a) => a.email === e) ?? null;
}
export async function getAccountById(id: string): Promise<Account | null> {
  return getDoc<Account>(COL, id);
}

export async function createAccount(input: {
  email: string;
  name: string;
  phone: string;
  password: string;
}): Promise<Account> {
  const salt = randomBytes(16).toString("hex");
  const account: Account = {
    id: crypto.randomUUID(),
    email: input.email.trim().toLowerCase(),
    name: input.name.trim(),
    phone: input.phone.trim(),
    passwordHash: hash(input.password, salt),
    salt,
    token: randomBytes(24).toString("hex"),
    createdAt: new Date().toISOString(),
    vehicles: [],
  };
  await putDoc(COL, account.id, account);
  return account;
}

export function verifyPassword(account: Account, pw: string): boolean {
  const a = Buffer.from(hash(pw, account.salt), "hex");
  const b = Buffer.from(account.passwordHash, "hex");
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function setSession(account: Account) {
  const jar = await cookies();
  jar.set(COOKIE, `${account.id}:${account.token}`, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}
export async function clearSession() {
  (await cookies()).delete(COOKIE);
}

export async function getCurrentAccount(): Promise<Account | null> {
  const raw = (await cookies()).get(COOKIE)?.value;
  if (!raw) return null;
  const [id, token] = raw.split(":");
  const acc = await getAccountById(id);
  if (!acc || acc.token !== token) return null;
  return acc;
}

export async function addVehicle(accountId: string, v: Omit<ClientVehicle, "id">) {
  const acc = await getAccountById(accountId);
  if (!acc) return;
  const vehicles = [...acc.vehicles, { id: crypto.randomUUID(), ...v }];
  await putDoc(COL, accountId, { ...acc, vehicles });
}
