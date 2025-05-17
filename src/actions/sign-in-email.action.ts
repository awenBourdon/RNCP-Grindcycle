"use server";
import { auth, ErrorCode } from "@/lib/auth";
import { headers } from "next/headers";
import { APIError } from "better-auth/api";

export async function signInEmailAction(formData: FormData) {
            const email = String(formData.get("email"))
            if (!email) return {error: "Merci d’indiquer ton adresse email."};
    
            const password= String(formData.get("password"))
            if (!password) return {error: "Merci de renseigner ton mot-de-passe."};

            try {
                await auth.api.signInEmail({
                    headers: await headers(),
                    body: {
                        email,
                        password,
                    },
                });
                
            return {error: null};
            } catch (err) {
                  if (err instanceof APIError) {
                                    const errCode = err.body ? (err.body.code as ErrorCode) : "Inconnu";
                                    console.log(errCode);
                  }

                 // TODO : Implémenter un switch/break/case et completer pour tous les cas (voir sign-up)
                if (err instanceof APIError) {
                    return { error: "Oups ! Une erreur est survenue pendant la connexion." }
                }
                return { error: "Erreur serveur"}
            }
};