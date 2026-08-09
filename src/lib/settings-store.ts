import "server-only";
import { DEFAULT_SETTINGS, type BusinessSettings } from "./settings-types";
import { getDoc, putDoc } from "./db";

const COL = "settings";
const ID = "singleton";

export async function getSettings(): Promise<BusinessSettings> {
  const raw = await getDoc<Partial<BusinessSettings>>(COL, ID);
  return { ...DEFAULT_SETTINGS, ...(raw ?? {}) };
}

export async function saveSettings(s: BusinessSettings): Promise<void> {
  await putDoc(COL, ID, s);
}
