"use server";

import { revalidatePath } from "next/cache";
import { addQuote, getQuotes } from "@/lib/quote-store";
import { VAT_RATE } from "@/lib/pricing";
import type { QuoteItem } from "@/lib/quote-types";
import type { SizeTier } from "@/lib/pricing";

export async function createQuoteAction(input: {
  customer: string;
  vehicleTitle: string;
  plate: string;
  size: SizeTier;
  items: QuoteItem[];
  discount: number;
}) {
  const id = crypto.randomUUID();
  const count = (await getQuotes()).length;
  const ref = `DEV-2026-${String(count + 1).padStart(4, "0")}`;

  const subtotal = input.items.reduce((s, i) => s + i.price, 0);
  const discount = Math.min(Math.max(0, input.discount || 0), subtotal);
  const taxable = subtotal - discount;
  const vat = Math.round(taxable * (VAT_RATE / 100) * 100) / 100;
  const total = Math.round((taxable + vat) * 100) / 100;

  await addQuote({
    id,
    ref,
    createdAt: new Date().toISOString(),
    customer: input.customer,
    vehicleTitle: input.vehicleTitle,
    plate: input.plate,
    size: input.size,
    items: input.items,
    discount,
    subtotal,
    taxable,
    vat,
    total,
    vatRate: VAT_RATE,
  });

  revalidatePath("/app/ventes");
  return { ok: true, id };
}
