"use client";
import { Button } from "@/components/ui/button"
import Spinner from "@/components/ui/Spinner";
import { signOut } from "@/lib/auth-client";
import { ErrorContext } from "@/lib/types";
import { useRouter } from "next/navigation"
import { useTransition } from "react";
import { toast } from "sonner";

const SignOutButton = () => {
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    async function handleClick() {
        startTransition(async () => {
        await signOut({
            fetchOptions : {
                onError: (ctx: ErrorContext) => {
                    toast.error(ctx.error.message)
                },
                onSuccess: () => {
                    toast.success("adieu :(");
                    router.push("/authentification/connexion");
                }
            }
        });
    }
)};

  return (
    <Button onClick={handleClick} size='sm' variant='destructive' className="text-black" disabled={isPending}>
        {isPending ? <Spinner/> : "Se déconnecter"}
    </Button>
  )
}

export default SignOutButton
