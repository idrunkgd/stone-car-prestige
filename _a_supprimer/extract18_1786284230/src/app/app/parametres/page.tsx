import { TopBar } from "@/components/layout/TopBar";
import { SettingsForm } from "@/components/settings/SettingsForm";
import { getSettings } from "@/lib/settings-store";

export const dynamic = "force-dynamic";

export default async function ParametresPage() {
  const settings = await getSettings();
  return (
    <>
      <TopBar title="Paramètres" />
      <SettingsForm initial={settings} />
    </>
  );
}
