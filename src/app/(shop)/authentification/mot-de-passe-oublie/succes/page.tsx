import Link from 'next/link'
import { ReturnButton } from '@/components/ui/ReturnButton'
import { CheckCircle } from 'lucide-react'

export default function SuccesPage() {
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
          <div className="bg-[#f8f7f4] rounded-xl p-8 text-center">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle size={32} className="text-green-600" />
              </div>
            </div>

            <h1 className="text-3xl font-normal mb-4">
              Compte créé avec succès
            </h1>

            <p className="text-gray-600 mb-8">
              Tu vas recevoir un email de vérification. Clique sur le lien dans
              ce message pour activer ton compte.
            </p>

            <div className="space-y-4">
              <Link
                href="/authentification/connexion"
                className="inline-flex items-center justify-center rounded-full text-sm font-medium px-6 py-3 bg-[#0a3d3f] text-white hover:bg-[#0a4d4f] transition-colors"
              >
                Connexion
              </Link>

              <p className="text-sm text-gray-500 mt-4">
                Si tu n&apos;as pas reçu d&apos;email, vérifie ton dossier de
                spam ou
                <Link
                  href="/authentification/mot-de-passe-oublie"
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
