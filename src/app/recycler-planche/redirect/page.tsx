import Link from 'next/link'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { LogIn, UserPlus } from 'lucide-react'
import { ReturnButton } from '@/components/ReturnButton'

const RedirectPage = async () => {
  const headersList = await headers()
  const session = await auth.api.getSession({
    headers: headersList,
  })

  if (session) {
    redirect('/recycler-planche')
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-6 py-40">
        <ReturnButton href={'/'} label={'Accueil'} />

        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-normal text-black mb-8">
            Connexion requise
          </h1>

          <p className="text-xl text-gray-600 mb-12">
            Pour donner une seconde vie à ta planche, tu dois d&apos;abord te
            connecter ou créer un compte.
          </p>

          <div className="bg-[#f8f7f4] rounded-xl p-8 mb-12">
            <h2 className="text-2xl font-normal mb-6">
              Pourquoi avoir un compte ?
            </h2>
            <div className="space-y-4 text-left">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-[#0a3d3f] rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-gray-600">
                  Suivre le statut de tes planches recyclées
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-[#0a3d3f] rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-gray-600">
                  Accumuler des points pour les échanger contre des planches
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-[#0a3d3f] rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-gray-600">
                  Accéder à ton historique de recyclage
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link
              href={`/authentification/connexion?redirect=/recycler-planche`}
              className="inline-flex items-center justify-center rounded-full text-lg font-medium px-8 py-4 bg-[#0a3d3f] text-white hover:bg-[#0a4d4f] transition-colors"
            >
              <LogIn size={20} className="mr-2" />
              Se connecter
            </Link>

            <Link
              href="/authentification/inscription"
              className="inline-flex items-center justify-center rounded-full text-lg font-medium px-8 py-4 border border-[#0a3d3f] text-[#0a3d3f] hover:bg-[#0a3d3f] hover:text-white transition-colors"
            >
              <UserPlus size={20} className="mr-2" />
              Créer un compte
            </Link>
          </div>

          <p className="text-gray-500 text-sm mt-8">
            Déjà membre ? La connexion ne prend que quelques secondes.
          </p>
        </div>
      </div>
    </div>
  )
}

export default RedirectPage
