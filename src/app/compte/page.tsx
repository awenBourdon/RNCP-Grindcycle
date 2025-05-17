import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import SignOutButton from "./components/SignOutButton";
import ReturnButton from "../../components/ui/ReturnButton";

const Page = async () => {
    const headersList = await headers();

    const session = await auth.api.getSession({
      headers: headersList,
    });

    if (!session) redirect("/authentification/connexion");

    // TODO : Découvrir pourquoi Better-Auth ne valide pas la méthode userHasPermission
    const FULL_POST_ACCESS = await auth.api.userHasPermission({
        body: {
          userId: session.user.id,
          permissions: {
            posts: ["update", "delete"],
          },
        },
      });
              
  return (
    <div className="px-8 py-16 container mx-auto max-w-screen-lg space-y-8">
        <div className="space-y-8">
            <ReturnButton href="/" label="Accueil"/>
            <h1 className="text-3xl font-bold">Mon compte</h1>
        </div>

        <div className="flex items-center gap-2">
            {session.user.role === "ADMIN" && (
                <Button size="sm" asChild>
                    <Link href="/admin/dashboard">
                        Accéder au Dashboard
                    </Link>
                </Button>
            )}
        </div>

            <SignOutButton/>

        <div className="text-2xl font-bold">Permissions</div>

        <div className="space-x-4">
            <Button size="sm">Modififer mes posts</Button>
            <Button size="sm" disabled={!FULL_POST_ACCESS.success}>Modifier tous les posts</Button>
        </div>

        <pre className="text-sm overflow-clip">
            {JSON.stringify(session, null, 2)}
        </pre>
    </div>
  )
}

export default Page
