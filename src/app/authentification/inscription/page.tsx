import Link from 'next/link'
import ReturnButton from '@/components/ReturnButton'
import RegisterForm from '../components/RegisterForm'
import { SignInOauthButton } from '../components/SignInOauthButton'

const RegisterPage = async () => {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-6 py-40">
        <div className="mb-12">
          <ReturnButton href="/" label="Accueil" />
          <h1 className="text-3xl font-normal mt-8 mb-2">S&apos;inscrire</h1>
          <p className="text-gray-600">
            Crée ton compte GRINDCYCLE et rejoins notre communauté
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-8">
            <div className="bg-[#f8f7f4] rounded-xl p-8 ">
              <h2 className="text-xl font-medium mb-6">Inscription standard</h2>
              <RegisterForm />

              <p className="text-gray-600 text-sm mt-6">
                Tu as déjà un compte ?{' '}
                <Link
                  href="/authentification/connexion"
                  className="text-[#0a3d3f] hover:underline font-medium"
                >
                  Se connecter
                </Link>
              </p>
            </div>
          </div>

          <div className="bg-[#f8f7f4] rounded-xl p-8 h-fit">
            <h2 className="text-xl font-medium mb-6">
              Inscription avec Google
            </h2>
            <p className="text-gray-600 mb-6">
              Inscris-toi rapidement avec ton compte Google, sans avoir à créer
              un nouveau mot de passe.
            </p>
            <SignInOauthButton signUp />
          </div>
        </div>
      </div>
    </div>
  )
}

export default RegisterPage
