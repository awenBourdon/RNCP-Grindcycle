import Link from 'next/link'
import Image from 'next/image'
import { ProductType } from '@/lib/types'

type Props = {
  product: ProductType
}

export const ProductCard = ({ product }: Props) => {
  return (
    <Link
      href={`/produit/${product.id}`}
      className="block rounded-2xl border border-gray-200 hover:shadow-md transition-shadow overflow-hidden bg-white"
    >
      <div className="relative w-full aspect-[3/4] bg-gray-100">
        <Image
          src={product.imageUrl[0] || '/placeholder.webp'}
          alt={product.name}
          fill
          className="object-cover"
        />
      </div>
      <div className="p-4">
        <h2 className="text-lg font-medium truncate">{product.name}</h2>
        <p className="text-sm text-gray-500 capitalize">{product.type}</p>
        <div className="mt-2 text-[#0a3d3f] font-medium text-base">
          {product.priceEuro} €
        </div>
        {product.pricePoints && (
          <div className="text-sm text-gray-500">
            ou {product.pricePoints} points
          </div>
        )}
      </div>
    </Link>
  )
}
