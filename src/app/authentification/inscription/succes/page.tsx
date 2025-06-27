import ReturnButton from '@/components/ReturnButton'

const InscriptionSuccesPage = () => {
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
            Un email de vérification t’a été envoyé. Clique sur le lien dans ce
            message pour activer ton compte.
          </p>

          <p className="text-gray-500 text-sm mt-8">
            Tu n’as pas reçu l’email ? Pense à vérifier tes spams ou réessaie
            plus tard.
          </p>
        </div>
      </div>
    </div>
  )
}

export default InscriptionSuccesPage
