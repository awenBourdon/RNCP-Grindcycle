import ReturnButton from "@/components/ui/ReturnButton";
import { redirect } from "next/navigation";
import { SendVerificationEmailForm } from "../components/SendVerificationEmailForm";

interface PageProps {
  searchParams: Promise<{ error: string }>;
}

export default async function VerifyPage({ searchParams }: PageProps) {
  const error = (await searchParams).error;

  if (!error) redirect("/compte");

  return (
    <div className="px-8 py-40 container mx-auto max-w-screen-lg space-y-8">
      <div className="space-y-4">
        <ReturnButton href="/authentification/connexion" label="Se connecter" />

        <h1 className="text-3xl font-bold">Vérification de ton adresse email.</h1>
      </div>

      <p className="text-destructive">
        <span className="capitalize">
          {error?.replace(/_/g, " ").replace(/-/g, " ")}
        </span>{" "}
        - Demande une nouvelle vérification de ton adresse email s&apos;il te plait.
      </p>

      <SendVerificationEmailForm />
    </div>
  );
}