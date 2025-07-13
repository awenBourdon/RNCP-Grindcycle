import { ReturnButton } from '@/components/ReturnButton'

interface PageProps {
  searchParams: Promise<{ error: string }>
}

export default async function ErrorLoginPage({ searchParams }: PageProps) {
  const error = (await searchParams).error

  return (
    <div className="px-8 py-40 container mx-auto max-w-screen-lg space-y-8">
      <div className="space-y-4">
        <ReturnButton href="/authentification/connexion" label="Connexion" />

        <h1 className="text-3xl font-bold">Erreur lors de la connexion.</h1>
      </div>

      <p className="text-destructive">
        {error === 'account_not_linked'
          ? 'Ce compte est déjà lié à une autre méthode de connexion.'
          : "Oups ! Une erreur s'est produite. Réessaie plus tard."}
      </p>
    </div>
  )
}
