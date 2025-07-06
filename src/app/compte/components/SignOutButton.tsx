'use client'
import Spinner from '@/components/Spinner'
import { signOut } from '@/lib/auth-client'
import type { ErrorContext } from '@/lib/types'
import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import { toast } from 'sonner'

export const SignOutButton = () => {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  async function handleClick() {
    startTransition(async () => {
      await signOut({
        fetchOptions: {
          onError: (ctx: ErrorContext) => {
            toast.error(ctx.error.message)
          },
          onSuccess: () => {
            toast.success('adieu :(')
            router.push('/authentification/connexion')
          },
        },
      })
    })
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className={`
        text-red-800 hover:text-red-900 transition-colors
        border-b border-transparent hover:border-red-800
        pb-0.5 text-sm font-medium
        ${isPending ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'}
      `}
    >
      {isPending ? (
        <span className="inline-flex items-center">
          <Spinner />
          <span className="ml-2">Déconnexion...</span>
        </span>
      ) : (
        'Se déconnecter'
      )}
    </button>
  )
}
