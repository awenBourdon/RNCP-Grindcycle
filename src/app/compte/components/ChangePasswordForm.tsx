"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { changePasswordAction } from "@/actions/change-password.action";

export const ChangePasswordForm = () => {
  const [isPending, setIsPending] = useState(false); // TODO : Utiliser useTransition

  async function handleSubmit(evt: React.FormEvent<HTMLFormElement>) {
    evt.preventDefault();
    const formData = new FormData(evt.target as HTMLFormElement);

    setIsPending(true);

    const { error } = await changePasswordAction(formData);

    if (error) {
      toast.error(error);
    } else {
      toast.success("Mot de passe modifié avec succès.");
      (evt.target as HTMLFormElement).reset();
    }

    setIsPending(false);
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-sm w-full space-y-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="currentPassword">Mot de passe actuel</Label>
        <Input type="password" id="currentPassword" name="currentPassword" autoComplete="off" />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="newPassword">Nouveau mot de passe</Label>
        <Input type="password" id="newPassword" name="newPassword" />
      </div>

      <Button type="submit" disabled={isPending}>
        Valider
      </Button>
    </form>
  );
};