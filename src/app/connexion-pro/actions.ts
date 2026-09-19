"use server";

import { redirect } from "next/navigation";
import {
  roleForCredentials,
  setAdminSession,
  clearAdminSession,
} from "@/lib/admin-auth";

export async function loginAdminAction(input: { email: string; password: string }) {
  const role = roleForCredentials(input.email, input.password);
  if (!role) {
    return { error: "Email ou mot de passe incorrect." };
  }
  await setAdminSession(role);
  redirect("/app");
}

export async function logoutAdminAction() {
  await clearAdminSession();
  redirect("/connexion-pro");
}
