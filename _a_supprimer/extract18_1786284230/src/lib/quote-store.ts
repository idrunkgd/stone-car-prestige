import "server-only";
import type { QuoteRecord } from "./quote-types";
import { listDocs, getDoc, putDoc, patchDoc } from "./db";

const COL = "quotes";

export async function getQuotes(): Promise<QuoteRecord[]> {
  return listDocs<QuoteRecord>(COL);
}

export async function getQuote(id: string): Promise<QuoteRecord | null> {
  return getDoc<QuoteRecord>(COL, id);
}

export async function getQuotesByAccount(accountId: string): Promise<QuoteRecord[]> {
  return (await getQuotes()).filter((q) => q.accountId === accountId);
}

export async function addQuote(q: QuoteRecord): Promise<void> {
  await putDoc(COL, q.id, q);
}

export async function updateQuote(id: string, patch: Partial<QuoteRecord>): Promise<void> {
  await patchDoc<QuoteRecord>(COL, id, patch);
}
