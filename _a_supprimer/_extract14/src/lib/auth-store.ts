import "server-only";
import { promises as fs } from "fs";
import path from "path";
import { randomBytes, scryptSync, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import type { Account, ClientVehicle } from "./auth-types";

const DIR = path.join(process.cwd(), ".data");
const FILE = path.join(DIR, "accounts.json");
const COOKIE = "scp_session";

async function readAll(): Promise<Account[]> {
  try {
    return JSON.parse(await fs.readFile(FILE, "utf8")) as Account[];
  } catch {
    return [];
  }
}
async function saveAll(list: Account[]) {
  await fs.mkdir(DIR, { recursive: true });
  await fs.writeFile(FILE, JSON.stringify(list, null, 2), "utf8");
}

function hash(pw: string, salt: string) {
  return scryptSync(pw, salt, 64).toString("hex");
}

export async function getAccountByEmail(email: string): Promise<Account | null> {
  const e = email.trim().toLowerCase();
  return (await readAll()).find((a) => a.email === e) ?? null;
}
export async function getAccountById(id: string): Promise<Account | null> {
  return (await readAll()).find((a) => a.id === id) ?? null;
}

export async function createAccount(input: {
  email: string;
  name: string;
  phone: string;
  password: string;
}): Promise<Account> {
  const list = await readAll();
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
  list.push(account);
  await saveAll(list);
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
  const list = await readAll();
  const acc = list.find((a) => a.id === accountId);
  if (!acc) return;
  acc.vehicles.push({ id: crypto.randomUUID(), ...v });
  await saveAll(list);
}
