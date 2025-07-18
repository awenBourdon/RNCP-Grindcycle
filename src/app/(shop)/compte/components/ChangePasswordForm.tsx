"use client"

import type React from "react"
import { useState } from "react"
import { toast } from "sonner"
import { changePasswordAction } from "@/actions/change-password.action"
import { passwordSchema } from "@/lib/zod-validations/authValidation"
import { z } from "zod"

export const ChangePasswordForm = () => {
  const [isPending, setIsPending] = useState(false)

  async function handleSubmit(evt: React.FormEvent<HTMLFormElement>) {
    evt.preventDefault()
    const formData = new FormData(evt.target as HTMLFormElement)
    const currentPassword = String(formData.get("currentPassword"))
    const newPassword = String(formData.get("newPassword"))
    const confirmPassword = String(formData.get("confirmPassword"))

    try {
      // Validate with your Zod schema
      passwordSchema.parse({ password: newPassword })

      if (newPassword !== confirmPassword) {
        return toast.error("Les mots de passe ne correspondent pas")
      }

      setIsPending(true)

      const result = await changePasswordAction({
        currentPassword,
        newPassword,
      })

      if (result.success) {
        toast.success("Mot de passe modifié avec succès")
        ;(evt.target as HTMLFormElement).reset()
      } else {
        toast.error(result.error || "Erreur lors de la modification")
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0]?.message || "Mot de passe invalide")
      } else {
        toast.error("Une erreur est survenue")
      }
    } finally {
      setIsPending(false)
    }
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div>
        <label htmlFor="currentPassword" className="block text-sm font-medium text-[#010101] mb-2">
          Mot de passe actuel
        </label>
        <input
          id="currentPassword"
          name="currentPassword"
          type="password"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0a3d3f] focus:border-transparent transition-colors"
          placeholder="Votre mot de passe actuel"
        />
      </div>

      <div>
        <label htmlFor="newPassword" className="block text-sm font-medium text-[#010101] mb-2">
          Nouveau mot de passe
        </label>
        <input
          id="newPassword"
          name="newPassword"
          type="password"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0a3d3f] focus:border-transparent transition-colors"
          placeholder="Votre nouveau mot de passe"
        />
      </div>

      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-[#010101] mb-2">
          Confirmer le nouveau mot de passe
        </label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0a3d3f] focus:border-transparent transition-colors"
          placeholder="Confirmez votre nouveau mot de passe"
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className={`w-full px-6 py-3 bg-[#0a3d3f] text-white rounded-lg font-medium hover:bg-[#0a4d4f] transition-colors ${
          isPending ? "opacity-70 cursor-not-allowed" : ""
        }`}
      >
        {isPending ? "Modification en cours..." : "Changer le mot de passe"}
      </button>
    </form>
  )
}
