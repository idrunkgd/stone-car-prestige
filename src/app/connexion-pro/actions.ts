"use server";

import { redirect } from "next/navigation";
import {
  verifyAdminCredentials,
  setAdminSession,
  clearAdminSession,
} from "@/lib/admin-auth";

export async function loginAdminAction(input: { email: string; password: string }) {
  if (!verifyAdminCredentials(input.email, input.password)) {
    return { error: "Email ou mot de passe incorrect." };
  }
  await setAdminSession();
  redirect("/app");
}

export async function logoutAdminAction() {
  await clearAdminSession();
  redirect("/connexion-pro");
}
