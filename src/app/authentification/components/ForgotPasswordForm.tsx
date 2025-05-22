"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Spinner from "@/components/ui/Spinner";
import { forgetPassword } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export const ForgotPasswordForm = () => {
  const [isPending, setIsPending] = useState(false); // TODO : Mettre UseTransition
  const router = useRouter();

  async function handleSubmit(evt: React.FormEvent<HTMLFormElement>) {
    evt.preventDefault();
    const formData = new FormData(evt.currentTarget);
    const email = String(formData.get("email"));

    if (!email) {
      toast.error("Merci de renseigner ton adresse email.");
      return;
    }

    setIsPending(true);

    try {
      await forgetPassword({
        email,
        redirectTo: "/authentification/reinitialiser-mot-de-passe",
        fetchOptions: {
          onRequest: () => {},
          onResponse: () => {},
          onError: (ctx) => {
            toast.error(ctx.error.message);
          },
          onSuccess: () => {
            toast.success("Le lien de réinitialisation a été envoyé.");
            router.push("/authentification/mot-de-passe-oublie/succes");
          },
        },
      });
    } finally {
      setTimeout(() => {
        setIsPending(false);
      }, 800);
    }
  }

  return (
    <form className="max-w-sm w-full space-y-4" onSubmit={handleSubmit}>
      <div className="flex flex-col gap-2">
        <Label htmlFor="email">Email</Label>
        <Input type="email" id="email" name="email" />
      </div>

      <Button type="submit" disabled={isPending}>
        <div className="flex items-center gap-2">
          {isPending && <Spinner />}
          Envoyer le lien de réinitialisation
        </div>
      </Button>
    </form>
  );
};
