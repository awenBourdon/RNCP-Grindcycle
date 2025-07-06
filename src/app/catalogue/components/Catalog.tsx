'use client'
import { useState, useEffect } from 'react'
import { ProductList } from './ProductsList'
import { Filters } from './Filters'
import { Spinner } from '@/components/Spinner'
import { ProductType } from '@/lib/types'

interface ApiResponse {
  success: boolean
  data: ProductType[]
  error?: string
}

export const Catalog = () => {
  const [products, setProducts] = useState<ProductType[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [filters, setFilters] = useState({
    types: [] as string[],
    priceRange: [0, 200] as [number, number],
    sizes: [] as number[],
  })

  const [priceRangeValues, setPriceRangeValues] = useState<[number, number]>([
    0, 200,
  ])

  const fetchProducts = async (signal?: AbortSignal) => {
    try {
      setLoading(true)
      const response = await fetch('/api/product/available', {
        signal: signal,
      })

      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`)
      }

      const data: ApiResponse = await response.json()

      if (data.success) {
        setProducts(data.data)
        setError(null)
      } else {
        setError(data.error || 'Erreur lors du chargement des produits')
      }
    } catch (err) {
      if (err instanceof Error && err.name !== 'AbortError') {
        console.error('Erreur fetch produits:', err)
        setError(err.message)
      }
    } finally {
      if (!signal || !signal.aborted) {
        setLoading(false)
      }
    }
  }

  useEffect(() => {
    const controller = new AbortController()

    fetchProducts(controller.signal)

    return () => {
      controller.abort()
    }
  }, [])

  const filteredProducts = products.filter((product) => {
    if (filters.types.length > 0 && !filters.types.includes(product.type))
      return false
    if (
      product.priceEuro < filters.priceRange[0] ||
      product.priceEuro > filters.priceRange[1]
    )
      return false
    return true
  })

  const handleTypeChange = (type: string) => {
    setFilters((prev) => {
      const newTypes = prev.types.includes(type)
        ? prev.types.filter((t) => t !== type)
        : [...prev.types, type]
      return { ...prev, types: newTypes }
    })
  }

  const handlePriceChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const newValue = Number.parseInt(e.target.value)
    const newValues: [number, number] = [...priceRangeValues]
    newValues[index] = newValue

    if (index === 0 && newValue > priceRangeValues[1]) {
      newValues[1] = newValue
    } else if (index === 1 && newValue < priceRangeValues[0]) {
      newValues[0] = newValue
    }

    setPriceRangeValues(newValues)
    setFilters((prev) => ({ ...prev, priceRange: newValues }))
  }

  const resetFilters = () => {
    setFilters({
      types: [],
      priceRange: [0, 200],
      sizes: [],
    })
    setPriceRangeValues([0, 200])
  }

  if (loading) {
    return (
      <div className="pb-24">
        <div className="flex justify-center items-center h-64">
          <Spinner />
          <span className="ml-3 text-gray-600">Chargement des produits...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="pb-24">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => fetchProducts()}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Réessayer
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="pb-24">
      <Filters
        filters={filters}
        handleTypeChange={handleTypeChange}
        handlePriceChange={handlePriceChange}
        resetFilters={resetFilters}
        priceRangeValues={priceRangeValues}
      />
      <div className="mt-8">
        <div className="flex justify-between items-center mb-8">
          <p className="text-gray-600">
            {filteredProducts.length} produit
            {filteredProducts.length !== 1 ? 's' : ''} trouvé
            {filteredProducts.length !== 1 ? 's' : ''}
          </p>
        </div>
        <ProductList filteredProducts={filteredProducts} />
      </div>
    </div>
  )
}
