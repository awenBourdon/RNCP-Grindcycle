"use client"
import { products } from "@/lib/data";
import type React from "react"
import { useState } from "react"
import ProductList from "./ProductsList";
import Filters from "./Filters";

export default function Catalog() {
  const [filters, setFilters] = useState({
    types: [] as string[],
    priceRange: [0, 200] as [number, number],
    sizes: [] as number[],
  })

  const [priceRangeValues, setPriceRangeValues] = useState<[number, number]>([0, 200])

  const filteredProducts = products.filter((product) => {
    if (filters.types.length > 0 && !filters.types.includes(product.type)) return false
    if (product.priceEuro < filters.priceRange[0] || product.priceEuro > filters.priceRange[1]) return false
    if (filters.sizes.length > 0 && (!product.size || !filters.sizes.includes(product.size))) return false
    return true
  })

  const handleTypeChange = (type: string) => {
    setFilters((prev) => {
      const newTypes = prev.types.includes(type) ? prev.types.filter((t) => t !== type) : [...prev.types, type]
      return { ...prev, types: newTypes }
    })
  }

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
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

  const handleSizeChange = (size: number) => {
    setFilters((prev) => {
      const newSizes = prev.sizes.includes(size) ? prev.sizes.filter((s) => s !== size) : [...prev.sizes, size]
      return { ...prev, sizes: newSizes }
    })
  }

  const resetFilters = () => {
    setFilters({
      types: [],
      priceRange: [0, 200],
      sizes: [],
    })
    setPriceRangeValues([0, 200])
  }

  return (
    <div className="pb-24">
      <Filters
        filters={filters}
        handleTypeChange={handleTypeChange}
        handlePriceChange={handlePriceChange}
        handleSizeChange={handleSizeChange}
        resetFilters={resetFilters}
        priceRangeValues={priceRangeValues}
      />
      <div className="mt-8">
        <div className="flex justify-between items-center mb-8">
          <p className="text-gray-600">
            {filteredProducts.length} produit{filteredProducts.length !== 1 ? "s" : ""} trouvé
            {filteredProducts.length !== 1 ? "s" : ""}
          </p>
        </div>
        <ProductList filteredProducts={filteredProducts} />
      </div>
    </div>
  )
}