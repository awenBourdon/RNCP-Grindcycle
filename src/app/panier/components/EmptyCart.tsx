import Link from 'next/link'
import { ShoppingBag } from 'lucide-react'

export const EmptyCart = () => {
  return (
    <div className="flex flex-col items-center justify-center pt-16">
      <div className="w-20 h-20 bg-[#f8f7f4] rounded-full flex items-center justify-center mb-6">
        <ShoppingBag size={32} className="text-gray-400" />
      </div>

      <h2 className="text-2xl font-normal mb-3">Ton panier est vide</h2>
      <p className="text-gray-600 mb-8 text-center max-w-md">
        Il semble que tu n&apos;aies pas encore ajouté d&apos;articles à ton
        panier.
      </p>

      <Link
        href="/catalogue"
        className="px-8 py-3 bg-[#0a3d3f] text-white font-medium rounded-full hover:bg-[#0a4d4f] transition-colors"
      >
        Découvrir nos planches
      </Link>
    </div>
  )
}
