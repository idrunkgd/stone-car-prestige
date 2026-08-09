import type { SizeTier } from "./pricing";

export type QuoteItem = { label: string; price: number };

export type QuoteRecord = {
  id: string;
  ref: string; // DEV-2026-0001
  createdAt: string;
  customer: string;
  vehicleTitle: string;
  plate: string;
  size: SizeTier;
  items: QuoteItem[];
  discount: number; // en €
  subtotal: number; // HT avant remise
  taxable: number; // HT après remise
  vat: number;
  total: number; // TTC
  vatRate: number;
};
