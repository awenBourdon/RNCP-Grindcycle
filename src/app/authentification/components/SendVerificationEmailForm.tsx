"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Spinner from "@/components/ui/Spinner";
import { sendVerificationEmail } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export const SendVerificationEmailForm = () => {
    // TODO : convertir en useTransition()
  const [isPending, setIsPending] = useState(false);
  const router = useRouter();

  async function handleSubmit(evt: React.FormEvent<HTMLFormElement>) {
    evt.preventDefault();
    const formData = new FormData(evt.currentTarget);
    const email = String(formData.get("email"));

    if (!email) {
      toast.error("Renseigne ton adresse email s'il te plait.");
      return;
    }

    setIsPending(true); // démarrer le spinner manuellement ici

    try {
      await sendVerificationEmail({
        email,
        callbackURL: "/authentification/verifier-email",
      });

      toast.success("Email de vérification envoyé avec succès.");
      router.push("/authentification/verifier-email/succes");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) { // TODO : Typer correctement
      toast.error(err?.message || "Une erreur est survenue.");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <form className="max-w-sm w-full space-y-4" onSubmit={handleSubmit}>
      <div className="flex flex-col gap-2">
        <Label htmlFor="email">Email</Label>
        <Input type="email" id="email" name="email" />
      </div>

      <Button type="submit" disabled={isPending}>
      {isPending && <Spinner />}
      Envoyer un email de vérification
      </Button>
    </form>
  );
};
