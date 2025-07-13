import { ReturnButton } from '@/components/ui/ReturnButton'
import Link from 'next/link'
import { CheckCircle } from 'lucide-react'

export default function Page() {
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
          <div className="bg-[#f8f7f4] rounded-xl p-8 border border-gray-200 text-center">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle size={32} className="text-green-600" />
              </div>
            </div>

            <h1 className="text-3xl font-normal mb-4">Email envoyé !</h1>

            <p className="text-gray-600 mb-8">
              Email de vérification envoyé avec succès. Vérifie ta boîte de
              réception et clique sur le lien pour vérifier ton adresse email.
            </p>

            <div className="space-y-4">
              <Link
                href="/authentification/connexion"
                className="inline-flex items-center justify-center rounded-full text-sm font-medium px-6 py-3 bg-[#0a3d3f] text-white hover:bg-[#0a4d4f] transition-colors"
              >
                Retour à la connexion
              </Link>

              <p className="text-sm text-gray-500 mt-4">
                Si tu n&apos;as pas reçu d&apos;email, vérifie ton dossier de
                spam ou
                <Link
                  href="/authentification/verifier-email"
                  className="text-[#0a3d3f] hover:underline ml-1"
                >
                  essaie à nouveau
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
