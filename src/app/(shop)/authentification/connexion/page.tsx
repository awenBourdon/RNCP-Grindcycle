import { LoginForm } from '../components/LoginForm'
import { ReturnButton } from '@/components/ReturnButton'
import Link from 'next/link'
import { SignInOauthButton } from '../components/SignInOauthButton'
import { MagicLinkLoginForm } from '../components/MagicLinkLoginForm'

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-6 py-40">
        <div className="mb-12">
          <ReturnButton href="/" label="Accueil" />
          <h1 className="text-3xl font-normal mt-8 mb-2">Se connecter</h1>
          <p className="text-gray-600">Accède à ton compte GRINDCYCLE</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-8">
            <div className="bg-[#f8f7f4] rounded-xl p-8 ">
              <h2 className="text-xl font-medium mb-6">Connexion standard</h2>
              <LoginForm />

              <p className="text-gray-600 text-sm mt-6">
                Tu n&apos;as pas de compte ?{' '}
                <Link
                  href="/authentification/inscription"
                  className="text-[#0a3d3f] hover:underline font-medium"
                >
                  S&apos;inscrire
                </Link>
              </p>
            </div>

            <div className="bg-[#f8f7f4] rounded-xl p-8 ">
              <h2 className="text-xl font-medium mb-6">
                Connexion avec Google
              </h2>
              <SignInOauthButton />
            </div>
          </div>

          <div className="bg-[#f8f7f4] rounded-xl p-8 h-fit">
            <h2 className="text-xl font-medium mb-6">Connexion express</h2>
            <p className="text-gray-600 mb-6">
              Reçois un lien de connexion directement dans ta boîte mail, sans
              avoir à saisir ton mot de passe.
            </p>
            <MagicLinkLoginForm />
          </div>
        </div>
      </div>
    </div>
  )
}
