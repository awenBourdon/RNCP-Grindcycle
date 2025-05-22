
import ReturnButton from "@/components/ui/ReturnButton";
import { redirect } from "next/navigation";
import { ResetPasswordForm } from "../components/ResetPasswordForm";

interface ResetPasswordPageProps {
  searchParams: Promise<{ token: string }>;
}

export default async function ResetPasswordPage({ searchParams }: ResetPasswordPageProps) {
  const token = (await searchParams).token;

  if (!token) redirect("/authentification/connexion");

  return (
    <div className="px-8 py-40 container mx-auto max-w-screen-lg space-y-8">
      <div className="space-y-4">
        <ReturnButton href="/authentification/connexion" label="Se connecter" />

        <h1 className="text-3xl font-bold">Réinitialiser ton mot de passe</h1>

        <p className="text-muted-foreground">
        Choisis ton nouveau mot de passe.
        </p>

        <ResetPasswordForm token={token} />
      </div>
    </div>
  );
}