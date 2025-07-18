"use client"

import type React from "react"
import { useState } from "react"
import { updateUser } from "@/lib/auth-client"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface UpdateUserFormProps {
  name: string
}

export const UpdateUserForm = ({ name }: UpdateUserFormProps) => {
  const [isPending, setIsPending] = useState(false)
  const router = useRouter()

  async function handleSubmit(evt: React.FormEvent<HTMLFormElement>) {
    evt.preventDefault()
    const formData = new FormData(evt.target as HTMLFormElement)
    const name = String(formData.get("name"))
    const image = String(formData.get("image"))

    if (!name && !image) {
      return toast.error("Veuillez entrer un nom ou une image")
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
          toast.success("Utilisateur mis à jour avec succès")
          ;(evt.target as HTMLFormElement).reset()
          router.refresh()
        },
      },
    })
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-[#010101] mb-2">
          Nom complet
        </label>
        <input
          id="name"
          name="name"
          defaultValue={name}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0a3d3f] focus:border-transparent transition-colors"
          placeholder="Votre nom complet"
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className={`w-full px-6 py-3 bg-[#0a3d3f] text-white rounded-lg font-medium hover:bg-[#0a4d4f] transition-colors ${
          isPending ? "opacity-70 cursor-not-allowed" : ""
        }`}
      >
        {isPending ? "Mise à jour en cours..." : "Mettre à jour"}
      </button>
    </form>
  )
}
