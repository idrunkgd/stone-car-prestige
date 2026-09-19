import { redirect } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { BottomBar } from "@/components/layout/BottomBar";
import { getStaffRole } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Espace pro protégé : admin ou employé. Les pages sensibles appellent en
  // plus requireAdminPage() pour verrouiller le rôle employé.
  const role = await getStaffRole();
  if (!role) redirect("/connexion-pro");

  return (
    <div className="flex min-h-screen">
      <Sidebar role={role} />
      <main className="flex-1 px-5 pb-24 pt-6 md:px-8 md:pb-10">
        <div className="mx-auto max-w-6xl">{children}</div>
      </main>
      <BottomBar role={role} />
    </div>
  );
}
