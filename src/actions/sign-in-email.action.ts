"use server";
import { auth, ErrorCode } from "@/lib/auth";
import { headers } from "next/headers";
import { APIError } from "better-auth/api";
import { redirect } from "next/navigation";

export async function signInEmailAction(formData: FormData) {
    const email = String(formData.get("email"));
    if (!email) return { error: "Merci d’indiquer ton adresse email." };

    const password = String(formData.get("password"));
    if (!password) return { error: "Merci de renseigner ton mot de passe." };

    try {
        await auth.api.signInEmail({
            headers: await headers(),
            body: {
                email,
                password,
            },
        });

        return { error: null };
    } catch (err) {
        if (err instanceof APIError) {
            const errCode = err.body ? (err.body.code as ErrorCode) : "Inconnu";
            console.log(errCode);

            // TODO : Implémenter un switch complet pour tous les cas possibles
            switch (errCode) {
                case "EMAIL_NOT_VERIFIED":
                    redirect("/auth/verify?error=email_not_verified");
                default:
                    return { error: "Oups ! Une erreur est survenue pendant la connexion." };
            }
        }

        return { error: "Oups ! Une erreur inattendue est survenue." };
    }
}
