"use client"

import Spinner from "@/components/Spinner"
import { sendVerificationEmail } from "@/lib/auth-client"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"
import { Mail, Send } from "lucide-react"
import type React from "react"

export const SendVerificationEmailForm = () => {
  // TODO : convertir en useTransition()
  const [isPending, setIsPending] = useState(false)
  const router = useRouter()

  async function handleSubmit(evt: React.FormEvent<HTMLFormElement>) {
    evt.preventDefault()
    const formData = new FormData(evt.currentTarget)
    const email = String(formData.get("email"))

    if (!email) {
      toast.error("Renseigne ton adresse email s'il te plait.")
      return
    }

    setIsPending(true) // démarrer le spinner manuellement ici

    try {
      await sendVerificationEmail({
        email,
        callbackURL: "/authentification/verifier-email",
      })

      toast.success("Email de vérification envoyé avec succès.")
      router.push("/authentification/verifier-email/succes")

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      // TODO : Typer correctement
      toast.error(err?.message || "Une erreur est survenue.")
    } finally {
      setIsPending(false)
    }
  }

  return (
    <form className="w-full space-y-6" onSubmit={handleSubmit}>
      <div className="flex flex-col gap-2">
        <label htmlFor="email" className="text-sm font-medium text-gray-700">
          Email
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Mail size={16} className="text-gray-400" />
          </div>
          <input
            type="email"
            id="email"
            name="email"
            placeholder="ton@email.com"
            className="w-full pl-10 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#0a3d3f] focus:border-transparent transition-colors"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className={`w-full inline-flex items-center justify-center rounded-full text-sm font-medium px-4 py-3 bg-[#0a3d3f] text-white hover:bg-[#0a4d4f] transition-colors ${
          isPending ? "opacity-70 cursor-not-allowed" : ""
        }`}
      >
        {isPending ? (
          <Spinner />
        ) : (
          <>
            <Send size={16} className="mr-2" />
            Envoyer un email de vérification
          </>
        )}
      </button>
    </form>
  )
}
