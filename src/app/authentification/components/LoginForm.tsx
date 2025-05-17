"use client";

import { signInEmailAction } from "@/actions/sign-in-email.action";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Spinner from "@/components/ui/Spinner";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";

const LoginForm = () => {
    const [isPending, startTransition] = useTransition();
    const router = useRouter();
 
    async function handleSubmit(evt: React.FormEvent<HTMLFormElement>){
        evt.preventDefault()
        const formData = new FormData(evt.target as HTMLFormElement);

        startTransition(async () => {

        const { error } = await signInEmailAction(formData);

        if (error) {
          toast.error(error);

        } else {
          toast.success("Connecter avec succès.");
          router.push("/compte");
        }
      });
    };    

  return (
    <form onSubmit={handleSubmit} className="max-w-sm w-full space-y-4">
     <div>
      <Label htmlFor="email">Email</Label>
      <Input type="email" id="email" name="email" />
     </div>

     <div>
      <Label htmlFor="password">Mot-de-passe</Label>
      <Input type="password" id="password" name="password" />
     </div>

     <Button type="submit" className="w-full" disabled={isPending}>
     {isPending ? <Spinner/> : "Se connecter"}
     </Button>
    </form>
  )
}

export default LoginForm
