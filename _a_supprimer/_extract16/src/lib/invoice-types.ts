import type { SizeTier } from "./pricing";

export type InvoiceItem = { label: string; price: number };
export type InvoiceStatus = "impayee" | "payee";

export type InvoiceRecord = {
  id: string;
  ref: string; // FAC-2026-0001
  createdAt: string;
  customer: string;
  vehicleTitle: string;
  plate: string;
  size: SizeTier;
  items: InvoiceItem[];
  discount: number;
  subtotal: number;
  taxable: number;
  vat: number;
  total: number;
  vatRate: number;
  quoteRef?: string;
  status: InvoiceStatus;
  payment?: { method: string; paidAt: string } | null;
};
