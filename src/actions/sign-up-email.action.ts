"use server";
import { auth, ErrorCode } from "@/lib/auth";
import { APIError } from "better-auth/api";

export async function signUpEmailAction(formData: FormData) {
            const name= String(formData.get("name"))
            if (!name) return {error:"Merci de définir un nom d'utilisateur"};
    
            const email = String(formData.get("email"))
            if (!email) return {error: "Merci d’indiquer ton adresse email."};
    
            const password= String(formData.get("password"))
            if (!password) return {error: "Merci de choisir un mot de passe pour ton compte."};

            try {
                await auth.api.signUpEmail({
                    body: {
                        name,
                        email,
                        password,
                    },
                });

            return {error: null};
            } catch (err) {
                console.log(err);
                if (err instanceof APIError) {
                    const errCode = err.body ? (err.body.code as ErrorCode) : "Inconnu";
                    
                    // TODO : Completer pour tous les cas
                    switch (errCode) {
                        case "USER_ALREADY_EXISTS":
                        return {error: "Cette adresse email est déjà utilisée."};
                        default :
                    return { error: err.message };
                    }

                }
                return { error: "Erreur serveur"}
            }
};