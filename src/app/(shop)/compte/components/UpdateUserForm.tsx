'use client'
import type React from 'react'
import { useState } from 'react'
import { updateUser } from '@/lib/auth-client'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface UpdateUserFormProps {
  name: string
}

export const UpdateUserForm = ({ name }: UpdateUserFormProps) => {
  const [isPending, setIsPending] = useState(false)
  const router = useRouter()

  async function handleSubmit(evt: React.FormEvent<HTMLFormElement>) {
    evt.preventDefault()
    const formData = new FormData(evt.target as HTMLFormElement)
    const name = String(formData.get('name'))
    const image = String(formData.get('image'))

    if (!name && !image) {
      return toast.error('Veuillez entrer un nom ou une image')
    }

    await updateUser({
      ...(name && { name }),
      image,
      fetchOptions: {
        onRequest: () => {
          setIsPending(true)
        },
        onResponse: () => {
          setIsPending(false)
        },
        onError: (ctx) => {
          toast.error(ctx.error.message)
        },
        onSuccess: () => {
          toast.success('Utilisateur mis à jour avec succès')
          ;(evt.target as HTMLFormElement).reset()
          router.refresh()
        },
      },
    })
  }

  return (
    <form className="max-w-sm w-full space-y-4" onSubmit={handleSubmit}>
      <div className="flex flex-col gap-2">
        <label htmlFor="name" className="text-sm font-medium text-gray-700">
          Nom
        </label>
        <input
          id="name"
          name="name"
          defaultValue={name}
          className="w-full px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#0a3d3f] focus:border-transparent transition-colors"
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className={`w-full inline-flex items-center justify-center rounded-full text-sm font-medium px-4 py-2 bg-[#0a3d3f] text-white hover:bg-[#0a4d4f] transition-colors ${
          isPending ? 'opacity-70 cursor-not-allowed' : ''
        }`}
      >
        {isPending ? 'Mise à jour en cours...' : 'Valider'}
      </button>
    </form>
  )
}
