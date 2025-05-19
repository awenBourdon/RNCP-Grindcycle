"use client"
import { useCart } from "@/contexts/CartContext"

export default function Header() {
  const { cartItems } = useCart()
  return (
    <>
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
    </>
  )
}
