"use client"
;import { signUpEmailAction } from "@/actions/sign-up-email.action";
import Spinner from "@/components/Spinner";
import { useRouter } from "next/navigation";
import { useTransition } from "react"
import { toast } from "sonner";
import { UserPlus, Mail, Lock } from "lucide-react";
import type React from "react";

const RegisterForm = () => {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  async function handleSubmit(evt: React.FormEvent<HTMLFormElement>) {
    evt.preventDefault()
    const formData = new FormData(evt.target as HTMLFormElement)

    startTransition(async () => {
      const { error } = await signUpEmailAction(formData)

      if (error) {
        toast.error(error)
      } else {
        toast.success("Compte créé avec succès.") // TODO : UX pour dire qu'il faut valider email si pas connectée avec google
        router.push("/authentification/connexion")
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-4">
      <div className="flex flex-col gap-2">
        <label htmlFor="name" className="text-sm font-medium text-gray-700">
          Nom d&apos;utilisateur
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <UserPlus size={16} className="text-gray-400" />
          </div>
          <input
            id="name"
            name="name"
            placeholder="Ton nom d'utilisateur"
            className="w-full pl-10 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#0a3d3f] focus:border-transparent transition-colors"
          />
        </div>
      </div>

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

      <div className="flex flex-col gap-2">
        <label htmlFor="password" className="text-sm font-medium text-gray-700">
          Mot de passe
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Lock size={16} className="text-gray-400" />
          </div>
          <input
            type="password"
            id="password"
            name="password"
            placeholder="••••••••"
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
            <UserPlus size={16} className="mr-2" />
            S&apos;inscrire
          </>
        )}
      </button>
    </form>
  )
}

export default RegisterForm
