import ReturnButton from "@/components/ui/ReturnButton";


export default function Page() {
  return (
    <div className="px-8 py-40 container mx-auto max-w-screen-lg space-y-8">
      <div className="space-y-4">
        <ReturnButton href="/authentification/connexion" label="Se connecter" />

        <h1 className="text-3xl font-bold">Succès</h1>

        <p className="text-muted-foreground">
          Email de vérification envoyé avec succès.
        </p>
      </div>
    </div>
  );
}