"use client";
import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { signIn } from "@/lib/auth-client";
import Spinner from "@/components/ui/Spinner";

interface SignInOauthButtonProps {
  signUp?: boolean;
}

export const SignInOauthButton = ({ signUp }: SignInOauthButtonProps) => {
  const [isPending, startTransition] = useTransition();

  const action = signUp ? "S'inscrire" : "Se connecter";


  // TODO : Ouvrir dans une modale || fenêtre
  function handleClick() {
    startTransition(async () => {
      await signIn.social({
        provider: "google",
        callbackURL: "/compte",
        errorCallbackURL: "/authentification/connexion/erreur",
      });
    });
  }

  return (
    <Button onClick={handleClick} disabled={isPending}>
      {isPending ? <Spinner /> : `${action} avec Google`}
    </Button>
  );
};
