"use client";
import { useRef, useState } from "react";
import { signIn } from "@/lib/auth-client";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ErrorContext } from "@/lib/types";

export const MagicLinkLoginForm = () => {
  const [isPending, setIsPending] = useState(false); // TODO : Utiliser useTransition
  const ref = useRef<HTMLDetailsElement>(null);

  async function handleSubmit(evt: React.FormEvent<HTMLFormElement>) {
    evt.preventDefault();
    const formData = new FormData(evt.currentTarget);
    const email = String(formData.get("email"));

    if (!email) return toast.error("Please enter your email.");

    await signIn.magicLink({
      email,
      name: email.split("@")[0],
      callbackURL: "/compte",
      fetchOptions: {
        onRequest: () => {
          setIsPending(true);
        },
        onResponse: () => {
          setIsPending(false);
        },
        onError: (ctx: ErrorContext) => {
          toast.error(ctx.error.message);
        },
        onSuccess: () => {
          toast.success("Check your email for the magic link!");
          if (ref.current) ref.current.open = false;
        },
      },
    });
  }

  return (
    <details
      ref={ref}
      className="max-w-sm rounded-md border border-black overflow-hidden"
    >
      <summary className="flex gap-2 items-center px-2 py-1  bg-black text-white">
        Connexion express
      </summary>

      <form onSubmit={handleSubmit} className="px-2 py-1">
        <Label htmlFor="email" className="sr-only">
          Email
        </Label>
        <div className="flex gap-2 items-center">
          <Input type="email" id="email" name="email" />
          <Button disabled={isPending}>Envoyer</Button>
        </div>
      </form>
    </details>
  );
};