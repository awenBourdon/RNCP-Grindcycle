"use client";
import { useEffect, useState } from 'react';
import { useParams } from "next/navigation";
import { ProductType } from '@/lib/types';
import { products } from '@/lib/data';
import ProductDisplay from './components/ProductDisplay';

export default function ProductPage() {
  const params = useParams()
  const { id } = params
  const [product, setProduct] = useState<ProductType | undefined>(undefined)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (typeof id === 'string') {
      const foundProduct = products.find((p) => p.id === Number(id))
      setProduct(foundProduct)
    }
    setLoading(false)
  }, [id])
  

  if (loading) {
    return (
      <>
        <div className="max-w-7xl mx-auto px-6 py-40">
          <div className="flex items-center justify-center h-[50vh]">
            <p className="text-lg text-gray-600">Chargement...</p>
          </div>
        </div>
      </>
    )
  }

  if (!product) {
    return (
      <>
        <div className="max-w-7xl mx-auto px-6 py-40">
          <div className="flex items-center justify-center h-[50vh]">
            <p className="text-lg text-gray-600">Produit non trouvé</p>
          </div>
        </div>
      </>
    )
  }

  return (
      <div className="max-w-7xl mx-auto px-6 py-40">
        <ProductDisplay product={product} />
      </div>
  )
}
