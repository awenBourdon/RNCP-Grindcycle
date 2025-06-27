'use client'
import { ProductType } from '@/lib/types'
import ProductCard from './ProductCard'

type Props = {
  filteredProducts: ProductType[]
}

export default function ProductList({ filteredProducts }: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
      {filteredProducts.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}
