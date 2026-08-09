"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { addQuote, getQuotes, getQuote } from "@/lib/quote-store";
import { addInvoice, getInvoices, updateInvoice } from "@/lib/invoice-store";
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

/** Transforme un devis accepté en facture (numérotée FAC-…). */
export async function createInvoiceFromQuoteAction(formData: FormData) {
  const quoteId = String(formData.get("quoteId"));
  const q = await getQuote(quoteId);
  if (!q) return;

  const id = crypto.randomUUID();
  const count = (await getInvoices()).length;
  const ref = `FAC-2026-${String(count + 1).padStart(4, "0")}`;

  await addInvoice({
    id,
    ref,
    createdAt: new Date().toISOString(),
    customer: q.customer,
    vehicleTitle: q.vehicleTitle,
    plate: q.plate,
    size: q.size,
    items: q.items,
    discount: q.discount,
    subtotal: q.subtotal,
    taxable: q.taxable,
    vat: q.vat,
    total: q.total,
    vatRate: q.vatRate,
    quoteRef: q.ref,
    status: "impayee",
    payment: null,
  });

  revalidatePath("/app/ventes");
  redirect(`/app/ventes/facture/${id}`);
}

/** Marque une facture comme payée avec le mode de paiement. */
export async function markInvoicePaidAction(id: string, method: string) {
  await updateInvoice(id, {
    status: "payee",
    payment: { method, paidAt: new Date().toISOString() },
  });
  revalidatePath("/app/ventes");
  revalidatePath(`/app/ventes/facture/${id}`);
  return { ok: true };
}
