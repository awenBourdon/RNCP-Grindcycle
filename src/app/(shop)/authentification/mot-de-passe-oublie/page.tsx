import { ReturnButton } from '@/app/(shop)/components/ReturnButton';
import { ForgotPasswordForm } from '../components/ForgotPasswordForm';

export default function ForgotPasswordPage() {
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
            <h1 className="text-3xl font-normal mb-4">Mot de passe oublié</h1>

            <p className="text-gray-600 mb-8">
              Saisis ton adresse email pour recevoir un lien de réinitialisation
              de ton mot de passe.
            </p>

            <ForgotPasswordForm />
          </div>
        </div>
      </div>
    </div>
  );
}
