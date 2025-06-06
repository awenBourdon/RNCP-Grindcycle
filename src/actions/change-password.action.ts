"use server";

import { auth } from "@/lib/auth";
import { APIError } from "better-auth/api";
import { headers } from "next/headers";
import { z } from "zod";

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{12,}$/;

const passwordSchema = z
  .string()
  .min(12)
  .regex(passwordRegex);

export async function changePasswordAction(formData: FormData) {
  const currentPassword = String(formData.get("currentPassword"));
  if (!currentPassword) return { error: "Veuillez entrer votre mot de passe actuel" };

  const newPassword = String(formData.get("newPassword"));
  if (!newPassword) return { error: "Veuillez entrer votre nouveau mot de passe" };

  try {
    passwordSchema.parse(newPassword);
  } catch {
    return { error: "Validation error" };
  }

  try {
    await auth.api.changePassword({
      headers: await headers(),
      body: {
        currentPassword,
        newPassword,
      },
    });

    return { error: null };
  } catch (err) {
    if (err instanceof APIError) {
      return { error: err.message };
    }

    return { error: "Erreur interne du serveur" };
  }
}
