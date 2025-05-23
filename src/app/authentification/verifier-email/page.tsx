import ReturnButton from "@/components/ReturnButton";
import { redirect } from "next/navigation";
import { SendVerificationEmailForm } from "../components/SendVerificationEmailForm";
import { AlertTriangle } from "lucide-react";

interface PageProps {
  searchParams: Promise<{ error: string }>
}

export default async function VerifyPage({ searchParams }: PageProps) {
  const error = (await searchParams).error

  if (!error) redirect("/compte")

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-6 py-40">
        <div className="mb-12">
          <ReturnButton href="/authentification/connexion" label="Se connecter" />
        </div>

        <div className="max-w-xl mx-auto">
          <div className="bg-[#f8f7f4] rounded-xl p-8 border border-gray-200">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-4">
                <AlertTriangle size={24} className="text-red-600" />
              </div>
              <h1 className="text-3xl font-normal">Vérification de ton adresse email</h1>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
              <p className="text-red-800">
                <span className="capitalize font-medium">{error?.replace(/_/g, " ").replace(/-/g, " ")}</span> - Demande
                une nouvelle vérification de ton adresse email s&apos;il te plait.
              </p>
            </div>

            <SendVerificationEmailForm />
          </div>
        </div>
      </div>
    </div>
  )
}
