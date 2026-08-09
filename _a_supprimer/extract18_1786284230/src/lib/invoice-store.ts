import "server-only";
import type { InvoiceRecord } from "./invoice-types";
import { listDocs, getDoc, putDoc, patchDoc } from "./db";

const COL = "invoices";

export async function getInvoices(): Promise<InvoiceRecord[]> {
  return listDocs<InvoiceRecord>(COL);
}

export async function getInvoice(id: string): Promise<InvoiceRecord | null> {
  return getDoc<InvoiceRecord>(COL, id);
}

export async function addInvoice(inv: InvoiceRecord): Promise<void> {
  await putDoc(COL, inv.id, inv);
}

export async function updateInvoice(
  id: string,
  patch: Partial<InvoiceRecord>,
): Promise<void> {
  await patchDoc<InvoiceRecord>(COL, id, patch);
}
