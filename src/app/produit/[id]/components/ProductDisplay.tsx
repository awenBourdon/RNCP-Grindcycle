'use client'
import { ShoppingCart, X } from 'lucide-react'
import Image from 'next/image'
import { useState, useTransition, useEffect } from 'react'
import type { ProductType } from '@/lib/types'
import { useCart } from '@/contexts/CartContext'
import Spinner from '@/components/Spinner'
import ReturnButton from '@/components/ReturnButton'

type Props = {
  product: ProductType
}

export default function ProductDisplay({ product }: Props) {
  const { addToCart, removeFromCart, isInCart } = useCart()
  const [isPending, startTransition] = useTransition()
  const [added, setAdded] = useState(false)

  useEffect(() => {
    setAdded(isInCart(product))
  }, [product, isInCart])

  const handleToggleCart = () => {
    startTransition(() => {
      if (added) {
        removeFromCart(product)
      } else {
        addToCart(product)
      }
      setAdded(!added)
    })
  }

  return (
    <div>
      <ReturnButton href="/catalogue" label="Catalogue" />

      <div className="grid md:grid-cols-2 gap-16 items-start">
        <div className="w-full aspect-[3/4] relative overflow-hidden rounded-xl">
          <Image
            src={product.imageUrl || '/placeholder.svg?height=700&width=600'}
            alt={product.name}
            fill
            className="object-cover bg-gray-500"
          />
        </div>

        <div>
          <h1 className="text-3xl font-normal mb-6">{product.name}</h1>
          <p className="text-gray-600 text-lg mb-8">
            {product.description ||
              'Planche de skate recyclée, parfaite pour tous les styles de ride.'}
          </p>

          <div className="space-y-4 mb-8">
            <div className="flex items-center border-b border-gray-200 pb-3">
              <span className="w-24 font-medium">Type :</span>
              <span className="text-gray-600 capitalize">
                {product.type || 'Skate'}
              </span>
            </div>
            <div className="flex items-center border-b border-gray-200 pb-3">
              <span className="w-24 font-medium">Taille :</span>
              <span className="text-gray-600">{product.size || '8'}&quot;</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-4 mt-8">
            <div className="text-[#0a3d3f]">
              <span className="text-3xl font-normal">
                {product.priceEuro} €
              </span>
            </div>
            {product.pricePoints && (
              <span className="text-sm text-gray-600">
                ou {product.pricePoints} points
              </span>
            )}
          </div>

          <button
            onClick={handleToggleCart}
            disabled={isPending}
            className="mt-8 w-full px-6 py-4 text-lg font-normal rounded-full transition-colors flex items-center justify-center bg-[#0a3d3f] text-white hover:bg-[#0a4d4f]"
          >
            <div className="flex items-center justify-center min-w-[180px]">
              {isPending ? (
                <Spinner />
              ) : added ? (
                <>
                  <X className="w-5 h-5 mr-2" />
                  <span>Retirer du panier</span>
                </>
              ) : (
                <>
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  <span>Ajouter au panier</span>
                </>
              )}
            </div>
          </button>

          <div className="mt-8 p-6 bg-[#f8f7f4] rounded-lg">
            <p className="text-gray-600">
              <span className="font-medium">Livraison gratuite</span> à partir
              de 100€ d&apos;achat
            </p>
            <p className="text-gray-600 mt-2">
              <span className="font-medium">Retour gratuit</span> sous 14 jours
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
