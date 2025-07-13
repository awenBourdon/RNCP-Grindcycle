'use client'
import { useState, useTransition, useEffect } from 'react'
import { signIn } from '@/lib/auth-client'
import { Spinner } from '@/components/ui/Spinner'
import Image from 'next/image'
import { toast } from 'sonner'

interface SignInOauthButtonProps {
  signUp?: boolean
}

export const SignInOauthButton = ({ signUp }: SignInOauthButtonProps) => {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const action = signUp ? "S'inscrire" : 'Se connecter'

  // TODO : Ouvrir dans une modale || fenêtre

  useEffect(() => {
    if (error) {
      toast.error(error)
      const timer = setTimeout(() => setError(null), 100)
      return () => clearTimeout(timer)
    }
  }, [error])

  function handleClick() {
    setError(null)

    startTransition(async () => {
      try {
        await signIn.social({
          provider: 'google',
          callbackURL: '/compte',
          errorCallbackURL: '/authentification/erreur',
          fetchOptions: {
            onError: async (context) => {
              const { response } = context

              if (response.status === 429) {
                try {
                  const errorData = await response.json()
                  setError(
                    errorData?.message ||
                      'Trop de tentatives de connexion. Retente dans 5 minutes.'
                  )
                } catch {
                  setError(
                    'Trop de tentatives de connexion. Retente dans 5 minutes.'
                  )
                }
                return
              }

              if (response.status >= 400) {
                try {
                  const errorData = await response.json()
                  setError(errorData?.message || 'Erreur lors de la connexion')
                } catch {
                  setError('Erreur lors de la connexion')
                }
              }
            },
          },
        })
      } catch (err) {
        console.error('Erreur connexion Google:', err)
        setError('Erreur lors de la connexion avec Google')
      }
    })
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className={`cursor-pointer w-full inline-flex items-center justify-center rounded-full text-sm font-medium px-4 py-3 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors ${
        isPending ? 'opacity-70 cursor-not-allowed' : ''
      }`}
    >
      {isPending ? (
        <Spinner />
      ) : (
        <>
          <Image
            src="/google.svg"
            alt="Google"
            width={18}
            height={18}
            className="mr-2"
          />
          {`${action} avec Google`}
        </>
      )}
    </button>
  )
}
