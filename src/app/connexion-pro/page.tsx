import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/admin-auth";
import { AdminLoginForm } from "./AdminLoginForm";

export const dynamic = "force-dynamic";

export default async function ConnexionProPage() {
  if (await isAdmin()) redirect("/app");

  return (
    <div className="flex min-h-screen items-center justify-center bg-night px-5">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="text-xs uppercase tracking-[0.3em] text-gold-2">
            Stone Car Prestige
          </div>
          <h1 className="mt-2 font-display text-3xl uppercase">Espace pro</h1>
          <p className="mt-2 text-sm text-ink-muted">
            Accès réservé — connectez-vous pour gérer l'activité.
          </p>
        </div>
        <AdminLoginForm />
      </div>
    </div>
  );
}
