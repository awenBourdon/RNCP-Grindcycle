'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { ProductType } from '@/lib/types'
import ProductDisplay from './components/ProductDisplay'
import Spinner from '@/components/Spinner'

export default function ProductPage() {
  const params = useParams()
  const { id } = params
  const [product, setProduct] = useState<ProductType | undefined>(undefined)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProduct = async () => {
      if (typeof id === 'string') {
        try {
          const response = await fetch(`/api/product/${id}`)

          if (response.ok) {
            const data = await response.json()
            if (data.success) {
              setProduct(data.data)
            }
          }
        } catch (error) {
          console.error('Erreur lors du chargement du produit:', error)
        }
      }
      setLoading(false)
    }

    fetchProduct()
  }, [id])

  if (loading) {
    return (
      <>
        <div className="max-w-7xl mx-auto px-6 py-40">
          <div className="flex justify-center items-center h-64">
            <Spinner />
            <span className="ml-3 text-gray-600">Chargement ...</span>
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
