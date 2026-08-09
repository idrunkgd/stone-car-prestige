import "server-only";
import { promises as fs } from "fs";
import path from "path";
import type { QuoteRecord } from "./quote-types";

const DIR = path.join(process.cwd(), ".data");
const FILE = path.join(DIR, "quotes.json");

export async function getQuotes(): Promise<QuoteRecord[]> {
  try {
    return JSON.parse(await fs.readFile(FILE, "utf8")) as QuoteRecord[];
  } catch {
    return [];
  }
}

export async function getQuote(id: string): Promise<QuoteRecord | null> {
  return (await getQuotes()).find((q) => q.id === id) ?? null;
}

export async function addQuote(q: QuoteRecord): Promise<void> {
  const all = await getQuotes();
  all.unshift(q);
  await fs.mkdir(DIR, { recursive: true });
  await fs.writeFile(FILE, JSON.stringify(all, null, 2), "utf8");
}
