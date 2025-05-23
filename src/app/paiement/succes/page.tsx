"use client"
import { useEffect } from "react"
import Link from "next/link"
import { CheckCircle, ArrowRight } from "lucide-react"
import { useCart } from "@/contexts/CartContext"

export default function SuccessPage() {
  const { clearCart } = useCart()

  useEffect(() => {

    clearCart()
    sessionStorage.removeItem("shippingAddress")
  }, [clearCart])

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-6 py-40">
        <div className="max-w-2xl mx-auto text-center">
          <div className="flex justify-center mb-8">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle size={40} className="text-green-600" />
            </div>
          </div>

          <h1 className="text-4xl md:text-5xl font-normal text-black mb-6">Commande confirmée !</h1>

          <p className="text-xl text-gray-600 mb-12">
            Merci pour votre achat. Votre commande a été traitée avec succès et sera bientôt expédiée.
          </p>

          <div className="space-y-6">
            <p className="text-gray-600">Un email de confirmation a été envoyé à l&apos;adresse que vous avez fournie.</p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
              <Link
                href="/catalogue"
                className="inline-flex items-center justify-center rounded-full text-sm font-medium px-6 py-3 bg-[#0a3d3f] text-white hover:bg-[#0a4d4f] transition-colors"
              >
                Continuer mes achats
                <ArrowRight size={16} className="ml-2" />
              </Link>

              <Link
                href="/compte"
                className="inline-flex items-center justify-center rounded-full text-sm font-medium px-6 py-3 border border-[#0a3d3f] text-[#0a3d3f] hover:bg-[#0a3d3f] hover:text-white transition-colors"
              >
                Mon compte
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
