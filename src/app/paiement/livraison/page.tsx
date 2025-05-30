"use client"
import { useState, useEffect } from "react"
import type React from "react"

import { useRouter } from "next/navigation"
import { useCart } from "@/contexts/CartContext"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function ShippingPage() {
  const router = useRouter()
  const { cartItems, getCartTotal, getShippingCost } = useCart()
  const [isLoading, setIsLoading] = useState(false)
  const [userEmail, setUserEmail] = useState("")
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    address: "",
    city: "",
    postalCode: "",
    country: "France",
    email: "",
    phone: "",
  })

  // Vérifier si l'utilisateur est connecté et récupérer son email
  useEffect(() => {
    const checkUserSession = async () => {
      try {
        const response = await fetch("/api/auth[/check-session]")
        const data = await response.json()
        if (data.isLoggedIn && data.user?.email) {
          setUserEmail(data.user.email)
          setFormData((prev) => ({ ...prev, email: data.user.email }))
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des données utilisateur:", error)
      }
    }

    checkUserSession()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (cartItems.length === 0) {
      alert("Votre panier est vide")
      router.push("/panier")
      return
    }

    setIsLoading(true)

    try {
      sessionStorage.setItem("shippingAddress", JSON.stringify(formData))

      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cartItems,
          shippingCost: getShippingCost(),
          shippingAddress: formData,
          userEmail: userEmail,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Erreur lors de la création de la session de paiement")
      }

      if (data.url) {
        // Redirection vers Stripe
        window.location.href = data.url
      } else {
        throw new Error("URL de paiement non disponible")
      }
    } catch (error) {
      console.error("Erreur lors du checkout:", error)
      alert("Une erreur est survenue lors du paiement. Veuillez réessayer.")
    } finally {
      setIsLoading(false)
    }
  }

  const subtotal = getCartTotal()
  const shipping = getShippingCost()
  const total = subtotal + shipping

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-6 py-40">
        <Link
          href="/panier"
          className="inline-flex items-center text-gray-600 hover:text-[#0a3d3f] transition-colors group mb-12"
        >
          <ArrowLeft size={16} className="mr-2 group-hover:-translate-x-1 transition-transform" />
          <span className="border-b border-transparent group-hover:border-[#0a3d3f] pb-0.5 transition-colors">
            Retour au panier
          </span>
        </Link>

        <h1 className="text-4xl md:text-6xl font-normal text-black mb-12">Adresse de livraison</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label htmlFor="firstName" className="text-sm font-medium text-gray-700">
                    Prénom
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#0a3d3f] focus:border-transparent transition-colors"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label htmlFor="lastName" className="text-sm font-medium text-gray-700">
                    Nom
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#0a3d3f] focus:border-transparent transition-colors"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="address" className="text-sm font-medium text-gray-700">
                  Adresse
                </label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#0a3d3f] focus:border-transparent transition-colors"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label htmlFor="city" className="text-sm font-medium text-gray-700">
                    Ville
                  </label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#0a3d3f] focus:border-transparent transition-colors"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label htmlFor="postalCode" className="text-sm font-medium text-gray-700">
                    Code postal
                  </label>
                  <input
                    type="text"
                    id="postalCode"
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#0a3d3f] focus:border-transparent transition-colors"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="country" className="text-sm font-medium text-gray-700">
                  Pays
                </label>
                <select
                  id="country"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#0a3d3f] focus:border-transparent transition-colors"
                >
                  <option value="France">France</option>
                  <option value="Belgique">Belgique</option>
                  <option value="Suisse">Suisse</option>
                  <option value="Luxembourg">Luxembourg</option>
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label htmlFor="email" className="text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#0a3d3f] focus:border-transparent transition-colors"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label htmlFor="phone" className="text-sm font-medium text-gray-700">
                    Téléphone
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#0a3d3f] focus:border-transparent transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-[#0a3d3f] text-white rounded-full hover:bg-[#0a4d4f] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Redirection vers le paiement...
                  </>
                ) : (
                  "Procéder au paiement"
                )}
              </button>
            </form>
          </div>

          <div>
            <div className="bg-[#f8f7f4] p-6 rounded-lg sticky top-40">
              <h2 className="text-xl font-medium mb-6">Récapitulatif</h2>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Sous-total</span>
                  <span>{subtotal.toFixed(2)} €</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Livraison</span>
                  <span>{shipping === 0 ? "Gratuite" : `${shipping.toFixed(2)} €`}</span>
                </div>

                {shipping > 0 && (
                  <div className="text-sm text-gray-500 italic">Livraison gratuite à partir de 100€ d&apos;achat</div>
                )}

                <div className="border-t border-gray-200 pt-4 flex justify-between font-medium">
                  <span>Total</span>
                  <span>{total.toFixed(2)} €</span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="text-sm text-gray-600">
                  En procédant au paiement, vous acceptez nos{" "}
                  <Link href="/conditions-generales" className="text-[#0a3d3f] hover:underline">
                    conditions générales de vente
                  </Link>{" "}
                  et notre{" "}
                  <Link href="/politique-confidentialite" className="text-[#0a3d3f] hover:underline">
                    politique de confidentialité
                  </Link>
                  .
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
