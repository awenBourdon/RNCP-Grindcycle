import { ReturnButton } from '@/app/(shop)/components/ReturnButton';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

export default async function SuccesPage() {
  const cookieStore = await cookies();
  const registrationToken = cookieStore.get('registration_success');

  if (!registrationToken) {
    redirect('/authentification/connexion');
  }
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-6 py-40">
        <ReturnButton
          href={'/authentification/connexion'}
          label={'Se connecter'}
        />

        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-normal text-black mb-6">
            Compte créé avec succès
          </h1>

          <p className="text-xl text-gray-600 mb-12">
            Un email de vérification t&apos;a été envoyé. Clique sur le lien
            dans ce message pour activer ton compte.
          </p>

          <p className="text-gray-500 text-sm mt-8">
            Tu n&apos;as pas reçu l&rsquo;email ? Pense à vérifier tes spams ou
            réessaie plus tard.
          </p>
        </div>
      </div>
    </div>
  );
}
