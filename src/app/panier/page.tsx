"use client"
import Image from "next/image"
import Link from "next/link"
import { X, ShoppingBag } from "lucide-react"
import { useCart } from "@/contexts/CartContext"

export default function CartPage() {
  const { 
    cartItems, 
    removeFromCart, 
    clearCart, 
    getCartTotal, 
    getShippingCost 
  } = useCart()

  const subtotal = getCartTotal()
  const shipping = getShippingCost()
  const total = subtotal + shipping

  return (
    <div className="max-w-7xl mx-auto px-6 py-40">
      <div className="mb-12">
        <h1 className="text-4xl md:text-6xl font-normal text-black mb-6">Mon panier</h1>
        <p className="text-gray-600">
          {cartItems.length > 0 ? (
            <>
              Tu as <span className="font-medium">{cartItems.length}</span> article
              {cartItems.length !== 1 ? "s" : ""} dans ton panier
            </>
          ) : (
            "Ton panier est vide"
          )}
        </p>
      </div>

      {cartItems.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
          <div className="lg:col-span-2">
            <div className="space-y-10">
              {cartItems.map((item) => (
                <div key={item.id} className="flex flex-col sm:flex-row gap-6 pb-10 border-b border-gray-200">
                  <div className="relative w-full sm:w-48 h-64 bg-[#f8f7f4] rounded-xl overflow-hidden">
                    <Image
                      src={item.imageUrl || "/placeholder.svg"}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  </div>

                  <div className="flex-1 flex flex-col">
                    <div className="flex justify-between">
                      <h3 className="text-xl font-medium">{item.name}</h3>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-gray-400 hover:text-black transition-colors"
                        aria-label="Supprimer l'article"
                      >
                        <X size={20} />
                      </button>
                    </div>

                    <div className="mt-2">
                      <p className="text-[#0a3d3f] text-lg">{item.price} €</p>
                      <p className="text-gray-500 text-sm mt-1">
                        {item.type.charAt(0).toUpperCase() + item.type.slice(1)} | {item.size}&quot;
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="bg-[#f8f7f4] p-6 rounded-lg">
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
                  <div className="text-sm text-gray-500 italic">
                    Livraison gratuite à partir de 100€ d&apos;achat
                  </div>
                )}

                <div className="border-t border-gray-200 pt-4 flex justify-between font-medium">
                  <span>Total</span>
                  <span>{total.toFixed(2)} €</span>
                </div>
              </div>

              <div className="space-y-4">
                <button className="w-full py-3 bg-[#0a3d3f] text-white rounded-full hover:bg-[#0a4d4f] transition-colors">
                  Passer la commande
                </button>

                <Link
                  href="/catalogue"
                  className="block w-full py-3 text-center border border-[#0a3d3f] text-[#0a3d3f] rounded-full hover:bg-[#0a3d3f] hover:text-white transition-colors"
                >
                  Continuer mes achats
                </Link>

                <button
                  onClick={clearCart}
                  className="w-full text-gray-500 hover:text-gray-700 text-sm py-2 transition-colors"
                >
                  Vider mon panier
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="w-20 h-20 bg-[#f8f7f4] rounded-full flex items-center justify-center mb-6">
            <ShoppingBag size={32} className="text-gray-400" />
          </div>

          <h2 className="text-2xl font-normal mb-3">Ton panier est vide</h2>
          <p className="text-gray-600 mb-8 text-center max-w-md">
            Il semble que tu n&apos;aies pas encore ajouté d&apos;articles à ton panier.
          </p>

          <Link
            href="/catalogue"
            className="px-6 py-3 bg-[#0a3d3f] text-white rounded-full hover:bg-[#0a4d4f] transition-colors"
          >
            Découvrir nos planches
          </Link>
        </div>
      )}
    </div>
  )
}
