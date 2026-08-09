import "server-only";
import { promises as fs } from "fs";
import path from "path";
import { DEFAULT_SETTINGS, type BusinessSettings } from "./settings-types";

const DIR = path.join(process.cwd(), ".data");
const FILE = path.join(DIR, "settings.json");

export async function getSettings(): Promise<BusinessSettings> {
  try {
    const raw = JSON.parse(await fs.readFile(FILE, "utf8"));
    return { ...DEFAULT_SETTINGS, ...raw };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export async function saveSettings(s: BusinessSettings): Promise<void> {
  await fs.mkdir(DIR, { recursive: true });
  await fs.writeFile(FILE, JSON.stringify(s, null, 2), "utf8");
}
