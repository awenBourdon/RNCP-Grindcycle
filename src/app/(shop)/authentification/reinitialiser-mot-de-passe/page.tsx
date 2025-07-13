import { ReturnButton } from '@/components/ReturnButton'
import { redirect } from 'next/navigation'
import { ResetPasswordForm } from '../components/ResetPasswordForm'

interface ResetPasswordPageProps {
  searchParams: Promise<{ token: string }>
}

export default async function ResetPasswordPage({
  searchParams,
}: ResetPasswordPageProps) {
  const token = (await searchParams).token

  if (!token) redirect('/authentification/connexion')

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-6 py-40">
        <div className="mb-12">
          <ReturnButton
            href="/authentification/connexion"
            label="Se connecter"
          />
        </div>

        <div className="max-w-xl mx-auto">
          <div className="bg-[#f8f7f4] rounded-xl p-8 ">
            <h1 className="text-3xl font-normal mb-4">
              Réinitialiser ton mot de passe
            </h1>

            <p className="text-gray-600 mb-8">
              Choisis ton nouveau mot de passe pour sécuriser ton compte.
            </p>

            <ResetPasswordForm token={token} />
          </div>
        </div>
      </div>
    </div>
  )
}
