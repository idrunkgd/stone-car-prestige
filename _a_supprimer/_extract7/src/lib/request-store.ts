import "server-only";
import { promises as fs } from "fs";
import path from "path";
import type { BookingRequest } from "./request-types";

const DIR = path.join(process.cwd(), ".data");
const FILE = path.join(DIR, "requests.json");

export async function getRequests(): Promise<BookingRequest[]> {
  try {
    return JSON.parse(await fs.readFile(FILE, "utf8")) as BookingRequest[];
  } catch {
    return [];
  }
}

async function persist(all: BookingRequest[]) {
  await fs.mkdir(DIR, { recursive: true });
  await fs.writeFile(FILE, JSON.stringify(all, null, 2), "utf8");
}

export async function addRequest(r: BookingRequest): Promise<void> {
  const all = await getRequests();
  all.unshift(r);
  await persist(all);
}

export async function setRequestStatus(
  id: string,
  status: BookingRequest["status"],
): Promise<void> {
  const all = await getRequests();
  const r = all.find((x) => x.id === id);
  if (r) {
    r.status = status;
    await persist(all);
  }
}

export async function countNewRequests(): Promise<number> {
  return (await getRequests()).filter((r) => r.status === "nouveau").length;
}
