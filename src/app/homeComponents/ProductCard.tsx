"use client";
import { ProductType } from "@/lib/types";
import Image from "next/image";

interface ProductCardProps {
  product: ProductType
}

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <div className="group">
      <div className="relative w-72 h-96 bg-white overflow-hidden rounded-xl">
        <Image
          src="/placeholder.svg?height=800&width=600"
          alt={product.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />

        <div className="absolute inset-0 bg-gray-300 bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300"></div>

        <div className="absolute bottom-0 left-0 w-full p-4 bg-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <button className="w-full py-2 bg-[#0a3d3f] text-white rounded-full font-medium hover:bg-[#0a4d4f] transition-all duration-300">
            Voir produit
          </button>
        </div>
      </div>

      <div className="mt-4 flex justify-between items-center">
        <h3 className="text-lg font-medium truncate">{product.name}</h3>
        <span className="px-3 py-1 bg-[#0a3d3f] text-white rounded-full">{product.priceEuro}€</span>
      </div>
    </div>
  )
}