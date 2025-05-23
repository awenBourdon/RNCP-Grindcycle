"use client";
import { signInEmailAction } from "@/actions/sign-in-email.action";
import type React from "react";
import Spinner from "@/components/Spinner";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";
import { LogIn } from "lucide-react";

const LoginForm = () => {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  async function handleSubmit(evt: React.FormEvent<HTMLFormElement>) {
    evt.preventDefault()
    const formData = new FormData(evt.target as HTMLFormElement)

    startTransition(async () => {
      const { error } = await signInEmailAction(formData)

      if (error) {
        toast.error(error)
      } else {
        toast.success("Connecté avec succès.")
        router.push("/compte")
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-4">
      <div className="flex flex-col gap-2">
        <label htmlFor="email" className="text-sm font-medium text-gray-700">
          Email
        </label>
        <input
          type="email"
          id="email"
          name="email"
          placeholder="ton@email.com"
          className="w-full px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#0a3d3f] focus:border-transparent transition-colors"
        />
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-center">
          <label htmlFor="password" className="text-sm font-medium text-gray-700">
            Mot de passe
          </label>
          <Link href="/authentification/mot-de-passe-oublie" className="text-sm text-[#0a3d3f] hover:underline">
            Mot de passe oublié ?
          </Link>
        </div>
        <input
          type="password"
          id="password"
          name="password"
          className="w-full px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#0a3d3f] focus:border-transparent transition-colors"
        />
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
            <LogIn size={16} className="mr-2" />
            Se connecter
          </>
        )}
      </button>
    </form>
  )
}

export default LoginForm
