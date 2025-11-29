'use client';
import { useState } from 'react';
import { LoginForm } from './LoginForm';
import { MagicLinkLoginForm } from './MagicLinkLoginForm';
import { RegisterForm } from './RegisterForm';
import { SignInOauthButton } from './SignInOauthButton';

type AuthMode = 'login' | 'register';

export function AuthContainer() {
  const [authMode, setAuthMode] = useState<AuthMode>('login');

  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-normal mb-2">
          {authMode === 'login' ? 'Se connecter' : "S'inscrire"}
        </h1>
        <p className="text-gray-600">
          {authMode === 'login'
            ? 'Accède à ton compte Grindcycle'
            : 'Crée ton compte Grindcycle et rejoins notre communauté'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="space-y-8">
          <div className="bg-[#f8f7f4] rounded-xl p-8">
            <h2 className="text-xl font-medium mb-6">
              {authMode === 'login'
                ? 'Connexion standard'
                : 'Inscription standard'}
            </h2>

            {authMode === 'login' ? <LoginForm /> : <RegisterForm />}

            <p className="text-gray-600 text-sm mt-6">
              {authMode === 'login' ? (
                <>
                  Tu n&apos;as pas de compte ?{' '}
                  <button
                    onClick={() => setAuthMode('register')}
                    className="text-[#0a3d3f] hover:underline font-medium cursor-pointer"
                    aria-label="Accéder au formulaire d'inscription"
                  >
                    S&apos;inscrire
                  </button>
                </>
              ) : (
                <>
                  Tu as déjà un compte ?{' '}
                  <button
                    onClick={() => setAuthMode('login')}
                    className="text-[#0a3d3f] hover:underline font-medium cursor-pointer"
                    aria-label="Retourner au formulaire de connexion"
                  >
                    Se connecter
                  </button>
                </>
              )}
            </p>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-[#f8f7f4] rounded-xl p-8">
            <h2 className="text-xl font-medium mb-4">
              {authMode === 'login'
                ? 'Connexion avec Google'
                : 'Inscription avec Google'}
            </h2>
            <p className="text-gray-600 mb-6">
              {authMode === 'login'
                ? 'Connecte-toi rapidement avec ton compte Google.'
                : 'Inscris-toi rapidement avec ton compte Google, sans avoir à créer un nouveau mot de passe.'}
            </p>
            <div
              aria-label={
                authMode === 'login'
                  ? 'Connexion avec Google'
                  : 'Inscription avec Google'
              }
            >
              <SignInOauthButton signUp={authMode === 'register'} />
            </div>
          </div>

          <div className="bg-[#f8f7f4] rounded-xl p-8">
            <h2 className="text-xl font-medium mb-4">Connexion express</h2>
            <p className="text-gray-600 mb-6">
              Reçois un lien de connexion directement dans ta boîte mail, sans
              avoir à saisir ton mot de passe.
            </p>
            <div aria-label="Connexion express par lien magique">
              <MagicLinkLoginForm />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
