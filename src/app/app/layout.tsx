import { redirect } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { BottomBar } from "@/components/layout/BottomBar";
import { isAdmin } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Espace pro protégé : redirige vers la connexion si non authentifié.
  if (!(await isAdmin())) redirect("/connexion-pro");

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 px-5 pb-24 pt-6 md:px-8 md:pb-10">
        <div className="mx-auto max-w-6xl">{children}</div>
      </main>
      <BottomBar />
    </div>
  );
}
