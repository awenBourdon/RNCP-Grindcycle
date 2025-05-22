import ReturnButton from "@/components/ui/ReturnButton";
import { ForgotPasswordForm } from "../components/ForgotPasswordForm";

export default function ForgotPasswordPage() {
  return (
    <div className="px-8 py-40 container mx-auto max-w-screen-lg space-y-8">
      <div className="space-y-4">
        <ReturnButton href="/authentification/connexion" label="Se connecter" />

        <h1 className="text-3xl font-bold">Mot de passe oublié.</h1>

        <p className="text-muted-foreground">
        Saisis ton adresse email pour recevoir un lien de réinitialisation de ton mot de passe.
        </p>

        <ForgotPasswordForm />
      </div>
    </div>
  );
}