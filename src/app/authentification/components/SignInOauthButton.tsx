"use client";
import { useTransition } from "react";
import { signIn } from "@/lib/auth-client";
import Spinner from "@/components/Spinner";
import Image from "next/image";

interface SignInOauthButtonProps {
  signUp?: boolean
}

export const SignInOauthButton = ({ signUp }: SignInOauthButtonProps) => {
  const [isPending, startTransition] = useTransition()

  const action = signUp ? "S'inscrire" : "Se connecter"

  // TODO : Ouvrir dans une modale || fenêtre
  function handleClick() {
    startTransition(async () => {
      await signIn.social({
        provider: "google",
        callbackURL: "/compte",
        errorCallbackURL: "/authentification/erreur",
      })
    })
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className={`cursor-pointer w-full inline-flex items-center justify-center rounded-full text-sm font-medium px-4 py-3 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors ${
        isPending ? "opacity-70 cursor-not-allowed" : ""
      }`}
    >
      {isPending ? (
        <Spinner />
      ) : (
        <>
          <Image src="/google.svg" alt="Google" width={18} height={18} className="mr-2" />
          {`${action} avec Google`}
        </>
      )}
    </button>
  )
}
