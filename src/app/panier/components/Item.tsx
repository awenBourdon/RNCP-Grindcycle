'use client'
import Image from 'next/image'
import { X } from 'lucide-react'
import { CartItemType, useCart } from '@/contexts/CartContext'

export default function CartItem({ item }: { item: CartItemType }) {
  const { removeFromCart } = useCart()

  return (
    <div className="flex flex-col sm:flex-row gap-6 pb-10 border-b border-gray-200">
      <div className="relative w-full sm:w-48 h-64 bg-[#f8f7f4] rounded-xl overflow-hidden">
        <Image
          src={item.imageUrl || '/placeholder.svg'}
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
            {item.type.charAt(0).toUpperCase() + item.type.slice(1)} |{' '}
            {item.size}&quot;
          </p>
        </div>
      </div>
    </div>
  )
}
