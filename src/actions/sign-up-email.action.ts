"use server";
import { auth, ErrorCode } from "@/lib/auth";
import { signUpSchema } from "@/lib/validation/authValidation";
import { APIError } from "better-auth/api";

export async function signUpEmailAction(formData: FormData) {
  const raw = {
    name: String(formData.get("name")),
    email: String(formData.get("email")),
    password: String(formData.get("password")),
  };

  const result = signUpSchema.safeParse(raw);

  if (!result.success) {
    const errorMessages = result.error.format();
    const firstFieldError = Object.values(errorMessages)[0];

    let firstError = "Erreur de validation.";

    if (
      firstFieldError &&
      typeof firstFieldError === "object" &&
      "_errors" in firstFieldError
    ) {
      const errors = (firstFieldError as { _errors: string[] })._errors;
      if (errors.length > 0) {
        firstError = errors[0];
      }
    }

    return { error: firstError };
  }

  const { name, email, password } = result.data;

  try {
    await auth.api.signUpEmail({
      body: { name, email, password },
    });

    return { error: null };
  } catch (err) {
    console.error(err);

    if (err instanceof APIError) {
      const errCode = err.body ? (err.body.code as ErrorCode) : "Inconnu";
     
     // TODO : Completer pour tous les cas
      switch (errCode) {
        case "USER_ALREADY_EXISTS":
          return { error: "Cette adresse email est déjà utilisée." };
        default:
          return { error: err.message || "Erreur inconnue côté API." };
      }
    }

    return { error: "Erreur serveur inattendue." };
  }
}
