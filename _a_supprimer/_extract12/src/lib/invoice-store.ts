import "server-only";
import { promises as fs } from "fs";
import path from "path";
import type { InvoiceRecord } from "./invoice-types";

const DIR = path.join(process.cwd(), ".data");
const FILE = path.join(DIR, "invoices.json");

export async function getInvoices(): Promise<InvoiceRecord[]> {
  try {
    return JSON.parse(await fs.readFile(FILE, "utf8")) as InvoiceRecord[];
  } catch {
    return [];
  }
}

export async function getInvoice(id: string): Promise<InvoiceRecord | null> {
  return (await getInvoices()).find((i) => i.id === id) ?? null;
}

async function persist(all: InvoiceRecord[]) {
  await fs.mkdir(DIR, { recursive: true });
  await fs.writeFile(FILE, JSON.stringify(all, null, 2), "utf8");
}

export async function addInvoice(inv: InvoiceRecord): Promise<void> {
  const all = await getInvoices();
  all.unshift(inv);
  await persist(all);
}

export async function updateInvoice(
  id: string,
  patch: Partial<InvoiceRecord>,
): Promise<void> {
  const all = await getInvoices();
  const idx = all.findIndex((i) => i.id === id);
  if (idx !== -1) {
    all[idx] = { ...all[idx], ...patch };
    await persist(all);
  }
}
