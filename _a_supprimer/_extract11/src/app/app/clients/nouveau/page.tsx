import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { TopBar } from "@/components/layout/TopBar";
import { NewCustomerForm } from "@/components/crm/NewCustomerForm";

export default function NewClientPage() {
  return (
    <>
      <TopBar title="Nouveau client" />
      <div className="mb-4">
        <Link
          href="/app/clients"
          className="flex items-center gap-1 text-sm text-ink-muted hover:text-ink"
        >
          <ChevronLeft size={16} /> Clients
        </Link>
      </div>
      <NewCustomerForm />
    </>
  );
}
