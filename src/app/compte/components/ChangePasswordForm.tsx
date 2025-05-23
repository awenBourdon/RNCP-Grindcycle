"use client";
import { useState } from "react";
import type React from "react";
import { toast } from "sonner";
import { changePasswordAction } from "@/actions/change-password.action";

export const ChangePasswordForm = () => {
  const [isPending, setIsPending] = useState(false) // TODO : Utiliser useTransition

  async function handleSubmit(evt: React.FormEvent<HTMLFormElement>) {
    evt.preventDefault()
    const formData = new FormData(evt.target as HTMLFormElement)

    setIsPending(true)

    const { error } = await changePasswordAction(formData)

    if (error) {
      toast.error(error)
    } else {
      toast.success("Mot de passe modifié avec succès.")
      ;(evt.target as HTMLFormElement).reset()
    }

    setIsPending(false)
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-sm w-full space-y-4">
      <div className="flex flex-col gap-2">
        <label htmlFor="currentPassword" className="text-sm font-medium text-gray-700">
          Mot de passe actuel
        </label>
        <input
          type="password"
          id="currentPassword"
          name="currentPassword"
          autoComplete="off"
          className="w-full px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#0a3d3f] focus:border-transparent transition-colors"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="newPassword" className="text-sm font-medium text-gray-700">
          Nouveau mot de passe
        </label>
        <input
          type="password"
          id="newPassword"
          name="newPassword"
          className="w-full px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#0a3d3f] focus:border-transparent transition-colors"
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className={`w-full inline-flex items-center justify-center rounded-full text-sm font-medium px-4 py-2 bg-[#0a3d3f] text-white hover:bg-[#0a4d4f] transition-colors ${
          isPending ? "opacity-70 cursor-not-allowed" : ""
        }`}
      >
        {isPending ? "Modification en cours..." : "Valider"}
      </button>
    </form>
  )
}
